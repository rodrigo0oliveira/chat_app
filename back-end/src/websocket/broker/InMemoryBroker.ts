import type { MessageBroker } from './MessageBroker.js';

type SubscriberCallback = (message: string) => void;

export class InMemoryBroker implements MessageBroker {
  private topics: Map<string, Map<string, SubscriberCallback>> = new Map();

  subscribe(destination: string, connectionId: string, callback: SubscriberCallback): void {
    if (!this.topics.has(destination)) {
      this.topics.set(destination, new Map());
    }
    this.topics.get(destination)!.set(connectionId, callback);
  }

  unsubscribe(destination: string, connectionId: string): void {
    if (this.topics.has(destination)) {
      const topicSubscribers = this.topics.get(destination)!;
      topicSubscribers.delete(connectionId);

      if (topicSubscribers.size === 0) {
        this.topics.delete(destination);
      }
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
  }

  publish(destination: string, message: string): void {
    if (this.topics.has(destination)) {
      const subscribers = this.topics.get(destination)!;
      for (const callback of subscribers.values()) {
        try {
          callback(message);
        } catch (error) {
          console.error(`[Broker] Error sending message to subscriber on ${destination}`, error);
        }
      }
    } else {
    }
  }
}

export const inMemoryBroker = new InMemoryBroker();
