/**
 * Browser-compatible zlib inflate using the Web Compression Streams API.
 * Falls back to a manual implementation if DecompressionStream is unavailable.
 */

export async function inflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== "undefined") {
    return inflateWithStreams(data);
  }
  return inflateManual(data);
}

async function inflateWithStreams(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  writer.write(new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)) as unknown as BufferSource);
  writer.close();

  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

async function inflateManual(data: Uint8Array): Promise<Uint8Array> {
  // For server-side (Node.js), use the built-in zlib
  const { promisify } = await import("util");
  const zlib = await import("zlib");
  const inflateRaw = promisify(zlib.inflateRaw);
  const result = await inflateRaw(Buffer.from(data));
  return new Uint8Array(result);
}
