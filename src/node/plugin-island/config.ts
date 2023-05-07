import { relative } from 'path';
import { Plugin, ViteDevServer } from 'vite';
import { SiteConfig } from '../../shared/types/index';

const SITE_DATA_ID = 'island:site-data';

// 这个插件的意义在于让前端可以通过虚拟模块的方式访问到 siteData 的内容
// src/runtime/clientEntry.ts
// import siteData from 'island:site-data';

export function pluginConfig(
  config: SiteConfig,
  restartServer: () => Promise<void>
): Plugin {
  let server: ViteDevServer | null = null;

  return {
    name: 'island:config',
    configureServer(s) {
      server = s;
    },
    resolveId(id) {
      
      if (id === SITE_DATA_ID) { 
        return '\0' + SITE_DATA_ID;
      }
    },
    load(id) {
      if (id === '\0' + SITE_DATA_ID) {
        return `export default ${JSON.stringify(config.siteData)}`;
      }
    },

    // handleHotUpdate钩子
    async handleHotUpdate(ctx) {
      const customWatchedFiles = [config.configPath];
      const include = (id: string) =>
        customWatchedFiles.some((file) => id.includes(file));

      if (include(ctx.file)) {
        console.log(
          `\n${relative(config.root, ctx.file)} changed, restarting server...`
        );
        // 重启 Dev Server
        await restartServer();
      }
    }
  };
}