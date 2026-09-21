/* TrialGuard engine - trial deadline math, pure functions.
   The problem: free trials quietly convert to paid plans. What matters is
   the cancel-by date and the total burn if everything converts. */
(function (global) {
  'use strict';

  var MS_DAY = 86400000;

  // Parse 'YYYY-MM-DD' to a UTC-midnight Date
  function parseDate(s) {
    var p = s.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  }
  function fmtDate(d) {
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }

  // The trial converts at the END of the trial period, so cancel by startDate + trialDays - 1
  function cancelBy(startDate, trialDays) {
    if (!(trialDays >= 1)) throw new Error('trialDays must be >= 1');
    var d = parseDate(startDate);
    d.setUTCDate(d.getUTCDate() + trialDays - 1);
    return fmtDate(d);
  }

  // Whole days from today (YYYY-MM-DD) until the cancel-by date. Negative = expired.
  function daysLeft(startDate, trialDays, today) {
    var cb = parseDate(cancelBy(startDate, trialDays));
    var t = parseDate(today);
    return Math.round((cb - t) / MS_DAY);
  }

  // urgency: 'expired' (<0), 'today' (0), 'soon' (1-2), 'week' (3-7), 'safe' (>7)
  function urgency(days) {
    if (days < 0) return 'expired';
    if (days === 0) return 'today';
    if (days <= 2) return 'soon';
    if (days <= 7) return 'week';
    return 'safe';
  }

  // Sort key for active trials: most urgent first (expired last - they're already lost)
  function sortTrials(trials, today) {
    return trials.slice().sort(function (a, b) {
      var da = daysLeft(a.startDate, a.trialDays, today);
      var db = daysLeft(b.startDate, b.trialDays, today);
      var ea = da < 0, eb = db < 0;
      if (ea !== eb) return ea ? 1 : -1; // expired sink to bottom
      return da - db;
    });
  }

  // Monthly burn if every active trial converts
  function monthlyBurn(trials) {
    return trials.reduce(function (s, t) { return s + t.cost; }, 0);
  }
  function annualBurn(trials) {
    return Math.round(monthlyBurn(trials) * 12 * 100) / 100;
  }

  // Money saved by the ones you cancelled in time (per year, at their monthly cost)
  function yearlySaved(cancelled) {
    return Math.round(cancelled.reduce(function (s, t) { return s + t.cost; }, 0) * 12 * 100) / 100;
  }

  var api = { parseDate: parseDate, fmtDate: fmtDate, cancelBy: cancelBy, daysLeft: daysLeft, urgency: urgency, sortTrials: sortTrials, monthlyBurn: monthlyBurn, annualBurn: annualBurn, yearlySaved: yearlySaved };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.TrialGuard = api;
})(typeof window !== 'undefined' ? window : globalThis);
