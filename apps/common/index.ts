import * as string from "lib0/string";
import type { RawData } from "ws";

export enum MessageType {
  Auth = 0,
  Update = 1,
}

export type MessageData = Exclude<RawData, Buffer[]>;

export function encodeMessage({
  type,
  data,
}: {
  type: MessageType;
  data: Uint8Array | string;
}) {
  if (typeof data === "string") {
    data = string.encodeUtf8(data);
  }

  return new Uint8Array([...data, type]);
}

export function decodeMessage(data: MessageData): {
  type: MessageType;
  data: Uint8Array;
} {
  const uint = new Uint8Array(data);

  return {
    type: uint[uint.length - 1],
    data: uint.slice(0, uint.length - 1),
  };
}
