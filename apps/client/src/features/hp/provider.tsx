interface IHpProviderProps {
  url: string;
}

export class HpProvider {
  private readonly _url: string;

  public constructor({ url }: IHpProviderProps) {
    this._url = url;

    new WebSocket(this._url);
  }
}
