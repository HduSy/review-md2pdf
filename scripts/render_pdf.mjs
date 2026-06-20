#!/usr/bin/env node
// render_pdf.mjs
// 用 Puppeteer 驱动真实 Chromium，把已生成的 HTML 简历渲染成 PDF。
// 页面几何(尺寸/页边距)以 templates/base.css 里的 @page 为准，保证所见即所得。
//
// 用法:
//   node render_pdf.mjs --in resume.html [--out resume.pdf]
//
// 首次使用前需在 scripts 目录执行一次:  npm install
// (puppeteer 安装时会下载 Chromium，约几百 MB)

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const input = arg('in', join(process.cwd(), 'resume.html'));
const out = arg('out', join(process.cwd(), 'resume.pdf'));

if (!existsSync(input)) {
  console.error(`✗ 找不到 HTML 文件: ${input}。请先运行 build_html.mjs 生成 HTML。`);
  process.exit(1);
}

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  console.error('✗ 缺少依赖 puppeteer。请在 scripts 目录执行一次:  npm install');
  console.error('  (首次安装会下载 Chromium，约几百 MB，请耐心等待)');
  process.exit(1);
}

const fileUrl = 'file://' + resolve(input);
let browser;
try {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=zh-CN'],
  });
} catch (e) {
  console.error('✗ 启动 Chromium 失败:', e.message);
  console.error('  若是 Chromium 尚未下载完成，请在 scripts 目录重跑一次:  npm install');
  process.exit(1);
}

try {
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await page.pdf({
    path: out,
    printBackground: true,
    preferCSSPageSize: true, // 使用 base.css 中 @page 的 A4 + 页边距
  });
  console.log(`✓ PDF 已生成: ${out}`);
} catch (e) {
  console.error('✗ 渲染 PDF 失败:', e.message);
  process.exit(1);
} finally {
  await browser.close();
}
