/* works.js: works page (Yeraly). Gallery is built from an array of 8 objects.
   Features: 1) filter / search / sort of the gallery with average duration,
   2) lightbox with keyboard control, 3) before/after slider. */
const WORKS = [
  { id: 1, car: 'Audi A6',          service: 'ceramic',  label: 'Керамика',     days: 3, year: 2021, img: 'img/work1.svg', alt: 'Тёмный седан с каплями воды после нанесения керамики' },
  { id: 2, car: 'BMW X5',           service: 'polish',   label: 'Полировка',    days: 2, year: 2020, img: 'img/work2.svg', alt: 'Тёмный кроссовер, на капоте полировальный круг и круговые следы' },
  { id: 3, car: 'Toyota Camry',     service: 'interior', label: 'Химчистка',    days: 1, year: 2019, img: 'img/work3.svg', alt: 'Руль и передняя панель салона после химчистки' },
  { id: 4, car: 'Lexus RX',         service: 'ppf',      label: 'Плёнка',       days: 2, year: 2022, img: 'img/work4.svg', alt: 'Капот с защитной плёнкой, один край плёнки приподнят' },
  { id: 5, car: 'Mercedes E-Class', service: 'ceramic',  label: 'Керамика',     days: 2, year: 2023, img: 'img/work5.svg', alt: 'Колёсный диск с голубым центром и каплями воды после керамики' },
  { id: 6, car: 'Kia Sportage',     service: 'polish',   label: 'Полировка',    days: 1, year: 2018, img: 'img/work6.svg', alt: 'Фара: левая половина мутная, правая после полировки прозрачная' },
  { id: 7, car: 'Hyundai Tucson',   service: 'wash',     label: 'Мойка',        days: 1, year: 2021, img: 'img/work7.svg', alt: 'Седан, покрытый белой пеной во время мойки' },
  { id: 8, car: 'Toyota LC 300',    service: 'interior', label: 'Кожа салона',  days: 1, year: 2022, img: 'img/work8.svg', alt: 'Кожаное сиденье с голубой прострочкой после чистки' }
];

$(function () {
  const state = { service: 'all', query: '', sort: 'new' };
  const $grid = $('#gallery');
  let shown = [];
  let currentIndex = 0;
  let lastTrigger = null;

  function visible() {
    const q = state.query.trim().toLowerCase();
    const items = WORKS.filter(function (w) {
      return (state.service === 'all' || w.service === state.service) && (q === '' || (w.car + ' ' + w.label).toLowerCase().includes(q));
    });
    items.sort(function (a, b) {
      if (state.sort === 'fast') { return a.days - b.days || a.car.localeCompare(b.car); }
      if (state.sort === 'slow') { return b.days - a.days || a.car.localeCompare(b.car); }
      return b.year - a.year || a.car.localeCompare(b.car);
    });
    return items;
  }
  function daysWord(n) { return n === 1 ? 'день' : (n < 5 ? 'дня' : 'дней'); }

  function render() {
    shown = visible();
    $grid.empty();
    if (!shown.length) {
      $('#galleryCount').html('Показано работ: <b>0</b> из ' + WORKS.length);
      $grid.append($('<div class="empty-state gallery-empty"></div>')
        .append($('<strong></strong>').text('Работ не найдено'))
        .append($('<span></span>').text('Измените запрос или выберите «Все работы».')));
      return;
    }
    let sum = 0;
    shown.forEach(function (w, i) {
      sum += w.days;
      const $fig = $('<figure class="work"></figure>');
      const $btn = $('<button type="button" class="work-open"></button>').attr('aria-label', 'Открыть фото: ' + w.car + ', ' + w.label).data('index', i);
      $('<img>').attr({ src: w.img, alt: w.alt, loading: 'lazy', width: 800, height: 500 }).appendTo($btn);
      $('<figcaption></figcaption>').append($('<b></b>').text(w.car)).append($('<span></span>').text(w.label + ' · ' + w.days + ' ' + daysWord(w.days))).appendTo($btn);
      $fig.append($btn).hide().appendTo($grid).delay(i * 60).fadeIn(300);
    });
    const avg = (sum / shown.length).toFixed(1).replace('.', ',');
    $('#galleryCount').html('Показано работ: <b>' + shown.length + '</b> из ' + WORKS.length + ' · средний срок <b>' + avg + ' дн.</b>');
  }

  $('#workChips').on('click', '.chip', function () {
    state.service = $(this).data('service');
    $('#workChips .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    render();
  });
  $('#workSearch').on('input', function () { state.query = this.value; render(); });
  $('#workSort').on('change', function () { state.sort = this.value; render(); });
  render();

  /* ---- lightbox ---- */
  const $lb = $('#lightbox');
  function showSlide(i) {
    currentIndex = (i + shown.length) % shown.length;
    const w = shown[currentIndex];
    $('#lbImg').attr({ src: w.img, alt: w.alt });
    $('#lbTitle').text(w.car + ' · ' + w.label);
    $('#lbMeta').text(w.year + ' год · срок работ: ' + w.days + ' ' + daysWord(w.days) + ' · ' + (currentIndex + 1) + ' из ' + shown.length);
  }
  function openLb(i, trigger) {
    lastTrigger = trigger;
    showSlide(i);
    $lb.stop(true, true).attr('aria-hidden', 'false').fadeIn(250, function () { $('#lbClose').trigger('focus'); });
    $('body').addClass('no-scroll');
  }
  function closeLb() {
    $lb.stop(true, true).attr('aria-hidden', 'true').fadeOut(200);
    $('body').removeClass('no-scroll');
    if (lastTrigger) { $(lastTrigger).trigger('focus'); }
  }
  $grid.on('click', '.work-open', function () { openLb($(this).data('index'), this); });
  $('#lbClose').on('click', closeLb);
  $('#lbPrev').on('click', function () { showSlide(currentIndex - 1); });
  $('#lbNext').on('click', function () { showSlide(currentIndex + 1); });
  $lb.on('click', function (e) { if (e.target === this) { closeLb(); } });
  $(document).on('keydown', function (e) {
    if ($lb.attr('aria-hidden') !== 'false') { return; }
    if (e.key === 'Escape') { closeLb(); }
    else if (e.key === 'ArrowLeft') { showSlide(currentIndex - 1); }
    else if (e.key === 'ArrowRight') { showSlide(currentIndex + 1); }
    else if (e.key === 'Tab') {   // keep focus inside the dialog
      const $f = $lb.find('button:visible');
      const first = $f[0], last = $f[$f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---- before / after slider ---- */
  const $ba = $('.ba');
  $ba.find('.ba-range').on('input', function () { $ba[0].style.setProperty('--pos', this.value + '%'); });
  const tween = { p: 50 };   // one shared object, so fast repeated clicks never stack animations
  $('#baPresets').on('click', 'button', function () {
    const v = Number($(this).data('pos'));
    tween.p = Number($ba.find('.ba-range').val());
    $(tween).stop(true).animate({ p: v }, {
      duration: 400,
      step: function (now) { $ba[0].style.setProperty('--pos', now + '%'); $ba.find('.ba-range').val(now); }
    });
  });
});
