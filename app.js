(function () {
'use strict';
const L = window.SG, esc = L.esc, num = L.num;
const KEY = 'sheghlana.v1';
const COLORS = ['#ff6b1a', '#2457c5', '#1f8a54', '#c93a2b', '#8a4fff', '#d99a00', '#0e8c9a'];
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => L.ymd(new Date());

function defaults() {
  return { v: 1, lang: (navigator.language || '').startsWith('en') ? 'en' : 'ar', biz: { name: '', phone: '', currency: 'EGP', taxRate: 0, weekStart: 6 }, clients: [], team: [], catalog: [], jobs: [], docs: [] };
}
let S = load();
function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v === 1) return Object.assign(defaults(), d, { biz: Object.assign(defaults().biz, d.biz) }); } catch (e) {} return defaults(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Storage full'); } }
const V = { tab: 'schedule', day: todayStr(), jobFilter: 'all', q: '', docTab: 'invoice', crewTab: 'team' };
const t = (k) => { const d = window.I18N[S.lang]; return d[k] != null ? d[k] : (window.I18N.en[k] != null ? window.I18N.en[k] : k); };
const $ = (s, r) => (r || document).querySelector(s);
const cur = () => S.biz.currency || 'EGP';
const M = (n) => L.money(n, cur(), S.lang);
const clientOf = (id) => S.clients.find((c) => c.id === id);
const workerOf = (id) => S.team.find((w) => w.id === id);
const jobOf = (id) => S.jobs.find((j) => j.id === id);
function toast(msg) { const e = $('#toast'); e.textContent = msg; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 1800); }
function fmtDate(s) { const d = L.parseYmd(s); return d.toLocaleDateString(S.lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
const stClass = (s) => 's-' + s;
const pill = (cls, txt) => `<span class="pill ${cls}">${esc(txt)}</span>`;
const IC = {
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  jobs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/></svg>',
  crew: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.5.7 3.5 2.7 3.5 6"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
  empty: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="10" y="14" width="44" height="40" rx="6"/><path d="M10 26h44M22 8v10M42 8v10M24 40h16"/></svg>'
};
const emptyBox = (m) => `<div class="empty">${IC.empty}<p>${esc(m)}</p></div>`;
const wColor = (w) => w.color || COLORS[0];
const initial = (s) => esc((s || '?').trim().charAt(0).toUpperCase());
const docStatus = (d) => L.invoiceStatus(d, todayStr());

/* ---------- shell ---------- */
function render() {
  document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = S.lang === 'ar' ? 'شغلانة | Sheghlana' : 'Sheghlana | شغلانة';
  const tabs = [['schedule', 'cal'], ['jobs', 'jobs'], ['papers', 'doc'], ['crew', 'crew'], ['settings', 'cog']];
  const body = { schedule: vSchedule, jobs: vJobs, papers: vPapers, crew: vCrew, settings: vSettings }[V.tab]();
  $('#app').innerHTML = `<header class="top"><div class="logo"><svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1d1b19"/><path d="M0 50h64v14H0z" fill="#ff6b1a"/><path d="M8 50h10l-6 14H2zM28 50h10l-6 14H22zM48 50h10l-6 14H42z" fill="#1d1b19"/><path d="M22 14c8-4 18 0 18 7 0 9-18 4-18 13 0 5 6 7 14 5" fill="none" stroke="#f3efe6" stroke-width="6" stroke-linecap="round"/></svg><div>${esc(S.biz.name || t('app'))}<small>${esc(t('tag'))}</small></div></div><span class="sp"></span><button class="chip" data-act="lang" aria-label="Language">${S.lang === 'ar' ? 'EN' : 'عربي'}</button></header>
  <main class="wrap">${body}</main>
  ${(V.tab === 'schedule' || V.tab === 'jobs') ? `<button class="btn fab" data-act="newJob" aria-label="${esc(t('addJob'))}">+</button>` : ''}
  <nav class="nav" aria-label="Main">${tabs.map(([k, i]) => `<button data-act="tab" data-v="${k}" class="${V.tab === k ? 'on' : ''}" aria-label="${esc(t(k))}" ${V.tab === k ? 'aria-current="page"' : ''}>${IC[i]}<span>${esc(t(k))}</span></button>`).join('')}</nav>`;
}

/* ---------- schedule ---------- */
function jobsOn(d) { return S.jobs.filter((j) => j.date === d && j.status !== 'cancelled').sort((a, b) => (a.time || '99').localeCompare(b.time || '99')); }
function jobCard(j) {
  const c = clientOf(j.clientId); const crew = (j.team || []).map(workerOf).filter(Boolean);
  const mats = (j.materials || []); const bought = mats.filter((m) => m.bought).length;
  return `<article class="card ticket" style="--c:${crew[0] ? wColor(crew[0]) : '#ff6b1a'}" data-act="openJob" data-id="${j.id}" tabindex="0" role="button">
  <div class="tk"><div class="row"><b class="b" style="font-size:17px">${esc(j.title)}</b><span class="sp"></span>${pill(stClass(j.status === 'in-progress' ? 'progress' : j.status), t('st_' + (j.status === 'in-progress' ? 'progress' : j.status)))}</div>
  <div class="mut">${j.time ? '' + esc(j.time) + ' · ' : ''}${esc(fmtDate(j.date))}${c ? ' · ' + esc(c.name) : ''}</div>
  ${j.address ? `<div class="mut">${esc(j.address)}</div>` : ''}
  <div class="row" style="margin-top:6px">${crew.map((w) => `<span class="avatar" style="--c:${wColor(w)}" title="${esc(w.name)}">${initial(w.name)}</span>`).join('')}${mats.length ? `<span class="mut">${esc(t('materials'))}: ${bought}/${mats.length}</span>` : ''}</div></div></article>`;
}
function vSchedule() {
  const ws = L.weekStart(V.day, num(S.biz.weekStart));
  const days = Array.from({ length: 7 }, (_, i) => L.addDays(ws, i));
  const td = todayStr(); const dayJobs = jobsOn(V.day);
  const weekJobs = S.jobs.filter((j) => j.date >= ws && j.date <= L.addDays(ws, 6) && j.status !== 'cancelled' && j.status !== 'done').length;
  const unpaid = S.docs.filter((d) => d.type === 'invoice').reduce((s, d) => s + L.docTotals(d).due, 0);
  const ms = td.slice(0, 7); let collected = 0;
  S.docs.filter((d) => d.type === 'invoice').forEach((d) => (d.payments || []).forEach((p) => { if ((p.date || '').slice(0, 7) === ms) collected += num(p.amount); }));
  return `<div class="stats"><div class="stat"><b>${weekJobs}</b><span>${esc(t('weekJobs'))}</span></div><div class="stat"><b>${esc(M(unpaid))}</b><span>${esc(t('unpaidTotal'))}</span></div><div class="stat"><b>${esc(M(collected))}</b><span>${esc(t('monthRev'))}</span></div></div>
  <div class="row"><button class="btn sm sec" data-act="shift" data-n="-7" aria-label="prev">${S.lang === 'ar' ? '›' : '‹'}</button><b>${esc(fmtDate(ws))} – ${esc(fmtDate(days[6]))}</b><button class="btn sm sec" data-act="shift" data-n="7" aria-label="next">${S.lang === 'ar' ? '‹' : '›'}</button><span class="sp"></span><button class="btn sm sec" data-act="goToday">${esc(t('today'))}</button><button class="btn sm dark" data-act="shopping">${esc(t('shopping'))}</button></div>
  <div class="week" role="tablist">${days.map((d) => { const n = jobsOn(d).length; const dd = L.parseYmd(d); return `<button class="day ${d === V.day ? 'on' : ''} ${d === td ? 'today-mark' : ''}" data-act="pickDay" data-d="${d}"><small>${esc(t('dayShort')[dd.getDay()])}</small><span class="n">${dd.getDate()}</span><span class="dots">${'<i></i>'.repeat(Math.min(n, 3))}</span></button>`; }).join('')}</div>
  <h2>${esc(fmtDate(V.day))}${V.day === td ? ' · ' + esc(t('today')) : ''}</h2>
  ${dayJobs.length ? '<div class="grid">' + dayJobs.map(jobCard).join('') + '</div>' : emptyBox(t('noJobsDay'))}`;
}

/* ---------- jobs ---------- */
function vJobs() {
  const sts = ['all', 'new', 'scheduled', 'in-progress', 'done', 'cancelled'];
  const q = V.q.toLowerCase();
  const list = S.jobs.filter((j) => (V.jobFilter === 'all' || j.status === V.jobFilter) && (!q || (j.title + ' ' + ((clientOf(j.clientId) || {}).name || '') + ' ' + (j.address || '')).toLowerCase().includes(q)))
    .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
  return `<h1>${esc(t('jobs'))}</h1><input id="q" type="search" placeholder="${esc(t('search'))}" value="${esc(V.q)}" aria-label="${esc(t('search'))}">
  <div class="seg">${sts.map((s) => `<button data-act="jobFilter" data-v="${s}" class="${V.jobFilter === s ? 'on' : ''}">${esc(s === 'all' ? t('all') : t('st_' + (s === 'in-progress' ? 'progress' : s)))}</button>`).join('')}</div>
  <div class="grid">${list.length ? list.map(jobCard).join('') : ''}</div>${list.length ? '' : emptyBox(t('emptyJobs'))}`;
}
function jobForm(j) {
  const isNew = !j.id; const d = Object.assign({ title: '', clientId: '', date: V.day, time: '09:00', duration: 120, address: '', status: 'scheduled', team: [], hours: 0, rate: 0, notes: '', materials: [] }, j);
  d.materials = JSON.parse(JSON.stringify(d.materials)); d.team = (d.team || []).slice();
  const draft = d;
  const html = () => `<div class="hd"><h3>${esc(isNew ? t('addJob') : t('editJob'))}</h3><button class="x" data-m="close" aria-label="${esc(t('close'))}">✕</button></div>
  <label for="f-title">${esc(t('title'))}</label><input id="f-title" value="${esc(draft.title)}" autocomplete="off">
  <label for="f-client">${esc(t('client'))}</label><div class="row"><select id="f-client" style="flex:1"><option value="">${esc(t('noClient'))}</option>${S.clients.map((c) => `<option value="${c.id}" ${c.id === draft.clientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><button class="btn sm sec" data-m="newClient">${esc(t('newClient'))}</button></div>
  <div class="f3"><div><label for="f-date">${esc(t('date'))}</label><input id="f-date" type="date" value="${draft.date}"></div><div><label for="f-time">${esc(t('time'))}</label><input id="f-time" type="time" value="${draft.time || ''}"></div><div><label for="f-dur">${esc(t('duration'))}</label><input id="f-dur" type="number" min="15" step="15" value="${draft.duration}"></div></div>
  <label for="f-addr">${esc(t('address'))}</label><input id="f-addr" value="${esc(draft.address)}">
  <label for="f-status">${esc(t('status'))}</label><select id="f-status">${['new', 'scheduled', 'in-progress', 'done', 'cancelled'].map((s) => `<option value="${s}" ${s === draft.status ? 'selected' : ''}>${esc(t('st_' + (s === 'in-progress' ? 'progress' : s)))}</option>`).join('')}</select>
  <label>${esc(t('team'))}</label><div class="crew">${S.team.map((w) => `<label><input type="checkbox" data-w="${w.id}" ${draft.team.includes(w.id) ? 'checked' : ''}>${esc(w.name)}</label>`).join('') || `<span class="mut">${esc(t('emptyCrew'))}</span>`}</div>
  <div id="conf"></div>
  <h2>${esc(t('materials'))}</h2><div class="items" id="mats"></div>
  <div class="row"><button class="btn sm sec" data-m="addMat">+ ${esc(t('addMat'))}</button>${S.catalog.length ? `<select id="cat" style="flex:1;min-width:140px"><option value="">${esc(t('fromCatalog'))}</option>${S.catalog.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>` : ''}</div>
  <div class="f2"><div><label for="f-hours">${esc(t('hours'))}</label><input id="f-hours" type="number" step="0.5" min="0" value="${draft.hours}"></div><div><label for="f-rate">${esc(t('rate'))}</label><input id="f-rate" type="number" step="1" min="0" value="${draft.rate}"></div></div>
  <div class="tot" id="jtot"></div>
  <label for="f-notes">${esc(t('notes'))}</label><textarea id="f-notes">${esc(draft.notes)}</textarea>
  <div class="row" style="margin-top:14px"><button class="btn" data-m="save">${esc(t('save'))}</button>${isNew ? '' : `<button class="btn sec" data-m="mkDoc" data-type="estimate">${esc(t('mkEstimate'))}</button><button class="btn sec" data-m="mkDoc" data-type="invoice">${esc(t('mkInvoice'))}</button>`}</div>
  ${isNew ? '' : `<div class="row" style="margin-top:10px">${clientOf(draft.clientId) && clientOf(draft.clientId).phone ? `<a class="btn sm sec" href="tel:${esc(clientOf(draft.clientId).phone)}">${esc(t('call'))}</a>` : ''}${draft.address ? `<a class="btn sm sec" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(draft.address)}">${esc(t('map'))}</a>` : ''}<span class="sp"></span><button class="btn sm bad" data-m="del">${esc(t('delete'))}</button></div>`}`;
  const sheet = openSheet(html(), (e, el) => {
    const m = e.target.closest('[data-m]'); if (!m) return; const a = m.dataset.m;
    if (a === 'close') closeSheet();
    else if (a === 'addMat') { syncJob(); draft.materials.push({ id: uid(), name: '', qty: 1, unit: '', cost: 0, price: 0, bought: false }); drawMats(); const r = el.querySelectorAll('#mats .it'); const last = r[r.length - 1]; if (last) last.querySelector('input').focus(); }
    else if (a === 'rm') { syncJob(); draft.materials.splice(+m.dataset.i, 1); drawMats(); }
    else if (a === 'newClient') { syncJob(); quickClient((c) => { draft.clientId = c.id; el.innerHTML = html(); wire(); }); }
    else if (a === 'save') { if (doSave()) closeSheet(); }
    else if (a === 'del') { if (confirm(t('confirmDel'))) { S.jobs = S.jobs.filter((x) => x.id !== draft.id); S.docs.forEach((x) => { if (x.jobId === draft.id) x.jobId = null; }); save(); closeSheet(); toast(t('deleted')); } }
    else if (a === 'mkDoc') { if (!doSave()) return; closeSheet(); newDocFromJob(draft.id, m.dataset.type); }
  });
  function syncJob() {
    draft.title = $('#f-title', sheet).value; draft.clientId = $('#f-client', sheet).value; draft.date = $('#f-date', sheet).value || V.day; draft.time = $('#f-time', sheet).value; draft.duration = num($('#f-dur', sheet).value) || 60;
    draft.address = $('#f-addr', sheet).value; draft.status = $('#f-status', sheet).value; draft.hours = num($('#f-hours', sheet).value); draft.rate = num($('#f-rate', sheet).value); draft.notes = $('#f-notes', sheet).value;
    draft.team = [...sheet.querySelectorAll('[data-w]:checked')].map((x) => x.dataset.w);
    sheet.querySelectorAll('#mats .it:not(.hdr)').forEach((r, i) => { const m = draft.materials[i]; if (!m) return; m.name = r.querySelector('[data-k=name]').value; m.qty = num(r.querySelector('[data-k=qty]').value); m.unit = r.querySelector('[data-k=unit]').value; m.cost = num(r.querySelector('[data-k=cost]').value); m.price = num(r.querySelector('[data-k=price]').value); m.bought = r.querySelector('[data-k=bought]').checked; });
  }
  function drawMats() {
    $('#mats', sheet).innerHTML = draft.materials.map((m, i) => `<div class="it mrow"><input class="mn" data-k="name" value="${esc(m.name)}" placeholder="${esc(t('name'))}" aria-label="${esc(t('name'))}"><button class="x" data-m="rm" data-i="${i}" style="width:34px;height:34px" aria-label="${esc(t('delete'))}">✕</button><div class="mg"><label>${esc(t('qty'))}<input data-k="qty" inputmode="decimal" value="${m.qty}"></label><label>${esc(t('unit'))}<input data-k="unit" value="${esc(m.unit)}"></label><label>${esc(t('cost'))}<input data-k="cost" inputmode="decimal" value="${m.cost}"></label><label>${esc(t('price'))}<input data-k="price" inputmode="decimal" value="${m.price}"></label><label class="check" style="margin:0">${esc(t('bought'))}<input data-k="bought" type="checkbox" ${m.bought ? 'checked' : ''}></label></div></div>`).join('');
    refresh();
  }
  function refresh() {
    syncJob();
    const rev = L.jobMaterialPrice(draft) + L.jobLabor(draft), cost = L.jobMaterialCost(draft), pr = L.jobProfit(draft);
    $('#jtot', sheet).innerHTML = `<div><span>${esc(t('revenue'))}</span><b>${esc(M(rev))}</b></div><div><span>${esc(t('matCost'))}</span><span>${esc(M(cost))}</span></div><div class="g"><span>${esc(t('profit'))}</span><span style="color:${pr < 0 ? 'var(--bad)' : 'var(--ok)'}">${esc(M(pr))}</span></div>`;
    const cf = L.conflicts(S.jobs, draft);
    $('#conf', sheet).innerHTML = cf.map((c) => `<div class="warn">${esc(t('conflict').replace('{w}', c.workers.map((w) => (workerOf(w) || {}).name).join(', ')).replace('{j}', c.job.title))}</div>`).join('');
  }
  function doSave() {
    syncJob(); if (!draft.title.trim()) { toast(t('needTitle')); $('#f-title', sheet).focus(); return false; }
    draft.materials = draft.materials.filter((m) => m.name.trim());
    if (isNew) { draft.id = uid(); S.jobs.push(draft); } else { const i = S.jobs.findIndex((x) => x.id === draft.id); S.jobs[i] = draft; }
    save(); toast(t('saved')); return true;
  }
  function wire() {
    drawMats();
    sheet.addEventListener('input', (e) => { if (e.target.closest('#mats') || e.target.id.startsWith('f-')) refresh(); });
    sheet.addEventListener('change', (e) => {
      if (e.target.dataset && e.target.dataset.w !== undefined) refresh();
      if (e.target.id === 'cat' && e.target.value) { syncJob(); const c = S.catalog.find((x) => x.id === e.target.value); if (c) draft.materials.push({ id: uid(), name: c.name, qty: 1, unit: c.unit, cost: c.cost, price: c.price, bought: false }); drawMats(); e.target.value = ''; }
    });
  }
  if (!wire._once) { wire._once = 1; }
  wire(); if (isNew) $('#f-title', sheet).focus();
}
function quickClient(done) {
  const ov = document.createElement('div'); ov.className = 'ov'; ov.style.zIndex = 60;
  ov.innerHTML = `<div class="sheet"><div class="hd"><h3>${esc(t('addClient'))}</h3><button class="x" data-q="x">✕</button></div><label for="qc-n">${esc(t('cName'))}</label><input id="qc-n"><label for="qc-p">${esc(t('phone'))}</label><input id="qc-p" inputmode="tel"><label for="qc-a">${esc(t('address'))}</label><input id="qc-a"><div class="row" style="margin-top:14px"><button class="btn" data-q="ok">${esc(t('save'))}</button></div></div>`;
  document.body.appendChild(ov); $('#qc-n', ov).focus();
  ov.addEventListener('click', (e) => { const q = e.target.dataset.q; if (q === 'x' || e.target === ov) ov.remove(); if (q === 'ok') { const n = $('#qc-n', ov).value.trim(); if (!n) { $('#qc-n', ov).focus(); return; } const c = { id: uid(), name: n, phone: $('#qc-p', ov).value.trim(), address: $('#qc-a', ov).value.trim() }; S.clients.push(c); save(); ov.remove(); done && done(c); } });
}

/* ---------- sheet infra ---------- */
let lastFocus = null;
function openSheet(html, onClick) {
  lastFocus = document.activeElement;
  const root = $('#modalRoot'); root.innerHTML = `<div class="ov"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  const ov = root.firstChild, el = ov.firstChild;
  ov.addEventListener('mousedown', (e) => { ov._down = e.target === ov; });
  ov.addEventListener('click', (e) => { if (e.target === ov && ov._down) { closeSheet(); return; } onClick(e, el); });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  document.body.style.overflow = 'hidden';
  return el;
}
function closeSheet() { $('#modalRoot').innerHTML = ''; document.body.style.overflow = ''; render(); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }

/* ---------- papers ---------- */
function docCard(d) {
  const c = clientOf(d.clientId); const tt = L.docTotals(d); const st = docStatus(d);
  return `<article class="card ticket" style="--c:${d.type === 'invoice' ? '#2457c5' : '#d99a00'}" data-act="openDoc" data-id="${d.id}" tabindex="0" role="button"><div class="tk"><div class="row"><b class="b">${esc(d.number)}</b><span class="sp"></span>${pill(stClass(st), t('ds_' + st))}</div><div class="mut">${esc(c ? c.name : t('noClient'))} · ${esc(fmtDate(d.date))}</div><div class="row"><b style="font-size:18px">${esc(M(tt.total))}</b>${d.type === 'invoice' && tt.due > 0 && tt.paid > 0 ? `<span class="mut">${esc(t('due'))}: ${esc(M(tt.due))}</span>` : ''}</div></div></article>`;
}
function vPapers() {
  const list = S.docs.filter((d) => d.type === V.docTab).sort((a, b) => (b.date + b.number).localeCompare(a.date + a.number));
  return `<h1>${esc(t('papers'))}</h1><div class="seg"><button data-act="docTab" data-v="invoice" class="${V.docTab === 'invoice' ? 'on' : ''}">${esc(t('invoices'))}</button><button data-act="docTab" data-v="estimate" class="${V.docTab === 'estimate' ? 'on' : ''}">${esc(t('estimates'))}</button><span class="sp"></span><button class="btn sm" data-act="newDoc">+ ${esc(t('newDoc'))}</button></div>
  <div class="grid">${list.map(docCard).join('')}</div>${list.length ? '' : emptyBox(t('emptyDocs'))}`;
}
function newDocFromJob(jobId, type) {
  const j = jobOf(jobId); if (!j) return;
  const d = { id: uid(), type, number: L.nextNumber(S.docs, type, type === 'invoice' ? 'INV' : 'EST'), jobId, clientId: j.clientId || '', items: L.itemsFromJob(j, t('laborLine')), discount: 0, discountType: 'pct', taxRate: num(S.biz.taxRate), status: type === 'invoice' ? 'unpaid' : 'draft', date: todayStr(), due: L.addDays(todayStr(), 7), payments: [], notes: '' };
  S.docs.push(d); save(); V.tab = 'papers'; V.docTab = type; render(); openDoc(d.id); toast(type === 'invoice' ? t('invMade') : t('estMade'));
}
function openDoc(id) {
  const orig = S.docs.find((x) => x.id === id); if (!orig) return;
  const d = JSON.parse(JSON.stringify(orig)); const inv = d.type === 'invoice';
  const html = () => `<div class="hd"><h3>${esc(inv ? t('invoice') : t('estimate'))} ${esc(d.number)}</h3><button class="x" data-m="close" aria-label="${esc(t('close'))}">✕</button></div>
  <div class="f2"><div><label for="d-client">${esc(t('client'))}</label><select id="d-client"><option value="">${esc(t('noClient'))}</option>${S.clients.map((c) => `<option value="${c.id}" ${c.id === d.clientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div><div><label for="d-date">${esc(t('date'))}</label><input id="d-date" type="date" value="${d.date}"></div></div>
  ${inv ? `<div class="f2"><div><label for="d-due">${esc(t('dueDate'))}</label><input id="d-due" type="date" value="${d.due || ''}"></div><div><label>${esc(t('status'))}</label><div style="padding:10px 0" id="d-st"></div></div></div>` : `<label for="d-status">${esc(t('status'))}</label><select id="d-status">${['draft', 'sent', 'accepted', 'rejected'].map((s) => `<option value="${s}" ${s === d.status ? 'selected' : ''}>${esc(t('ds_' + s))}</option>`).join('')}</select>`}
  <h2>${esc(t('items'))}</h2><div class="items" id="its"></div><button class="btn sm sec" data-m="addIt">+ ${esc(t('addItem'))}</button>
  <div class="f3"><div><label for="d-disc">${esc(t('discount'))}</label><input id="d-disc" inputmode="decimal" value="${d.discount || 0}"></div><div><label for="d-dt">&nbsp;</label><select id="d-dt"><option value="pct" ${d.discountType !== 'fixed' ? 'selected' : ''}>%</option><option value="fixed" ${d.discountType === 'fixed' ? 'selected' : ''}>${esc(cur())}</option></select></div><div><label for="d-tax">${esc(t('tax'))}</label><input id="d-tax" inputmode="decimal" value="${d.taxRate || 0}"></div></div>
  <div class="tot" id="dtot"></div>
  ${inv ? `<h2>${esc(t('payments'))}</h2><div id="pays"></div><div class="row"><input id="p-amt" inputmode="decimal" placeholder="${esc(t('amount'))}" style="flex:1" aria-label="${esc(t('amount'))}"><button class="btn sm" data-m="addPay">+ ${esc(t('addPayment'))}</button></div>` : ''}
  <label for="d-notes">${esc(t('notes'))}</label><textarea id="d-notes">${esc(d.notes || '')}</textarea>
  <div class="row" style="margin-top:14px"><button class="btn" data-m="save">${esc(t('save'))}</button>${inv ? '' : `<button class="btn dark" data-m="toInv">${esc(t('toInvoice'))}</button>`}<button class="btn sec" data-m="print">${esc(t('print'))}</button><button class="btn sec" data-m="wa">${esc(t('whatsapp'))}</button><span class="sp"></span><button class="btn sm bad" data-m="del">${esc(t('delete'))}</button></div>`;
  const el = openSheet(html(), (e) => {
    const m = e.target.closest('[data-m]'); if (!m) return; const a = m.dataset.m;
    if (a === 'close') closeSheet();
    else if (a === 'addIt') { sync(); d.items.push({ desc: '', qty: 1, unit: '', price: 0 }); drawIts(); const r = el.querySelectorAll('#its .it'); r[r.length - 1].querySelector('input').focus(); }
    else if (a === 'rmIt') { sync(); d.items.splice(+m.dataset.i, 1); drawIts(); }
    else if (a === 'addPay') { sync(); const v = num($('#p-amt', el).value); if (v <= 0) return; d.payments.push({ id: uid(), amount: v, date: todayStr() }); $('#p-amt', el).value = ''; drawPays(); refresh(); toast(t('pay')); }
    else if (a === 'rmPay') { sync(); d.payments.splice(+m.dataset.i, 1); drawPays(); refresh(); }
    else if (a === 'save') { commit(); closeSheet(); toast(t('saved')); }
    else if (a === 'toInv') { commit(); const ni = L.estimateToInvoice(d, S.docs, todayStr(), 7); $('#d-status', el).value = 'accepted'; commit(); S.docs.push(ni); save(); V.docTab = 'invoice'; closeSheet(); render(); openDoc(ni.id); toast(t('invMade')); }
    else if (a === 'print') { commit(); printDoc(d); }
    else if (a === 'wa') { sync(); const c = clientOf(d.clientId); const tt = L.docTotals(d); const txt = `${S.biz.name || t('app')}\n${inv ? t('invoice') : t('estimate')} ${d.number}\n` + d.items.map((i) => `• ${i.desc} × ${i.qty} = ${M(L.lineTotal(i))}`).join('\n') + `\n${t('total')}: ${M(tt.total)}` + (inv && tt.paid ? `\n${t('due')}: ${M(tt.due)}` : ''); const ph = c && c.phone ? c.phone.replace(/\D/g, '').replace(/^0/, '20') : ''; window.open('https://wa.me/' + ph + '?text=' + encodeURIComponent(txt), '_blank', 'noopener'); }
    else if (a === 'del') { if (confirm(t('confirmDel'))) { S.docs = S.docs.filter((x) => x.id !== d.id); save(); closeSheet(); toast(t('deleted')); } }
  });
  function sync() {
    d.clientId = $('#d-client', el).value; d.date = $('#d-date', el).value || d.date; if (inv) d.due = $('#d-due', el).value; else d.status = $('#d-status', el).value;
    d.discount = num($('#d-disc', el).value); d.discountType = $('#d-dt', el).value; d.taxRate = num($('#d-tax', el).value); d.notes = $('#d-notes', el).value;
    el.querySelectorAll('#its .it:not(.hdr)').forEach((r, i) => { const it = d.items[i]; if (!it) return; it.desc = r.querySelector('[data-k=desc]').value; it.qty = num(r.querySelector('[data-k=qty]').value); it.unit = r.querySelector('[data-k=unit]').value; it.price = num(r.querySelector('[data-k=price]').value); });
  }
  function drawIts() {
    $('#its', el).innerHTML = (d.items.length ? `<div class="it hdr"><span>${esc(t('desc'))}</span><span>${esc(t('qty'))}</span><span>${esc(t('unit'))}</span><span>${esc(t('price'))}</span><span></span></div>` : '') + d.items.map((i, k) => `<div class="it"><input data-k="desc" value="${esc(i.desc)}" aria-label="${esc(t('desc'))}"><input data-k="qty" inputmode="decimal" value="${i.qty}" aria-label="${esc(t('qty'))}"><input data-k="unit" value="${esc(i.unit || '')}" aria-label="${esc(t('unit'))}"><input data-k="price" inputmode="decimal" value="${i.price}" aria-label="${esc(t('price'))}"><button class="x" data-m="rmIt" data-i="${k}" style="width:30px;height:30px" aria-label="${esc(t('delete'))}">✕</button></div>`).join(''); refresh();
  }
  function drawPays() { const p = $('#pays', el); if (p) p.innerHTML = d.payments.map((x, i) => `<div class="row" style="margin-bottom:6px"><span>${esc(fmtDate(x.date))}</span><b>${esc(M(x.amount))}</b><span class="sp"></span><button class="x" data-m="rmPay" data-i="${i}" style="width:30px;height:30px" aria-label="${esc(t('delete'))}">✕</button></div>`).join(''); }
  function refresh() {
    sync(); const tt = L.docTotals(d);
    $('#dtot', el).innerHTML = `<div><span>${esc(t('subtotal'))}</span><span>${esc(M(tt.sub))}</span></div>${tt.discount ? `<div><span>${esc(t('discount'))}</span><span>-${esc(M(tt.discount))}</span></div>` : ''}${tt.tax ? `<div><span>${esc(t('tax'))} ${d.taxRate}</span><span>${esc(M(tt.tax))}</span></div>` : ''}<div class="g"><span>${esc(t('total'))}</span><span>${esc(M(tt.total))}</span></div>${inv ? `<div><span>${esc(t('paid'))}</span><span>${esc(M(tt.paid))}</span></div><div class="b"><span>${esc(t('due'))}</span><span>${esc(M(tt.due))}</span></div><div class="bar" style="margin-top:6px"><i style="width:${tt.total ? Math.min(100, tt.paid / tt.total * 100) : 0}%"></i></div>` : ''}`;
    if (inv) { const s = L.invoiceStatus(d, todayStr()); $('#d-st', el).innerHTML = pill(stClass(s), t('ds_' + s)); }
  }
  function commit() { sync(); if (inv) d.status = L.invoiceStatus(d, todayStr()); const i = S.docs.findIndex((x) => x.id === d.id); if (i >= 0) S.docs[i] = d; save(); }
  drawIts(); drawPays(); refresh();
  el.addEventListener('input', (e) => { if (e.target.closest('.items') || e.target.id.startsWith('d-')) refresh(); });
  el.addEventListener('change', (e) => { if (e.target.id.startsWith('d-')) refresh(); });
}
function printDoc(d) {
  const c = clientOf(d.clientId) || {}; const tt = L.docTotals(d); const inv = d.type === 'invoice';
  $('#printArea').innerHTML = `<div class="doc" dir="${S.lang === 'ar' ? 'rtl' : 'ltr'}"><div class="band"></div><div class="row" style="display:flex;justify-content:space-between;gap:20px"><div><h1>${esc(inv ? t('invoice') : t('estimate'))}</h1><div>${esc(d.number)} · ${esc(d.date)}${inv && d.due ? ' · ' + esc(t('dueDate')) + ' ' + esc(d.due) : ''}</div></div><div style="text-align:end"><b style="font-size:20px">${esc(S.biz.name || t('app'))}</b><div>${esc(S.biz.phone || '')}</div></div></div>
  <p><b>${esc(t('billTo'))}:</b> ${esc(c.name || '-')}${c.phone ? ' · ' + esc(c.phone) : ''}${c.address ? '<br>' + esc(c.address) : ''}</p>
  <table><thead><tr><th>${esc(t('desc'))}</th><th>${esc(t('qty'))}</th><th>${esc(t('price'))}</th><th>${esc(t('total'))}</th></tr></thead><tbody>${d.items.map((i) => `<tr><td>${esc(i.desc)}</td><td>${i.qty} ${esc(i.unit || '')}</td><td>${esc(M(i.price))}</td><td>${esc(M(L.lineTotal(i)))}</td></tr>`).join('')}</tbody></table>
  <div class="tt"><div><span>${esc(t('subtotal'))}</span><span>${esc(M(tt.sub))}</span></div>${tt.discount ? `<div><span>${esc(t('discount'))}</span><span>-${esc(M(tt.discount))}</span></div>` : ''}${tt.tax ? `<div><span>${esc(t('tax'))} ${d.taxRate}</span><span>${esc(M(tt.tax))}</span></div>` : ''}<div style="font-size:18px;font-weight:900;border-top:2px solid #000"><span>${esc(t('total'))}</span><span>${esc(M(tt.total))}</span></div>${inv ? `<div><span>${esc(t('paid'))}</span><span>${esc(M(tt.paid))}</span></div><div style="font-weight:800"><span>${esc(t('due'))}</span><span>${esc(M(tt.due))}</span></div>` : ''}</div>
  ${d.notes ? `<p style="margin-top:16px">${esc(d.notes)}</p>` : ''}<p style="margin-top:30px;text-align:center;color:#555">${esc(t('thanks'))}</p></div>`;
  setTimeout(() => window.print(), 50);
}

/* ---------- crew ---------- */
function vCrew() {
  const tabs = [['team', t('team_')], ['clients', t('clients')], ['catalog', t('catalog')]];
  let body = '';
  if (V.crewTab === 'team') body = S.team.map((w) => { const n = S.jobs.filter((j) => (j.team || []).includes(w.id) && j.date === todayStr() && j.status !== 'cancelled').length; return `<article class="card" data-act="editWorker" data-id="${w.id}" tabindex="0" role="button"><div class="row"><span class="avatar" style="--c:${wColor(w)}">${initial(w.name)}</span><div><b>${esc(w.name)}</b><div class="mut">${esc(w.role || '')}${w.phone ? ' · ' + esc(w.phone) : ''}</div></div><span class="sp"></span>${n ? pill('s-progress', n + ' ' + t('onJob')) : ''}</div></article>`; }).join('') || emptyBox(t('emptyCrew'));
  if (V.crewTab === 'clients') body = S.clients.map((c) => `<article class="card" data-act="editClient" data-id="${c.id}" tabindex="0" role="button"><b>${esc(c.name)}</b><div class="mut">${esc(c.phone || '')}${c.address ? ' · ' + esc(c.address) : ''}</div><div class="mut">${S.jobs.filter((j) => j.clientId === c.id).length} ${esc(t('jobsCount'))}</div></article>`).join('') || emptyBox(t('emptyCrew'));
  if (V.crewTab === 'catalog') body = S.catalog.map((c) => `<article class="card" data-act="editCat" data-id="${c.id}" tabindex="0" role="button"><div class="row"><b>${esc(c.name)}</b><span class="sp"></span><span class="mut">${esc(c.unit || '')}</span></div><div class="mut">${esc(t('cost'))} ${esc(M(c.cost))} · ${esc(t('price'))} ${esc(M(c.price))}</div></article>`).join('') || emptyBox(t('emptyCrew'));
  return `<h1>${esc(t('crew'))}</h1><div class="seg">${tabs.map(([k, l]) => `<button data-act="crewTab" data-v="${k}" class="${V.crewTab === k ? 'on' : ''}">${esc(l)}</button>`).join('')}<span class="sp"></span><button class="btn sm" data-act="addCrew">+ ${esc(V.crewTab === 'team' ? t('addWorker') : V.crewTab === 'clients' ? t('addClient') : t('addItem'))}</button></div><div class="grid">${body}</div>`;
}
function simpleForm(title, fields, vals, onSave, onDel) {
  const el = openSheet(`<div class="hd"><h3>${esc(title)}</h3><button class="x" data-m="close" aria-label="${esc(t('close'))}">✕</button></div>${fields.map((f) => `<label for="sf-${f.k}">${esc(f.l)}</label><input id="sf-${f.k}" ${f.n ? 'inputmode="decimal"' : ''} value="${esc(vals[f.k] == null ? '' : vals[f.k])}">`).join('')}<div class="row" style="margin-top:14px"><button class="btn" data-m="save">${esc(t('save'))}</button><span class="sp"></span>${onDel ? `<button class="btn sm bad" data-m="del">${esc(t('delete'))}</button>` : ''}</div>`, (e) => {
    const m = e.target.closest('[data-m]'); if (!m) return;
    if (m.dataset.m === 'close') closeSheet();
    if (m.dataset.m === 'save') { const o = {}; fields.forEach((f) => { const v = $('#sf-' + f.k, el).value.trim(); o[f.k] = f.n ? num(v) : v; }); if (!o[fields[0].k] && fields[0].req !== false) { $('#sf-' + fields[0].k, el).focus(); return; } onSave(o); save(); closeSheet(); toast(t('saved')); }
    if (m.dataset.m === 'del' && confirm(t('confirmDel'))) { onDel(); save(); closeSheet(); toast(t('deleted')); }
  });
  $('#sf-' + fields[0].k, el).focus();
}
const F_WORKER = () => [{ k: 'name', l: t('name') }, { k: 'role', l: t('role') }, { k: 'phone', l: t('phone') }, { k: 'dayRate', l: t('dayRate'), n: 1 }];
const F_CLIENT = () => [{ k: 'name', l: t('cName') }, { k: 'phone', l: t('phone') }, { k: 'address', l: t('address') }];
const F_CAT = () => [{ k: 'name', l: t('name') }, { k: 'unit', l: t('unit') }, { k: 'cost', l: t('cost'), n: 1 }, { k: 'price', l: t('price'), n: 1 }];

/* ---------- settings ---------- */
function vSettings() {
  const b = S.biz;
  return `<h1>${esc(t('settings'))}</h1><div class="card"><label for="s-name">${esc(t('bizName'))}</label><input id="s-name" data-s="name" value="${esc(b.name)}"><label for="s-phone">${esc(t('phone'))}</label><input id="s-phone" data-s="phone" inputmode="tel" value="${esc(b.phone)}">
  <div class="f3"><div><label for="s-cur">${esc(t('currency'))}</label><input id="s-cur" data-s="currency" value="${esc(b.currency)}"></div><div><label for="s-tax">${esc(t('taxRate'))}</label><input id="s-tax" data-s="taxRate" inputmode="decimal" value="${b.taxRate}"></div><div><label for="s-ws">${esc(t('weekStart'))}</label><select id="s-ws" data-s="weekStart"><option value="6" ${b.weekStart == 6 ? 'selected' : ''}>${esc(t('sat'))}</option><option value="0" ${b.weekStart == 0 ? 'selected' : ''}>${esc(t('sun'))}</option><option value="1" ${b.weekStart == 1 ? 'selected' : ''}>${esc(t('mon'))}</option></select></div></div></div>
  <h2>${esc(t('backup'))}</h2><div class="card"><div class="row"><button class="btn sm" data-act="exportJson">${esc(t('exportJson'))}</button><button class="btn sm sec" data-act="importJson">${esc(t('importJson'))}</button><button class="btn sm sec" data-act="exportCsv">${esc(t('exportCsv'))}</button></div><input type="file" id="imp" accept="application/json" hidden><p class="mut">${esc(t('footer'))}</p><div class="row"><button class="btn sm sec" data-act="sample">${esc(t('sample'))}</button><button class="btn sm bad" data-act="wipe">${esc(t('wipe'))}</button></div></div>`;
}
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function sample() {
  if (S.jobs.some((j) => j.id === 'j1') || S.team.some((w) => w.id === 'w1')) { toast(S.lang === 'ar' ? 'البيانات التجريبية موجودة بالفعل' : 'Sample data is already loaded'); return; }
  const td = todayStr(); const w = [{ id: 'w1', name: S.lang === 'ar' ? 'أسطى محمود' : 'Mahmoud', role: S.lang === 'ar' ? 'سباك' : 'Plumber', phone: '01000000001', dayRate: 400, color: COLORS[0] }, { id: 'w2', name: S.lang === 'ar' ? 'رضا' : 'Reda', role: S.lang === 'ar' ? 'كهربائي' : 'Electrician', phone: '01000000002', dayRate: 450, color: COLORS[1] }, { id: 'w3', name: S.lang === 'ar' ? 'سيد' : 'Sayed', role: S.lang === 'ar' ? 'نقاش' : 'Painter', phone: '01000000003', dayRate: 350, color: COLORS[2] }];
  const c = [{ id: 'c1', name: S.lang === 'ar' ? 'مدام منى' : 'Mona Saleh', phone: '01100000001', address: S.lang === 'ar' ? 'سموحة، الإسكندرية' : 'Smouha, Alexandria' }, { id: 'c2', name: S.lang === 'ar' ? 'مطعم الفرن' : 'El Forn Restaurant', phone: '01200000002', address: S.lang === 'ar' ? 'سيدي جابر' : 'Sidi Gaber' }];
  const A = S.lang === 'ar';
  const jobs = [
    { id: 'j1', title: A ? 'تغيير مواسير حمام' : 'Bathroom pipe replacement', clientId: 'c1', date: td, time: '09:00', duration: 180, address: c[0].address, status: 'in-progress', team: ['w1'], hours: 6, rate: 120, notes: '', materials: [{ id: 'm1', name: A ? 'ماسورة PVC' : 'PVC pipe', qty: 6, unit: A ? 'متر' : 'm', cost: 45, price: 60, bought: true }, { id: 'm2', name: A ? 'كوع' : 'Elbow', qty: 8, unit: '', cost: 12, price: 20, bought: false }] },
    { id: 'j2', title: A ? 'تمديد كهربا مطبخ' : 'Kitchen rewiring', clientId: 'c2', date: td, time: '13:00', duration: 240, address: c[1].address, status: 'scheduled', team: ['w2'], hours: 8, rate: 150, notes: '', materials: [{ id: 'm3', name: A ? 'سلك 2.5' : 'Wire 2.5mm', qty: 40, unit: A ? 'متر' : 'm', cost: 18, price: 25, bought: false }, { id: 'm4', name: A ? 'مفتاح' : 'Switch', qty: 6, unit: '', cost: 30, price: 45, bought: false }] },
    { id: 'j3', title: A ? 'دهان شقة' : 'Flat painting', clientId: 'c1', date: L.addDays(td, 1), time: '10:00', duration: 480, address: c[0].address, status: 'scheduled', team: ['w3'], hours: 16, rate: 100, notes: '', materials: [{ id: 'm5', name: A ? 'بلاستيك أبيض' : 'White paint', qty: 3, unit: A ? 'جردل' : 'bucket', cost: 650, price: 800, bought: false }] }
  ];
  const e1 = { id: 'd1', type: 'estimate', number: 'EST-0001', jobId: 'j2', clientId: 'c2', items: L.itemsFromJob(jobs[1], A ? 'صنعة' : 'Labor'), discount: 0, discountType: 'pct', taxRate: 0, status: 'sent', date: td, due: '', payments: [], notes: '' };
  const i1 = { id: 'd2', type: 'invoice', number: 'INV-0001', jobId: 'j1', clientId: 'c1', items: L.itemsFromJob(jobs[0], A ? 'صنعة' : 'Labor'), discount: 0, discountType: 'pct', taxRate: 0, status: 'partial', date: L.addDays(td, -3), due: L.addDays(td, 4), payments: [{ id: 'p1', amount: 500, date: L.addDays(td, -3) }], notes: '' };
  S.team = S.team.concat(w); S.clients = S.clients.concat(c); S.jobs = S.jobs.concat(jobs); S.docs = S.docs.concat([e1, i1]);
  S.catalog = S.catalog.concat([{ id: 'k1', name: A ? 'ماسورة PVC' : 'PVC pipe', unit: A ? 'متر' : 'm', cost: 45, price: 60 }, { id: 'k2', name: A ? 'سلك 2.5' : 'Wire 2.5mm', unit: A ? 'متر' : 'm', cost: 18, price: 25 }]);
  save(); toast(t('sampleLoaded'));
}
function shoppingSheet() {
  const ws = L.weekStart(V.day, num(S.biz.weekStart)); const list = L.shoppingList(S.jobs, ws, L.addDays(ws, 6)); const tot = list.reduce((s, x) => s + x.cost, 0);
  openSheet(`<div class="hd"><h3>${esc(t('shopping'))}</h3><button class="x" data-m="close" aria-label="${esc(t('close'))}">✕</button></div><p class="mut">${esc(t('shopHint'))}</p>${list.length ? list.map((x) => `<div class="card"><div class="row"><b>${esc(x.name)}</b><span class="sp"></span><b>${x.qty} ${esc(x.unit)}</b></div><div class="mut">${esc(x.jobs.join(' · '))} · ${esc(M(x.cost))}</div></div>`).join('') + `<div class="tot"><div class="g"><span>${esc(t('total_'))}</span><span>${esc(M(tot))}</span></div></div>` : emptyBox(t('nothingToBuy'))}`, (e) => { if (e.target.closest('[data-m=close]')) closeSheet(); });
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el || el.closest('#modalRoot')) return; const a = el.dataset.act, v = el.dataset.v;
  if (a === 'tab') { V.tab = v; render(); window.scrollTo(0, 0); }
  else if (a === 'lang') { S.lang = S.lang === 'ar' ? 'en' : 'ar'; save(); render(); }
  else if (a === 'pickDay') { V.day = el.dataset.d; render(); }
  else if (a === 'shift') { V.day = L.addDays(V.day, +el.dataset.n); render(); }
  else if (a === 'goToday') { V.day = todayStr(); render(); }
  else if (a === 'newJob') jobForm({});
  else if (a === 'openJob') jobForm(jobOf(el.dataset.id));
  else if (a === 'jobFilter') { V.jobFilter = v; render(); }
  else if (a === 'docTab') { V.docTab = v; render(); }
  else if (a === 'newDoc') { if (!S.clients.length) { quickClient(() => { render(); mkBlank(); }); } else mkBlank(); }
  else if (a === 'openDoc') openDoc(el.dataset.id);
  else if (a === 'crewTab') { V.crewTab = v; render(); }
  else if (a === 'addCrew') { if (V.crewTab === 'team') simpleForm(t('addWorker'), F_WORKER(), {}, (o) => { o.id = uid(); o.color = COLORS[S.team.length % COLORS.length]; S.team.push(o); }); else if (V.crewTab === 'clients') simpleForm(t('addClient'), F_CLIENT(), {}, (o) => { o.id = uid(); S.clients.push(o); }); else simpleForm(t('addItem'), F_CAT(), {}, (o) => { o.id = uid(); S.catalog.push(o); }); }
  else if (a === 'editWorker') { const w = workerOf(el.dataset.id); simpleForm(w.name, F_WORKER(), w, (o) => Object.assign(w, o), () => { S.team = S.team.filter((x) => x.id !== w.id); S.jobs.forEach((j) => { j.team = (j.team || []).filter((x) => x !== w.id); }); }); }
  else if (a === 'editClient') { const c = clientOf(el.dataset.id); simpleForm(c.name, F_CLIENT(), c, (o) => Object.assign(c, o), () => { S.clients = S.clients.filter((x) => x.id !== c.id); }); }
  else if (a === 'editCat') { const c = S.catalog.find((x) => x.id === el.dataset.id); simpleForm(c.name, F_CAT(), c, (o) => Object.assign(c, o), () => { S.catalog = S.catalog.filter((x) => x.id !== c.id); }); }
  else if (a === 'shopping') shoppingSheet();
  else if (a === 'exportJson') download('sheghlana-backup-' + todayStr() + '.json', JSON.stringify(S, null, 1), 'application/json');
  else if (a === 'importJson') $('#imp').click();
  else if (a === 'exportCsv') download('invoices-' + todayStr() + '.csv', L.csv([['number', 'date', 'client', 'total', 'paid', 'due', 'status']].concat(S.docs.filter((d) => d.type === 'invoice').map((d) => { const tt = L.docTotals(d); return [d.number, d.date, (clientOf(d.clientId) || {}).name || '', tt.total, tt.paid, tt.due, docStatus(d)]; }))), 'text/csv');
  else if (a === 'sample') { sample(); render(); }
  else if (a === 'wipe') { if (confirm(t('confirmDel'))) { const l = S.lang; S = defaults(); S.lang = l; save(); render(); toast(t('erased')); } }
});
function mkBlank() { const d = { id: uid(), type: V.docTab, number: L.nextNumber(S.docs, V.docTab, V.docTab === 'invoice' ? 'INV' : 'EST'), jobId: null, clientId: S.clients[0] ? S.clients[0].id : '', items: [{ desc: '', qty: 1, unit: '', price: 0 }], discount: 0, discountType: 'pct', taxRate: num(S.biz.taxRate), status: V.docTab === 'invoice' ? 'unpaid' : 'draft', date: todayStr(), due: L.addDays(todayStr(), 7), payments: [], notes: '' }; S.docs.push(d); save(); render(); openDoc(d.id); }
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-act][role=button]')) { e.preventDefault(); e.target.click(); } });
document.addEventListener('input', (e) => {
  if (e.target.id === 'q') { V.q = e.target.value; const pos = e.target.selectionStart; render(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  else if (e.target.dataset && e.target.dataset.s) { const k = e.target.dataset.s; S.biz[k] = ['taxRate', 'weekStart'].includes(k) ? num(e.target.value) : e.target.value; save(); }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'imp' && e.target.files[0]) { const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d || d.v !== 1 || !Array.isArray(d.jobs)) throw 0; S = Object.assign(defaults(), d); save(); render(); toast(t('imported')); } catch (x) { toast(t('badFile')); } }; r.readAsText(e.target.files[0]); }
  else if (e.target.dataset && e.target.dataset.s === 'weekStart') { S.biz.weekStart = num(e.target.value); save(); }
});
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
window.__SG = { get state() { return S; } };
})();
