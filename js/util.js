/* 공통 도구 — 값 표기, 저장소, 알림, 확인 창 */
(function (w) {
  'use strict';

  var F = {
    /* 숫자 한 칸 표기: 98.6 → "98.6", 100.0 → "100" */
    num: function (v, d) {
      if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
      var n = Number(v);
      if (d === undefined) d = 1;
      var s = n.toFixed(d);
      if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
      return s;
    },
    fixed: function (v, d) {
      if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
      return Number(v).toFixed(d === undefined ? 2 : d);
    },
    /* 부호 붙임: -19.23 → "-19.2" */
    signed: function (v, d) {
      if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
      var n = Number(v);
      var s = n.toFixed(d === undefined ? 1 : d);
      return (n > 0 ? '+' : '') + s;
    },
    pct: function (v, d) {
      if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
      return F.signed(v, d) + '%';
    },
    /* 원 단위: 1234567 → "1,234,567" */
    int: function (v) {
      if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
      return Math.round(Number(v)).toLocaleString('ko-KR');
    },
    won: function (v) {
      if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
      var n = Math.round(Number(v));
      var s = n.toLocaleString('ko-KR');
      if (Math.abs(n) >= 100000000) {
        return s + ' <small>(' + F.num(n / 100000000, 2) + '억)</small>';
      }
      return s;
    },
    /* 날짜: 2026-11-20 → 2026.11.20 */
    day: function (s) {
      if (!s) return '—';
      return String(s).replace(/-/g, '.');
    },
    today: function () {
      var d = new Date();
      var p = function (n) { return (n < 10 ? '0' : '') + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
  };

  var S = {
    get: function (k, def) {
      try {
        var raw = w.localStorage.getItem('stockrebal.' + k);
        if (raw === null) return def;
        return JSON.parse(raw);
      } catch (e) { return def; }
    },
    set: function (k, v) {
      try {
        w.localStorage.setItem('stockrebal.' + k, JSON.stringify(v));
        return true;
      } catch (e) {
        toast('저장하지 못했습니다(브라우저 저장 공간).');
        return false;
      }
    },
    del: function (k) {
      try { w.localStorage.removeItem('stockrebal.' + k); } catch (e) {}
    }
  };

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }

  var confirmCb = null;
  function confirmBox(opts, cb) {
    var modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = opts.title || '확인';
    document.getElementById('modal-body').textContent = opts.body || '';
    document.getElementById('modal-ok').textContent = opts.ok || '삭제';
    document.getElementById('modal-cancel').textContent = opts.cancel || '취소';
    confirmCb = cb;
    modal.hidden = false;
    document.getElementById('modal-ok').focus();
  }
  function bindModal() {
    var modal = document.getElementById('modal');
    document.getElementById('modal-ok').addEventListener('click', function () {
      modal.hidden = true;
      if (confirmCb) { var cb = confirmCb; confirmCb = null; cb(); }
    });
    document.getElementById('modal-cancel').addEventListener('click', function () {
      modal.hidden = true; confirmCb = null;
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) { modal.hidden = true; confirmCb = null; }
    });
  }

  function isEl(x) { return !!(x && x.nodeType === 1); }
  /* el('#id', root) / el(root, '#id') 둘 다 허용 */
  function el(a, b) {
    var root = isEl(a) ? a : (isEl(b) ? b : document);
    var sel = isEl(a) ? b : a;
    return root.querySelector(sel);
  }
  function els(a, b) {
    var root = isEl(a) ? a : (isEl(b) ? b : document);
    var sel = isEl(a) ? b : a;
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  /* 이벤트 위임 — 같은 요소에 같은 이벤트·선택자를 두 번 붙이지 않는다(화면을 다시 그릴 때 중복 실행 방지) */
  function on(root, ev, sel, fn) {
    var key = ev + '|' + sel;
    if (!root.__bound) { root.__bound = {}; }
    if (root.__bound[key]) { root.__bound[key] = fn; return; }
    root.__bound[key] = fn;
    root.addEventListener(ev, function (e) {
      var h = root.__bound[key];
      if (!h) return;
      var t = e.target.closest(sel);
      if (t && root.contains(t)) h.call(t, e, t);
    });
  }

  function numOrNull(v) {
    if (v === null || v === undefined) return null;
    var s = String(v).replace(/,/g, '').trim();
    if (s === '') return null;
    var n = Number(s);
    return isNaN(n) ? null : n;
  }

  w.F = F; w.S = S; w.esc = esc; w.toast = toast; w.confirmBox = confirmBox;
  w.bindModal = bindModal; w.el = el; w.els = els; w.on = on; w.numOrNull = numOrNull;
})(window);
