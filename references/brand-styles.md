# 品牌设计风格库（awesome-design-md）

可选地，简历主题可以**基于某个知名品牌的设计语言**来做（配色、字体气质、设计原则），而不是让 frontend-design 完全自由设计。素材来自 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)：每个品牌一份 `DESIGN.md`，含 9 段规范（视觉氛围、配色+hex、字体、组件、布局、层次、Do/Don't、响应式、Agent Prompt）。

## 运行时怎么取一份品牌规范

raw URL 模式（`<slug>` 用下表的目录名）：

```
https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<slug>/DESIGN.md
```

抓到本地再读（比联网转述更保真）：

```bash
curl -fsSL "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<slug>/DESIGN.md" -o .brand-design.md
```

然后 Read `.brand-design.md`，重点取：**配色 hex（Colors 段）、字体气质（Typography 段）、视觉氛围与 Do/Don't**。

## 怎么把品牌规范变成简历主题（关键）

品牌 DESIGN.md 是给**网站/产品 UI** 写的，不能照搬到 A4 简历。把它当**风格依据**，转化为本管线的主题 CSS：

- **借**：主强调色（→ `--accent`）、中性灰阶、字体气质（衬线/无衬线/等宽）、标题处理思路、整体气质（克制/编辑/科技…）。
- **丢**：导航栏/按钮/卡片阴影/大色块背景/hover 动效/响应式断点——简历用不到，且违反硬约束。
- **必须仍满足** [主题设计指南](theme-design-guide.md) 的 CSS 契约，并过 `check_theme.mjs`：定义 `--accent`、不碰分页、无图片背景、打印安全、A4 单页。
- **打印安全提醒**：很多品牌是深色/大色块 UI（如 ElevenLabs、VoltAgent、PlayStation）。简历是白底，深色只用于文字/细线/小标，不要铺大面积深色背景。

落地有两种方式（选一）：
1. **喂给 frontend-design**：在 [theme-design-guide.md](theme-design-guide.md) 的 prompt 里附上「品牌名 + 从 DESIGN.md 摘出的配色/字体/气质」，让它据此设计简历主题（推荐，质量最稳）。
2. **直接合成**：据 DESIGN.md 的配色/字体自己写主题 CSS。

无论哪种，最后都 `check_theme.mjs` 校验通过再用。

## 如何向用户呈现

清单有 67 个，别一次性全抛。**按目标岗位推荐 3-4 个贴合的**用 AskUserQuestion 给选项（附"都不要 → 让我自由设计"），用户也可直接点名清单里任意品牌。下面是完整清单备查。

---

## 完整清单（按类目）

> 偏克制/专业/编辑气质的更适合简历正文；张扬的品牌（汽车/游戏/运动）可只借其配色与气质。

### AI & LLM
- Claude `claude` — 暖陶土强调色，干净编辑式排版（克制，适合简历）
- Cohere `cohere` — 鲜亮渐变，数据看板感
- ElevenLabs `elevenlabs` — 暗色电影感、声波美学（深色，慎用）
- Minimax `minimax` — 大胆暗色 + 霓虹
- Mistral AI `mistral.ai` — 法式极简、紫调
- Ollama `ollama` — 终端优先、单色
- OpenCode AI `opencode.ai` — 开发者暗色
- Replicate `replicate` — 干净白底、代码感（适合简历）
- Runway `runwayml` — 影展编辑美学
- Together AI `together.ai` — 蓝图风
- VoltAgent `voltagent` — 极暗黑 + 翡翠绿（深色，慎用）
- xAI `x.ai` — 冷峻单色、未来感

### Developer Tools & IDEs
- Cursor `cursor`、Expo `expo`、Lovable `lovable`、Raycast `raycast`、Superhuman `superhuman`、Vercel `vercel`（极简黑白，很适合简历）、Warp `warp`

### Backend / DB / DevOps
- ClickHouse `clickhouse`、Composio `composio`、HashiCorp `hashicorp`、MongoDB `mongodb`、PostHog `posthog`、Sanity `sanity`、Sentry `sentry`、Supabase `supabase`（绿色科技感）

### Productivity & SaaS
- Cal.com `cal`、Intercom `intercom`、Linear `linear.app`（冷静精密，很适合简历）、Mintlify `mintlify`、Notion `notion`（克制编辑，很适合简历）、Resend `resend`、Slack `slack`、Zapier `zapier`

### Design & Creative
- Airtable `airtable`、Clay `clay`、Figma `figma`、Framer `framer`、Miro `miro`、Webflow `webflow`

### Fintech & Crypto
- Binance `binance`、Coinbase `coinbase`、Kraken `kraken`、Mastercard `mastercard`、Revolut `revolut`、Stripe `stripe`（专业克制，很适合简历）、Wise `wise`

### E-commerce & Retail
- Airbnb `airbnb`、Meta `meta`、Nike `nike`（张扬，借配色）、Shopify `shopify`、Starbucks `starbucks`

### Media & Consumer Tech
- Apple `apple`（极简高级，很适合简历）、HP `hp`、IBM `ibm`（理性企业级，适合简历）、NVIDIA `nvidia`、Pinterest `pinterest`、PlayStation `playstation`（深色，慎用）、SpaceX `spacex`、Spotify `spotify`、The Verge `theverge`、Uber `uber`（黑白克制，适合简历）、Vodafone `vodafone`、WIRED `wired`（编辑杂志感）

### Automotive
- BMW `bmw`、BMW M `bmw-m`、Bugatti `bugatti`、Ferrari `ferrari`、Lamborghini `lamborghini`、Renault `renault`、Tesla `tesla`（汽车品牌多为深色大片，做简历建议只借配色与气质）

### Retro / Nostalgia
- Dell 1996 `dell-1996`、Nintendo.com 2001 `nintendo-2001`（怀旧网页风，趣味用途）
