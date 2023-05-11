import { createServer as createViteDevServer } from "vite";
import { PACKAGE_ROOT } from './constants';
import { resolveConfig } from "./config";
import { createVitePlugins } from './vitePlugins';


// vite 开发环境
export async function createDevServer(
  root: string,
  restartServer: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development');

  return createViteDevServer({
    root: PACKAGE_ROOT,
    plugins: await createVitePlugins(config, restartServer),
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}