# sheghlana audit (pass 1, base 90b70f3)

| Severity | Where | Finding | Fix |
|---|---|---|---|
| High | sw.js activate | Deleted every cache on the shared github.io origin except its own, which wipes other projects' offline caches | Delete only caches that start with `sheghlana-`; same-origin GET and ok responses only |
| High | app.js toInv | Pressing "to invoice" twice created two invoices for one estimate | `invoiceFor()` finds the existing invoice and opens it |
| Medium | logic.js num | Arabic-Indic digits, the Arabic decimal mark and thousands marks parsed as 0 or truncated; negatives were accepted | Normalise digits and marks; negative or invalid is 0 |
| Medium | app.js tel link | Client phone went into a `tel:` href unchecked | `safePhone()` accepts phone-like values only |
| Low | logic.js csv | Cells starting with = + - @ could run as spreadsheet formulas | Prefix with an apostrophe (real numbers are kept) |
| Low | whole app | No author credit or demo label | YK logo, favicon, byline and a demo notice in the footer and README |

Checked and left as is: all user text goes through `esc()` in templates (no unescaped user text found in `app.js`); totals round per line and again at each step with the discount applied before tax; adjacent jobs are not conflicts (tested).

## Not done / remaining risk
- No dated tax rates are built in; tax is a user-entered percentage. Nothing here is a tax-compliance claim.
- Job conflicts only warn, and overnight jobs are compared within one day.
- Browser e2e (tests/e2e.js, needs puppeteer) was not run in this pass; a headless load showed no script errors.
- No WCAG or screen-reader certification is claimed. Drag is not required for scheduling.
- Data is local to one browser; clear-site-data erases it. Export CSV for a copy.

## Next
1. S: overnight job handling and a hard-block option for crew overlap.
2. M: backup/restore JSON with preview and version check.
3. L: dated, sourced tax presets (only with an authoritative source).
