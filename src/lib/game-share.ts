import { JUEGO } from "@/content/juego";
import { urlPublica, SERVICIO } from "@/content/servicio";

export const gameShareUrl = () => `${urlPublica("/juego")}?ref=compartido`;
export async function gameShareImage(score: number) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se ha podido crear la imagen");
  const tokens = getComputedStyle(document.documentElement);
  ctx.fillStyle = tokens.getPropertyValue("--cream").trim(); ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = tokens.getPropertyValue("--ink").trim();
  ctx.font = '500 32px "Space Grotesk"'; ctx.fillText(SERVICIO.marca, 64, 72);
  ctx.font = '500 48px "Space Grotesk"'; ctx.fillText(JUEGO.title, 64, 170);
  ctx.font = '500 170px "IBM Plex Mono"'; ctx.fillText(score.toFixed(1).replace(".", ","), 64, 370);
  ctx.font = '400 28px "Space Grotesk"'; ctx.fillText("sobre 10 · tres retos de minería", 72, 424);
  ctx.fillStyle = tokens.getPropertyValue("--instrument").trim(); ctx.fillRect(64, 476, 1072, 3);
  ctx.fillStyle = tokens.getPropertyValue("--ink").trim(); ctx.font = '400 32px "Space Grotesk"';
  ctx.fillText(JUEGO.shareText, 64, 550);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("No se ha podido crear la imagen")), "image/png"));
}