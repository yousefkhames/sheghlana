/* MIT · Copyright (c) 2026 Yousef Khames · UI strings as [Arabic, English]. */
(function (root) {
  'use strict';
  Object.assign(root.Kit.dict, {
    title: ['شغلانة', 'sheghlana'], lang: ['EN', 'عربي'], jobs: ['الشغل', 'Jobs'], day: ['اليوم', 'Day'], clients: ['العملاء', 'Clients'], settings: ['الإعدادات', 'Settings'],
    demoBanner: ['بيانات تجريبية بأسماء خيالية. امسحها من الإعدادات وابدأ شغلك.', 'Demo data with fictional names. Clear it in Settings and start your own.'], demoTag: ['تجريبي', 'Demo'],
    st_lead: ['طلب جديد', 'Lead'], st_estimate: ['عرض سعر', 'Estimate sent'], st_scheduled: ['محدد موعد', 'Scheduled'], st_done: ['تم التنفيذ', 'Done'], st_paid: ['تم الاستلام', 'Received'], all: ['الكل', 'All'],
    summaryH: ['من الفواتير المسجلة فقط', 'From recorded invoices only'], noInvoices: ['لا توجد فواتير مسجلة بعد.', 'No invoices recorded yet.'], invoiced: ['إجمالي الفواتير: {v}', 'Invoiced: {v}'], received: ['تم استلامه (تسجيل يدوي): {v}', 'Received (manual mark): {v}'], outstanding: ['المتبقي: {v}', 'Outstanding: {v}'],
    addJob: ['إضافة شغل', 'Add job'], jobTitle: ['وصف الشغل (مثلا: تغيير خلاط)', 'Job title (for example: replace a mixer)'], pickClient: ['اختر العميل', 'Pick a client'], noJobs: ['لا يوجد شغل.', 'No jobs.'], needTitle: ['اكتب وصف الشغل', 'Enter a job title'], needClient: ['اختر عميلا أو أضف عميلا أولا', 'Pick a client or add one first'],
    clientName: ['اسم العميل', 'Client name'], clientPhone: ['واتساب العميل', 'Client WhatsApp'], clientAddr: ['العنوان', 'Address'], addClient: ['إضافة عميل', 'Add client'], needName: ['اكتب اسم العميل', 'Enter a client name'], delClient: ['حذف', 'Delete'], clientBusy: ['لا يمكن حذف عميل له شغل', 'Cannot delete a client who has jobs'], noClients: ['لا يوجد عملاء.', 'No clients.'],
    dayH: ['شغل اليوم', 'Jobs for the day'], noDay: ['لا شغل في هذا اليوم.', 'No jobs on this day.'], noTime: ['بدون وقت', 'No time'],
    fTitle: ['الوصف', 'Title'], fClient: ['العميل', 'Client'], fStatus: ['الحالة', 'Status'], fDate: ['التاريخ', 'Date'], fTime: ['الوقت', 'Time'], fNotes: ['ملاحظات', 'Notes'], checklist: ['قائمة المهام', 'Checklist'], addCheck: ['أضف مهمة', 'Add task'],
    items: ['البنود', 'Line items'], labour: ['مصنعية', 'Labour'], material: ['خامات', 'Materials'], desc: ['البيان', 'Description'], qty: ['الكمية', 'Qty'], price: ['السعر', 'Price'], addItem: ['إضافة بند', 'Add line'], remove: ['حذف', 'Remove'],
    subtotal: ['المجموع', 'Subtotal'], tax: ['ضريبة ({r}%)', 'Tax ({r}%)'], total: ['الإجمالي', 'Total'],
    estimate: ['عرض سعر', 'Estimate'], invoice: ['فاتورة', 'Invoice'], printDoc: ['طباعة / PDF', 'Print / PDF'], waDoc: ['مسودة واتساب', 'WhatsApp draft'], noItems: ['أضف بندا واحدا على الأقل أولا', 'Add at least one line first'], noPhone: ['أضف رقم واتساب للعميل', 'Add a WhatsApp number for the client'],
    markPaid: ['تسجيل استلام المبلغ (يدوي)', 'Mark payment received (manual)'], payMethod: ['طريقة الاستلام', 'How it was received'], payNote: ['ملاحظة', 'Note'], needInvoice: ['أصدر فاتورة أولا', 'Issue an invoice first'], undoPaid: ['إلغاء تسجيل الاستلام', 'Undo received mark'], paidInfo: ['سجلت كمستلم يدويا. لا يوجد دفع داخل التطبيق.', 'Marked as received by hand. There is no payment in the app.'],
    delJob: ['حذف الشغل', 'Delete job'], confirmDel: ['حذف هذا الشغل نهائيا؟', 'Delete this job for good?'], close: ['إغلاق', 'Close'],
    docNotTax: ['هذا المستند ليس فاتورة ضريبية رسمية.', 'This document is not an official tax invoice.'], docDate: ['التاريخ: {d}', 'Date: {d}'], docTo: ['العميل: {c}', 'Client: {c}'],
    waDocText: ['{biz}: {k} رقم {no} لشغل {job}. الإجمالي {tot} {cur}.', '{biz}: {k} {no} for {job}. Total {tot} {cur}.'],
    biz: ['اسم النشاط', 'Business name'], bizPhone: ['هاتف النشاط', 'Business phone'], cur: ['العملة', 'Currency'], taxRate: ['نسبة الضريبة % (الافتراضي 0)', 'Tax rate % (default 0)'], estPrefix: ['بادئة رقم العرض', 'Estimate number prefix'], invPrefix: ['بادئة رقم الفاتورة', 'Invoice number prefix'], nextEst: ['رقم العرض التالي', 'Next estimate number'], nextInv: ['رقم الفاتورة التالي', 'Next invoice number'],
    save: ['حفظ', 'Save'], saved: ['تم الحفظ', 'Saved'], exportCsv: ['تصدير الشغل CSV', 'Export jobs CSV'], backup: ['نسخة احتياطية JSON', 'Backup JSON'], restoreFile: ['استعادة نسخة', 'Restore backup'], restored: ['تمت الاستعادة', 'Restored'], restoreFail: ['ملف غير صالح', 'Invalid file'],
    clearDemo: ['مسح البيانات التجريبية', 'Clear demo data'], confirmClear: ['سيتم حذف كل بيانات التطبيق على هذا الجهاز. متابعة؟', 'This deletes all app data on this device. Continue?'],
    limits: ['حدود: البيانات في متصفح هذا الجهاز فقط ولا توجد مزامنة. صدّر نسخة احتياطية كل فترة. المستندات ليست فواتير ضريبية رسمية. لا يوجد دفع داخل التطبيق. لا توجد صور مرفقة في هذه النسخة.', 'Limits: data lives in this browser only, with no sync. Export a backup regularly. Documents are not official tax invoices. No payments inside the app. No photo attachments in this version.'],
    blocked: ['البيانات المخزنة غير قابلة للقراءة ولن يتم الكتابة فوقها حتى تمسحها.', 'Stored data is unreadable and will not be overwritten until you erase it.']
  });
})(globalThis);
