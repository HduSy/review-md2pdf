# 配置与排错

## 一次性安装

管线依赖 Node（≥ 18，已验证 v22）+ 两个 npm 包。在 `scripts/` 目录执行一次：

```bash
cd ~/.claude/skills/resume-md2pdf/scripts
npm install
```

- `marked`：Markdown → HTML。
- `puppeteer`：安装时会**下载一份 Chromium**（约几百 MB），首次较慢，之后复用。

## 中文字体（PDF 渲染中文的关键）

Puppeteer 用系统字体。各平台自带情况：

- **macOS**：自带 `PingFang SC` / `Songti SC`，中文开箱即用。
- **Windows**：自带 `Microsoft YaHei`（微软雅黑），可用。
- **Linux**：通常需安装，如 `fonts-noto-cjk` 或 `wqy-microhei`，否则中文会变方块/缺字。

`base.css` 的字体栈已按 `PingFang SC → 思源黑体 → 微软雅黑 → …` 降级，按需补齐即可。

## 矢量与可复制

PDF 由 Puppeteer 的 `page.pdf()` 产出，**文字为矢量、可选、可复制、缩放保真**——这是该管线天然具备的。**不要**改用 `page.screenshot()` 之类栅格化方式，否则会丢失矢量文字。

## 常见问题

- **`Chromium 启动失败` / 找不到浏览器**：多半是首次安装时 Chromium 没下完。在 `scripts/` 重跑 `npm install`，或 `npx puppeteer browsers install chrome`。
- **下载 Chromium 慢/失败**：可设镜像，如 `PUPPETEER_DOWNLOAD_BASE_URL=https://cdn.npmmirror.com/binaries/chrome-browsers` 后重装。
- **PDF 中文是方块/缺字**：系统缺中文字体，按上面「中文字体」补装。
- **预览没自动打开**：macOS 用 `open`、Linux 用 `xdg-open`、Windows 用 `start`；也可手动打开生成的 `resume.html`。
- **想要联系方式图标**：图标可选、默认关闭；给 `build_html.mjs` 加 `--icons` 即按邮箱/电话/GitHub/LinkedIn/网址匹配 Lucide 图标。识别不到的格式可由 Claude 手动补内联 SVG。
