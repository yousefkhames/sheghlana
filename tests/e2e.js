// Usage: NODE_PATH=/tmp/pt/node_modules node tests/e2e.js <url> [shotDir]
const puppeteer = require('puppeteer-core');
const url = process.argv[2] || 'http://localhost:8123/'; const shots = process.argv[3] || '/tmp/shots';
require('fs').mkdirSync(shots, { recursive: true });
let pass = 0; const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; throw new Error(m); } pass++; console.log('ok', m); };
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'], headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('dialog', (d) => d.accept());
  await p.goto(url, { waitUntil: 'networkidle0' });
  const click = async (sel) => { await p.waitForSelector(sel); await p.click(sel); };
  const txt = () => p.evaluate(() => document.body.innerText);
  const tick = (ms) => new Promise((r) => setTimeout(r, ms));
  ok((await p.evaluate(() => document.documentElement.dir)) !== '', 'page loads with dir set');
  await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle0' });
  // language toggle
  const dir0 = await p.evaluate(() => document.documentElement.dir); await click('[data-act=lang]'); const dir1 = await p.evaluate(() => document.documentElement.dir); ok(dir0 !== dir1, 'language toggle flips RTL/LTR');
  if (dir1 === 'rtl') { await click('[data-act=lang]'); }
  ok(await p.evaluate(() => document.documentElement.dir) === 'ltr', 'English is LTR');
  // crew: add worker, client
  await click('[data-act=tab][data-v=crew]'); await click('[data-act=addCrew]'); await p.type('#sf-name', 'Mahmoud'); await p.type('#sf-role', 'Plumber'); await click('[data-m=save]'); ok((await txt()).includes('Mahmoud'), 'worker added');
  await click('[data-act=crewTab][data-v=clients]'); await click('[data-act=addCrew]'); await p.type('#sf-name', 'Mona Saleh'); await p.type('#sf-phone', '01100000001'); await click('[data-m=save]'); ok((await txt()).includes('Mona Saleh'), 'client added');
  await click('[data-act=crewTab][data-v=catalog]'); await click('[data-act=addCrew]'); await p.type('#sf-name', 'PVC pipe'); await p.type('#sf-unit', 'm'); await p.type('#sf-cost', '45'); await p.type('#sf-price', '60'); await click('[data-m=save]'); ok((await txt()).includes('PVC pipe'), 'catalog item added');
  // job
  await click('[data-act=tab][data-v=schedule]'); await click('[data-act=newJob]'); await p.type('#f-title', 'Fix kitchen sink');
  await p.select('#f-client', await p.$eval('#f-client option:nth-child(2)', (o) => o.value)); await p.click('[data-w]');
  await p.select('#cat', await p.$eval('#cat option:nth-child(2)', (o) => o.value)); await tick(100);
  await p.$eval('#mats [data-k=qty]', (e) => { e.value = '4'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.$eval('#f-hours', (e) => { e.value = '2'; e.dispatchEvent(new Event('input', { bubbles: true })); }); await p.$eval('#f-rate', (e) => { e.value = '100'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  let jt = await p.$eval('#jtot', (e) => e.innerText); ok(/440/.test(jt) && /260/.test(jt), 'job totals: revenue 440 (240+200) profit 260 -> ' + jt.replace(/\n/g, ' '));
  await p.screenshot({ path: shots + '/job-form.png' });
  await click('[data-m=save]'); await tick(100); ok((await txt()).includes('Fix kitchen sink'), 'job appears on schedule');
  // conflict warning
  await click('[data-act=newJob]'); await p.type('#f-title', 'Overlap'); await p.click('[data-w]'); await tick(100); ok((await p.$eval('#conf', (e) => e.innerText)).includes('Fix kitchen sink'), 'double-booking warning shown'); await click('[data-m=close]');
  // open job, make estimate
  await click('[data-act=openJob]'); await click('[data-m=mkDoc][data-type=estimate]'); await tick(200);
  ok((await p.$eval('#dtot', (e) => e.innerText)).includes('440'), 'estimate total 440');
  await p.$eval('#d-tax', (e) => { e.value = '14'; e.dispatchEvent(new Event('input', { bubbles: true })); }); ok((await p.$eval('#dtot', (e) => e.innerText)).includes('501.6'), 'tax 14% -> 501.6');
  await p.screenshot({ path: shots + '/estimate.png' });
  await click('[data-m=toInv]'); await tick(300); ok((await p.$eval('.sheet h3', (e) => e.innerText)).includes('INV-0001'), 'estimate converted to INV-0001');
  await p.type('#p-amt', '200'); await click('[data-m=addPay]'); await tick(100); const dt = await p.$eval('#dtot', (e) => e.innerText); ok(/301\.6/.test(dt), 'payment 200 leaves 301.6 due');
  await click('[data-m=save]'); await tick(100);
  ok((await txt()).toLowerCase().includes('part paid'), 'invoice shows part paid');
  await click('[data-act=docTab][data-v=estimate]'); ok((await txt()).toLowerCase().includes('accepted'), 'estimate marked accepted');
  // persistence
  await p.reload({ waitUntil: 'networkidle0' }); const st = await p.evaluate(() => JSON.parse(localStorage.getItem('sheghlana.v1'))); ok(st.jobs.length === 1 && st.docs.length === 2, 'data persisted in localStorage');
  // shopping
  await click('[data-act=tab][data-v=schedule]'); await click('[data-act=shopping]'); ok((await txt()).includes('PVC pipe'), 'shopping list lists material'); await click('[data-m=close]');
  // print markup
  await click('[data-act=tab][data-v=papers]'); await click('[data-act=openDoc]'); await p.evaluate(() => { window.print = () => { window.__printed = true; }; }); await click('[data-m=print]'); await tick(200);
  ok(await p.evaluate(() => window.__printed === true && document.querySelector('#printArea .doc') && document.querySelector('#printArea').textContent.includes('PVC pipe')), 'print view renders the document'); await click('[data-m=close]');
  // sample data + arabic screenshots
  await click('[data-act=tab][data-v=settings]'); await click('[data-act=sample]'); await click('[data-act=lang]'); await click('[data-act=tab][data-v=schedule]'); await tick(200);
  ok(await p.evaluate(() => document.documentElement.dir) === 'rtl', 'Arabic is RTL');
  await p.screenshot({ path: shots + '/schedule-ar.png' });
  await click('[data-act=tab][data-v=papers]'); await tick(100); await p.screenshot({ path: shots + '/papers-ar.png' });
  await click('[data-act=tab][data-v=crew]'); await p.screenshot({ path: shots + '/crew-ar.png' });
  // no horizontal overflow
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no horizontal overflow on mobile');
  // desktop shot
  await p.setViewport({ width: 1280, height: 800 }); await click('[data-act=tab][data-v=schedule]'); await tick(150); await p.screenshot({ path: shots + '/desktop.png' });
  ok(errs.length === 0, 'no console/page errors ' + errs.join('|'));
  await b.close(); console.log(pass + ' browser checks passed');
})().catch((e) => { console.error(e.message); process.exit(1); });
