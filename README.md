# review-md2pdf

**[English](README.en.md)** · 简体中文

把 **Markdown 简历**按目标岗位套上有设计观点的视觉主题，先渲染成 HTML 预览，确认后用 **Puppeteer / 真实 Chromium** 导出 **A4 矢量 PDF**（文字可选可复制、缩放保真；分页用 `@page` / `break-inside` 精确控制，不会从一行中间截断）。

这是一个 [Claude Code](https://docs.claude.com/en/docs/claude-code) skill。

## 能力边界

- **做**：Markdown 排版 + 视觉主题 + HTML 预览 + 导出 A4 矢量 PDF。
- **不做**：不改写 / 不润色 / 不增删简历内容（内容优化是另一回事）；不做中英混排（默认中文，或纯英文）。

## 工作流

1. **定位目标岗位**（用户明说 > 从简历推断 > 默认通用），确认语言。
2. **选主题风格**（生成 HTML 前先问）：
   - **品牌设计风格** —— 基于 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 的 67 个知名品牌（Stripe / Apple / Linear / Notion / Claude …），`curl` 取该品牌 `DESIGN.md`，提炼配色/字体/气质转成简历主题。见 `references/brand-styles.md`。
   - **自由设计** —— 调用 `frontend-design` skill 现场设计。见 `references/theme-design-guide.md`。
3. **校验主题**：`node scripts/check_theme.mjs .resume-theme.css`（拦截改分页 / 缺 `--accent` / 图片背景等违规）。
4. **生成 HTML 预览**（自动开浏览器）：`node scripts/build_html.mjs --in resume.md --theme-css .resume-theme.css --lang zh-CN [--icons]`。
5. **用户确认后导出 PDF**：`node scripts/render_pdf.mjs --in resume.html --out resume.pdf`。

## 两条硬保证

- **不从一行中间截断**：分页交给 Puppeteer 原生 `@page` + `break-inside`/`break-after` + `widows/orphans`（写在 `templates/base.css`），主题不得覆盖。
- **矢量、可选可复制、缩放保真**：PDF 由 `page.pdf()` 产出，禁止截图栅格化。

## 安装

```bash
cd scripts && npm install      # 安装 marked + puppeteer（首次会下载 Chromium，约几百 MB）
```

中文字体 / 排错见 `references/setup-notes.md`。

## 目录

```
SKILL.md                      入口（触发描述 + 工作流 + 资产地图）
agents/interface.yaml         接口元数据
scripts/build_html.mjs        Markdown → 主题化 HTML（结构分组 + 可选 Lucide 图标 + 自动开预览）
scripts/check_theme.mjs       主题 CSS 硬约束校验（无依赖）
scripts/render_pdf.mjs        HTML → A4 矢量 PDF（Puppeteer，preferCSSPageSize）
templates/base.css            结构层：A4 / 字体栈 / 分页规则（稳定地基）
templates/resume.template.html HTML 骨架
assets/lucide-icons.js        内联 Lucide SVG 图标集
references/theme-design-guide.md  如何调用 frontend-design 生成主题（含 prompt 模板与 CSS 契约）
references/brand-styles.md        品牌设计风格库（67 个品牌 + 取用与转化）
references/style-examples/        设计灵感范例 CSS（借模式，不照搬）
references/setup-notes.md          配置与排错
references/export-checklist.md     导出检查清单
examples/sample-resume.md          可直接试跑的样例简历
```

## 许可

[MIT](LICENSE)。品牌设计规范素材来自第三方仓库 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)，其内容版权归各自所有者。
