const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return out;
}

/** SHA-256 doble, igual que Bitcoin. */
export async function doubleSha256(input: string): Promise<string> {
  const first = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  const second = await crypto.subtle.digest("SHA-256", first);
  return toHex(second);
}

export function leadingZeros(hash: string): number {
  let n = 0;
  while (n < hash.length && hash[n] === "0") n++;
  return n;
}

export function formatInt(value: number): string {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value);
}

export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatSeconds(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${formatDecimal(s, 1)} s`;
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${formatInt(m)} min ${formatDecimal(rest, 0)} s`;
}
