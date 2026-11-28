const assert = require('node:assert/strict'), { serve, launch } = require('./cdp.js');
(async () => {
  const srv = await serve(8135); const b = await launch(); let fail = 0; const U = 'http://127.0.0.1:8135/';
  const step = async (n, f) => { try { await f(); console.log('ok  ' + n); } catch (e) { fail++; console.log('FAIL ' + n + ' ' + e.message); } };
  const txt = (s) => b.eval('document.querySelector(' + JSON.stringify(s) + ').textContent');
  const tab = async (id) => { await b.click('#tab-' + id); await new Promise((r) => setTimeout(r, 150)); };
  try {
    await b.goto(U);
    await step('demo banner, demo jobs, no invented totals, byline', async () => { const t = await b.text(); assert.match(t, /بيانات تجريبية/); assert.match(t, /Demo: replace a kitchen mixer/); assert.match(await txt('#sum'), /لا توجد فواتير مسجلة/); assert.match(t, /من تطوير يوسف خميس/); });
    await step('open demo job, totals computed with tax 0', async () => { await b.click('[data-job=j1]'); await b.waitFor("document.querySelector('#jobsheet')"); assert.match(await txt('#j-total'), /650/); });
    await step('issue invoice, mark received, summary from recorded invoice', async () => {
      await b.eval("window.print=()=>{}"); await b.click('#inv-print'); await b.waitFor("document.querySelector('#j-nos')"); assert.match(await txt('#j-nos'), /INV-001/); assert.match(await txt('#doc-print'), /INV-001/); assert.match(await txt('#doc-print'), /ليس فاتورة ضريبية/);
      await b.type('#pay-method', 'cash'); await b.click('#mark-paid'); await b.waitFor("document.querySelector('#paid-info')"); await b.click('#j-close'); await b.waitFor("!document.querySelector('#jobsheet')");
      const s = await txt('#sum'); assert.match(s, /650/); assert.match(s, /المتبقي: 0/);
    });
    await step('cannot mark received without an invoice', async () => { await b.click('[data-job=j2]'); await b.waitFor("document.querySelector('#mark-paid')"); await b.click('#mark-paid'); await b.waitFor("document.querySelector('#toast.on')"); assert.match(await txt('#toast'), /أصدر فاتورة/); });
    await step('add line items to a job and see the total', async () => { await b.click('#item-add'); await b.waitFor("document.querySelector('.i-qty')"); await b.type('.i-desc', 'Demo part'); await b.type('.i-qty', '2'); await b.waitFor("document.querySelector('.i-price')"); await b.type('.i-price', '75.5'); await b.waitFor("document.querySelector('#j-total').textContent.includes('151')"); await b.type('#j-date', '2027-01-10'); await b.click('#j-close'); });
    await step('day view lists scheduled jobs by date', async () => { await tab('day'); await b.waitFor("document.querySelector('#day-date')"); await b.type('#day-date', '2027-01-10'); await b.waitFor("document.querySelector('[data-job=j2]')"); assert.ok(!(await b.eval("!!document.querySelector('[data-job=j1]')"))); await b.type('#day-date', '2027-02-02'); await b.waitFor("document.querySelector('#day-empty')"); });
    await step('add a client and a job; client with jobs cannot be deleted', async () => { await tab('clients'); await b.type('#c-name', 'Demo Client 3'); await b.click('#c-add'); await b.waitFor("document.body.innerText.includes('Demo Client 3')"); await tab('jobs'); await b.type('#new-title', 'Demo: paint a room'); await b.eval("document.querySelector('#new-client').value=[...document.querySelector('#new-client').options].find(o=>o.text==='Demo Client 3').value"); await b.click('#new-job'); await b.waitFor("document.querySelector('#jobsheet')"); await b.click('#j-close'); await tab('clients'); await b.waitFor("document.body.innerText.includes('Demo Client 3')"); await b.click('.line button', 'حذف'); await b.waitFor("document.querySelector('#toast.on')"); assert.match(await txt('#toast'), /لا يمكن حذف/); });
    await step('clear demo data empties everything', async () => { await tab('settings'); await b.eval('window.confirm=()=>true'); await b.click('#clear'); await b.waitFor("!document.querySelector('#demo-banner')"); await tab('jobs'); assert.match(await b.text(), /لا يوجد شغل/); });
    await step('no script errors', async () => assert.deepEqual(b.logs, []));
    await b.eval("localStorage.clear();location.hash='#/'"); await b.eval('location.reload()'); await new Promise((r) => setTimeout(r, 800)); await b.viewport(412, 860, true);
    await b.waitFor("document.querySelector('[data-job=j1]')"); await b.shot('/tmp/sheghlana-jobs.png'); await b.click('[data-job=j1]'); await b.waitFor("document.querySelector('#jobsheet')"); await b.shot('/tmp/sheghlana-job.png');
  } finally { await b.close(); srv.close(); }
  process.exit(fail ? 1 : 0);
})();
