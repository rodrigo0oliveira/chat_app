export interface MessageBroker {

  subscribe(destination: string, connectionId: string, callback: (message: string) => void): void;

  unsubscribe(destination: string, connectionId: string): void;

  unsubscribeAll(connectionId: string): void;

  publish(destination: string, message: string): void;
}
