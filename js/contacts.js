/* contacts.js: contacts page (Dinmukhammet).
   Features: 1) live "open now" status + opening hours table from an array,
   2) search in quick answers (array of 8 objects), 3) validated contact form. */
const HOURS = [
  { day: 1, name: 'Понедельник', open: '09:00', close: '20:00', inspection: '19:00' },
  { day: 2, name: 'Вторник',     open: '09:00', close: '20:00', inspection: '19:00' },
  { day: 3, name: 'Среда',       open: '09:00', close: '20:00', inspection: '19:00' },
  { day: 4, name: 'Четверг',     open: '09:00', close: '20:00', inspection: '19:00' },
  { day: 5, name: 'Пятница',     open: '09:00', close: '20:00', inspection: '19:00' },
  { day: 6, name: 'Суббота',     open: '09:00', close: '20:00', inspection: '18:00' },
  { day: 7, name: 'Воскресенье', open: '09:00', close: '20:00', inspection: '18:00' }
];

const ANSWERS = [
  { id: 1, topic: 'Запись',   question: 'Как записаться на осмотр?',           answer: 'Заполните форму на странице «Запись» или позвоните. Осмотр бесплатный и занимает около 20 минут.', keywords: 'запись осмотр бесплатно звонок' },
  { id: 2, topic: 'Оплата',   question: 'Можно ли оплатить картой?',           answer: 'Да, принимаем карты и Kaspi. Для керамики и плёнки возможна предоплата 50 процентов.', keywords: 'оплата карта kaspi предоплата' },
  { id: 3, topic: 'Гарантия', question: 'Что входит в гарантию на керамику?',   answer: 'Письменный сертификат на 5 лет и бесплатное обслуживание через полгода после нанесения.', keywords: 'гарантия керамика сертификат' },
  { id: 4, topic: 'Сроки',    question: 'Сколько машина будет в студии?',       answer: 'От 3 часов на мойку до 3 дней на полный комплекс. Срок называем заранее.', keywords: 'сроки время дни часы' },
  { id: 5, topic: 'Адрес',    question: 'Где находится студия и есть ли парковка?', answer: 'Астана, ул. Култегин, 10. Въезд со двора через ворота студии, гостевая парковка бесплатная.', keywords: 'адрес парковка проезд двор' },
  { id: 6, topic: 'Салон',    question: 'Уберёте ли вы запах из салона?',      answer: 'Да. После химчистки делаем озонирование, и запах уходит полностью.', keywords: 'запах салон озон химчистка' },
  { id: 7, topic: 'Плёнка',   question: 'Можно ли оклеить только капот?',      answer: 'Можно. Защищаем только те зоны, которые вы выберете: капот, бампер, зеркала, пороги.', keywords: 'плёнка капот бампер оклейка' },
  { id: 8, topic: 'Фотоотчёт', question: 'Присылаете ли вы фото в процессе?',   answer: 'Да, фотоотчёт приходит в WhatsApp на каждом этапе: до, во время и после работ.', keywords: 'фото отчёт whatsapp этапы' }
];

$(function () {
  /* ---- opening hours table + open-now status (Astana time) ---- */
  function astanaNow() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = function (t) { return parts.find(function (p) { return p.type === t; }).value; };
    const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    return { day: dayMap[get('weekday')], minutes: Number(get('hour')) % 24 * 60 + Number(get('minute')) };
  }
  function toMin(t) { const p = t.split(':'); return Number(p[0]) * 60 + Number(p[1]); }

  const now = astanaNow();
  const $tbody = $('#hoursBody');
  HOURS.forEach(function (h) {
    const $tr = $('<tr></tr>').toggleClass('today', h.day === now.day);
    $('<th scope="row"></th>').text(h.name).appendTo($tr);
    $('<td></td>').text(h.open + '–' + h.close).appendTo($tr);
    $('<td></td>').text(h.open + '–' + h.inspection).appendTo($tr);
    $tbody.append($tr);
  });

  const today = HOURS.find(function (h) { return h.day === now.day; });
  const open = toMin(today.open), close = toMin(today.close);
  const $status = $('#openStatus');
  if (now.minutes >= open && now.minutes < close) {
    const left = close - now.minutes;
    $status.addClass('is-open').text('Сейчас открыто · закрываемся через ' + Math.floor(left / 60) + ' ч ' + (left % 60) + ' мин');
  } else {
    $status.addClass('is-closed').text(now.minutes < open ? 'Сейчас закрыто · откроемся сегодня в ' + today.open : 'Сейчас закрыто · откроемся завтра в 09:00');
  }

  /* ---- route: slideToggle ---- */
  let routeOpen = false;
  $('#routeToggle').on('click', function () {
    routeOpen = !routeOpen;
    $('#routeSteps').stop(true, true).slideToggle(300);
    $(this).attr('aria-expanded', routeOpen).text(routeOpen ? 'Скрыть маршрут' : 'Показать, как проехать');
  });

  /* ---- quick answers: search + accordion ---- */
  const $ans = $('#answerList');
  function renderAnswers(query) {
    const q = query.trim().toLowerCase();
    const items = ANSWERS.filter(function (a) { return q === '' || (a.question + ' ' + a.answer + ' ' + a.keywords + ' ' + a.topic).toLowerCase().includes(q); });
    $ans.empty();
    $('#answerCount').html('Найдено ответов: <b>' + items.length + '</b> из ' + ANSWERS.length);
    if (!items.length) {
      $ans.append($('<div class="empty-state"></div>')
        .append($('<strong></strong>').text('Ответов не найдено'))
        .append($('<span></span>').text('Напишите нам через форму ниже, и мы ответим в течение часа.')));
      return;
    }
    items.forEach(function (a, i) {
      const id = 'ans' + a.id;
      const $item = $('<div class="qa"></div>');
      $('<button type="button" class="qa-btn" aria-expanded="false"></button>').attr('aria-controls', id)
        .append($('<span class="qa-topic"></span>').text(a.topic))
        .append($('<span class="qa-q"></span>').text(a.question))
        .appendTo($item);
      $('<div class="qa-a"></div>').attr('id', id).text(a.answer).hide().appendTo($item);
      $item.hide().appendTo($ans).delay(i * 50).fadeIn(250);
    });
  }
  $ans.on('click', '.qa-btn', function () {
    const $btn = $(this);
    const $panel = $('#' + $btn.attr('aria-controls'));
    $panel.stop(true, true).slideToggle(250);
    $btn.attr('aria-expanded', $btn.attr('aria-expanded') !== 'true');
    $btn.parent().toggleClass('open');
  });
  $('#answerSearch').on('input', function () { renderAnswers(this.value); });
  renderAnswers('');

  /* ---- contact form ---- */
  const R = Validator.rules;
  let lastName = '';
  Validator.attach('#contactForm', {
    name:    [R.required('Введите ваше имя'), R.minLen(2, 'Имя должно содержать минимум 2 буквы'), R.pattern(/^[\p{L}\s'-]+$/u, 'В имени допустимы только буквы')],
    phone:   [R.required('Введите номер телефона'), R.phone('Номер выглядит так: +7 705 000 00 00')],
    email:   [R.required('Введите e-mail'), R.email('Проверьте e-mail: нужен адрес вида name@mail.kz')],
    topic:   [R.required('Выберите тему обращения')],
    message: [R.required('Напишите сообщение'), R.minLen(10, 'Сообщение слишком короткое: напишите минимум 10 символов')],
    consent: [R.required('Нужно согласие на обработку данных')]
  }, {
    successSelector: '#contactSuccess',
    onSuccess: function (v) { $('#contactSuccessText').text(v.name + ', спасибо! Мы ответим на ' + v.email + ' или позвоним в течение часа.'); }
  });
});
