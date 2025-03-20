// Define types locally to avoid dependency on web-streams-polyfill package
type TransformStreamDefaultController = {
  enqueue: (chunk: any) => void;
  error: (reason: any) => void;
  terminate: () => void;
};

export default class SwitchableStream {
  private _controller: TransformStreamDefaultController | null = null;
  private _currentReader: any = null; // Use any to avoid typing issues with ReadableStreamDefaultReader
  private _switches = 0;
  private _transformStream: any;

  constructor() {
    let controllerRef: TransformStreamDefaultController | null = null;

    // Create a standard TransformStream without relying on global objects
    // This fixes the compatibility issue in production environments
    this._transformStream = new TransformStream({
      start(controller: TransformStreamDefaultController) {
        controllerRef = controller;
      },
    });

    this._controller = controllerRef;
  }

  async switchSource(newStream: ReadableStream) {
    if (this._currentReader) {
      await this._currentReader.cancel();
    }

    this._currentReader = newStream.getReader();
    this._pumpStream();
    this._switches++;
  }

  private async _pumpStream() {
    if (!this._currentReader || !this._controller) {
      throw new Error('Stream is not properly initialized');
    }

    try {
      while (true) {
        const { done, value } = await this._currentReader.read();

        if (done) {
          break;
        }

        this._controller.enqueue(value);
      }
    } catch (error) {
      console.error('Error in SwitchableStream:', error);
      if (this._controller) {
        this._controller.error(error);
      }
    }
  }

  close() {
    if (this._currentReader) {
      this._currentReader.cancel().catch((err: Error) => {
        console.error('Error cancelling reader:', err);
      });
    }

    if (this._controller) {
      try {
        this._controller.terminate();
      } catch (err: unknown) {
        console.error('Error terminating controller:', err);
      }
    }
  }

  get switches() {
    return this._switches;
  }

  get readable() {
    return this._transformStream.readable;
  }
}
