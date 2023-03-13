import * as Y from "yjs";

interface IHpProviderProps {
  url: string;
  document: Y.Doc;
}

export class HpProvider {
  private readonly _url: string;
  private readonly _document: Y.Doc;
  private readonly _socket: WebSocket;

  public constructor({ url, document }: IHpProviderProps) {
    this._url = url;
    this._document = document;
    this._socket = new WebSocket(this._url);

    this._initDocument();
    this._initSocket();
  }

  private _initSocket() {
    this._socket.binaryType = "arraybuffer";
    this._socket.onmessage = (event) => {
      this._onMessage(event);
    };
  }

  private _initDocument = () => {
    this._document.on("update", (update: Uint8Array, origin) => {
      if (origin === this) {
        return;
      }

      this.sendMessage(update);
    });
  };

  private sendMessage = (update: Uint8Array) => {
    this._socket.send(update);
  };

  private _onMessage = (event: MessageEvent) => {
    this._applyUpdate(new Uint8Array(event.data as ArrayBuffer));
  };

  private _applyUpdate = (update: Uint8Array) => {
    Y.applyUpdate(this._document, update, this);
  };
}
