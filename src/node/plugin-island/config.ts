import { relative } from 'path';
import { Plugin } from 'vite';
import { SiteConfig } from '../../shared/types/index';

const SITE_DATA_ID = 'island:site-data';

// 这个插件的意义在于让前端可以通过虚拟模块的方式访问到 siteData 的内容
// src/runtime/clientEntry.ts
// import siteData from 'island:site-data';

export function pluginConfig(
  config: SiteConfig,
): Plugin {
  return {
    name: 'island:config',
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
  };
}