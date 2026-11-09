import { JUEGO } from "@/content/juego";
import { urlPublica, SERVICIO } from "@/content/servicio";
import { formatScore, scoreSquare } from "@/lib/game";

export const gameShareUrl = () => `${urlPublica("/juego")}?ref=compartido`;

/** Texto al estilo Wordle: se entiende de un vistazo y no revela la solución. */
export function gameShareText(dayNumber: number, scores: number[], final: number) {
  return `${SERVICIO.marca} · ${JUEGO.daily} #${dayNumber}\n${scores.map(scoreSquare).join("")} ${formatScore(final)}/10\n${JUEGO.shareText} ${gameShareUrl()}`;
}

export async function gameShareImage(dayNumber: number, scores: number[], final: number) {
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
  // Un cuadrado por bloque, con la intensidad de la nota.
  scores.forEach((s, i) => {
    const x = 72 + i * 150;
    ctx.fillStyle = color("--instrument-dark");
    ctx.globalAlpha = s >= 10 ? 1 : s >= 7 ? 0.7 : s >= 4 ? 0.4 : 0.15;
    ctx.fillRect(x, 210, 124, 124);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color(s >= 7 ? "--ink" : "--on-dark");
    ctx.font = '500 36px "IBM Plex Mono"';
    ctx.fillText(formatScore(s), x + 22, 285);
  });
  ctx.fillStyle = color("--on-dark");
  ctx.font = '500 150px "IBM Plex Mono"';
  ctx.fillText(formatScore(final), 560, 330);
  ctx.font = '400 30px "Space Grotesk"';
  ctx.fillText("sobre 10", 570, 380);
  ctx.fillStyle = color("--instrument-dark");
  ctx.fillRect(72, 450, 1056, 3);
  ctx.fillStyle = color("--on-dark");
  ctx.font = '400 36px "Space Grotesk"';
  ctx.fillText(`${JUEGO.shareText} bloque170.com/juego`, 72, 530);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se ha podido crear la imagen"))),
      "image/png",
    ),
  );
}
