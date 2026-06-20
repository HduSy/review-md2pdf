# resume-md2pdf

English · **[简体中文](README.md)**

Turn a **Markdown résumé** into a polished, role-tailored PDF: apply an opinionated visual theme, preview it as HTML, then export an **A4 vector PDF** with **Puppeteer / real Chromium** (selectable & copyable text, crisp at any zoom; pagination controlled precisely via `@page` / `break-inside` so lines are never cut mid-row).

At its core are three independent Node scripts (`build_html` / `check_theme` / `render_pdf`) that run from the command line — tool- and platform-agnostic. The only step that involves an AI assistant is *designing a visual theme for this résumé on the spot*; you can let an AI coding agent (e.g. Claude Code) do it, or hand-write a theme CSS yourself.

## Scope

- **Does**: Markdown layout + visual theme + HTML preview + A4 vector PDF export.
- **Does not**: rewrite / polish / add / remove résumé content (content optimization is a separate concern); no mixed CJK/Latin typesetting (Chinese by default, or English only).

## Workflow

1. **Identify the target role** (user-stated > inferred from the résumé > generic default), confirm language.
2. **Pick a theme style** (asked before generating HTML):
   - **Brand design style** — based on the 67 brands in [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (Stripe / Apple / Linear / Notion / Claude …): `curl` that brand's `DESIGN.md`, distill its palette/typography/mood into a résumé theme. See `references/brand-styles.md`.
   - **Freeform design** — let an AI coding agent (e.g. Claude Code's `frontend-design` skill) design one on the spot, or hand-write a theme CSS yourself against the constraints. See `references/theme-design-guide.md`.
3. **Validate the theme**: `node scripts/check_theme.mjs .resume-theme.css` (blocks pagination overrides / missing `--accent` / image backgrounds, etc.).
4. **Generate HTML preview** (opens in browser): `node scripts/build_html.mjs --in resume.md --theme-css .resume-theme.css --lang zh-CN [--icons]`.
5. **Export PDF after the user approves**: `node scripts/render_pdf.mjs --in resume.html --out resume.pdf`.

## Two hard guarantees

- **No mid-line cuts**: pagination is delegated to Puppeteer's native `@page` + `break-inside`/`break-after` + `widows/orphans` (defined in `templates/base.css`); themes must not override them.
- **Vector, selectable & copyable, zoom-faithful**: the PDF is produced by `page.pdf()`; screenshot rasterization is forbidden.

## Install

```bash
cd scripts && npm install      # installs marked + puppeteer (first run downloads Chromium, a few hundred MB)
```

Chinese fonts / troubleshooting: see `references/setup-notes.md`.

## Layout

```
SKILL.md                      Entry point (trigger description + workflow + asset map)
agents/interface.yaml         Interface metadata
scripts/build_html.mjs        Markdown → themed HTML (semantic grouping + optional Lucide icons + auto-open preview)
scripts/check_theme.mjs       Theme-CSS hard-constraint validator (no deps)
scripts/render_pdf.mjs        HTML → A4 vector PDF (Puppeteer, preferCSSPageSize)
templates/base.css            Structure layer: A4 / font stack / pagination rules (stable base)
templates/resume.template.html HTML skeleton
assets/lucide-icons.js        Inline Lucide SVG icon set
references/theme-design-guide.md  How to invoke frontend-design for a theme (prompt template + CSS contract)
references/brand-styles.md        Brand design style library (67 brands + how to fetch & adapt)
references/style-examples/        Reference CSS for inspiration (borrow patterns, don't copy)
references/setup-notes.md          Setup & troubleshooting
references/export-checklist.md     Export checklist
examples/sample-resume.md          A ready-to-run sample résumé
```

## License

[MIT](LICENSE). Brand design-spec material is sourced from the third-party repository [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md); its content remains the property of the respective owners.
