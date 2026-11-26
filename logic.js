/* Sheghlana core logic: pure functions, no DOM. Works in browser and Node. */
(function (root) {
  'use strict';
  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };

  function lineTotal(it) { return round2(num(it.qty) * num(it.price)); }
  function docTotals(doc) {
    const sub = round2((doc.items || []).reduce((s, it) => s + lineTotal(it), 0));
    const discount = Math.min(sub, round2(doc.discountType === 'pct' ? sub * num(doc.discount) / 100 : num(doc.discount)));
    const taxable = round2(sub - discount);
    const tax = round2(taxable * num(doc.taxRate) / 100);
    const total = round2(taxable + tax);
    const paid = round2((doc.payments || []).reduce((s, p) => s + num(p.amount), 0));
    return { sub, discount, tax, total, paid, due: round2(Math.max(0, total - paid)) };
  }
  function jobMaterialCost(job) { return round2((job.materials || []).reduce((s, m) => s + num(m.qty) * num(m.cost), 0)); }
  function jobMaterialPrice(job) { return round2((job.materials || []).reduce((s, m) => s + num(m.qty) * num(m.price), 0)); }
  function jobLabor(job) { return round2(num(job.hours) * num(job.rate)); }
  function jobProfit(job) { return round2(jobMaterialPrice(job) + jobLabor(job) - jobMaterialCost(job)); }

  /* Build document line items from a job: one line per material at sell price, plus a labor line. */
  function itemsFromJob(job, laborLabel) {
    const items = (job.materials || []).filter((m) => num(m.qty) > 0).map((m) => ({ desc: m.name, qty: num(m.qty), unit: m.unit || '', price: num(m.price) }));
    if (num(job.hours) > 0) items.push({ desc: laborLabel || 'Labor', qty: num(job.hours), unit: 'h', price: num(job.rate) });
    return items;
  }
  function nextNumber(docs, type, prefix) {
    const re = new RegExp('^' + prefix + '-(\\d+)$');
    let max = 0;
    docs.filter((d) => d.type === type).forEach((d) => { const m = re.exec(d.number || ''); if (m) max = Math.max(max, parseInt(m[1], 10)); });
    return prefix + '-' + String(max + 1).padStart(4, '0');
  }
  /* Turn an accepted estimate into an invoice. Returns a new doc and does not mutate the input. */
  function estimateToInvoice(est, docs, today, dueDays) {
    if (est.type !== 'estimate') throw new Error('not an estimate');
    const due = addDays(today, dueDays == null ? 7 : dueDays);
    return {
      id: 'd' + Math.random().toString(36).slice(2, 9), type: 'invoice', number: nextNumber(docs, 'invoice', 'INV'),
      jobId: est.jobId || null, clientId: est.clientId, items: JSON.parse(JSON.stringify(est.items)),
      discount: est.discount, discountType: est.discountType, taxRate: est.taxRate, status: 'unpaid',
      date: today, due, payments: [], fromEstimate: est.number, notes: est.notes || ''
    };
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }
  function addDays(s, n) { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function weekStart(s, startDay) { // startDay: 6 = Saturday (Egypt), 0 = Sunday
    const d = parseYmd(s); const diff = (d.getDay() - startDay + 7) % 7; d.setDate(d.getDate() - diff); return ymd(d);
  }
  function invoiceStatus(doc, today) {
    const t = docTotals(doc);
    if (doc.type !== 'invoice') return doc.status;
    if (t.total > 0 && t.due === 0) return 'paid';
    if (t.paid > 0) return doc.due && doc.due < today ? 'overdue' : 'partial';
    return doc.due && doc.due < today ? 'overdue' : 'unpaid';
  }
  /* Time overlap: two jobs for the same worker on the same day with overlapping [time, time+dur). */
  function toMin(t) { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; }
  function conflicts(jobs, cand) {
    const out = [];
    const cs = toMin(cand.time); if (cs == null) return out;
    const ce = cs + Math.max(15, num(cand.duration || 60));
    jobs.forEach((j) => {
      if (j.id === cand.id || j.date !== cand.date || j.status === 'done' || j.status === 'cancelled') return;
      const s = toMin(j.time); if (s == null) return;
      const e = s + Math.max(15, num(j.duration || 60));
      if (s < ce && cs < e) {
        const shared = (j.team || []).filter((w) => (cand.team || []).includes(w));
        if (shared.length) out.push({ job: j, workers: shared });
      }
    });
    return out;
  }
  /* Shopping list: total quantity of materials across not-done jobs in a date range, grouped by name+unit. */
  function shoppingList(jobs, from, to) {
    const map = {};
    jobs.filter((j) => j.date >= from && j.date <= to && j.status !== 'done' && j.status !== 'cancelled').forEach((j) => {
      (j.materials || []).forEach((m) => {
        if (m.bought) return;
        const k = (m.name.trim().toLowerCase()) + '|' + (m.unit || '');
        if (!map[k]) map[k] = { name: m.name.trim(), unit: m.unit || '', qty: 0, cost: 0, jobs: [] };
        map[k].qty = round2(map[k].qty + num(m.qty)); map[k].cost = round2(map[k].cost + num(m.qty) * num(m.cost));
        if (!map[k].jobs.includes(j.title)) map[k].jobs.push(j.title);
      });
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }
  function money(n, cur, lang) {
    const v = round2(n); const s = v.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
    return s + ' ' + (lang === 'ar' && cur === 'EGP' ? 'ج.م' : cur);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function csv(rows) { return rows.map((r) => r.map((c) => { const s = String(c == null ? '' : c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\n'); }

  const api = { round2, num, lineTotal, docTotals, jobMaterialCost, jobMaterialPrice, jobLabor, jobProfit, itemsFromJob, nextNumber, estimateToInvoice, addDays, weekStart, ymd, parseYmd, invoiceStatus, conflicts, shoppingList, money, esc, csv, toMin };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SG = api;
})(typeof window !== 'undefined' ? window : globalThis);
