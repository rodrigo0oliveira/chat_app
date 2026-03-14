export type StompFrame  = {
  command: string;
  headers: Record<string, string>;
  body: string;
}

export class StompParser {
  /**
   * Parses a raw STOMP message string into a StompFrame object.
   */
  static parse(rawMessage: string): StompFrame {
    // A STOMP frame is terminated by a NULL byte (ASCII 0)
    const nullIndex = rawMessage.indexOf('\0');
    let message = rawMessage;
    
    if (nullIndex !== -1) {
      message = rawMessage.substring(0, nullIndex);
    }

    const lines = message.split('\n');
    const command = lines[0].trim();
    const headers: Record<string, string> = {};
    let lineIdx = 1;

    // Parse headers until we hit an empty line
    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      if (line === '') {
        lineIdx++; // skip empty line
        break;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        if (!headers[key]) {
             // STOMP 1.2: if a header appears multiple times, the first value is used.
             headers[key] = value;
        }
      }
      lineIdx++;
    }

    // Parse body (everything after the empty line)
    const bodyLines = [];
    while (lineIdx < lines.length) {
      bodyLines.push(lines[lineIdx]);
      lineIdx++;
    }
    const body = bodyLines.join('\n');

    return { command, headers, body };
  }

  /**
   * Serializes a STOMP frame back to a string format suitable for transmission.
   */
  static serialize(command: string, headers: Record<string, string> = {}, body: string = ''): string {
    let frame = `${command}\n`;
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    if (body.length > 0 && !headers['content-length']) {
        frame += `content-length:${Buffer.byteLength(body, 'utf8')}\n`;
    }
    frame += '\n'; // Empty line separating headers and body
    frame += body;
    frame += '\0'; // NULL byte terminator
    return frame;
  }

  static createMessageFrame(destination: string, subscriptionId: string, messageId: string, body: string): string {
    const headers = {
      destination,
      subscription: subscriptionId,
      'message-id': messageId,
      'content-type': 'application/json'
    };
    return this.serialize('MESSAGE', headers, body);
  }

  static createErrorFrame(message: string, details: string = ''): string {
    return this.serialize('ERROR', { message }, details);
  }

  static createConnectedFrame(version: string = '1.2'): string {
    return this.serialize('CONNECTED', { version });
  }

  static createReceiptFrame(receiptId: string): string {
    return this.serialize('RECEIPT', { 'receipt-id': receiptId });
  }
}
