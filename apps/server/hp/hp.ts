import { WebSocketServer } from "ws";

interface IHpOptions {
  port: number;
}

class Hp {
  private readonly _port: number;

  public constructor({ port }: IHpOptions) {
    this._port = port;
  }

  public listen = () => {
    const wss = new WebSocketServer({ port: this._port });

    wss.on("connection", () => {
      console.log("connection");
    });

    console.log(`Listening on ${this._port}`);
  };
}

export { Hp };
