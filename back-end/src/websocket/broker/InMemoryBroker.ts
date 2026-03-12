import { MessageBroker } from './MessageBroker.js';

type SubscriberCallback = (message: string) => void;

export class InMemoryBroker implements MessageBroker {
  // Map<destination, Map<connectionId, callback>>
  private topics: Map<string, Map<string, SubscriberCallback>> = new Map();

  subscribe(destination: string, connectionId: string, callback: SubscriberCallback): void {
    if (!this.topics.has(destination)) {
      this.topics.set(destination, new Map());
    }
    this.topics.get(destination)!.set(connectionId, callback);
    console.log(`[Broker] Connection ${connectionId} subscribed to ${destination}`);
  }

  unsubscribe(destination: string, connectionId: string): void {
    if (this.topics.has(destination)) {
      const topicSubscribers = this.topics.get(destination)!;
      topicSubscribers.delete(connectionId);
      
      if (topicSubscribers.size === 0) {
        this.topics.delete(destination);
      }
      console.log(`[Broker] Connection ${connectionId} unsubscribed from ${destination}`);
    }
  }

  unsubscribeAll(connectionId: string): void {
    for (const [destination, subscribers] of this.topics.entries()) {
      if (subscribers.has(connectionId)) {
        subscribers.delete(connectionId);
        if (subscribers.size === 0) {
          this.topics.delete(destination);
        }
      }
    }
    console.log(`[Broker] Connection ${connectionId} unsubscribed from all topics`);
  }

  publish(destination: string, message: string): void {
    if (this.topics.has(destination)) {
      const subscribers = this.topics.get(destination)!;
      console.log(`[Broker] Publishing to ${destination} (${subscribers.size} subscribers)`);
      for (const callback of subscribers.values()) {
        try {
          callback(message);
        } catch (error) {
          console.error(`[Broker] Error sending message to subscriber on ${destination}`, error);
        }
      }
    } else {
      console.log(`[Broker] No subscribers for destination ${destination}`);
    }
  }
}

// Singleton instance for the current application scope
export const inMemoryBroker = new InMemoryBroker();
