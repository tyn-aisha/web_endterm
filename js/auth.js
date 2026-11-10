/* auth.js: demo accounts in localStorage, shared by every page (Aisha).
   Storage keys (JSON):
     obsidian_users   - array of user objects
     obsidian_session - email of the logged-in user
   The navbar link changes for a logged-in user. Everything works when storage is empty or blocked. */
const Auth = (function () {
  const USERS_KEY = 'obsidian_users';
  const SESSION_KEY = 'obsidian_session';

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (err) { return false; }
  }

  function users() {
    const list = read(USERS_KEY, []);
    return Array.isArray(list) ? list : [];
  }
  function findUser(email) {
    const e = String(email).trim().toLowerCase();
    return users().find(function (u) { return u.email === e; }) || null;
  }
  function saveUsers(list) { return write(USERS_KEY, list); }
  function current() {
    const email = read(SESSION_KEY, null);
    return email ? findUser(email) : null;
  }
  function login(email) { return write(SESSION_KEY, String(email).trim().toLowerCase()); }
  function logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* storage blocked */ }
  }
  function updateUser(email, changes) {
    const list = users();
    const i = list.findIndex(function (u) { return u.email === email; });
    if (i === -1) { return false; }
    list[i] = Object.assign({}, list[i], changes);
    return saveUsers(list);
  }
  function removeUser(email) {
    return saveUsers(users().filter(function (u) { return u.email !== email; }));
  }

  // navbar: "Войти" for a guest, "Кабинет · Имя" for a logged-in user
  function paintNav() {
    const user = current();
    $('[data-auth-link]').each(function () {
      const $a = $(this);
      if (user) {
        const first = user.name.split(' ')[0];
        $a.text('Кабинет · ' + first).attr('title', 'Личный кабинет: ' + user.name);
        $a.attr('href', 'account.html#profile');
      } else {
        $a.text('Войти').removeAttr('title').attr('href', 'account.html');
      }
    });
  }

  $(paintNav);

  return {
    users: users, findUser: findUser, saveUsers: saveUsers, current: current,
    login: login, logout: logout, updateUser: updateUser, removeUser: removeUser,
    paintNav: paintNav
  };
})();
