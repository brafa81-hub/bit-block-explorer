import type { ComponentType } from "react";

import { DemoDificultad } from "./DemoDificultad";
import { DemoHash } from "./DemoHash";
import { DemoRed } from "./DemoRed";
import { DemoUnidades } from "./DemoUnidades";

/** Demos interactivas por slug de ficha del Diccionario. */
export const DEMOS: Record<string, ComponentType> = {
  hash: DemoHash,
  dificultad: DemoDificultad,
  "unidades-de-hashrate": DemoUnidades,
  "hashrate-de-la-red": DemoRed,
};
