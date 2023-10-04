// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer/index'

export async function blobToBuffer(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
