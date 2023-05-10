import { build as viteBuild, InlineConfig } from 'vite';
import { join } from "path";
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH  } from "./constants";
import fs from "fs-extra";
import { pathToFileURL } from 'url'; 
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';

// vite 正式环境
export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle - client 端 + server 端
  const [clientBundle, serverBundle] = await bundle(root, config);


  // 2. 引入 ssr 入口模块
  const serverEntryPath = join(root, ".temp", "ssr-entry.js");
  const { render } = await import(pathToFileURL(serverEntryPath));

  // 3. 服务端渲染，产出 HTML
  await renderPage(render, root, clientBundle);
}

export async function bundle(root: string, config: SiteConfig) {
  
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: "production",
    root,
    // 注意加上这个插件，自动注入 import React from 'react'，避免 React is not defined 的错误
    plugins: createVitePlugins(config),
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
      viteBuild(resolveViteConfig(false)),
      // server build
      viteBuild(resolveViteConfig(true)),
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}


export async function renderPage(
  render: () => string,
  root: string,
  clientBundle
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log(`Rendering page in server side...`);
  const appHtml = render();
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
  await fs.ensureDir(join(root, "build"));
  await fs.writeFile(join(root, "build/index.html"), html);
  await fs.remove(join(root, ".temp"));  
}