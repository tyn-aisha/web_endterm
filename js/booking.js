/* booking.js: booking page (Bertan).
   Data: extras (8 objects), time slots (8 objects), promo codes.
   Features: 1) live price calculator with extras and promo code (total is calculated),
   2) time slots built for the chosen date (busy slots are disabled),
   3) validated booking form with a success message. */
const EXTRAS = [
  { id: 'ozone',    name: 'Озонирование салона',      price: 8000,  hours: 1, note: 'Убирает запахи' },
  { id: 'lights',   name: 'Полировка фар',            price: 12000, hours: 2, note: 'Прозрачные фары' },
  { id: 'wheels',   name: 'Керамика на диски',        price: 25000, hours: 4, note: 'Диски не грязнятся' },
  { id: 'glass',    name: 'Керамика на стёкла',       price: 15000, hours: 2, note: 'Вода скатывается' },
  { id: 'engine',   name: 'Мойка двигателя',          price: 8000,  hours: 1, note: 'Без риска для электрики' },
  { id: 'leather',  name: 'Кондиционер для кожи',     price: 20000, hours: 3, note: 'Мягкая кожа салона' },
  { id: 'trunk',    name: 'Чистка багажника',         price: 6000,  hours: 1, note: 'Ковёр и ниши' },
  { id: 'report',   name: 'Видеоотчёт о работах',     price: 3000,  hours: 0, note: 'Ролик в WhatsApp' }
];
const SLOTS = [
  { time: '09:00', period: 'Утро',  capacity: 2, busyMod: 3 },
  { time: '10:00', period: 'Утро',  capacity: 2, busyMod: 4 },
  { time: '11:00', period: 'Утро',  capacity: 2, busyMod: 5 },
  { time: '12:00', period: 'День',  capacity: 1, busyMod: 3 },
  { time: '14:00', period: 'День',  capacity: 2, busyMod: 4 },
  { time: '15:00', period: 'День',  capacity: 2, busyMod: 5 },
  { time: '16:00', period: 'Вечер', capacity: 1, busyMod: 3 },
  { time: '17:00', period: 'Вечер', capacity: 1, busyMod: 4 }
];
const PROMOS = [
  { code: 'OBSIDIAN10', percent: 10 },
  { code: 'FIRST5',     percent: 5 },
  { code: 'WINTER15',   percent: 15 }
];

$(function () {
  const form = $('#bookingForm')[0];
  const $form = $(form);
  const $total = $('#sumTotal');
  const totalAnim = { v: 0 };

  /* ---- extras built from the array ---- */
  const $extras = $('#extrasList');
  EXTRAS.forEach(function (e) {
    const $label = $('<label class="extra-item"></label>');
    $('<input class="form-check-input extra" type="checkbox" name="extra">').val(e.id).appendTo($label);
    const $txt = $('<span class="extra-text"></span>');
    $('<b></b>').text(e.name).appendTo($txt);
    $('<small></small>').text(e.note).appendTo($txt);
    $label.append($txt).append($('<em></em>').text('+' + Site.rub(e.price)));
    $extras.append($label);
  });

  /* ---- car classes and packages from data.js ---- */
  const $classGrid = $('#classGrid');
  CAR_CLASSES.forEach(function (c, i) {
    const $l = $('<label class="class-option"></label>');
    $('<input type="radio" name="carClass">').val(c.id).prop('checked', i === 0).appendTo($l);
    $l.append($('<span></span>').append($('<b></b>').text(c.name)).append($('<small></small>').text(c.examples)));
    $classGrid.append($l);
  });
  const $pkg = $('#package');
  PACKAGES.forEach(function (p) {
    $('<option></option>').val(p.id).text(p.name + ': ' + p.lead).prop('selected', p.id === 'ceramic').appendTo($pkg);
  });

  /* ---- price calculation ---- */
  function currentPromo() {
    const code = $('#promo').val().trim().toUpperCase();
    return PROMOS.find(function (p) { return p.code === code; }) || null;
  }
  function calc() {
    const cls = form.elements.carClass.value;
    const pack = PACKAGES.find(function (p) { return p.id === $pkg.val(); });
    let extrasSum = 0, extrasCount = 0, hours = 0;
    $form.find('.extra:checked').each(function () {
      const e = EXTRAS.find(function (x) { return x.id === this.value; }, this);
      extrasSum += e.price; hours += e.hours; extrasCount += 1;
    });
    const subtotal = pack.prices[cls] + extrasSum;
    const promo = currentPromo();
    const discount = promo ? Math.round(subtotal * promo.percent / 100) : 0;
    return { pack: pack, cls: CAR_CLASSES.find(function (c) { return c.id === cls; }), extrasSum: extrasSum, extrasCount: extrasCount, discount: discount, promo: promo, total: subtotal - discount, hours: hours };
  }
  function updateSummary() {
    const c = calc();
    $('#sumPackage').text(c.pack.name);
    $('#sumClass').text(c.cls.name);
    $('#sumExtras').text(c.extrasCount ? c.extrasCount + ' шт. · ' + Site.rub(c.extrasSum) : '0 ₸');
    $('#sumDiscountRow').toggle(!!c.promo);
    $('#sumDiscount').text(c.promo ? '−' + Site.rub(c.discount) + ' (' + c.promo.percent + '%)' : '');
    // animated change of the total (one tween object, so fast clicks do not stack)
    $(totalAnim).stop(true).animate({ v: c.total }, {
      duration: 350,
      step: function (now) { $total.text(Site.rub(Math.round(now))); },
      complete: function () { $total.text(Site.rub(c.total)); }
    });
    $total.parent().stop(true, true).css('position', 'relative').animate({ top: -3 }, 90).animate({ top: 0 }, 90);
    return c;
  }
  $form.on('change input', 'input[name=carClass], #package, .extra, #promo', function () { updateSummary(); });

  /* ---- time slots for the chosen date ---- */
  const dateInput = $('#date')[0];
  const fmt = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const today = new Date();
  const maxDate = new Date(today.getTime() + 90 * 86400000);
  dateInput.min = fmt(today);
  dateInput.max = fmt(maxDate);

  // deterministic "busy" rule: the same date always gives the same free slots
  function isBusy(dateStr, slot) {
    const n = Number(dateStr.replace(/-/g, '')) + Number(slot.time.slice(0, 2));
    return n % slot.busyMod === 0;
  }
  function renderSlots() {
    const $box = $('#slotList').empty();
    const d = dateInput.value;
    if (!d) {
      $box.append($('<p class="slot-hint"></p>').text('Сначала выберите дату, и мы покажем свободное время.'));
      return;
    }
    const isToday = d === fmt(today);
    let free = 0;
    SLOTS.forEach(function (s, i) {
      const past = isToday && Number(s.time.slice(0, 2)) <= today.getHours();
      const busy = past || isBusy(d, s);
      if (!busy) { free += 1; }
      const $l = $('<label class="slot"></label>').toggleClass('is-busy', busy);
      $('<input type="radio" name="time">').val(s.time).prop('disabled', busy).appendTo($l);
      $l.append($('<span></span>').append($('<b></b>').text(s.time)).append($('<small></small>').text(busy ? 'занято' : s.period)));
      $l.hide().appendTo($box).delay(i * 40).fadeIn(200);
    });
    $('#slotFree').text(free === 0 ? 'На эту дату свободного времени нет. Выберите другую дату.' : 'Свободно окон: ' + free + ' из ' + SLOTS.length);
  }
  $('#date').on('change', function () { renderSlots(); });

  /* ---- validation ---- */
  const R = Validator.rules;
  const toDate = function (s) { const p = s.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); };
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  Validator.attach('#bookingForm', {
    name:    [R.required('Введите ваше имя'), R.minLen(2, 'Имя должно содержать минимум 2 буквы'), R.pattern(/^[\p{L}\s'-]+$/u, 'В имени допустимы только буквы')],
    phone:   [R.required('Введите номер телефона'), R.phone('Номер выглядит так: +7 705 000 00 00')],
    email:   [R.required('Введите e-mail'), R.email('Проверьте e-mail: нужен адрес вида name@mail.kz')],
    car:     [R.required('Укажите марку и модель автомобиля'), R.minLen(3, 'Название слишком короткое: например, Audi A6'), R.pattern(/\p{L}/u, 'В названии должны быть буквы')],
    date:    [R.required('Выберите дату визита'),
              R.custom(function (v) { return v === '' || toDate(v) >= startOfToday || 'Эта дата уже прошла: выберите сегодняшнюю или более позднюю'; }),
              R.custom(function (v) { return v === '' || toDate(v) <= maxDate || 'Запись открыта на 90 дней вперёд'; })],
    time:    [R.required('Выберите свободное время')],
    promo:   [R.custom(function (v) { return v.trim() === '' || PROMOS.some(function (p) { return p.code === v.trim().toUpperCase(); }) || 'Такого промокода нет. Проверьте написание или оставьте поле пустым'; })],
    consent: [R.required('Нужно согласие на обработку данных')]
  }, {
    successSelector: '#bookingSuccess',
    onSuccess: function (v) {
      const c = calc();
      const code = 'OD-' + String(Date.now()).slice(-5);
      const date = toDate(v.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      $('#successCode').text(code);
      $('#successText').text(v.name + ', спасибо! Заявка ' + code + ': ' + c.pack.name + ', ' + c.cls.name.toLowerCase() + ', ' + date + ' в ' + v.time + '. Предварительная стоимость: ' + Site.rub(c.total) + '. Мы позвоним в течение часа.');
    }
  });
  $form.on('form:cleared', function () {
    // after a successful submit: restore defaults and recalculate
    $('input[name=carClass]').first().prop('checked', true);
    $pkg.val('ceramic');
    renderSlots();
    updateSummary();
  });
  $('#successClose').on('click', function () { $('#bookingSuccess').stop(true, true).slideUp(250); });

  renderSlots();
  updateSummary();
});
