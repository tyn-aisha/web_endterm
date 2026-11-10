/* validate.js: reusable form validation (jQuery).
   - errors appear UNDER the field (never alert()), in plain words;
   - an error disappears as soon as the field is corrected;
   - on a correct submit: success message, the form is cleared;
   - no errors when the page opens.

   Usage: Validator.attach('#formId', schema, { onSuccess(values) {...}, successSelector: '#ok' })
   schema = { fieldName: [ruleFn, ruleFn, ...] }, ruleFn(value, form) returns true or an error text. */
const Validator = (function ($) {
  const R = {
    required: (msg) => (v) => (String(v).trim() !== '') || msg,
    minLen: (n, msg) => (v) => (String(v).trim() === '' || String(v).trim().length >= n) || msg,
    pattern: (re, msg) => (v) => (String(v).trim() === '' || re.test(String(v).trim())) || msg,
    email: (msg) => (v) => (String(v).trim() === '' || /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim())) || msg,
    // Kazakhstan phone: +7 / 8 and 10 more digits, spaces, dashes and brackets are allowed
    phone: (msg) => (v) => {
      if (String(v).trim() === '') { return true; }
      if (!/^[+\d][\d\s()\-]*$/.test(v.trim())) { return msg; }
      const d = v.replace(/\D/g, '');
      return ((d.length === 11 && (d[0] === '7' || d[0] === '8')) || d.length === 10) || msg;
    },
    number: (min, max, msg) => (v) => {
      if (String(v).trim() === '') { return true; }
      const n = Number(v);
      return (Number.isFinite(n) && n >= min && n <= max) || msg;
    },
    custom: (fn) => fn
  };

  function getValue(form, name) {
    const el = form.elements[name];
    if (!el) { return ''; }
    if (el instanceof RadioNodeList) { return el.value; }
    if (el.type === 'checkbox') { return el.checked ? '1' : ''; }
    return el.value;
  }
  function controls(form, name) {
    const el = form.elements[name];
    if (!el) { return $(); }
    return el instanceof RadioNodeList ? $(Array.from(el)) : $(el);
  }
  function fieldBox(form, name) {
    return $(form).find('[data-field="' + name + '"]').first();
  }
  function showError(form, name, msg) {
    const $box = fieldBox(form, name);
    let $err = $box.find('.field-error').first();
    if (!$err.length) {
      $err = $('<div class="field-error" role="alert"></div>').attr('id', name + '-error').appendTo($box);
    }
    $err.text(msg).stop(true, true).fadeIn(150);
    $box.addClass('has-error');
    controls(form, name).addClass('is-invalid').attr({ 'aria-invalid': 'true', 'aria-describedby': name + '-error' });
  }
  function clearError(form, name) {
    const $box = fieldBox(form, name);
    $box.removeClass('has-error').find('.field-error').stop(true, true).fadeOut(120);
    controls(form, name).removeClass('is-invalid').removeAttr('aria-invalid').removeAttr('aria-describedby');
  }
  function check(form, schema, name) {
    const value = getValue(form, name);
    for (const rule of schema[name]) {
      const res = rule(value, form);
      if (res !== true) { clearError(form, name); showError(form, name, res); return false; }
    }
    clearError(form, name);
    return true;
  }

  function attach(selector, schema, opts) {
    const form = $(selector)[0];
    if (!form) { return; }
    const $form = $(form);
    const touched = {};
    $form.attr('novalidate', 'novalidate');

    // live check: only after the field was touched or already shows an error
    $form.on('input change', function (e) {
      const name = e.target.name;
      if (!name || !schema[name]) { return; }
      if (fieldBox(form, name).hasClass('has-error') || touched[name]) { check(form, schema, name); }
    });
    $form.on('focusout', function (e) {
      const name = e.target.name;
      if (!name || !schema[name]) { return; }
      if (String(getValue(form, name)).trim() !== '') { touched[name] = true; check(form, schema, name); }
    });

    $form.on('submit', function (e) {
      e.preventDefault();
      if ($form.data('busy')) { return; }
      let firstBad = null;
      Object.keys(schema).forEach(function (name) {
        if (!check(form, schema, name) && !firstBad) { firstBad = name; }
      });
      if (firstBad) {
        let $first = controls(form, firstBad).first();
        if (!$first.length) { $first = fieldBox(form, firstBad); }
        $('html, body').stop(true).animate({ scrollTop: Math.max(0, $first.offset().top - 140) }, 350, function () { $first.trigger('focus'); });
        window.Site.shake(fieldBox(form, firstBad));
        return;
      }
      $form.data('busy', true);
      const values = {};
      Object.keys(schema).forEach(function (n) { values[n] = getValue(form, n); });
      if (opts && opts.onSuccess) { opts.onSuccess(values, form); }
      form.reset();
      Object.keys(schema).forEach(function (n) { clearError(form, n); touched[n] = false; });
      $form.trigger('form:cleared');
      if (opts && opts.successSelector) {
        const $ok = $(opts.successSelector);
        $ok.stop(true, true).hide().slideDown(300);
        $('html, body').stop(true).animate({ scrollTop: Math.max(0, $ok.offset().top - 120) }, 400);
      }
      setTimeout(function () { $form.data('busy', false); }, 600);
    });
  }
  return { attach: attach, rules: R };
})(jQuery);
