---
name: resume-md2pdf
description: 把 Markdown 简历按分析出的目标岗位现场生成定制视觉主题，先渲染成 HTML 在浏览器预览，用户确认后用 Puppeteer/真实 Chromium 导出 A4 矢量 PDF（文字可选可复制、缩放保真；分页用 @page/break-inside 精确控制，不会从一行中间截断）。当用户说「生成简历」「创建简历」「把简历转成 PDF」「简历排版」「resume to pdf」时使用。仅做排版与格式转 PDF，忠于原文不改写、不润色优化内容（内容优化改用 tailored-resume-generator），不做中英混排；图标可选、按需引入。
metadata:
  author: rayonreal
---

# Resume MD2PDF

把 Markdown 简历 → 按目标岗位定制视觉风格 → HTML 预览 → A4 矢量 PDF。

## 能力边界

- **做**：Markdown 排版 + 视觉主题 + HTML 预览 + Puppeteer/Chromium 导出 PDF。
- **不做**：不改写、不润色、不增删简历内容（那是 `tailored-resume-generator` 的事）；不做中英混排（默认中文，或纯英文）。

## 工作流

1. **定位目标岗位**：用户明说 > 从简历推断 > 默认通用。确认语言（默认 `zh-CN`）。
2. **选风格**（生成 HTML 前先问）：按目标岗位从 [品牌风格库](references/brand-styles.md) 推荐 3-4 个贴合的知名品牌设计风格，用 AskUserQuestion 让用户挑，并附「都不要 → 让我自由设计」选项；用户也可点名清单里任意品牌。
   - **选了某品牌** → `curl` 抓该品牌 `DESIGN.md`，提炼配色/字体/气质，转化为符合本管线约束的简历主题（细节见 [品牌风格库](references/brand-styles.md)）。
   - **没有心仪的 / 默认** → 用 Skill 工具调用 `frontend-design` 自由设计（带上岗位+简历气质+硬约束，prompt 模板见 [主题设计指南](references/theme-design-guide.md)）。
   - 两条路都**不套固定模板**，产出写入工作目录 `.resume-theme.css`。
3. **校验主题**（拦截违规，必过）：
   ```bash
   node ~/.claude/skills/resume-md2pdf/scripts/check_theme.mjs .resume-theme.css
   ```
   非 0 退出说明违反硬约束（改了分页 / 缺 `--accent` / 图片背景等）——按报错让 frontend-design 重出或手动修正，重校通过再继续。
4. **生成 HTML 预览**（会自动用浏览器打开）：
   ```bash
   node ~/.claude/skills/resume-md2pdf/scripts/build_html.mjs \
     --in resume.md --theme-css .resume-theme.css \
     --lang zh-CN [--icons] [--out resume.html]
   ```
   - `--theme-css` 必填（你刚生成的那份）。
   - `--icons` 可选：给联系方式加 Lucide 图标（非必须，按需）。
5. **等用户确认** HTML 后，再导出 PDF（用户没点头前不出 PDF）。
6. **导出 PDF**：
   ```bash
   node ~/.claude/skills/resume-md2pdf/scripts/render_pdf.mjs \
     --in resume.html --out resume.pdf
   ```
7. 按 [导出检查清单](references/export-checklist.md) 过一遍。

## 一次性配置（首次使用）

```bash
cd ~/.claude/skills/resume-md2pdf/scripts && npm install
```

`puppeteer` 首次会下载 Chromium（几百 MB）。中文字体/排错见 [配置与排错](references/setup-notes.md)。

## 分页与矢量（两条硬保证）

- **不从一行中间截断**：分页完全交给 Puppeteer 原生的 `@page` + `break-inside`/`break-after` + `widows/orphans`（写在 `templates/base.css`）。生成主题时**不要**覆盖这些规则。详见 [主题设计指南](references/theme-design-guide.md) 的「CSS 契约」。
- **矢量文字、可选可复制、缩放保真**：PDF 由 `page.pdf()` 产出，文字天然是矢量。**禁止**改用截图栅格化。

## 资产地图

- `scripts/build_html.mjs` —— Markdown → 主题化 HTML（结构分组 + 可选图标 + 自动开预览）。
- `scripts/check_theme.mjs` —— 校验主题 CSS 是否守住硬约束（不碰分页、有 `--accent`、无图片背景）。
- `scripts/render_pdf.mjs` —— HTML → A4 矢量 PDF（Puppeteer/Chromium，`preferCSSPageSize`）。
- `templates/base.css` —— 结构层：A4、字体栈、分页规则（稳定地基）。
- `templates/resume.template.html` —— HTML 骨架。
- `assets/lucide-icons.js` —— 内联 Lucide SVG 图标集（按需取用）。
- `references/theme-design-guide.md` —— **如何调用 frontend-design 生成主题**（核心，含 prompt 模板与约束）。
- `references/brand-styles.md` —— **品牌设计风格库**（awesome-design-md 的 67 个品牌，按岗位选用、curl 取规范、转成简历主题）。
- `references/style-examples/` —— 设计灵感范例（借模式，不照搬，运行时不依赖）。
- `references/setup-notes.md` / `references/export-checklist.md` —— 配置排错 / 导出检查。
- `examples/sample-resume.md` —— 可直接拿来试跑的样例简历。

## 输出契约

- HTML 预览（自动打开）→ 用户确认 → A4 矢量 PDF。
- 内容忠于原文；视觉为当前岗位定制；分页干净、文字可选可复制。

## 下一步（按需，复用增长后再加）

- 触发评测（vs `tailored-resume-generator` 的路由混淆）、主题质量回归样例、一键 `npm install` 检测。
