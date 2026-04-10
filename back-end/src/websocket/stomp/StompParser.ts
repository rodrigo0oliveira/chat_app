export type StompFrame = {
  command: string;
  headers: Record<string, string>;
  body: string;
}

export class StompParser {

  static parse(rawMessage: string): StompFrame {
    const nullIndex = rawMessage.indexOf('\0');
    let message = rawMessage;

    if (nullIndex !== -1) {
      message = rawMessage.substring(0, nullIndex);
    }

    const lines = message.split('\n');
    const commandLine = lines[0];
    const command = commandLine ? commandLine.trim() : '';
    const headers: Record<string, string> = {};
    let lineIdx = 1;

    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      if (line === undefined) {
        break;
      }
      if (line === '') {
        lineIdx++; // skip empty line
        break;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        if (!headers[key]) {
          headers[key] = value;
        }
      }
      lineIdx++;
    }

    const bodyLines = [];
    while (lineIdx < lines.length) {
      bodyLines.push(lines[lineIdx]);
      lineIdx++;
    }
    const body = bodyLines.join('\n');

    return { command, headers, body };
  }


  static serialize(command: string, headers: Record<string, string> = {}, body: string = ''): string {
    let frame = `${command}\n`;
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    if (body.length > 0 && !headers['content-length']) {
      frame += `content-length:${Buffer.byteLength(body, 'utf8')}\n`;
    }
    frame += '\n';
    frame += body;
    frame += '\0';
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
