/* common.js: shared jQuery effects for every page.
   1) navbar changes on scroll, 2) "back to top" button, 3) smooth anchor scroll,
   4) fade-in of sections when they scroll into view. */
$(function () {
  const $nav = $('.site-nav');
  const $top = $('.to-top');

  $(window).on('scroll', function () {
    const y = $(this).scrollTop();
    $nav.toggleClass('scrolled', y > 20);
    if (y > 400) { $top.stop(true, true).fadeIn(200); }
    else { $top.stop(true, true).fadeOut(200); }
  }).trigger('scroll');

  $top.on('click', function () {
    $('html, body').stop(true).animate({ scrollTop: 0 }, 500);
  });

  $('a[href^="#"]').not('[href="#"]').on('click', function (e) {
    const $target = $(this.hash);
    if (!$target.length) { return; }
    e.preventDefault();
    $('html, body').stop(true).animate({ scrollTop: $target.offset().top - 72 }, 600, function () {
      $target.attr('tabindex', '-1').trigger('focus');
    });
  });

  window.Site = {
    // fade-in effect for elements that appear while scrolling; also used for dynamic content
    reveal: function ($items) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) { return; }
      $items.css({ opacity: 0, top: 24 });
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          io.unobserve(entry.target);
          $(entry.target).stop(true).animate({ opacity: 1, top: 0 }, 600);
        });
      }, { threshold: 0.12 });
      $items.each(function () { io.observe(this); });
    },
    rub: function (n) { return Number(n).toLocaleString('ru-RU') + ' ₸'; },
    // short "shake" animation for a field with an error
    shake: function ($el) {
      $el.stop(true, true).css('position', 'relative')
        .animate({ left: -7 }, 50).animate({ left: 7 }, 50)
        .animate({ left: -4 }, 50).animate({ left: 0 }, 50);
    }
  };

  window.Site.reveal($('.reveal'));
});
