/* account.js: account page (Aisha).
   Data: CAR_CLASSES and PACKAGES from data.js, users in localStorage (see auth.js).
   Features: 1) sign up / log in / log out with validation and errors under the fields,
   2) profile built from saved JSON, 3) calculated prices of all packages for the user's car class,
   4) edit data and delete account. jQuery effects: fadeIn/fadeOut view switch, slideDown message, shake. */
$(function () {
  const $guest = $('#guestArea');
  const $profile = $('#profileArea');
  const V = Validator.rules;
  const FLASH_KEY = 'obsidian_flash';

  /* ---- car classes from data.js: radio cards (sign up) and select (edit) ---- */
  CAR_CLASSES.forEach(function (c) {
    const $l = $('<label class="class-option"></label>');
    $('<input type="radio" name="carClass">').val(c.id).appendTo($l);
    $l.append($('<span></span>').append($('<b></b>').text(c.name)).append($('<small></small>').text(c.examples)));
    $('#suClassGrid').append($l);
    $('<option></option>').val(c.id).text(c.name + ' (' + c.examples + ')').appendTo('#edClass');
  });

  function className(id) {
    const c = CAR_CLASSES.find(function (x) { return x.id === id; });
    return c ? c.name : '';
  }

  /* ---- views ---- */
  function setTab(view) {
    $('#tabLogin').attr('aria-pressed', view === 'login');
    $('#tabSignup').attr('aria-pressed', view === 'signup');
    const $show = $(view === 'login' ? '#loginForm' : '#signupForm');
    const $hide = $(view === 'login' ? '#signupForm' : '#loginForm');
    if ($hide.is(':visible')) {
      $hide.stop(true, true).fadeOut(150, function () { $hide.prop('hidden', true); $show.prop('hidden', false).hide().fadeIn(250); });
    } else if (!$show.is(':visible')) {
      $show.prop('hidden', false).hide().fadeIn(250);
    }
  }

  function renderProfile(user) {
    const initial = user.name.trim().charAt(0).toUpperCase();
    $('#profAvatar').text(initial);
    $('#profName').text(user.name);
    $('#profEmail').text(user.email);
    $('#profPhone').text(user.phone);
    $('#profCar').text(user.brand + ', ' + className(user.carClass).toLowerCase());
    $('#profSince').text(new Date(user.created).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }));

    // calculated value: prices of every package for this car class and their sum
    let sum = 0;
    const $body = $('#priceBody').empty();
    PACKAGES.forEach(function (p) {
      const price = p.prices[user.carClass];
      if (typeof price !== 'number') { return; }
      sum += price;
      $body.append($('<tr></tr>').append($('<th scope="row"></th>').text(p.name)).append($('<td class="text-end"></td>').text(Site.rub(price))));
    });
    $('#priceSum').text(Site.rub(sum));
    $('#priceLead').text('Класс «' + className(user.carClass) + '». Цены от, окончательную сумму мастер назовёт после бесплатного осмотра.');

    $('#edPhone').val(user.phone);
    $('#edBrand').val(user.brand);
    $('#edClass').val(user.carClass);
    $('#accountTitle').html('Привет,<br>' + $('<span></span>').text(user.name.split(' ')[0]).html() + '.');
    $('#accountLead').text('Это ваш профиль. Данные сохранены в браузере и никуда не отправляются.');
  }

  function showProfile(user, animate) {
    renderProfile(user);
    $('#deleteConfirm').prop('hidden', true);
    const open = function () { $profile.prop('hidden', false).hide().fadeIn(animate ? 300 : 0); };
    if ($guest.is(':visible') && animate) { $guest.stop(true, true).fadeOut(150, function () { $guest.prop('hidden', true); open(); }); }
    else { $guest.prop('hidden', true); open(); }
    if (location.hash !== '#profile') { history.replaceState(null, '', '#profile'); }
    Auth.paintNav();
  }

  function showGuest(view, animate) {
    $('#accountTitle').html('Ваш гараж<br>в одном месте.');
    $('#accountLead').text('Создайте профиль, сохраните данные автомобиля, и мы покажем цены именно для вашего класса.');
    const open = function () { $guest.prop('hidden', false).hide().fadeIn(animate ? 300 : 0); setTab(view); };
    if ($profile.is(':visible') && animate) { $profile.stop(true, true).fadeOut(150, function () { $profile.prop('hidden', true); open(); }); }
    else { $profile.prop('hidden', true); open(); }
    history.replaceState(null, '', location.pathname);
    Auth.paintNav();
  }

  function flash(title, text) {
    $('#flashTitle').text(title);
    $('#flashText').text(text);
    $('#flash').stop(true, true).hide().slideDown(300);
  }

  /* ---- tabs ---- */
  $('#tabLogin, #tabSignup').on('click', function () {
    $('#loginHint').removeClass('is-warn').text('');
    setTab($(this).data('view'));
  });

  /* ---- login ---- */
  Validator.attach('#loginForm', {
    email: [
      V.required('Введите email.'),
      V.email('Проверьте email: он должен выглядеть как name@example.com.'),
      V.custom(function (v) { return Auth.findUser(v) ? true : 'Аккаунт с таким email не найден. Создайте его на вкладке «Регистрация».'; })
    ],
    password: [
      V.required('Введите пароль.'),
      V.custom(function (v, form) {
        const u = Auth.findUser(form.elements.email.value);
        return (!u || u.password === v) ? true : 'Неверный пароль. Попробуйте ещё раз.';
      })
    ]
  }, {
    onSuccess: function (values) {
      Auth.login(values.email);
      showProfile(Auth.current(), true);
      flash('Вы вошли', 'С возвращением! Ниже ваши данные и цены для вашего автомобиля.');
    }
  });

  /* ---- sign up ---- */
  Validator.attach('#signupForm', {
    name: [V.required('Введите имя и фамилию.'), V.minLen(2, 'Имя слишком короткое.'),
           V.pattern(/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүІіҺһ' -]+$/, 'В имени допустимы только буквы, пробел и дефис.')],
    email: [V.required('Введите email.'), V.email('Проверьте email: он должен выглядеть как name@example.com.'),
            V.custom(function (v) { return (v.trim() === '' || !Auth.findUser(v)) || 'Этот email уже зарегистрирован. Войдите на вкладке «Вход».'; })],
    phone: [V.required('Введите телефон.'), V.phone('Телефон: +7 и 10 цифр, например +7 700 123-45-67.')],
    brand: [V.required('Укажите марку и модель.'), V.minLen(2, 'Название слишком короткое.')],
    carClass: [V.required('Выберите класс автомобиля.')],
    password: [V.required('Придумайте пароль.'), V.minLen(6, 'Пароль должен быть не короче 6 символов.')],
    password2: [V.required('Повторите пароль.'),
                V.custom(function (v, form) { return v === form.elements.password.value || 'Пароли не совпадают.'; })],
    agree: [V.required('Подтвердите, что понимаете: это демо.')]
  }, {
    onSuccess: function (values) {
      const user = {
        name: values.name.trim().replace(/\s+/g, ' '),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        brand: values.brand.trim(),
        carClass: values.carClass,
        password: values.password,
        created: new Date().toISOString()
      };
      const list = Auth.users();
      list.push(user);
      if (!Auth.saveUsers(list)) {
        $('#loginHint').addClass('is-warn').text('Не удалось сохранить: браузер блокирует localStorage.');
        return;
      }
      Auth.login(user.email);
      showProfile(user, true);
      flash('Аккаунт создан', 'Профиль сохранён в вашем браузере. Теперь вы можете записаться на осмотр.');
    }
  });

  /* ---- edit profile ---- */
  Validator.attach('#editForm', {
    phone: [V.required('Введите телефон.'), V.phone('Телефон: +7 и 10 цифр, например +7 700 123-45-67.')],
    brand: [V.required('Укажите марку и модель.'), V.minLen(2, 'Название слишком короткое.')],
    carClass: [V.required('Выберите класс автомобиля.')]
  }, {
    onSuccess: function (values) {
      const me = Auth.current();
      if (!me) { return; }
      Auth.updateUser(me.email, { phone: values.phone.trim(), brand: values.brand.trim(), carClass: values.carClass });
      renderProfile(Auth.current());
      flash('Данные сохранены', 'Профиль и цены обновлены.');
    }
  });
  // Validator clears the form after success; fill it with the saved data again
  $('#editForm').on('form:cleared', function () {
    const me = Auth.current();
    if (me) { $('#edPhone').val(me.phone); $('#edBrand').val(me.brand); $('#edClass').val(me.carClass); }
  });

  /* ---- log out and delete ---- */
  $('#logoutBtn').on('click', function () {
    Auth.logout();
    showGuest('login', true);
    $('#loginHint').removeClass('is-warn').text('Вы вышли из аккаунта.');
  });
  $('#deleteBtn').on('click', function () { $('#deleteConfirm').stop(true, true).prop('hidden', false).hide().slideDown(200); $('#deleteYes').trigger('focus'); });
  $('#deleteNo').on('click', function () { $('#deleteConfirm').stop(true, true).slideUp(150, function () { $(this).prop('hidden', true); }); $('#deleteBtn').trigger('focus'); });
  $('#deleteYes').on('click', function () {
    const me = Auth.current();
    if (me) { Auth.removeUser(me.email); }
    Auth.logout();
    showGuest('signup', true);
    $('#loginHint').removeClass('is-warn').text('Аккаунт удалён.');
  });

  /* ---- start: no errors in the console when storage is empty ---- */
  const askedProfile = location.hash === '#profile';
  const user = Auth.current();
  if (user) {
    showProfile(user, false);
  } else {
    showGuest('login', false);
    if (askedProfile) {
      $('#loginHint').addClass('is-warn').text('Чтобы открыть профиль, войдите в аккаунт.');
    }
  }
  $(window).on('hashchange', function () {
    if (location.hash === '#profile' && !Auth.current()) {
      $('#loginHint').addClass('is-warn').text('Чтобы открыть профиль, войдите в аккаунт.');
    }
  });
});
