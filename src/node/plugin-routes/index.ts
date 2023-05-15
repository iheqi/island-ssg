import { Plugin } from "vite";
import { RouteService } from './RouteService';
import React from 'react';
import { PageModule } from 'shared/types';

export interface Route {
  path: string;
  element: React.ReactElement;
  filePath: string;
  preload: () => Promise<PageModule> // preload 方法，它的作用就是为了获取路由组件编译后的模块内容
}


interface PluginOptions {
  root: string;
  isSSR: boolean;
}

export const CONVENTIONAL_ROUTE_ID = 'island:routes';

export function pluginRoutes(options: PluginOptions): Plugin {
  const routeService = new RouteService(options.root);

  return {
    name: "island:routes",
    async configResolved() {
      // Vite 启动时，对 RouteService 进行初始化
      await routeService.init();
    },

    resolveId(id: string) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return '\0' + id;
      }
    },

    load(id: string) {
      if (id === '\0' + CONVENTIONAL_ROUTE_ID) {
        return routeService.generateRoutesCode(options.isSSR || false);
      }
    }
  }
}