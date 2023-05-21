import { defineConfig } from '../dist/index.js';

export default defineConfig({
  title: '123456',
  themeConfig: {
    nav: [
      { text: "主页", link: "/" },
      { text: "指南", link: "/guide/" },
    ],
  },
});