import { JUEGO } from "@/content/juego";
import { urlPublica, SERVICIO } from "@/content/servicio";
import { formatPoints } from "@/lib/game";
import { BLOCKS_PER_HALVING, chainSquares } from "@/lib/snake";

export const gameShareUrl = () => `${urlPublica("/juego")}?ref=compartido`;

type Shared = { dayNumber: number; blocks: number; points: number; crashed: boolean };

/** Texto al estilo Wordle: se entiende de un vistazo y no revela el mapa. */
export function gameShareText({ dayNumber, blocks, points, crashed }: Shared) {
  return `${SERVICIO.marca} · ${JUEGO.daily} #${dayNumber}\n${chainSquares(blocks)} ${crashed ? "💥" : "⏱️"}\n${blocks} bloques · ${formatPoints(points)} puntos\n${JUEGO.shareText} ${gameShareUrl()}`;
}

export async function gameShareImage({ dayNumber, blocks, points, crashed }: Shared) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se ha podido crear la imagen");
  const tokens = getComputedStyle(document.documentElement);
  const color = (name: string) => tokens.getPropertyValue(name).trim();
  ctx.fillStyle = color("--ink");
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = color("--on-dark");
  ctx.font = '500 34px "Space Grotesk"';
  ctx.fillText(SERVICIO.marca, 72, 92);
  ctx.font = '400 30px "IBM Plex Mono"';
  ctx.fillText(`${JUEGO.daily} #${dayNumber}`, 72, 150);
  // La cadena: un eslabón por bloque, más tenue tras cada halving.
  const size = 22;
  const perRow = 42;
  for (let b = 0; b < Math.min(blocks, perRow * 3); b++) {
    const x = 72 + (b % perRow) * (size + 3);
    const y = 200 + Math.floor(b / perRow) * (size + 3);
    ctx.fillStyle = color("--instrument-dark");
    ctx.globalAlpha = [1, 0.6, 0.35, 0.2][Math.min(Math.floor(b / BLOCKS_PER_HALVING), 3)]!;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color("--on-dark");
  ctx.font = '500 120px "IBM Plex Mono"';
  ctx.fillText(formatPoints(points), 72, 400);
  ctx.font = '400 30px "Space Grotesk"';
  ctx.fillText(`puntos · ${blocks} bloques · ${crashed ? "choque" : "tiempo"}`, 76, 445);
  ctx.fillStyle = color("--instrument-dark");
  ctx.fillRect(72, 490, 1056, 3);
  ctx.fillStyle = color("--on-dark");
  ctx.font = '400 36px "Space Grotesk"';
  ctx.fillText(`${JUEGO.shareText} bloque170.com/juego`, 72, 560);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se ha podido crear la imagen"))),
      "image/png",
    ),
  );
}
