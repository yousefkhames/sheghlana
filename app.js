/* MIT · Copyright (c) 2026 Yousef Khames · sheghlana UI */
(function () {
  'use strict';
  const { el, t } = Kit, S = SheghCore;
  const cfg = Object.assign({ demo: true }, window.SHEGH_CONFIG);
  const demoData = () => {
    const n = Date.now(), st = S.defaults(); st.biz = 'Demo Workshop'; st.phone = '';
    const c = [{ id: 'c1', name: 'Demo Client 1', phone: '', addr: 'Demo Street 1', demo: true }, { id: 'c2', name: 'Demo Client 2', phone: '', addr: 'Demo Street 2', demo: true }];
    const j1 = S.newJob('j1', 'c1', 'Demo: replace a kitchen mixer', n, true); j1.items = [{ kind: 'labour', desc: 'Demo labour', qty: 1, price: 200 }, { kind: 'material', desc: 'Demo mixer', qty: 1, price: 450 }]; S.issueEstimate(j1, st); j1.date = '2027-01-10'; j1.time = '10:00'; j1.status = 'scheduled'; j1.checklist = [{ t: 'Demo: bring tools', done: false }];
    const j2 = S.newJob('j2', 'c2', 'Demo: inspect an AC unit', n, true);
    return { settings: st, clients: c, jobs: [j1, j2], demo: true };
  };
  const store = Kit.store('sheghlana', 1, { settings: S.defaults(), clients: [], jobs: [], demo: false, seeded: false });
  if (!store.data.seeded) { if (cfg.demo) Object.assign(store.data, demoData()); store.data.seeded = true; store.save(); }
  const app = document.getElementById('app'), D = () => store.data;
  let tab = 'jobs', filter = 'all', open = null, day = '2027-01-10';
  const cur = () => D().settings.currency || 'EGP';
  const money = (n) => Kit.money(n, cur());
  const client = (id) => D().clients.find((c) => c.id === id);
  const jobTot = (j) => S.totals(j.items, j.taxRate == null ? D().settings.taxRate : j.taxRate);
  const A = (p, ...k) => p.append(...k.flat(Infinity).filter((x) => x != null && x !== false));
  const field = (label, input) => el('label', { class: 'field' }, el('span', { text: label }), input);
  const save = () => { store.save(); render(); };
  const inp = (v, on, attrs) => { const i = el('input', Object.assign({ value: v == null ? '' : v }, attrs || {})); i.addEventListener('change', () => on(i.value)); return i; };
  const badge = (j) => el('span', { class: 'badge', text: t('st_' + j.status) });

  function docNode(j, kind) {
    const s = D().settings, c = client(j.clientId) || {}, tot = jobTot(j), no = kind === 'inv' ? j.invNo : j.estNo;
    return el('div', {}, el('h2', { text: s.biz || t('title') }), s.phone ? el('p', { text: s.phone }) : null, el('h3', { text: t(kind === 'inv' ? 'invoice' : 'estimate') + ' ' + no }), el('p', { text: t('docDate', { d: new Date(Kit.now()).toLocaleDateString(Kit.lang === 'ar' ? 'ar-EG' : 'en-GB') }) }), el('p', { text: t('docTo', { c: c.name || '' }) + (c.addr ? ' · ' + c.addr : '') }), el('p', { text: j.title }),
      el('table', {}, el('tbody', {}, j.items.map((i) => el('tr', {}, el('td', { text: t(i.kind) + ': ' + i.desc }), el('td', { text: String(i.qty) + ' × ' + i.price }), el('td', { text: String(S.lineTotal(i)) }))))),
      el('p', { text: t('subtotal') + ': ' + money(tot.sub) }), tot.rate ? el('p', { text: t('tax', { r: tot.rate }) + ': ' + money(tot.tax) }) : null, el('p', {}, el('strong', { text: t('total') + ': ' + money(tot.total) })), j.demo ? el('p', { text: t('demoTag') }) : null, el('p', { class: 'small', text: t('docNotTax') }), el('p', { class: 'small', text: 'By Yousef Khames · من تطوير يوسف خميس' }));
  }
  function issue(j, kind) { const r = kind === 'inv' ? S.issueInvoice(j, D().settings) : S.issueEstimate(j, D().settings); if (!r.ok) { Kit.toast(t('noItems')); return false; } store.save(); return true; }
  function printDoc(j, kind) { if (!issue(j, kind)) return; let p = document.getElementById('doc-print'); if (!p) { p = el('div', { id: 'doc-print' }); document.body.append(p); } p.replaceChildren(docNode(j, kind)); render(); window.print(); }
  function waDoc(j, kind) {
    const c = client(j.clientId) || {}; if (!Kit.phone(c.phone)) return Kit.toast(t('noPhone')); if (!issue(j, kind)) return;
    const w = Kit.waLink(c.phone, t('waDocText', { biz: D().settings.biz || t('title'), k: t(kind === 'inv' ? 'invoice' : 'estimate'), no: kind === 'inv' ? j.invNo : j.estNo, job: j.title, tot: jobTot(j).total, cur: cur() })); render(); window.open(w.url, '_blank', 'noopener');
  }

  function jobSheet(j) {
    const p = el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true', id: 'jobsheet' }), s = D().settings;
    const csel = el('select', { id: 'j-client' }, D().clients.map((c) => el('option', { value: c.id, selected: c.id === j.clientId }, c.name))); csel.addEventListener('change', () => { j.clientId = csel.value; store.save(); });
    const ssel = el('select', { id: 'j-status' }, S.STATUSES.map((x) => el('option', { value: x, selected: x === j.status }, t('st_' + x)))); ssel.addEventListener('change', () => { const r = S.setStatus(j, ssel.value); if (!r.ok) Kit.toast(t('needInvoice')); save(); });
    const tot = jobTot(j), notes = el('textarea', { id: 'j-notes' }, j.notes); notes.addEventListener('change', () => { j.notes = notes.value; store.save(); });
    const addCheck = el('input', { id: 'chk-new', placeholder: t('addCheck'), 'aria-label': t('addCheck') });
    const pm = el('input', { id: 'pay-method', placeholder: t('payMethod') }), pn = el('input', { id: 'pay-note', placeholder: t('payNote') });
    A(p, el('h2', { text: j.title }), j.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null,
      field(t('fTitle'), inp(j.title, (v) => { j.title = v.trim().slice(0, 80) || j.title; save(); }, { id: 'j-title' })), field(t('fClient'), csel), field(t('fStatus'), ssel),
      el('div', { class: 'row' }, field(t('fDate'), inp(j.date, (v) => { j.date = v; store.save(); }, { type: 'date', id: 'j-date' })), field(t('fTime'), inp(j.time, (v) => { j.time = v; store.save(); }, { type: 'time', id: 'j-time' }))), field(t('fNotes'), notes),
      el('h3', { text: t('checklist') }), j.checklist.map((x, i) => el('label', { class: 'row line' }, el('input', { type: 'checkbox', checked: x.done, onchange: (e) => { x.done = e.target.checked; store.save(); } }), el('span', { class: 'grow', text: x.t }), el('button', { class: 'btn small', onclick: () => { j.checklist.splice(i, 1); save(); } }, t('remove')))),
      el('div', { class: 'row' }, addCheck, el('button', { class: 'btn small', id: 'chk-add', onclick: () => { if (!addCheck.value.trim()) return; j.checklist.push({ t: addCheck.value.trim().slice(0, 80), done: false }); save(); } }, t('addCheck'))),
      el('h3', { text: t('items') }), el('div', { class: 'items' }, j.items.map((i, n) => el('div', { class: 'irow', 'data-row': n },
        (() => { const k = el('select', { 'aria-label': t('fTitle') }, ['labour', 'material'].map((x) => el('option', { value: x, selected: x === i.kind }, t(x)))); k.addEventListener('change', () => { i.kind = k.value; store.save(); }); return k; })(),
        inp(i.desc, (v) => { i.desc = v.slice(0, 80); store.save(); }, { class: 'i-desc', placeholder: t('desc'), 'aria-label': t('desc') }), inp(i.qty, (v) => { i.qty = S.num(v, 1); save(); }, { class: 'i-qty', inputmode: 'decimal', 'aria-label': t('qty') }), inp(i.price, (v) => { i.price = S.num(v); save(); }, { class: 'i-price', inputmode: 'decimal', 'aria-label': t('price') }),
        el('button', { class: 'btn small', onclick: () => { j.items.splice(n, 1); save(); } }, t('remove'))))),
      el('button', { class: 'btn small', id: 'item-add', onclick: () => { j.items.push({ kind: 'labour', desc: '', qty: 1, price: 0 }); save(); } }, t('addItem')),
      el('p', { class: 'tot', id: 'j-total', text: t('total') + ': ' + money(tot.total) }),
      el('div', { class: 'row' }, el('button', { class: 'btn', id: 'est-print', onclick: () => printDoc(j, 'est') }, t('estimate') + ': ' + t('printDoc')), el('button', { class: 'btn', onclick: () => waDoc(j, 'est') }, t('estimate') + ': ' + t('waDoc'))),
      el('div', { class: 'row' }, el('button', { class: 'btn', id: 'inv-print', onclick: () => printDoc(j, 'inv') }, t('invoice') + ': ' + t('printDoc')), el('button', { class: 'btn', onclick: () => waDoc(j, 'inv') }, t('invoice') + ': ' + t('waDoc'))),
      j.estNo || j.invNo ? el('p', { class: 'small', id: 'j-nos', text: [j.estNo, j.invNo].filter(Boolean).join(' · ') }) : null,
      j.paid ? el('div', { class: 'banner', id: 'paid-info' }, el('p', { text: t('paidInfo') }), el('p', { class: 'small', text: [j.paid.method, j.paid.note].filter(Boolean).join(' · ') }), el('button', { class: 'btn small', onclick: () => { S.unmarkPaid(j); save(); } }, t('undoPaid')))
        : el('div', { class: 'row' }, pm, pn, el('button', { class: 'btn', id: 'mark-paid', onclick: () => { const r = S.markPaid(j, Kit.now(), pm.value, pn.value); if (!r.ok) return Kit.toast(t('needInvoice')); save(); } }, t('markPaid'))),
      el('div', { class: 'row' }, el('button', { class: 'btn danger', id: 'j-del', onclick: () => { if (!confirm(t('confirmDel'))) return; D().jobs = D().jobs.filter((x) => x.id !== j.id); open = null; save(); } }, t('delJob')), el('button', { class: 'btn primary', id: 'j-close', onclick: () => { open = null; render(); } }, t('close'))));
    return el('div', { class: 'sheet', onclick: (e) => { if (e.target.classList.contains('sheet')) { open = null; render(); } } }, p);
  }

  function viewJobs() {
    const root = el('div', {}), jobs = D().jobs, sm = S.summary(jobs, D().settings);
    root.append(el('h2', { text: t('summaryH') }), sm.invoiced == null ? el('p', { id: 'sum', text: t('noInvoices') }) : el('p', { id: 'sum' }, t('invoiced', { v: money(sm.invoiced) }), el('br'), t('received', { v: money(sm.received) }), el('br'), t('outstanding', { v: money(sm.outstanding) })));
    root.append(el('div', { class: 'row' }, ['all'].concat(S.STATUSES).map((x) => el('button', { class: 'btn small' + (filter === x ? ' primary' : ''), onclick: () => { filter = x; render(); } }, (x === 'all' ? t('all') : t('st_' + x)) + ' ' + (x === 'all' ? jobs.length : sm.counts[x])))));
    const list = jobs.filter((j) => filter === 'all' || j.status === filter).sort((a, b) => b.createdAt - a.createdAt);
    if (!list.length) root.append(el('p', { text: t('noJobs') }));
    list.forEach((j) => root.append(el('div', { class: 'row line jobrow', 'data-job': j.id, tabindex: 0, role: 'button', onclick: () => { open = j.id; render(); } }, el('strong', { class: 'grow', text: j.title }), el('span', { class: 'small', text: (client(j.clientId) || {}).name || '' }), badge(j), j.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null)));
    const ti = el('input', { id: 'new-title', placeholder: t('jobTitle'), 'aria-label': t('jobTitle') }), cs = el('select', { id: 'new-client', 'aria-label': t('pickClient') }, D().clients.map((c) => el('option', { value: c.id }, c.name)));
    root.append(el('section', { class: 'card' }, el('h2', { text: t('addJob') }), ti, cs, el('button', { class: 'btn primary', id: 'new-job', onclick: () => { if (!ti.value.trim()) return Kit.toast(t('needTitle')); if (!cs.value) return Kit.toast(t('needClient')); const j = S.newJob(Kit.uid('job'), cs.value, ti.value, Kit.now(), false); D().jobs.push(j); open = j.id; save(); } }, t('addJob'))));
    return root;
  }
  function viewDay() {
    const root = el('div', {}), dl = S.dayList(D().jobs, day);
    root.append(el('h2', { text: t('dayH') }), field(t('fDate'), inp(day, (v) => { day = v; render(); }, { type: 'date', id: 'day-date' })));
    if (!dl.length) root.append(el('p', { id: 'day-empty', text: t('noDay') }));
    dl.forEach((j) => root.append(el('div', { class: 'row line jobrow', 'data-job': j.id, onclick: () => { open = j.id; render(); } }, el('strong', { text: j.time || t('noTime') }), el('span', { class: 'grow', text: j.title }), el('span', { class: 'small', text: (client(j.clientId) || {}).name || '' }), badge(j))));
    return root;
  }
  function viewClients() {
    const root = el('div', {}); root.append(el('h2', { text: t('clients') })); if (!D().clients.length) root.append(el('p', { text: t('noClients') }));
    D().clients.forEach((c) => root.append(el('div', { class: 'row line' }, el('strong', { class: 'grow', text: c.name }), el('span', { class: 'small', text: [c.phone, c.addr].filter(Boolean).join(' · ') }), c.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null, el('button', { class: 'btn small', onclick: () => { if (D().jobs.some((j) => j.clientId === c.id)) return Kit.toast(t('clientBusy')); D().clients = D().clients.filter((x) => x.id !== c.id); save(); } }, t('delClient')))));
    const n = el('input', { id: 'c-name', placeholder: t('clientName'), 'aria-label': t('clientName') }), p = el('input', { id: 'c-phone', type: 'tel', dir: 'ltr', placeholder: t('clientPhone'), 'aria-label': t('clientPhone') }), a = el('input', { id: 'c-addr', placeholder: t('clientAddr'), 'aria-label': t('clientAddr') });
    root.append(el('section', { class: 'card' }, n, p, a, el('button', { class: 'btn primary', id: 'c-add', onclick: () => { if (!n.value.trim()) return Kit.toast(t('needName')); D().clients.push({ id: Kit.uid('c'), name: n.value.trim().slice(0, 60), phone: p.value.trim().slice(0, 20), addr: a.value.trim().slice(0, 100) }); save(); } }, t('addClient')))); return root;
  }
  function viewSettings() {
    const s = D().settings, root = el('div', {}), imp = el('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async (e) => { const f = e.target.files[0]; if (!f) return; const r = store.importJSON(await Kit.readFile(f)); const d = r.ok && r.data; if (!d || !d.settings || !Array.isArray(d.jobs) || !Array.isArray(d.clients)) return Kit.toast(t('restoreFail')); store.data = Object.assign({ seeded: true }, d); store.save(); Kit.toast(t('restored')); render(); } });
    const set = (k, num) => (v) => { s[k] = num ? Math.max(num === 'int' ? 1 : 0, S.num(v)) : v.trim().slice(0, 30); if (num === 'int') s[k] = Math.floor(s[k]); store.save(); };
    root.append(el('h2', { text: t('settings') }), field(t('biz'), inp(s.biz, set('biz'), { id: 's-biz' })), field(t('bizPhone'), inp(s.phone, set('phone'), { dir: 'ltr' })), field(t('cur'), inp(s.currency, set('currency'))), field(t('taxRate'), inp(s.taxRate, set('taxRate', 1), { id: 's-tax', inputmode: 'decimal' })),
      field(t('estPrefix'), inp(s.estPrefix, set('estPrefix'))), field(t('nextEst'), inp(s.nextEst, set('nextEst', 'int'), { inputmode: 'numeric' })), field(t('invPrefix'), inp(s.invPrefix, set('invPrefix'))), field(t('nextInv'), inp(s.nextInv, set('nextInv', 'int'), { inputmode: 'numeric' })),
      el('div', { class: 'row' }, el('button', { class: 'btn', id: 'csv', onclick: () => Kit.download('sheghlana-jobs.csv', S.jobsCsv(D().jobs, D().clients, s), 'text/csv') }, t('exportCsv')), el('button', { class: 'btn', onclick: () => Kit.download('sheghlana-backup.json', store.exportJSON(), 'application/json') }, t('backup')), el('button', { class: 'btn', onclick: () => imp.click() }, t('restoreFile')), imp,
        el('button', { class: 'btn danger', id: 'clear', onclick: () => { if (!confirm(t('confirmClear'))) return; store.reset(); store.data.seeded = true; store.data.demo = false; store.save(); open = null; render(); } }, t('clearDemo'))), el('p', { class: 'small', text: t('limits') })); return root;
  }

  function render() {
    Kit.applyTheme(); document.title = 'sheghlana | شغلانة';
    const tb = (id, l) => el('button', { class: 'tab' + (tab === id ? ' on' : ''), id: 'tab-' + id, 'aria-current': tab === id ? 'page' : null, onclick: () => { tab = id; render(); } }, l);
    const main = el('main', { id: 'main-content', tabindex: '-1' });
    if (store.blocked) main.append(el('div', { class: 'banner', role: 'alert', text: t('blocked') }), el('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmClear'))) { store.reset(); location.reload(); } } }, t('clearDemo')));
    if (D().demo) main.append(el('div', { class: 'banner', role: 'note', id: 'demo-banner', text: t('demoBanner') }));
    main.append(tab === 'jobs' ? viewJobs() : tab === 'day' ? viewDay() : tab === 'clients' ? viewClients() : viewSettings());
    const header = el('header', { class: 'top noprint' }, el('div', { class: 'brand' }, el('img', { src: 'assets/favicon.svg', width: 28, height: 28, alt: '' }), el('strong', { text: D().settings.biz || t('title') })), el('nav', { class: 'tabs', 'aria-label': 'Main' }, tb('jobs', t('jobs')), tb('day', t('day')), tb('clients', t('clients')), tb('settings', t('settings'))), el('button', { class: 'btn small', onclick: () => { Kit.setLang(Kit.lang === 'ar' ? 'en' : 'ar', 'sheghlana'); render(); } }, t('lang')));
    const j = open && D().jobs.find((x) => x.id === open);
    app.replaceChildren(header, el('div', { class: 'wrap' }, main), Kit.footer(), j ? jobSheet(j) : null); document.body.dataset.ready = '1';
  }
  Kit.initLang('sheghlana'); render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
