import { RawData, WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";

interface IHpOptions {
  port: number;
}

class Hp {
  private readonly _port: number;
  private readonly _rooms: Map<string, Set<WebSocket>> = new Map();

  public constructor({ port }: IHpOptions) {
    this._port = port;
  }

  public listen = () => {
    const wss = new WebSocketServer({ port: this._port });

    wss.on("connection", (socket, request) => {
      this._registerSocket(socket, request);
    });

    console.log(`Listening on ${this._port}`);
  };

  private _registerSocket = (socket: WebSocket, request: IncomingMessage) => {
    const room = this._getRoomFromUrl(request.url);
    this._addSocketToRoom(socket, room);

    socket.on("message", (data, isBinary) => {
      this._processMessage({
        socket,
        room,
        data,
        isBinary,
      });
    });

    socket.on("close", () => {
      this._onSocketClose({
        socket,
        room,
      });
    });
  };

  private _processMessage({
    socket,
    room,
    data,
    isBinary,
  }: {
    socket: WebSocket;
    data: RawData;
    isBinary: boolean;
    room: string;
  }) {
    this._rooms.get(room)?.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  }

  private _onSocketClose({
    socket,
    room,
  }: {
    socket: WebSocket;
    room: string;
  }) {
    this._rooms.get(room)?.delete(socket);
    console.log(
      `Disconnect. Sockets in room: ${
        this._rooms.get(room)?.size ?? 0
      } (${room})`
    );
  }

  private _getRoomFromUrl = (urlString: string) => {
    // Remove leading slash
    const params = new URLSearchParams(urlString.slice(1));
    const room = params.get("room");

    if (!room) {
      throw new Error("No room specified");
    }

    return room;
  };

  private _addSocketToRoom = (socket: WebSocket, room: string) => {
    const sockets = this._rooms.get(room) ?? new Set();
    sockets.add(socket);
    this._rooms.set(room, sockets);
  };
}

export { Hp };
