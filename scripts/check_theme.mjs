#!/usr/bin/env node
// check_theme.mjs
// 校验「主题 CSS」是否遵守 resume-md2pdf 的硬约束。
// 主题由 frontend-design 现场生成，但它不知道本管线的约束（分页归 base.css、
// 矢量可复制、打印安全），所以拿回 CSS 后用本脚本自动拦截违规项。
//
// 用法:  node check_theme.mjs <theme.css>
// 退出码: 0 = 通过（可能有 warning）; 1 = 有 error 级违规，需修正后再用。

import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('用法: node check_theme.mjs <theme.css>'); process.exit(2); }
if (!existsSync(file)) { console.error(`✗ 找不到主题 CSS: ${file}`); process.exit(2); }

// 去掉注释，避免注释里的字样误报
const raw = readFileSync(file, 'utf8');
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

const errors = [];
const warnings = [];

// 1) 必须定义 --accent（base.css 的标题色/链接色依赖它）
if (!/--accent\s*:/.test(css)) {
  errors.push('缺少 `--accent` 变量定义（base.css 的标题分割线、链接色依赖它）。');
}

// 2) 禁止重定义 @page（A4/页边距归 base.css）
if (/@page\b/.test(css)) {
  errors.push('出现 `@page`：纸张/页边距由 templates/base.css 统一管，主题不得重定义。');
}

// 3) 禁止覆盖分页控制（会破坏“不从一行中间截断”的保证）
const pageRules = [
  ['break-inside', /\bbreak-inside\s*:/],
  ['break-before', /\bbreak-before\s*:/],
  ['break-after', /\bbreak-after\s*:/],
  ['page-break-*', /\bpage-break-(inside|before|after)\s*:/],
  ['orphans', /\borphans\s*:/],
  ['widows', /\bwidows\s*:/],
];
for (const [name, re] of pageRules) {
  if (re.test(css)) errors.push(`出现分页属性 \`${name}\`：分页归 base.css，主题不得覆盖。`);
}

// 4) 禁止图片背景（PDF 要矢量可复制；位图背景违背这一点）
if (/background-image\s*:/.test(css) || /background\s*:[^;{}]*url\(/.test(css)) {
  errors.push('出现图片背景（background-image / background:url(...)）：禁止位图背景，文字须保持矢量可选。');
}
// 内容用图片替代文字
if (/content\s*:\s*url\(/.test(css)) {
  errors.push('出现 `content:url(...)`：禁止用图片替代文字。');
}

// 5) 软提醒：动画对打印无意义（不拦截，仅提示）
if (/@keyframes\b/.test(css) || /\banimation\s*:/.test(css)) {
  warnings.push('含动画（@keyframes/animation）：PDF 打印无意义，可删以保持干净。');
}
// 软提醒：position:fixed 在分页里行为怪异
if (/position\s*:\s*fixed/.test(css)) {
  warnings.push('含 `position:fixed`：多页打印行为不可预期，建议避免。');
}

// 输出
for (const w of warnings) console.log(`⚠️  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n主题校验未通过：${errors.length} 项硬约束违规。请修正主题 CSS（或让 frontend-design 重出符合约束的版本）后再用。`);
  process.exit(1);
}
console.log('✓ 主题校验通过：未发现硬约束违规。');
