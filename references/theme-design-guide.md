# 主题设计指南（调用 frontend-design 现场生成）

本 skill 的视觉层**不套固定模板**，也**不由本 skill 亲自配色排版**——而是把"为这份简历设计一套主题 CSS"这件事**委托给 `frontend-design` skill**（它专门产出有设计观点、避免 AI 套路感的前端样式）。本 skill 负责：把约束讲清楚、拿回 CSS 后校验、再喂给渲染管线。

固定模板会限制发挥、覆盖不全；让 frontend-design 现场设计，才能既贴岗位又有真正的设计水准。

> **另一条路：品牌设计风格。** 生成 HTML 前会先问用户要不要基于某个知名品牌的设计语言（Stripe / Apple / Linear / Notion …）来做。选了就走 [品牌风格库](brand-styles.md)（curl 抓该品牌 DESIGN.md → 提炼配色/字体/气质 → 转成简历主题，可再喂给 frontend-design）；没有心仪的才走下面的 frontend-design 自由设计。两条路最后都过 `check_theme.mjs`。

## 流程（核心）

1. **读简历 + 定位岗位**：用户明说 > 从简历推断 > 默认通用。顺带提炼简历气质（技术/金融/设计/学术…、信息密度、有无亮点）。
2. **用 Skill 工具调用 `frontend-design`**，prompt 用下面的模板填好（带上岗位、气质、结构说明、硬约束）。
3. **把它产出的 CSS 写入** 工作目录 `.resume-theme.css`。
4. **校验**：`node ~/.claude/skills/resume-md2pdf/scripts/check_theme.mjs .resume-theme.css`。非 0 退出 → 把报错贴回给 frontend-design 让它修，或手动改，重校直到通过。
5. 通过后作为 `--theme-css` 传给 `build_html.mjs`。

> 若 `frontend-design` 不可用（未安装/无法加载），降级为：你（Claude）亲自按下面的「设计维度」合成一份 CSS，同样跑 `check_theme.mjs` 校验。质量会弱一些，但流程不变。

## 调用 frontend-design 的 prompt 模板

把 `{...}` 换成实际内容后，用 Skill 工具调用 `frontend-design`：

```
为一份{语言：中文/英文}{目标岗位，如"后端工程师"}简历设计一套高质感的纯 CSS 视觉主题（皮肤层），叠加在已管好排版的 base.css 之上。

简历气质：{从简历提炼，如"6 年经验、偏基础设施、信息密度中等、有大厂背景"}。

固定 HTML 结构（只能给这些选择器加视觉样式，不增删 DOM）：
- h1 = 姓名；紧跟的第一个 p = 联系方式行
- section.r-section（内含 h2 章节标题，如"工作经历"）
- div.r-entry（内含 h3 条目标题，如"公司 — 职位 · 日期"）
- ul>li 要点；strong = 技能分类标签；code = 技术名词
- 联系方式项可能被包进 span.contact-item（含内联 Lucide <svg class="lucide">）

硬约束（必须全部满足，违反会破坏 PDF 管线）：
1. 只输出视觉层 CSS（字体族、颜色、字号、间距、标题装饰、列表标记、强调样式），用 :root 覆盖变量 + .resume 作用域。
2. 必须定义 --accent 变量（base.css 的标题色、链接色依赖它）。
3. 绝对不要写 @page、break-inside/break-before/break-after、page-break-*、orphans、widows——分页归 base.css，改了会让简历从一行中间截断。
4. 文字必须矢量可选：禁止任何图片背景（background-image / background:url / content:url），不要用图片替代文字。
5. 打印安全：A4 单页、避免大面积深色填充、保证文字/背景对比度（≥4.5:1）、不只靠颜色传意。
6. 不要动画（@keyframes/animation）和 position:fixed（PDF 打印无意义/行为不可预期）。
7. 中文字体走 base.css 的 PingFang/思源栈，主题只决定"偏衬线还是无衬线"（如需衬线，可 @import Google 衬线字体并以思源宋体/Songti 作中文回退）。

风格方向：{给一个明确方向，避免每次雷同，如"理性冷色工程感"或"暖色编辑感"，或"换一个和上次不同的方向"}。请给出可直接保存使用的完整 CSS。
```

## 设计维度（喂给 frontend-design 的素材，也是降级时自己用的清单）

- **色彩情绪**：一个 `--accent` 强调色 + 一组中性灰阶。暖/冷、明/稳由岗位气质定。
- **字体气质**：无衬线（现代/理性）/ 衬线（稳重/学术/编辑）/ 等宽点缀（工程感）。
- **标题处理**：下划线 / 左竖条 / 全大写 / 字重对比 / 序号编号，选一种主调，别堆砌。
- **密度**：字号、行高、段距。信息量大就紧凑，要留白感就放松。
- **强调方式**：accent 用于分割线/链接/小标签；避免大面积深色背景（打印不友好）。

## 岗位 → 设计方向（起点，不是硬映射）

- **技术 / 工程 / 数据**：理性冷色（蓝/青）、紧凑、可加等宽点缀、清晰分隔。
- **金融 / 咨询 / 法务 / 审计**：藏青/深灰、偏衬线、稳重、标题克制大写。
- **设计 / 产品 / 市场 / 内容**：品牌暖色或独特主色、现代、留白、标题处理可更有性格。
- **学术 / 科研 / 教育**：克制、偏衬线、层级清晰、少装饰。
- **不确定 / 通用 / 行政 / 运营**：中性蓝、平衡、最安全。

务必结合**具体简历内容**和**用户偏好**做差异化，避免"换汤不换药"。用户给的主色/参考站点优先采纳。

## CSS 契约（= 传给 frontend-design 的约束，也是 check_theme.mjs 的校验项）

`scripts/check_theme.mjs` 会自动拦截以下违规（error 级），通过后才进渲染：

1. **必须定义 `--accent`**——base.css 的标题分割线、链接等都依赖它。
2. **不得出现 `@page`**——纸张/页边距归 base.css。
3. **不得覆盖分页属性**：`break-inside`/`break-before`/`break-after`/`page-break-*`/`orphans`/`widows`。改坏会破坏"不从一行中间截断"的保证。
4. **不得有图片背景**：`background-image`、`background:url(...)`、`content:url(...)` 均禁止——文字须保持矢量可选。

软提醒（warning 级，不拦截）：动画、`position:fixed`。

只覆盖视觉层、作用域挂 `.resume`/`:root`；`body` 上会带一个 `theme-<name>` class，可选用于命名。

## 图标（可选，非必须）

图标**非必须**，不用图标也完全可以——干净的纯文字简历同样专业。只在判断"加图标确实增值"时才用（例如联系方式项较多，图标能提升扫读）。

- **自动联系方式图标**：给 `build_html.mjs` 加 `--icons`，按邮箱/电话/GitHub/LinkedIn/网址匹配 Lucide 图标，颜色跟随 `currentColor`。
- **手动按需放置**：从 `assets/lucide-icons.js` 取合适字形（mail / phone / mapPin / globe / github / linkedin / link / briefcase / graduationCap / star / user / award），作为内联 SVG 写到需要的位置。
- 想给图标单独着色，可在主题里覆盖 `.contact-item svg{ color: var(--accent); }`。

原则：宁可不加，不要堆砌；图标只服务于信息密度。

## 参考

`references/style-examples/` 里有几份范例 CSS——**借其中的配色系统与标题处理模式，不要照搬**。每份简历都应得到为它定制的新主题。

## 图标（可选，非必须）

图标**非必须**，不用图标也完全可以——干净的纯文字简历同样专业。只在判断"加图标确实增值"时才用（例如联系方式项较多，图标能提升扫读）。

- **自动联系方式图标**：给 `build_html.mjs` 加 `--icons`，按邮箱/电话/GitHub/LinkedIn/网址匹配 Lucide 图标，颜色跟随 `currentColor`。
- **手动按需放置**：从 `assets/lucide-icons.js` 取合适字形（mail / phone / mapPin / globe / github / linkedin / link / briefcase / graduationCap / star / user / award），作为内联 SVG 写到需要的位置。
- 想给图标单独着色，可在主题里覆盖 `.contact-item svg{ color: var(--accent); }`。

原则：宁可不加，不要堆砌；图标只服务于信息密度。

## 参考

`references/style-examples/` 里有几份范例 CSS——**借其中的配色系统与标题处理模式，不要照搬**。每份简历都应得到为它定制的新主题。
