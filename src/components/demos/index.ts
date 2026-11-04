import type { ComponentType } from "react";

import { DemoDificultad } from "./DemoDificultad";
import { DemoHash } from "./DemoHash";

/** Demos interactivas por slug de ficha del Diccionario. */
export const DEMOS: Record<string, ComponentType> = {
  hash: DemoHash,
  dificultad: DemoDificultad,
};
