// 运行时加载路由，代替 Content.tsx 中的手动配置路由

import fastGlob from 'fast-glob';
import { normalizePath } from 'vite';
import path from 'path';

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  #scanDir: string;
  #routeData: RouteMeta[] = [];

  constructor(scanDir: string) {
    this.#scanDir = scanDir;
  }

  async init() {
    const files = fastGlob.sync(['**/*.{js,jsx,ts,tsx,md,mdx}'], {
      cwd: this.#scanDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/build/**', 'config.ts']
    }).sort();

    files.forEach((file) => {
      const fileRelativePath = normalizePath(
        path.relative(this.#scanDir, file)
      );

      // 1. 路由路径
      const routePath = this.normalizeRoutePath(fileRelativePath);
      // 2. 文件绝对路径
      this.#routeData.push({
        routePath,
        absolutePath: file
      });

    })
  }

  // 获取路由数据，方便测试
  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }

  // 生成路由配置。使用 @loadable/component 来进行组件的按需加载
  generateRoutesCode(ssr = false) {
    return `
  import React from 'react';
  ${ssr ? '' : 'import loadable from "@loadable/component";'}
  ${this.#routeData
  .map((route, index) => {
    return ssr
      ? `import Route${index} from "${route.absolutePath}";`
      : `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
  })
  .join('\n')}
  export const routes = [
  ${this.#routeData
    .map((route, index) => {
      return `{ path: '${route.routePath}', element: React.createElement(Route${index}) }`;
    })
    .join(',\n')}
  ];
  `;
  }

  // 返回符合 react-router 的路由
  normalizeRoutePath(rawPath: string) {
    const routePath = rawPath.replace(/\.(.*)?$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }
}