/* home.js: home page (Dinmukhammet). Reviews are stored in an array and built with the DOM.
   Features: 1) filter + search of reviews, 2) sort and average rating, 3) animated counters. */
const REVIEWS = [
  { id: 1, name: 'Ерлан А.',  car: 'Audi A6',        service: 'ceramic',  serviceLabel: 'Керамика',  rating: 5, date: '2026-09-14', text: 'Чёрный Audi после керамики выглядит глубже, чем в салоне. Мыть стало вдвое проще.' },
  { id: 2, name: 'Диана С.',  car: 'BMW X5',         service: 'polish',   serviceLabel: 'Полировка', rating: 5, date: '2026-08-30', text: 'Убрали царапины, которые я считал неубираемыми. Фотоотчёт приятно удивил.' },
  { id: 3, name: 'Марат К.',  car: 'Toyota Camry',   service: 'interior', serviceLabel: 'Химчистка', rating: 4, date: '2026-08-12', text: 'Химчистка салона за день, запаха нет совсем. Приеду ещё раз весной.' },
  { id: 4, name: 'Алия Т.',   car: 'Lexus RX',       service: 'ppf',      serviceLabel: 'Плёнка',    rating: 5, date: '2026-07-25', text: 'Оклеили капот и бампер плёнкой. Швов не видно, после зимы ни одного скола.' },
  { id: 5, name: 'Тимур Б.',  car: 'Mercedes E-Class', service: 'ceramic', serviceLabel: 'Керамика', rating: 5, date: '2026-07-03', text: 'Через полгода пришёл на бесплатное обслуживание, покрытие как в первый день.' },
  { id: 6, name: 'Асель Н.',  car: 'Kia Sportage',   service: 'interior', serviceLabel: 'Химчистка', rating: 4, date: '2026-06-18', text: 'Вернули светлый салон после детских перекусов. Немного ждала выдачу, но результат того стоит.' },
  { id: 7, name: 'Руслан Д.', car: 'Toyota LC 300',  service: 'polish',   serviceLabel: 'Полировка', rating: 3, date: '2026-05-29', text: 'Блеск отличный, но пришлось перенести дату записи. Мастер всё компенсировал.' },
  { id: 8, name: 'Мадина Е.', car: 'Hyundai Tucson', service: 'ppf',      serviceLabel: 'Плёнка',    rating: 5, date: '2026-05-07', text: 'Показали образцы плёнки и честно сказали, какие зоны защищать, а какие нет.' }
];

$(function () {
  const state = { service: 'all', query: '', sort: 'new' };
  const $list = $('#reviewList');
  const $summary = $('#reviewSummary');

  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  function visibleReviews() {
    const q = state.query.trim().toLowerCase();
    const items = REVIEWS.filter(function (r) {
      const okService = state.service === 'all' || r.service === state.service;
      const okQuery = q === '' || (r.name + ' ' + r.car + ' ' + r.text + ' ' + r.serviceLabel).toLowerCase().includes(q);
      return okService && okQuery;
    });
    items.sort(function (a, b) {
      if (state.sort === 'high') { return b.rating - a.rating || b.date.localeCompare(a.date); }
      if (state.sort === 'low') { return a.rating - b.rating || b.date.localeCompare(a.date); }
      return b.date.localeCompare(a.date);
    });
    return items;
  }

  function card(r) {
    const month = new Date(r.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const $c = $('<div class="col-12 col-md-6 col-lg-4"></div>');
    const $fig = $('<figure class="card-gloss review mb-0"></figure>');
    $('<div class="review-top"></div>')
      .append($('<span class="stars"></span>').text(stars(r.rating)).attr('aria-label', 'Оценка ' + r.rating + ' из 5'))
      .append($('<span class="review-tag"></span>').text(r.serviceLabel))
      .appendTo($fig);
    $('<blockquote></blockquote>').text('«' + r.text + '»').appendTo($fig);
    $('<figcaption></figcaption>').text(r.name + ' · ' + r.car + ' · ' + month).appendTo($fig);
    return $c.append($fig);
  }

  function render() {
    const items = visibleReviews();
    $list.empty();
    if (items.length === 0) {
      $list.append($('<div class="col-12"></div>').append(
        $('<div class="empty-state"></div>')
          .append($('<strong></strong>').text('Ничего не найдено'))
          .append($('<span></span>').text('Попробуйте другое слово или выберите «Все услуги».'))
      ));
      $summary.html('Показано <b>0</b> из ' + REVIEWS.length);
      return;
    }
    let sum = 0;
    items.forEach(function (r, i) {
      sum += r.rating;
      card(r).appendTo($list).hide().delay(i * 60).fadeIn(300);
    });
    const avg = (sum / items.length).toFixed(1);
    $summary.html('Показано <b>' + items.length + '</b> из ' + REVIEWS.length + ' · средняя оценка <b>' + avg + ' ★</b>');
  }

  $('#reviewChips').on('click', '.chip', function () {
    state.service = $(this).data('service');
    $('#reviewChips .chip').attr('aria-pressed', 'false');
    $(this).attr('aria-pressed', 'true');
    render();
  });
  $('#reviewSearch').on('input', function () { state.query = this.value; render(); });
  $('#reviewSort').on('change', function () { state.sort = this.value; render(); });
  render();

  // animated counters in the stats strip (start once, when the strip is visible)
  const $stats = $('.stats-grid strong[data-count]');
  let counted = false;
  function runCounters() {
    if (counted) { return; }
    counted = true;
    $stats.each(function () {
      const $el = $(this);
      const target = Number($el.data('count'));
      const dec = Number($el.data('decimals') || 0);
      const suffix = $el.data('suffix') || '';
      $({ n: 0 }).animate({ n: target }, {
        duration: 1400,
        easing: 'swing',
        step: function (now) { $el.text(now.toLocaleString('ru-RU', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix); },
        complete: function () { $el.text(target.toLocaleString('ru-RU', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix); }
      });
    });
  }
  if ('IntersectionObserver' in window && $stats.length) {
    const io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { runCounters(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe($('.stats')[0]);
  }
});
