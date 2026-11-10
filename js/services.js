/* services.js: services page (Yeraly). Data in arrays, content built with the DOM.
   Features: 1) search / filter / sort of the price list, 2) cart with a total,
   3) package finder (validated form with a calculated recommendation). */
const SERVICES = [
  { id: 1,  name: 'Комплексная мойка',            category: 'wash',     prices: { sedan: 15000,  crossover: 18000,  suv: 22000 },  duration: '3 часа',    hours: 3 },
  { id: 2,  name: 'Мойка двигателя',              category: 'wash',     prices: { sedan: 8000,   crossover: 10000,  suv: 12000 },  duration: '1 час',     hours: 1 },
  { id: 3,  name: 'Полировка кузова',             category: 'polish',   prices: { sedan: 60000,  crossover: 75000,  suv: 90000 },  duration: '1–2 дня',   hours: 16 },
  { id: 4,  name: 'Полировка фар',                category: 'polish',   prices: { sedan: 12000,  crossover: 12000,  suv: 15000 },  duration: '2 часа',    hours: 2 },
  { id: 5,  name: 'Керамическое покрытие',        category: 'protect',  prices: { sedan: 140000, crossover: 170000, suv: 210000 }, duration: '2–3 дня',   hours: 24 },
  { id: 6,  name: 'Керамика на диски',            category: 'protect',  prices: { sedan: 25000,  crossover: 25000,  suv: 30000 },  duration: '4 часа',    hours: 4 },
  { id: 7,  name: 'Керамика на стёкла',           category: 'protect',  prices: { sedan: 15000,  crossover: 18000,  suv: 20000 },  duration: '2 часа',    hours: 2 },
  { id: 8,  name: 'Защитная плёнка (капот и бампер)', category: 'protect', prices: { sedan: 180000, crossover: 210000, suv: 250000 }, duration: '2 дня', hours: 16 },
  { id: 9,  name: 'Химчистка салона',             category: 'interior', prices: { sedan: 45000,  crossover: 55000,  suv: 65000 },  duration: '1 день',    hours: 8 },
  { id: 10, name: 'Озонирование салона',          category: 'interior', prices: { sedan: 8000,   crossover: 8000,   suv: 10000 },  duration: '1 час',     hours: 1 },
  { id: 11, name: 'Чистка и кондиционер кожи',    category: 'interior', prices: { sedan: 20000,  crossover: 25000,  suv: 30000 },  duration: '3 часа',    hours: 3 }
];
const CATEGORY_NAMES = { wash: 'Мойка', polish: 'Полировка', protect: 'Защита', interior: 'Салон' };

$(function () {
  /* ---- packages built from data.js ---- */
  const $pk = $('#packages');
  PACKAGES.forEach(function (p) {
    const $col = $('<div class="col-12 col-md-6 col-lg-4"></div>');
    const $a = $('<article class="card-gloss package reveal"></article>').toggleClass('package-featured', p.featured);
    if (p.featured) { $('<span class="badge-top"></span>').text('Популярный').appendTo($a); }
    $('<h3></h3>').text(p.name).appendTo($a);
    $('<p class="price"></p>').text('от ' + Site.rub(p.prices.sedan)).appendTo($a);
    $('<p class="text-muted-2"></p>').text(p.lead).appendTo($a);
    const $ul = $('<ul></ul>');
    p.includes.forEach(function (t) { $('<li></li>').text(t).appendTo($ul); });
    $a.append($ul);
    $('<a class="btn w-100"></a>').addClass(p.featured ? 'btn-accent' : 'btn-ghost').attr('href', 'booking.html').text('Выбрать').appendTo($a);
    $pk.append($col.append($a));
  });
  Site.reveal($pk.find('.reveal'));

  /* ---- price list: search, filter, sort, cart ---- */
  const state = { cat: 'all', query: '', sort: 'name', cls: 'sedan' };
  const cart = new Set();
  const $body = $('#priceBody');
  const $empty = $('#priceEmpty');
  const $table = $('#priceWrap');
  const $bar = $('#cartBar');

  function list() {
    const q = state.query.trim().toLowerCase();
    const items = SERVICES.filter(function (s) {
      return (state.cat === 'all' || s.category === state.cat) && (q === '' || s.name.toLowerCase().includes(q));
    });
    items.sort(function (a, b) {
      if (state.sort === 'asc') { return a.prices[state.cls] - b.prices[state.cls]; }
      if (state.sort === 'desc') { return b.prices[state.cls] - a.prices[state.cls]; }
      if (state.sort === 'time') { return a.hours - b.hours; }
      return a.name.localeCompare(b.name, 'ru');
    });
    return items;
  }

  function renderTable() {
    const items = list();
    $body.empty();
    $('#priceCount').html('Показано услуг: <b>' + items.length + '</b> из ' + SERVICES.length);
    $table.toggle(items.length > 0);
    $empty.toggle(items.length === 0);
    items.forEach(function (s, i) {
      const $tr = $('<tr></tr>').toggleClass('picked', cart.has(s.id));
      const $pick = $('<td class="pick" data-label="В расчёт"></td>');
      $('<input class="form-check-input" type="checkbox">').attr({ id: 'pick' + s.id, 'aria-label': 'Добавить в расчёт: ' + s.name }).prop('checked', cart.has(s.id)).data('id', s.id).appendTo($pick);
      $tr.append($pick);
      $('<th scope="row"></th>').append($('<span class="cat"></span>').text(CATEGORY_NAMES[s.category])).append(document.createTextNode(s.name)).appendTo($tr);
      CAR_CLASSES.forEach(function (c) {
        $('<td></td>').attr('data-label', c.name).toggleClass('col-sel', c.id === state.cls).text(Site.rub(s.prices[c.id])).appendTo($tr);
      });
      $('<td></td>').attr('data-label', 'Срок').text(s.duration).appendTo($tr);
      $tr.hide().appendTo($body).delay(i * 30).fadeIn(220);
    });
    $('#priceHead th[data-class]').each(function () { $(this).toggleClass('col-sel', $(this).data('class') === state.cls); });
  }

  function renderCart() {
    let total = 0, hours = 0;
    cart.forEach(function (id) {
      const s = SERVICES.find(function (x) { return x.id === id; });
      total += s.prices[state.cls];
      hours += s.hours;
    });
    $('#cartCount').text(cart.size);
    $('#cartTotal').text(Site.rub(total));
    $('#cartHours').text(hours >= 8 ? 'около ' + Math.ceil(hours / 8) + ' раб. дн.' : hours + ' ч');
    if (cart.size > 0) { $bar.stop(true, true).slideDown(250); }
    else { $bar.stop(true, true).slideUp(200); }
  }

  $body.on('change', 'input[type=checkbox]', function () {
    const id = $(this).data('id');
    if (this.checked) { cart.add(id); } else { cart.delete(id); }
    $(this).closest('tr').toggleClass('picked', this.checked);
    renderCart();
  });
  $('#cartClear').on('click', function () { cart.clear(); renderTable(); renderCart(); });

  $('#catChips').on('click', '.chip', function () {
    state.cat = $(this).data('cat');
    $('#catChips .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    renderTable();
  });
  $('#classChips').on('click', '.chip', function () {
    state.cls = $(this).data('cls');
    $('#classChips .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    renderTable(); renderCart();
  });
  $('#priceSearch').on('input', function () { state.query = this.value; renderTable(); });
  $('#priceSort').on('change', function () { state.sort = this.value; renderTable(); });
  $('#resetFilters').on('click', function () {
    state.cat = 'all'; state.query = ''; state.sort = 'name';
    $('#priceSearch').val(''); $('#priceSort').val('name');
    $('#catChips .chip').attr('aria-pressed', 'false').first().attr('aria-pressed', 'true');
    renderTable();
  });
  renderTable();

  /* ---- package finder ---- */
  function recommend(v) {
    const budget = Number(v.budget);
    const age = new Date().getFullYear() - Number(v.year);
    const byId = function (id) { return PACKAGES.find(function (p) { return p.id === id; }); };
    const price = function (id) { return byId(id).prices[v.carClass]; };
    const reasons = [];
    let pick;
    if (v.goal === 'interior') {
      pick = 'interior'; reasons.push('Вы хотите обновить салон, а пакет Interior закрывает химчистку, кожу и озонирование.');
    } else if (v.goal === 'protect') {
      pick = budget >= price('ceramic') ? 'ceramic' : 'fresh';
      reasons.push(pick === 'ceramic' ? 'Для защиты на годы подходит керамика, и она укладывается в бюджет.' : 'Бюджета не хватает на керамику, поэтому Fresh с воском на 3 месяца: это самая разумная защита.');
      if (age <= 2 && pick === 'ceramic') { reasons.push('Автомобиль новый, и керамика сохранит заводской лак почти без полировки.'); }
    } else if (v.goal === 'restore') {
      pick = budget >= price('ceramic') ? 'ceramic' : 'fresh';
      reasons.push(pick === 'ceramic' ? 'Коррекционная полировка из пакета Ceramic убирает царапины, а керамика закрепляет результат.' : 'Fresh включает лёгкую полировку. Для глубоких царапин лучше накопить на Ceramic.');
      if (v.condition === 'bad') { reasons.push('Лак в плохом состоянии: на осмотре мастер уточнит объём полировки.'); }
    } else {
      pick = 'fresh'; reasons.push('Перед продажей достаточно Fresh: аккуратный кузов добавляет к цене автомобиля.');
      if (budget >= price('fresh') + price('interior')) { reasons.push('Бюджет позволяет добавить Interior: чистый салон продаёт машину быстрее.'); }
    }
    if (age >= 10 && pick === 'fresh') { reasons.push('Автомобилю ' + age + ' лет: возможно, понадобится дополнительная полировка.'); }
    const p = byId(pick), cost = price(pick);
    return { pkg: p, cost: cost, left: budget - cost, reasons: reasons };
  }

  const R = Validator.rules;
  const thisYear = new Date().getFullYear();
  Validator.attach('#finderForm', {
    name:      [R.required('Введите имя'), R.minLen(2, 'Имя должно содержать минимум 2 буквы'), R.pattern(/^[\p{L}\s'-]+$/u, 'В имени допустимы только буквы')],
    email:     [R.required('Введите e-mail'), R.email('Проверьте e-mail: нужен адрес вида name@mail.kz')],
    year:      [R.required('Укажите год выпуска'), R.number(1990, thisYear, 'Год выпуска должен быть от 1990 до ' + thisYear)],
    carClass:  [R.required('Выберите класс автомобиля')],
    condition: [R.required('Выберите состояние кузова')],
    goal:      [R.required('Выберите, что для вас важнее всего')],
    budget:    [R.required('Укажите бюджет'), R.number(15000, 1000000, 'Бюджет должен быть от 15 000 до 1 000 000 ₸')]
  }, {
    successSelector: '#finderResult',
    onSuccess: function (v) {
      const r = recommend(v);
      $('#fName').text(v.name);
      $('#fPackage').text(r.pkg.name);
      $('#fPrice').text('от ' + Site.rub(r.cost));
      $('#fBudget').text(r.left >= 0 ? 'Остаток от бюджета: ' + Site.rub(r.left) : 'Не хватает: ' + Site.rub(-r.left));
      const $ul = $('#fReasons').empty();
      r.reasons.forEach(function (t) { $('<li></li>').text(t).appendTo($ul); });
    }
  });
});
