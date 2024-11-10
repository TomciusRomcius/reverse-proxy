const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeText(text: string) {
  return textEncoder.encode(text);
}

export function decodeBytesToText(bytes: Uint8Array) {
  return textDecoder.decode(bytes);
}
