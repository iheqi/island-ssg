import { build as viteBuild, InlineConfig } from 'vite';
import { join, dirname } from "path";
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH  } from "./constants";
import fs from "fs-extra";
import { pathToFileURL } from 'url'; 
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';

// vite 正式环境
export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle - client 端 + server 端
  const [clientBundle, serverBundle] = await bundle(root, config);


  // 2. 引入 ssr 入口模块
  const serverEntryPath = join(root, ".temp", "ssr-entry.js");
  const { render, routes } = await import(pathToFileURL(serverEntryPath));

  // 3. 服务端渲染，产出 HTML
  await renderPages(render, routes, root, clientBundle);
}

export async function bundle(root: string, config: SiteConfig) {
  
  const resolveViteConfig = async (isServer: boolean): Promise<InlineConfig> => ({
    mode: "production",
    root,
    // 注意加上这个插件，自动注入 import React from 'react'，避免 React is not defined 的错误
    plugins: await createVitePlugins(config, undefined, isServer),
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      noExternal: ['react-router-dom']
    },
    build: {
      ssr: isServer,
      outDir: isServer ? join(root, '.temp') : 'build',
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm",
        },
      },
    },
  });

  console.log(`Building client + server bundles...`);
  
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(await resolveViteConfig(false)),
      // server build
      viteBuild(await resolveViteConfig(true)),
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}


export async function renderPages(
  render: (url: string) => string,
  routes: Route[],
  root: string,
  clientBundle
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log(`Rendering page in server side...`);

  return Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      const appHtml = render(routePath);
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>title</title>
    <meta name="description" content="xxx">
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module" src="/${clientChunk?.fileName}"></script>
  </body>
</html>`.trim();
      const fileName = routePath.endsWith('/')
        ? `${routePath}index.html`
        : `${routePath}.html`;
      await fs.ensureDir(join(root, 'build', dirname(fileName)));
      await fs.writeFile(join(root, 'build', fileName), html);
    })
  ); 
}