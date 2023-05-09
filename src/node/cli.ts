import { cac } from 'cac';
import { resolveConfig } from './config';

import { build } from './build';
import { resolve } from 'path';

const version = require("../../package.json").version;
const cli = cac('island').version(version).help();

cli
  .command("[root]", "start dev server")
  .alias('dev')
  .action(async (root: string) => {
    const createServer = async () => {
      // 配置文件改动的时候，我们都会执行 restartServer 的逻辑
      // 重新调用 dev.ts(构建产物为 dev.js) 的内容
      const { createDevServer } = await import('./dev.js');
      const server = await createDevServer(root, async () => {
        await server.close();
        await createServer();
      });
      await server.listen();
      server.printUrls();
    };
    await createServer();
  });

cli
  .command("build [root]", "build for production")
  .action(async (root: string) => {
    try {
      root = resolve(root);
      const config = await resolveConfig(root, 'build', 'production');
      await build(root, config);
    } catch (error) {
      console.log(error);
    }
  });

cli.parse();  