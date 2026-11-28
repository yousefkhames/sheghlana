/* MIT · Copyright (c) 2026 Yousef Khames · sheghlana core: jobs, estimates, invoices and totals from recorded entries (browser and Node). */
(function (root) {
  'use strict';
  const STATUSES = ['lead', 'estimate', 'scheduled', 'done', 'paid'];
  const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const num = (v, d) => { const n = Number(String(v == null ? '' : v).replace(/[٠-٩]/g, (x) => '٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(',', '.')); return Number.isFinite(n) ? n : (d == null ? 0 : d); };
  const defaults = () => ({ biz: '', phone: '', currency: 'EGP', taxRate: 0, estPrefix: 'EST-', invPrefix: 'INV-', nextEst: 1, nextInv: 1 });
  function totals(items, taxRate) {
    const sub = r2((items || []).reduce((s, i) => s + r2(Math.max(0, num(i.qty)) * Math.max(0, num(i.price))), 0)), rate = Math.max(0, Math.min(100, num(taxRate)));
    const tax = r2(sub * rate / 100); return { sub, tax, total: r2(sub + tax), rate };
  }
  const lineTotal = (i) => r2(Math.max(0, num(i.qty)) * Math.max(0, num(i.price)));
  const pad = (n) => String(n).padStart(3, '0');
  function takeNumber(settings, kind) { const k = kind === 'inv' ? 'nextInv' : 'nextEst', p = kind === 'inv' ? settings.invPrefix : settings.estPrefix; const n = settings[k]; settings[k] = n + 1; return p + pad(n); }
  const newJob = (id, clientId, title, now, demo) => ({ id, clientId, title: String(title || '').trim().slice(0, 80), status: 'lead', date: '', time: '', notes: '', checklist: [], items: [], taxRate: null, estNo: null, invNo: null, paid: null, createdAt: now, demo: !!demo });
  /* Issuing a document freezes its number. The tax rate is copied onto the job so later settings changes do not rewrite it. */
  function issueEstimate(job, settings) { if (!job.items.length) return { ok: false, error: 'noitems' }; if (!job.estNo) job.estNo = takeNumber(settings, 'est'); if (job.taxRate == null) job.taxRate = settings.taxRate; if (job.status === 'lead') job.status = 'estimate'; return { ok: true, no: job.estNo }; }
  function issueInvoice(job, settings) { if (!job.items.length) return { ok: false, error: 'noitems' }; if (!job.invNo) job.invNo = takeNumber(settings, 'inv'); if (job.taxRate == null) job.taxRate = settings.taxRate; return { ok: true, no: job.invNo }; }
  function markPaid(job, now, method, note) { if (!job.invNo) return { ok: false, error: 'noinvoice' }; if (job.paid) return { ok: false, error: 'already' }; job.paid = { at: now, method: String(method || '').slice(0, 20), note: String(note || '').slice(0, 80) }; job.status = 'paid'; return { ok: true }; }
  function unmarkPaid(job) { if (!job.paid) return { ok: false, error: 'state' }; job.paid = null; job.status = 'done'; return { ok: true }; }
  function setStatus(job, status) { if (!STATUSES.includes(status)) return { ok: false, error: 'status' }; if (status === 'paid' && !job.paid) return { ok: false, error: 'usepaid' }; if (status !== 'paid' && job.paid) job.paid = null; job.status = status; return { ok: true }; }
  /* Everything below is computed from recorded invoices only. null means nothing recorded yet. */
  function summary(jobs, settings) {
    const counts = {}; STATUSES.forEach((s) => { counts[s] = jobs.filter((j) => j.status === s).length; });
    const inv = jobs.filter((j) => j.invNo), t = (j) => totals(j.items, j.taxRate == null ? settings.taxRate : j.taxRate).total;
    if (!inv.length) return { counts, invoices: 0, invoiced: null, received: null, outstanding: null };
    const invoiced = r2(inv.reduce((s, j) => s + t(j), 0)), received = r2(inv.filter((j) => j.paid).reduce((s, j) => s + t(j), 0)); return { counts, invoices: inv.length, invoiced, received, outstanding: r2(invoiced - received) };
  }
  const dayList = (jobs, date) => jobs.filter((j) => j.date === date && j.status !== 'paid').sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  const csvCell = (v) => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function jobsCsv(jobs, clients, settings) {
    const cn = (id) => (clients.find((c) => c.id === id) || {}).name || '';
    return [['job', 'client', 'status', 'date', 'estimate_no', 'invoice_no', 'total', 'paid_marked', 'demo']].concat(jobs.map((j) => [j.title, cn(j.clientId), j.status, j.date, j.estNo || '', j.invNo || '', totals(j.items, j.taxRate == null ? settings.taxRate : j.taxRate).total, j.paid ? 'yes' : 'no', j.demo ? 'yes' : 'no'])).map((r) => r.map(csvCell).join(',')).join('\n');
  }
  const api = { STATUSES, r2, num, defaults, totals, lineTotal, takeNumber, newJob, issueEstimate, issueInvoice, markPaid, unmarkPaid, setStatus, summary, dayList, jobsCsv };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.SheghCore = api;
})(globalThis);
