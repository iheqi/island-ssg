// import { Plugin } from "vite";
import { pluginMdxRollup } from "./pluginMdxRollup";

export async function pluginMdx() {
  return [await pluginMdxRollup()];
}