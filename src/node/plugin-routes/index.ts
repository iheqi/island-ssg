import { Plugin } from "vite";

interface PluginOptions {
  root: string;
}

export const CONVENTIONAL_ROUTE_ID = 'island:routes';

export function pluginRoutes(options: PluginOptions): Plugin {
  return {
    name: "island:routes",
    resolveId(id: string) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return '\0' + id;
      }
    },

    load(id: string) {
      if (id === '\0' + CONVENTIONAL_ROUTE_ID) {
        return `export const routes = []`;
      }
    }
  }
}