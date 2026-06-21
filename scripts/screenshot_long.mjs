#!/usr/bin/env node
// screenshot_long.mjs —— 用 Puppeteer 对 HTML 简历做整页长截图(PNG)
// 用法: node screenshot_long.mjs --in resume.html --out shot.png [--width 900] [--scale 2]
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

function arg(name, fb){ const i=process.argv.indexOf(`--${name}`); return i>-1&&process.argv[i+1]?process.argv[i+1]:fb; }
const input = arg('in');
const out = arg('out', 'shot.png');
const width = parseInt(arg('width','900'),10);
const scale = parseInt(arg('scale','2'),10);

if(!input || !existsSync(input)){ console.error('✗ 找不到 HTML:', input); process.exit(1); }

const puppeteer = (await import('puppeteer')).default;
const browser = await puppeteer.launch({ headless:true, args:['--no-sandbox','--disable-dev-shm-usage','--lang=zh-CN'] });
try{
  const page = await browser.newPage();
  await page.setViewport({ width, height: 1200, deviceScaleFactor: scale });
  await page.goto('file://'+resolve(input), { waitUntil:'networkidle0' });
  // 屏幕态下 .resume 是居中带阴影的 A4 纸；只截这张纸，得到一张连续长图
  const el = await page.$('.resume');
  await el.screenshot({ path: out });
  console.log('✓ 长截图已生成:', out);
}catch(e){ console.error('✗ 截图失败:', e.message); process.exit(1); }
finally{ await browser.close(); }
