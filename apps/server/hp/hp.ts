import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { decodeMessage, MessageData, MessageType } from "@hp/common";
import * as string from "lib0/string";

interface IHpOptions {
  port: number;

  onAuthenticate(data: { token: string }): Promise<boolean>;
}

class Hp {
  private readonly _port: number;
  private readonly _rooms: Map<string, Set<WebSocket>> = new Map();

  private readonly _onAuthenticate: IHpOptions["onAuthenticate"];

  public constructor({ port, onAuthenticate }: IHpOptions) {
    this._port = port;
    this._onAuthenticate = onAuthenticate.bind(this);
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

    socket.on("message", async (data, isBinary) => {
      await this._processMessage({
        socket,
        room,
        data: data as MessageData,
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

  private async _processMessage({
    socket,
    room,
    data,
    isBinary,
  }: {
    socket: WebSocket;
    data: MessageData;
    isBinary: boolean;
    room: string;
  }) {
    const message = decodeMessage(data);

    switch (message.type) {
      case MessageType.Auth: {
        const isAuthenticated = await this._onAuthenticate({
          token: string.decodeUtf8(message.data),
        });

        if (isAuthenticated) {
          this._addSocketToRoom(socket, room);
        }

        break;
      }

      case MessageType.Update: {
        this._rooms.get(room)?.forEach((client) => {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(data, { binary: isBinary });
          }
        });
        break;
      }
    }
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
