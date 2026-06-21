#!/usr/bin/env node
// render_pdf.mjs
// 用 Puppeteer 驱动真实 Chromium，把已生成的 HTML 简历渲染成 PDF。
// 页面几何(尺寸/页边距)以 templates/base.css 里的 @page 为准，保证所见即所得。
//
// 用法:
//   node render_pdf.mjs --in resume.html [--out resume.pdf] [--no-open]
//   不传 --in/--out 时，默认从桌面读 resume.html、把 resume.pdf 写到桌面。
//   默认生成后自动打开 PDF 预览；--no-open 关闭。
//
// 首次使用前需在 scripts 目录执行一次:  npm install
// (puppeteer 安装时会下载 Chromium，约几百 MB)

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

// 桌面目录（跨平台：macOS / Windows；Windows 开了 OneDrive 重定向时回退到 OneDrive\Desktop）。
function desktopDir() {
  const std = join(homedir(), 'Desktop');
  if (existsSync(std)) return std;
  const oneDrive = join(homedir(), 'OneDrive', 'Desktop');
  return existsSync(oneDrive) ? oneDrive : std;
}
function has(name) {
  return process.argv.includes(`--${name}`);
}
// 生成后用系统默认应用打开 PDF 预览（macOS 通常为 Preview，Windows 常为 Edge 等浏览器）。
function openPreview(file) {
  const target = resolve(file);
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    if (cmd === 'start') spawn(cmd, ['', target], { shell: true, stdio: 'ignore' }).unref();
    else spawn(cmd, [target], { stdio: 'ignore', detached: true }).unref();
    console.log(`  已打开预览: ${target}`);
  } catch {
    console.log(`  请手动打开预览: ${target}`);
  }
}

const input = arg('in', join(desktopDir(), 'resume.html'));
const out = arg('out', join(desktopDir(), 'resume.pdf'));

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
  if (!has('no-open')) openPreview(out);
} catch (e) {
  console.error('✗ 渲染 PDF 失败:', e.message);
  process.exit(1);
} finally {
  await browser.close();
}
