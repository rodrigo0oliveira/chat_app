import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { StompParser, StompFrame } from './stomp/StompParser.js';
import { inMemoryBroker } from './broker/InMemoryBroker.js';
import { MessageService } from '../services/chat/MessageService.js';
import RoomMember from '../models/RoomMember.js';

export class StompHandler {
  private ws: WebSocket;
  private connectionId: string;
  private isAuthenticated: boolean = false;
  private userId: string | null = null;
  // Map<subscriptionId, destination>
  private subscriptions: Map<string, string> = new Map();

  constructor(ws: WebSocket, connectionId: string) {
    this.ws = ws;
    this.connectionId = connectionId;

    this.ws.on('message', (data: any) => this.handleRawMessage(data));
    this.ws.on('close', () => this.handleDisconnect());
    this.ws.on('error', (err) => console.error(`[WS Error - ${this.connectionId}]`, err));
  }

  private async handleRawMessage(data: any): Promise<void> {
    try {
      const rawMessage = data.toString('utf8');
      
      // Heartbeat checks (just newline chars)
      if (rawMessage === '\n' || rawMessage === '\r\n') {
        return;
      }

      const frame = StompParser.parse(rawMessage);
      await this.processFrame(frame);

    } catch (error: any) {
      console.error(`[STOMP Parse Error]`, error);
      this.sendError('Failed to parse STOMP frame', error.message);
      this.ws.close();
    }
  }

  private async processFrame(frame: StompFrame): Promise<void> {
    const { command, headers } = frame;

    if (command !== 'CONNECT' && command !== 'STOMP' && !this.isAuthenticated) {
      this.sendError('Not authenticated', 'Must send CONNECT frame with valid jwt token first');
      this.ws.close();
      return;
    }

    try {
      switch (command) {
        case 'CONNECT':
        case 'STOMP':
          await this.handleConnect(frame);
          break;
        case 'SUBSCRIBE':
          await this.handleSubscribe(frame);
          break;
        case 'UNSUBSCRIBE':
          this.handleUnsubscribe(frame);
          break;
        case 'SEND':
          await this.handleSend(frame);
          break;
        case 'DISCONNECT':
          this.handleDisconnect(headers['receipt']);
          break;
        default:
          console.warn(`[STOMP] Unknown command: ${command}`);
          this.sendError('Unknown command', `Command ${command} is not supported`);
      }
    } catch (error: any) {
      console.error(`[STOMP Process Error]`, error);
      this.sendError('Processing failed', error.message);
    }
  }

  private async handleConnect(frame: StompFrame): Promise<void> {
    const { headers } = frame;
    
    // Auth logic via STOMP headers (e.g. login/passcode or authorization header)
    const token = headers['passcode'] || headers['authorization']

    if (!token) {
      throw new Error('Authentication token required');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Server configuration error (JWT_SECRET miss)');
    }

    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      this.userId = decoded.id;
      this.isAuthenticated = true;

      this.ws.send(StompParser.createConnectedFrame('1.2'));

    } catch (error) {
       this.sendError('Authentication failed', 'Invalid JWT token');
       this.ws.close();
    }
  }

  private async handleSubscribe(frame: StompFrame): Promise<void> {
    const { headers } = frame;
    const destination = headers['destination'];
    const id = headers['id']; 
    const type = headers['type'] || 'PRIVATE'; 

    if (!destination || !id) { 
      throw new Error('SUBSCRIBE requires destination and id headers');
    }

    // Logic for /topic/rooms.{roomId}
    if (destination.startsWith('/topic/rooms.')) {
        const roomId = destination.split('.')[1];
        
        
        // Authorize: ensure user is part of the room
        const isMember = await RoomMember.exists({ userId: this.userId, roomId });
        if (!isMember && type !== 'PUBLIC') {
          throw new Error('Unauthorized: You are not a member of this room');
        }

        // Add to broker
        inMemoryBroker.subscribe(destination, this.connectionId, (message) => {
           // Provide a unique message-id per broadcast from the broker
           const frameToSend = StompParser.createMessageFrame(destination, id, `msg-${Date.now()}`, message);
           if (this.ws.readyState === WebSocket.OPEN) {
             this.ws.send(frameToSend);
           }
        });

        this.subscriptions.set(id, destination);

        if (headers['receipt']) {
            this.ws.send(StompParser.createReceiptFrame(headers['receipt']));
        }
    } else {
       throw new Error(`Destination ${destination} is not supported`);
    }
  }

  private handleUnsubscribe(frame: StompFrame): void {
     const id = frame.headers['id'];
     if (!id) throw new Error('UNSUBSCRIBE requires id header');

     const destination = this.subscriptions.get(id);
     if (destination) {
         inMemoryBroker.unsubscribe(destination, this.connectionId);
         this.subscriptions.delete(id);
     }

     if (frame.headers['receipt']) {
        this.ws.send(StompParser.createReceiptFrame(frame.headers['receipt']));
     }
  }

  private async handleSend(frame: StompFrame): Promise<void> {
      const { headers, body } = frame;
      const destination = headers['destination'];

      if (!destination) {
          throw new Error('SEND requires destination header');
      }

      if (destination === '/app/chat.sendMessage') {
          // Parse request body. Expected `{ "roomId": "...", "content": "..." }`
          const dto = JSON.parse(body);
          
          if (!dto.roomId || !dto.content) {
            throw new Error('Message body requires roomId and content');
          }

          const clientMessageId = headers['message-id']; // Optional idempotent key from client

          if (!this.userId) {
             throw new Error("Internal state error: userId not present");
          }

          // MessageService will validate membership, store to Mongo, and publish to the broker
          await MessageService.saveAndPublishMessage(this.userId, {
            roomId: dto.roomId,
            content: dto.content
          }, clientMessageId);

          if (headers['receipt']) {
              this.ws.send(StompParser.createReceiptFrame(headers['receipt']));
          }

      } else {
          throw new Error(`Destination ${destination} not supported for SEND`);
      }
  }

  private handleDisconnect(receipt?: string): void {
      inMemoryBroker.unsubscribeAll(this.connectionId);
      this.subscriptions.clear();

      if (receipt && this.ws.readyState === WebSocket.OPEN) {
         this.ws.send(StompParser.createReceiptFrame(receipt));
      }
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
  }

  private sendError(message: string, details: string): void {
       if (this.ws.readyState === WebSocket.OPEN) {
          const errorFrame = StompParser.createErrorFrame(message, details);
          this.ws.send(errorFrame);
       }
  }
}
