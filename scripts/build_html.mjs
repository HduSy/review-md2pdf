#!/usr/bin/env node
// build_html.mjs
// 把 Markdown 简历转换成「结构层(base.css) + 动态主题(Claude 现场生成) + 内联」的单文件 HTML。
// 产物既能浏览器预览，又能直接交给 Puppeteer 渲染矢量 PDF。
//
// 用法:
//   node build_html.mjs --in resume.md --theme-css ./my-theme.css \
//     [--theme-name custom] [--lang zh-CN] [--title 标题] \
//     [--out resume.html] [--no-open] [--icons]
//
//   --theme-css  必填：Claude 根据目标岗位现场生成的主题 CSS（视觉层）。
//   --no-open    不自动用浏览器打开预览（默认会打开）。
//   --icons      可选：给联系方式注入 Lucide 图标（默认不注入；图标非必须）。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { icon } from '../assets/lucide-icons.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(HERE, '..', 'templates');

// 联系方式信号：含这些特征之一的 <p> 才视作「联系方式行」。
const CONTACT_SIGNAL = /(@|github\.com|linkedin\.com|\+?\d[\d\s-]{6,}\d|https?:\/\/)/i;

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function has(name) {
  return process.argv.includes(`--${name}`);
}

/* ---------- 分页友好的语义分组 ---------- */
// 每个 <h2> 段落包进 <section class="r-section">；每个 <h3> 条目包进 <div class="r-entry">。
// 配合 base.css 的 break-inside:avoid，尽量不让单条经历被拆到两页。
function structure(html) {
  const tokens = html.split(/(?=<(?:h2|h3)\b)/);
  let out = '';
  let inSection = false;
  for (const tok of tokens) {
    if (!tok) continue;
    if (/^<h2\b/.test(tok)) {
      if (inSection) out += '\n</section>\n';
      out += `<section class="r-section">\n${tok}`;
      inSection = true;
    } else if (/^<h3\b/.test(tok)) {
      out += `\n<div class="r-entry">${tok}</div>`;
    } else {
      out += tok;
    }
  }
  if (inSection) out += '\n</section>\n';
  return out;
}

/* ---------- 联系方式 Lucide 图标注入（可选） ---------- */
// 找到第一个「像联系方式」的 <p>（含邮箱/电话/GitHub/LinkedIn/网址信号），
// 按分隔符切成片段，逐项识别并在前面加上对应 Lucide 图标。失败时整体回退原样。
function classifyContact(seg) {
  const s = (seg || '').trim();
  if (!s) return seg;
  const text = s.replace(/<[^>]+>/g, '');
  const low = text.toLowerCase();
  let key = null;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+/.test(text)) key = 'mail';
  else if (/github\.com\//.test(low)) key = 'github';
  else if (/linkedin\.com\//.test(low)) key = 'linkedin';
  else if (!/[a-z一-龥]/i.test(text) && text.replace(/\D/g, '').length >= 7) key = 'phone';
  else if (/https?:\/\//i.test(text) || /(^|\s)([a-z0-9-]+\.)+(com|net|org|io|me|dev|cn|edu|co)(\/|\b|$)/i.test(text)) key = 'globe';
  if (!key) return seg;
  return `<span class="contact-item">${icon(key)}${seg}</span>`;
}
function injectContactIcons(html) {
  try {
    const matches = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)];
    const target = matches.find((mt) => CONTACT_SIGNAL.test(mt[1].replace(/<[^>]+>/g, '')));
    if (!target) return html;
    const inner = target[1];
    const parts = inner.split(/(\s*[·|•、,]\s*|\s*<br\s*\/?>\s*)/i);
    const rebuilt = parts.map((seg, i) => (i % 2 === 1 ? seg : classifyContact(seg))).join('');
    return html.slice(0, target.index) + `<p>${rebuilt}</p>` + html.slice(target.index + target[0].length);
  } catch {
    return html; // 识别失败时保持原样，不影响出 HTML
  }
}

/* ---------- 浏览器打开预览 ---------- */
function openInBrowser(file) {
  const target = resolve(file);
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    if (cmd === 'start') spawn(cmd, ['', target], { shell: true, stdio: 'ignore' }).unref();
    else spawn(cmd, [target], { stdio: 'ignore', detached: true }).unref();
    console.log(`  已在浏览器打开预览: ${target}`);
  } catch {
    console.log(`  请手动打开预览: ${target}`);
  }
}

/* ---------- 主流程 ---------- */
const input = arg('in');
const out = arg('out', join(process.cwd(), 'resume.html'));
const themeCssPath = arg('theme-css');
const themeName = arg('theme-name', 'custom');
const lang = arg('lang', 'zh-CN');
const title = arg('title', lang.startsWith('en') ? 'Resume' : '个人简历');
const wantOpen = !has('no-open');
const wantIcons = has('icons'); // 图标可选，默认关；按需用 --icons 开启联系方式图标

if (!input) {
  console.error('用法: node build_html.mjs --in <resume.md> --theme-css <theme.css> [--lang zh-CN] [--out resume.html] [--no-open] [--icons]');
  process.exit(1);
}
if (!existsSync(input)) { console.error(`✗ 找不到简历文件: ${input}`); process.exit(1); }
if (!themeCssPath) {
  console.error('✗ 缺少 --theme-css <path>。主题需由 Claude 根据目标岗位现场生成，见 references/theme-design-guide.md');
  process.exit(1);
}
if (!existsSync(themeCssPath)) { console.error(`✗ 找不到主题 CSS: ${themeCssPath}`); process.exit(1); }

let marked;
try { marked = (await import('marked')).marked; }
catch { console.error('✗ 缺少依赖 marked。请在 scripts 目录执行一次:  npm install'); process.exit(1); }

const md = readFileSync(input, 'utf8');
let bodyHtml = marked.parse(md, { gfm: true, breaks: false });
bodyHtml = structure(bodyHtml);
if (wantIcons) bodyHtml = injectContactIcons(bodyHtml);

const baseCss = readFileSync(join(TEMPLATES, 'base.css'), 'utf8');
const themeCss = readFileSync(themeCssPath, 'utf8');
const tpl = readFileSync(join(TEMPLATES, 'resume.template.html'), 'utf8');

const html = tpl
  .replaceAll('{{LANG}}', lang)
  .replaceAll('{{TITLE}}', title)
  .replaceAll('{{THEME}}', themeName)
  .replaceAll('{{STYLES}}', `${baseCss}\n/* ---- dynamic theme: ${themeName} ---- */\n${themeCss}`)
  .replaceAll('{{BODY}}', bodyHtml);

writeFileSync(out, html, 'utf8');
console.log(`✓ HTML 已生成: ${out}`);
console.log(`  主题: ${themeCssPath} (${themeName}) · 语言: ${lang} · 图标: ${wantIcons ? 'on' : 'off'}`);
if (wantOpen) openInBrowser(out);
