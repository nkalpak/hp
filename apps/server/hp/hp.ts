import { WebSocketServer, WebSocket, RawData } from "ws";

interface IHpOptions {
  port: number;
}

class Hp {
  private readonly _port: number;
  private readonly _clients: Set<WebSocket> = new Set();

  public constructor({ port }: IHpOptions) {
    this._port = port;
  }

  public listen = () => {
    const wss = new WebSocketServer({ port: this._port });

    wss.on("connection", (socket) => {
      this._registerSocket(socket);
    });

    console.log(`Listening on ${this._port}`);
  };

  private _registerSocket = (socket: WebSocket) => {
    this._clients.add(socket);

    socket.on("message", (data, isBinary) => {
      this._processMessage(socket, data, isBinary);
    });

    socket.on("close", () => {
      this._onSocketClose(socket);
    });
  };

  private _processMessage(socket: WebSocket, data: RawData, isBinary: boolean) {
    this._clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  }

  private _onSocketClose(socket: WebSocket) {
    this._clients.delete(socket);
  }
}

export { Hp };
