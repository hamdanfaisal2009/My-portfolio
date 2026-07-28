(function () {
  "use strict";

  /* ==========================================================
     PRELOADER
     ========================================================== */
  function runPreloader() {
    var pre       = document.getElementById('preloader');
    var fillEl    = document.querySelector('.pt-fill');
    var barFill   = document.getElementById('preloaderBarFill');
    var percentEl = document.getElementById('preloaderPercent');
    var content   = document.querySelector('.preloader-content');

    if (!pre) {
      document.body.classList.add('loaded');
      return;
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      barFill.style.width        = '100%';
      percentEl.textContent      = '100%';
      fillEl.classList.add('is-filled');
      finishPreload();
      return;
    }

    var start    = null;
    var duration = 2600;

    function tick(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      var pct     = Math.min(100, Math.round((elapsed / duration) * 100));

      barFill.style.width   = pct + '%';
      percentEl.textContent = (pct < 10 ? '0' : '') + pct + '%';

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        barFill.style.width   = '100%';
        percentEl.textContent = '100%';
        setTimeout(finishPreload, 350);
      }
    }

    requestAnimationFrame(function () {
      fillEl.classList.add('is-filled');
      requestAnimationFrame(tick);
    });

    function finishPreload() {
      content.classList.add('is-zoom');

      setTimeout(function () {
        pre.classList.add('is-hidden');
        document.body.classList.add('loaded');
        initRevealObserver();
        animateHeroStats();
      }, 600);

      setTimeout(function () {
        if (pre && pre.parentNode) pre.style.display = 'none';
      }, 1600);
    }
  }

  /* ==========================================================
     TYPED ROLE TEXT
     ========================================================== */
  function runTypedRole() {
    var el = document.getElementById('typedRole');
    if (!el) return;

    var roles = [
      'Full-Stack Developer',
      'React & Node.js Engineer',
      'UI/UX-Minded Builder',
      'Open Source Contributor'
    ];

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.textContent = roles[0];
      return;
    }

    var ri      = 0,
        ci      = 0,
        deleting = false;

    function step() {
      var word = roles[ri];

      if (!deleting) {
        ci++;
        el.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          setTimeout(step, 1600);
          return;
        }
      } else {
        ci--;
        el.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          ri = (ri + 1) % roles.length;
        }
      }

      setTimeout(step, deleting ? 35 : 65);
    }

    setTimeout(step, 900);
  }

  /* ==========================================================
     ROUTER (hash-based view switching)
     ========================================================== */
  var VIEWS = ['home', 'about', 'skills', 'projects', 'blog', 'contact'];

  function navigateTo(view, opts) {
    opts = opts || {};
    if (VIEWS.indexOf(view) === -1) view = 'home';

    var current = document.querySelector('.view.is-active');
    var target  = document.querySelector('.view[data-view="' + view + '"]');

    if (!target || target === current) {
      closeMobileNav();
      return;
    }

    if (current) current.classList.remove('is-active');
    target.classList.add('is-active');

    document.querySelectorAll('.rail-item[data-route]').forEach(function (item) {
      item.classList.toggle('is-active', item.getAttribute('data-route') === view);
    });

    moveRailLight(view);

    if (!opts.silent) {
      history.pushState(null, '', '#' + view);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    closeMobileNav();

    setTimeout(function () {
      resetRevealsIn(target);
      revealObserverScan();
    }, 30);
  }

  function moveRailLight(view) {
    var light      = document.getElementById('railLight');
    var activeItem = document.querySelector('.rail-item[data-route="' + view + '"]');
    if (!light || !activeItem) return;

    var items = Array.prototype.slice.call(
      document.querySelectorAll('.rail-track .rail-item')
    );
    var idx = items.indexOf(activeItem);
    if (idx === -1) return;

    var itemHeight = activeItem.offsetHeight;
    var gap        = 6;
    var topOffset  = 14 + idx * (itemHeight + gap);

    light.style.top = topOffset + 'px';
  }

  function resetRevealsIn(container) {
    container.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.remove('is-visible');
    });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-route]');
    if (!link) return;
    e.preventDefault();
    navigateTo(link.getAttribute('data-route'));
  });

  window.addEventListener('popstate', function () {
    var view = (location.hash || '#home').replace('#', '');
    navigateTo(view, { silent: true });
  });

  /* ==========================================================
     MOBILE NAV TOGGLE
     ========================================================== */
  function closeMobileNav() {
    document.getElementById('rail').classList.remove('is-open');
    document.getElementById('navScrim').classList.remove('is-visible');

    var toggle = document.getElementById('navToggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var rail   = document.getElementById('rail');
    var scrim  = document.getElementById('navScrim');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var isOpen = rail.classList.toggle('is-open');
      scrim.classList.toggle('is-visible', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    scrim.addEventListener('click', closeMobileNav);
  }

  /* ==========================================================
     SCROLL REVEAL
     ========================================================== */
  var revealObserver;

  function initRevealObserver() {
    if (revealObserver) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el    = entry.target;
            var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
            setTimeout(function () {
              el.classList.add('is-visible');
            }, delay);
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealObserverScan();
  }

  function revealObserverScan() {
    if (!revealObserver) return;
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ==========================================================
     HERO STAT COUNTERS
     ========================================================== */
  var statsAnimated = false;

  function animateHeroStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.hero-stat-num').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;

      if (reduced) {
        el.textContent = target;
        return;
      }

      var startTime = null,
          dur       = 1400;

      function step(ts) {
        if (!startTime) startTime = ts;
        var p     = Math.min(1, (ts - startTime) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  /* ==========================================================
     PROJECT FILTERS
     ========================================================== */
  function initProjectFilters() {
    var chips = document.querySelectorAll('#projects .filter-chip[data-filter]');
    var cards = document.querySelectorAll('#projectGrid .project-card');

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-selected', 'false');
        });

        chip.classList.add('is-active');
        chip.setAttribute('aria-selected', 'true');

        var filter = chip.getAttribute('data-filter');

        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-cats') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          card.classList.toggle('is-filtered-out', !show);
        });
      });
    });
  }

  /* ==========================================================
     BLOG FILTERS
     ========================================================== */
  function initBlogFilters() {
    var chips = document.querySelectorAll('#blog .filter-chip[data-blogfilter]');
    var cards = document.querySelectorAll('#blogGrid .blog-card');

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-selected', 'false');
        });

        chip.classList.add('is-active');
        chip.setAttribute('aria-selected', 'true');

        var filter = chip.getAttribute('data-blogfilter');

        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-blogcats') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          card.classList.toggle('is-filtered-out', !show);
        });
      });
    });
  }

  /* ==========================================================
     CONTACT FORM (frontend-only validation)
     ========================================================== */
  function initContactForm() {
    var form     = document.getElementById('contactForm');
    if (!form) return;

    var note      = document.getElementById('formNote');
    var submitBtn = document.getElementById('contactSubmit');

    var validators = {
      'cf-name': function (v) {
        return v.trim().length >= 2 ? '' : 'Please enter your name.';
      },
      'cf-email': function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
          ? ''
          : 'Please enter a valid email.';
      },
      'cf-subject': function (v) {
        return v.trim().length >= 3 ? '' : 'Please add a short subject.';
      },
      'cf-message': function (v) {
        return v.trim().length >= 10 ? '' : 'Message should be at least 10 characters.';
      }
    };

    function validateField(id) {
      var field  = document.getElementById(id);
      var errorEl = form.querySelector('[data-error-for="' + id + '"]');
      var msg    = validators[id](field.value);

      field.classList.toggle('is-invalid', !!msg);
      if (errorEl) errorEl.textContent = msg;

      return !msg;
    }

    Object.keys(validators).forEach(function (id) {
      var field = document.getElementById(id);

      field.addEventListener('blur', function () {
        validateField(id);
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid')) validateField(id);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = Object.keys(validators).map(validateField).every(Boolean);

      if (!allValid) {
        note.textContent = 'Please fix the highlighted fields.';
        note.style.color = 'var(--rose)';
        return;
      }

      submitBtn.disabled = true;
      var label    = submitBtn.querySelector('.btn-label');
      var original = label.textContent;
      label.textContent = 'Sending...';

      setTimeout(function () {
        label.textContent    = original;
        submitBtn.disabled   = false;
        note.style.color     = 'var(--cyan)';
        note.textContent     =
          "Thanks! This is a frontend demo, so nothing was actually sent — but in production this message is on its way.";
        showToast('Message ready to send — connect a backend to go live.');
        form.reset();
      }, 1100);
    });
  }

  /* ==========================================================
     TOAST
     ========================================================== */
  var toastTimer;

  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;

    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('is-visible');

    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  /* ==========================================================
     BACK TO TOP
     ========================================================== */
  function initToTop() {
    var btn = document.getElementById('toTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 420);
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================
     INIT
     ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initProjectFilters();
    initBlogFilters();
    initContactForm();
    initToTop();
    runTypedRole();

    var initialView = (location.hash || '#home').replace('#', '');
    if (VIEWS.indexOf(initialView) === -1) initialView = 'home';

    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('is-active');
    });
    document.querySelector('.view[data-view="' + initialView + '"]').classList.add('is-active');

    document.querySelectorAll('.rail-item[data-route]').forEach(function (item) {
      item.classList.toggle('is-active', item.getAttribute('data-route') === initialView);
    });

    setTimeout(function () {
      moveRailLight(initialView);
    }, 50);

    window.addEventListener('resize', function () {
      var active = document.querySelector('.view.is-active');
      if (active) moveRailLight(active.getAttribute('data-view'));
    });

    runPreloader();
  });
})();

