/**
 * Interactive Resume & Portfolio JavaScript
 * Author: Loginov Andrey Vladimirovich (IVT-23-1)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPdfExport();
  initSkillsFilter();
  initEducationAccordion();
  initModals();
  initApiPlayground();
  initCopyEmail();
  initFeedbackForm();
  initScrollSpy();
});

/* ==========================================================================
   1. Theme Toggle (Dark / Light)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = toggleBtn.querySelector('.theme-icon');
  
  // Check saved theme in localStorage
  const savedTheme = localStorage.getItem('loginov_theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
  } else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    themeIcon.textContent = '🌙';
  }

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      themeIcon.textContent = '☀️';
      localStorage.setItem('loginov_theme', 'light');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      themeIcon.textContent = '🌙';
      localStorage.setItem('loginov_theme', 'dark');
    }
  });
}

/* ==========================================================================
   2. PDF Export
   ========================================================================== */
function initPdfExport() {
  const pdfBtn = document.getElementById('pdfExportBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   3. Skills Filter Tabs
   ========================================================================== */
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. Education Accordion
   ========================================================================== */
function initEducationAccordion() {
  const accordionBtn = document.getElementById('eduAccordionBtn');
  const accordionContent = document.getElementById('eduAccordionContent');

  if (accordionBtn && accordionContent) {
    accordionBtn.addEventListener('click', () => {
      accordionBtn.classList.toggle('open');
      accordionContent.classList.toggle('show');
    });
  }
}

/* ==========================================================================
   5. Modals Management (Architecture & Snippets)
   ========================================================================== */
function initModals() {
  const openButtons = document.querySelectorAll('.open-modal-btn');
  const closeButtons = document.querySelectorAll('.modal-close');
  const overlays = document.querySelectorAll('.modal-overlay');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlays.forEach(overlay => {
        overlay.classList.remove('open');
      });
      document.body.style.overflow = '';
    }
  });
}

/* ==========================================================================
   6. Interactive REST API Playground
   ========================================================================== */
function initApiPlayground() {
  const select = document.getElementById('endpointSelect');
  const badge = document.getElementById('httpMethodBadge');
  const sendBtn = document.getElementById('sendApiRequestBtn');
  const jsonOutput = document.getElementById('apiJsonOutput');
  const statusChip = document.getElementById('apiStatusChip');
  const timeChip = document.getElementById('apiTimeChip');
  const btnSpinner = document.getElementById('apiSpinner');
  const btnText = document.getElementById('apiBtnText');

  const endpointMocks = {
    create_booking: {
      status: "201 Created",
      badgeClass: "badge-post",
      method: "POST",
      generate: () => {
        const randId = Math.random().toString(36).substring(2, 9).toUpperCase();
        return {
          status: "success",
          code: 201,
          booking: {
            id: `BKG-${randId}`,
            created_at: new Date().toISOString(),
            client: "lethariess (Тестовый клиент)",
            service: "Аудит архитектуры базы данных",
            time_slot: "2026-10-15 14:00 UTC+5",
            isolation_level: "SERIALIZABLE",
            lock_mechanism: "SELECT FOR UPDATE - SUCCESS"
          },
          meta: {
            server: "FastAPI / Uvicorn (Worker #2)",
            database: "PostgreSQL 15 (Transaction committed)",
            cache_invalidation: "Redis key slots:cache purged"
          }
        };
      }
    },
    check_slot: {
      status: "200 OK",
      badgeClass: "badge-get",
      method: "GET",
      generate: () => ({
        status: "success",
        code: 200,
        query: {
          date: new Date().toISOString().split('T')[0],
          service_id: 104
        },
        available_slots: [
          { time: "10:00", free: true, max_capacity: 1 },
          { time: "12:30", free: true, max_capacity: 1 },
          { time: "15:00", free: false, booked_by: "id_77" },
          { time: "17:30", free: true, max_capacity: 1 }
        ],
        cache: {
          hit: true,
          store: "Redis In-Memory",
          ttl_remaining: "54s"
        }
      })
    },
    health: {
      status: "200 OK",
      badgeClass: "badge-get",
      method: "GET",
      generate: () => ({
        status: "healthy",
        code: 200,
        timestamp: new Date().toISOString(),
        environment: "production",
        uptime_seconds: 345620,
        services: {
          api: { status: "UP", latency_ms: 1.2 },
          postgres: { status: "UP", active_connections: 8, pool_size: 20 },
          redis: { status: "UP", memory_used_mb: 42.6 },
          celery_workers: { active: 4, registered_queues: ["high_priority", "default", "notifications"] }
        }
      })
    }
  };

  // Update badge on select change
  select.addEventListener('change', () => {
    const val = select.value;
    const item = endpointMocks[val];
    if (item) {
      badge.textContent = item.method;
      badge.className = `http-badge ${item.badgeClass}`;
    }
  });

  // Handle request click
  sendBtn.addEventListener('click', () => {
    const val = select.value;
    const item = endpointMocks[val];
    if (!item) return;

    // Loading state
    btnSpinner.style.display = 'inline-block';
    btnText.textContent = 'Выполнение...';
    sendBtn.disabled = true;
    jsonOutput.textContent = '// Выполнение асинхронного вызова к backend...';

    // Simulate real network/db latency
    const randomLatency = Math.floor(Math.random() * 25) + 12; // 12 - 37 ms

    setTimeout(() => {
      btnSpinner.style.display = 'none';
      btnText.textContent = 'Отправить запрос (Execute)';
      sendBtn.disabled = false;

      statusChip.textContent = item.status;
      timeChip.textContent = `${randomLatency} ms`;

      const responseData = item.generate();
      jsonOutput.textContent = JSON.stringify(responseData, null, 2);
    }, 280);
  });
}

/* ==========================================================================
   7. Copy Email with Toast
   ========================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toastNotification');
  const email = 'lethariess@gmail.com';

  if (copyBtn && toast) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(email).then(() => {
        showToast('Адрес lethariess@gmail.com скопирован!');
      }).catch(() => {
        // Fallback
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast('Адрес скопирован в буфер обмена!');
      });
    });
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* ==========================================================================
   8. Feedback Form Submission
   ========================================================================== */
function initFeedbackForm() {
  const form = document.getElementById('contactForm');
  const alertBox = document.getElementById('formAlert');

  if (form && alertBox) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value;

      alertBox.textContent = `✓ Спасибо, ${name}! Ваше сообщение готово к отправке lethariess.`;
      alertBox.style.display = 'block';

      form.reset();

      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 5000);
    });
  }
}

/* ==========================================================================
   9. Scroll Spy for Active Navigation Link
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
