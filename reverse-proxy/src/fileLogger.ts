import { decodeBytesToText, encodeText } from "./encodeDecode.ts";

class FileLogger {
  file: Deno.FsFile | null = null;
  messageQueue: string[] = [];
  isProcessing: boolean = false;
  async openFile() {
    this.file = await Deno.open("logs.txt", { write: true, create: true });
  }

  writeLogs(message: string) {
    if (this.file === null) {
      return;
    }

    this.messageQueue.push(message);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    if (this.messageQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    console.log(this.messageQueue.length);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue[0];
      await this.file?.write(encodeText(`${message} \n`));
      this.messageQueue.shift(); // Remove processed message
    }

    this.messageQueue = [];
    this.isProcessing = false;
  }
}

export const fileLogger = new FileLogger();
