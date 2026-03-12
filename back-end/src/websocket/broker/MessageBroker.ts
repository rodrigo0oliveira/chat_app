export interface MessageBroker {
  /**
   * Subscribes a connection to a specific destination topic.
   */
  subscribe(destination: string, connectionId: string, callback: (message: string) => void): void;

  /**
   * Unsubscribes a connection from a specific destination.
   */
  unsubscribe(destination: string, connectionId: string): void;

  /**
   * Unsubscribes a connection from all destinations.
   */
  unsubscribeAll(connectionId: string): void;

  /**
   * Publishes a message to all subscribers of a destination.
   */
  publish(destination: string, message: string): void;
}
