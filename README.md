# Chrome 扩展开发模板

## 技术栈

| 技术 | 用途 |
|------|------|
| Vite | 构建打包，开发时支持 HMR |
| @crxjs/vite-plugin | Vite 插件，自动处理 Chrome 扩展打包 |
| Manifest V3 | Chrome 扩展最新规范 |
| 原生 JavaScript | 业务逻辑 |

## 项目结构

```
├── src/
│   ├── manifest.json       # 扩展配置
│   ├── content/
│   │   └── index.js        # 注入页面的脚本
│   └── popup/
│       ├── index.html      # 点击扩展图标的弹窗
│       └── main.js
├── vite.config.js
├── package.json
└── .gitignore
```

## 快速创建新项目

```bash
mkdir my-extension && cd my-extension
npm init -y
npm i -D vite @crxjs/vite-plugin
```

## 关键配置

vite.config.js:
```javascript
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'

export default defineConfig({
  plugins: [crx({ manifest })]
})
```

package.json:
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

## 开发流程

1. `npm run dev` 启动开发模式
2. Chrome 打开 `chrome://extensions`，开启开发者模式
3. 点击"加载已解压的扩展程序"，选择 `dist` 目录
4. 修改代码后刷新页面即可（content script 需刷新页面，popup 自动热更新）
5. `npm run build` 打包发布

## 常用功能

### Content Script
注入到目标页面，可以操作 DOM、监听事件等。

### Popup
点击扩展图标弹出的界面，用于用户交互。

### Shadow DOM 操作
如果目标页面使用了 Shadow DOM，需要通过 `element.shadowRoot` 访问内部元素。

### 消息通信
popup 和 content script 之间通过 `chrome.runtime.sendMessage` 和 `chrome.tabs.sendMessage` 通信。
