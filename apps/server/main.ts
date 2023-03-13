import { Hp } from "./hp";

const hp = new Hp({
  port: 4000,
  async onAuthenticate(data: { token: string }) {
    return data.token === "123";
  },
});

hp.listen();
