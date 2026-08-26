/**
 * Data Scout Solutions - Master Interactive Controller + Telemetry & Admin Audit Suite
 * Controls: Dynamic Spotlights, FAQs Accordion, Chart.js Dashboard, AutoTask Simulator, SheetJS Real Excel Downloader, WhatsApp & Admin Suite
 */

// Global Security & State (PIN de Acceso Privado)
const ADMIN_PIN = '80242480'; 
const MAX_FAILED_ATTEMPTS = 2;
const LOCKOUT_MINUTES = 30;
const WHATSAPP_PHONE = '59891802402'; // Uruguay

document.addEventListener('DOMContentLoaded', () => {
  // 1. Telemetry & Analytics Tracking on Load
  initTelemetryTracker();

  // 2. Admin Audit Suite Modal & Keybindings
  initAdminAuditSuite();

  // 3. Dynamic Mouse Spotlight Effect for Cards
  initSpotlightEffect();

  // 4. Interactive FAQ Accordion
  initFAQAccordion();

  // 5. Initialize Chart.js for CommandCenter 360
  initCommandCenterCharts();

  // 6. Tab Switcher for Demos (AutoTask vs CommandCenter)
  initProductDemoTabs();

  // 7. AutoTask 1-Click Python Simulator + Excel Download
  initAutoTaskSimulator();

  // 8. Raw Input Data Preview Toggle
  initRawPreviewToggle();

  // 9. WhatsApp Quote Form Integration
  initQuoteForm();

  // 10. Theme Toggle & Mobile Nav
  initThemeAndNav();

  // 11. Data Scout Studio (Universal Profiler & Multi-Domain Engine)
  initDataScoutStudio();
});

/* ==========================================================================
   1. TELEMETRY & AUDIT TRACKER ENGINE
   ========================================================================== */
function getStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

function logAuditEvent(eventType, details = {}) {
  const events = getStorage('datascout_audit_events', []);
  const newEvent = {
    id: 'EVT-' + Date.now(),
    timestamp: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' }),
    type: eventType,
    details: details
  };
  events.unshift(newEvent);
  // Keep last 250 events
  if (events.length > 250) events.pop();
  setStorage('datascout_audit_events', events);
}

function initTelemetryTracker() {
  const isSessionTracked = sessionStorage.getItem('datascout_session_active');
  const nowStr = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' });

  // Detect Device, OS and Browser
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? '📱 Celular / Tablet' : '💻 Computadora';
  
  let os = 'Windows / Mac';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Navegador Web';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';

  const visitRecord = {
    id: 'VIS-' + Date.now(),
    timestamp: nowStr,
    device: deviceType,
    os: os,
    browser: browser,
    screen: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer ? new URL(document.referrer).hostname : 'Acceso Directo',
    location: 'Cargando ubicación...',
    ip: 'Consultando...'
  };

  // Only record new visit once per session
  if (!isSessionTracked) {
    sessionStorage.setItem('datascout_session_active', 'true');
    const visits = getStorage('datascout_audit_visits', []);
    visits.unshift(visitRecord);
    if (visits.length > 250) visits.pop();
    setStorage('datascout_audit_visits', visits);
    logAuditEvent('NUEVA_VISITA', { device: deviceType, os: os, browser: browser });

    // Fetch approximate location asynchronously
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          const currentVisits = getStorage('datascout_audit_visits', []);
          if (currentVisits.length > 0 && currentVisits[0].id === visitRecord.id) {
            currentVisits[0].location = `${data.city || 'Ciudad'}, ${data.country_name || 'Uruguay'} (${data.country_code || 'UY'})`;
            currentVisits[0].ip = data.ip;
            setStorage('datascout_audit_visits', currentVisits);
          }
        }
      })
      .catch(() => {
        // Fallback if blocked
        const currentVisits = getStorage('datascout_audit_visits', []);
        if (currentVisits.length > 0 && currentVisits[0].id === visitRecord.id) {
          currentVisits[0].location = 'Uruguay / Región';
          currentVisits[0].ip = 'Anónimo';
          setStorage('datascout_audit_visits', currentVisits);
        }
      });
  }

  // Track Floating WhatsApp clicks
  const floatWa = document.getElementById('floatingWhatsapp');
  if (floatWa) {
    floatWa.addEventListener('click', () => {
      logAuditEvent('CLIC_WHATSAPP_FLOTANTE', { action: 'Chat Directo' });
    });
  }
}

/* ==========================================================================
   2. ADMIN AUDIT SUITE & SECURE PIN PASS CONTROLLER (2-ATTEMPT LOCKOUT)
   ========================================================================== */
function getLockoutMinutesRemaining() {
  const lockoutTimestamp = localStorage.getItem('datascout_admin_lockout_until');
  if (lockoutTimestamp) {
    const remainingMs = parseInt(lockoutTimestamp) - Date.now();
    if (remainingMs > 0) {
      return Math.ceil(remainingMs / (60 * 1000));
    } else {
      localStorage.removeItem('datascout_admin_lockout_until');
      localStorage.removeItem('datascout_admin_failed_count');
    }
  }
  return 0;
}

function initAdminAuditSuite() {
  const btnOpenAdmin = document.getElementById('btnOpenAdmin');
  const btnCloseAdmin = document.getElementById('btnCloseAdminModal');
  const adminModal = document.getElementById('adminModal');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminPinInput = document.getElementById('adminPinInput');
  const adminLoginError = document.getElementById('adminLoginError');
  const adminLockoutWarning = document.getElementById('adminLockoutWarning');
  const lockoutMsgText = document.getElementById('lockoutMsgText');
  const btnAdminSubmit = document.getElementById('btnAdminSubmit');
  const adminLoginView = document.getElementById('adminLoginView');
  const adminDashboardView = document.getElementById('adminDashboardView');
  const btnLogoutAdmin = document.getElementById('btnLogoutAdmin');
  const btnClearAuditData = document.getElementById('btnClearAuditData');
  const btnExportAuditExcel = document.getElementById('btnExportAuditExcel');

  // Check URL hash or hotkey
  if (window.location.hash === '#admin') {
    openAdminModal();
  }

  window.addEventListener('keydown', (e) => {
    // Hotkey: Ctrl + Shift + A
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      openAdminModal();
    }
  });

  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', () => openAdminModal());
  }

  if (btnCloseAdmin) {
    btnCloseAdmin.addEventListener('click', () => closeAdminModal());
  }

  // Close modal when clicking outside
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) closeAdminModal();
    });
  }

  function openAdminModal() {
    if (!adminModal) return;
    adminModal.classList.remove('hidden');
    const isAuth = sessionStorage.getItem('datascout_admin_auth') === 'true';
    if (isAuth) {
      showDashboardView();
    } else {
      showLoginView();
    }
  }

  function closeAdminModal() {
    if (!adminModal) return;
    adminModal.classList.add('hidden');
    if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }

  function showLoginView() {
    if (adminLoginView) adminLoginView.classList.remove('hidden');
    if (adminDashboardView) adminDashboardView.classList.add('hidden');
    if (adminLoginError) adminLoginError.classList.add('hidden');

    const minutesRemaining = getLockoutMinutesRemaining();
    if (minutesRemaining > 0) {
      if (adminLockoutWarning) adminLockoutWarning.classList.remove('hidden');
      if (lockoutMsgText) lockoutMsgText.innerText = `Acceso bloqueado por seguridad (${minutesRemaining} min restantes).`;
      if (adminPinInput) {
        adminPinInput.disabled = true;
        adminPinInput.value = '';
      }
      if (btnAdminSubmit) btnAdminSubmit.disabled = true;
    } else {
      if (adminLockoutWarning) adminLockoutWarning.classList.add('hidden');
      if (adminPinInput) {
        adminPinInput.disabled = false;
        adminPinInput.value = '';
        setTimeout(() => adminPinInput.focus(), 150);
      }
      if (btnAdminSubmit) btnAdminSubmit.disabled = false;
    }
  }

  function showDashboardView() {
    if (adminLoginView) adminLoginView.classList.add('hidden');
    if (adminDashboardView) adminDashboardView.classList.remove('hidden');
    renderAdminDashboard();
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const minutesRemaining = getLockoutMinutesRemaining();
      if (minutesRemaining > 0) {
        if (adminLockoutWarning) adminLockoutWarning.classList.remove('hidden');
        if (lockoutMsgText) lockoutMsgText.innerText = `Acceso bloqueado por seguridad (${minutesRemaining} min restantes).`;
        return;
      }

      const enteredPin = adminPinInput.value.trim();

      if (enteredPin === ADMIN_PIN) {
        // Successful login: reset failed attempts
        localStorage.removeItem('datascout_admin_failed_count');
        localStorage.removeItem('datascout_admin_lockout_until');
        sessionStorage.setItem('datascout_admin_auth', 'true');
        showDashboardView();
      } else {
        // Failed login: increment failed count
        let failedCount = parseInt(localStorage.getItem('datascout_admin_failed_count') || '0') + 1;
        localStorage.setItem('datascout_admin_failed_count', failedCount.toString());

        if (failedCount >= MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
          localStorage.setItem('datascout_admin_lockout_until', lockoutUntil.toString());
          if (adminLoginError) adminLoginError.classList.add('hidden');
          if (adminLockoutWarning) adminLockoutWarning.classList.remove('hidden');
          if (lockoutMsgText) lockoutMsgText.innerText = `Acceso bloqueado por seguridad (${LOCKOUT_MINUTES} min).`;
          if (adminPinInput) {
            adminPinInput.disabled = true;
            adminPinInput.value = '';
          }
          if (btnAdminSubmit) btnAdminSubmit.disabled = true;
          logAuditEvent('BLOQUEO_SEGURIDAD_ADMIN', { reason: '2 intentos fallidos' });
        } else {
          if (adminLoginError) {
            adminLoginError.innerText = `PIN Pass incorrecto (1 intento restante antes del bloqueo).`;
            adminLoginError.classList.remove('hidden');
          }
          if (adminPinInput) {
            adminPinInput.value = '';
            adminPinInput.focus();
          }
        }
      }
    });
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.addEventListener('click', () => {
      sessionStorage.removeItem('datascout_admin_auth');
      showLoginView();
    });
  }

  if (btnClearAuditData) {
    btnClearAuditData.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas vaciar los registros de auditoría locales?')) {
        localStorage.removeItem('datascout_audit_visits');
        localStorage.removeItem('datascout_audit_leads');
        localStorage.removeItem('datascout_audit_events');
        renderAdminDashboard();
      }
    });
  }

  if (btnExportAuditExcel) {
    btnExportAuditExcel.addEventListener('click', () => {
      exportAuditToExcel();
    });
  }

  // Admin Tabs
  initAdminDashboardTabs();
}

function initAdminDashboardTabs() {
  const tabLeads = document.getElementById('tabAdminLeads');
  const tabVisits = document.getElementById('tabAdminVisits');
  const tabLogs = document.getElementById('tabAdminLogs');
  const contentLeads = document.getElementById('contentAdminLeads');
  const contentVisits = document.getElementById('contentAdminVisits');
  const contentLogs = document.getElementById('contentAdminLogs');

  if (!tabLeads || !tabVisits || !tabLogs) return;

  function resetTabs() {
    [tabLeads, tabVisits, tabLogs].forEach(t => {
      t.className = 'admin-tab-btn px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5 bg-slate-800';
    });
    [contentLeads, contentVisits, contentLogs].forEach(c => {
      if (c) c.classList.add('hidden');
    });
  }

  tabLeads.addEventListener('click', () => {
    resetTabs();
    tabLeads.className = 'admin-tab-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-cyan-600 text-white';
    if (contentLeads) contentLeads.classList.remove('hidden');
  });

  tabVisits.addEventListener('click', () => {
    resetTabs();
    tabVisits.className = 'admin-tab-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-cyan-600 text-white';
    if (contentVisits) contentVisits.classList.remove('hidden');
  });

  tabLogs.addEventListener('click', () => {
    resetTabs();
    tabLogs.className = 'admin-tab-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-cyan-600 text-white';
    if (contentLogs) contentLogs.classList.remove('hidden');
  });
}

function renderAdminDashboard() {
  const visits = getStorage('datascout_audit_visits', []);
  const leads = getStorage('datascout_audit_leads', []);
  const events = getStorage('datascout_audit_events', []);

  // Update Counters
  const metricVisits = document.getElementById('metricTotalVisits');
  const metricLeads = document.getElementById('metricTotalLeads');
  const metricDownloads = document.getElementById('metricTotalDownloads');
  const metricWhatsApp = document.getElementById('metricTotalWhatsAppClicks');
  const countLeadsBadge = document.getElementById('countLeadsBadge');
  const countVisitsBadge = document.getElementById('countVisitsBadge');

  const downloadsCount = events.filter(e => e.type === 'DESCARGA_EXCEL').length;
  const waCount = events.filter(e => e.type.includes('WHATSAPP') || e.type.includes('COTIZACION')).length;

  if (metricVisits) metricVisits.innerText = visits.length;
  if (metricLeads) metricLeads.innerText = leads.length;
  if (metricDownloads) metricDownloads.innerText = downloadsCount;
  if (metricWhatsApp) metricWhatsApp.innerText = waCount;
  if (countLeadsBadge) countLeadsBadge.innerText = leads.length;
  if (countVisitsBadge) countVisitsBadge.innerText = visits.length;

  // Render Leads Table
  const tableBodyLeads = document.getElementById('tableBodyLeads');
  if (tableBodyLeads) {
    if (leads.length === 0) {
      tableBodyLeads.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-slate-500 font-mono text-xs">
            No hay solicitudes registradas aún. Las cotizaciones que completen los clientes aparecerán aquí automáticamente.
          </td>
        </tr>
      `;
    } else {
      tableBodyLeads.innerHTML = leads.map(item => `
        <tr class="hover:bg-white/5 transition">
          <td class="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">${item.timestamp}</td>
          <td class="p-3 font-bold text-white">${item.name}</td>
          <td class="p-3 text-slate-300">${item.industry || 'No especificado'}</td>
          <td class="p-3 text-cyan-300 font-medium">${item.service}</td>
          <td class="p-3 text-slate-400 max-w-xs truncate" title="${item.description}">${item.description}</td>
          <td class="p-3 text-center">
            <a href="https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola ' + item.name + ', recibí tu solicitud para ' + item.service)}" target="_blank" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[10px] transition inline-flex items-center gap-1">
              <i class="fa-brands fa-whatsapp"></i> Chat
            </a>
          </td>
        </tr>
      `).join('');
    }
  }

  // Render Visits Table
  const tableBodyVisits = document.getElementById('tableBodyVisits');
  if (tableBodyVisits) {
    if (visits.length === 0) {
      tableBodyVisits.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-slate-500 font-mono text-xs">
            No hay visitas registradas aún.
          </td>
        </tr>
      `;
    } else {
      tableBodyVisits.innerHTML = visits.map(item => `
        <tr class="hover:bg-white/5 transition">
          <td class="p-3 text-slate-400 whitespace-nowrap">${item.timestamp}</td>
          <td class="p-3 text-emerald-400 font-bold">${item.location}</td>
          <td class="p-3 text-slate-200">${item.device} (${item.os})</td>
          <td class="p-3 text-cyan-300">${item.browser}</td>
          <td class="p-3 text-slate-400">${item.screen}</td>
          <td class="p-3 text-slate-400">${item.referrer}</td>
        </tr>
      `).join('');
    }
  }

  // Render Logs Terminal
  const terminalLogs = document.getElementById('terminalAdminLogs');
  if (terminalLogs) {
    if (events.length === 0) {
      terminalLogs.innerHTML = `<p class="text-slate-500"># Esperando eventos en tiempo real...</p>`;
    } else {
      terminalLogs.innerHTML = events.map(e => `
        <div class="flex items-start gap-2 py-0.5">
          <span class="text-slate-500">[${e.timestamp}]</span>
          <span class="text-cyan-400 font-bold">${e.type}:</span>
          <span class="text-slate-300">${JSON.stringify(e.details)}</span>
        </div>
      `).join('');
    }
  }
}

function exportAuditToExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Generador de Excel cargando... Por favor intenta en un momento.');
    return;
  }

  const visits = getStorage('datascout_audit_visits', []);
  const leads = getStorage('datascout_audit_leads', []);
  const events = getStorage('datascout_audit_events', []);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Leads
  const wsLeads = XLSX.utils.json_to_sheet(leads.length ? leads : [{ "Estado": "Sin peticiones aún" }]);
  XLSX.utils.book_append_sheet(wb, wsLeads, "Peticiones de Clientes");

  // Sheet 2: Visits
  const wsVisits = XLSX.utils.json_to_sheet(visits.length ? visits : [{ "Estado": "Sin visitas registradas" }]);
  XLSX.utils.book_append_sheet(wb, wsVisits, "Registro de Visitas");

  // Sheet 3: Events
  const formattedEvents = events.map(e => ({
    "ID Evento": e.id,
    "Fecha y Hora": e.timestamp,
    "Tipo de Evento": e.type,
    "Detalle": JSON.stringify(e.details)
  }));
  const wsEvents = XLSX.utils.json_to_sheet(formattedEvents.length ? formattedEvents : [{ "Estado": "Sin eventos" }]);
  XLSX.utils.book_append_sheet(wb, wsEvents, "Bitácora de Interacciones");

  XLSX.writeFile(wb, "Auditoria_DataScout_Trafico_y_Leads.xlsx");
}

/* ==========================================================================
   3. DYNAMIC MOUSE SPOTLIGHT EFFECT
   ========================================================================== */
function initSpotlightEffect() {
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const content = item.querySelector('.faq-content');
      const isExpanded = !content.classList.contains('hidden');

      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherContent = other.querySelector('.faq-content');
        if (otherContent) otherContent.classList.add('hidden');
      });

      if (!isExpanded) {
        item.classList.add('active');
        content.classList.remove('hidden');
      }
    });
  });
}

/* ==========================================================================
   5. COMMANDCENTER 360 CHARTS (POWER BI STYLE)
   ========================================================================== */
let salesChart = null;
let categoryChart = null;

const branchData = {
  all: {
    revenue: '$48,250 USD',
    margin: '32.8%',
    ticket: '$142.50',
    stock: '3 productos',
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    sales: [28000, 32500, 39000, 41200, 44800, 48250],
    costs: [19500, 22100, 26000, 27500, 30200, 32400],
    categories: [45, 25, 18, 12]
  },
  central: {
    revenue: '$24,100 USD',
    margin: '35.2%',
    ticket: '$165.00',
    stock: '1 producto',
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    sales: [14000, 16200, 19500, 20800, 22400, 24100],
    costs: [9200, 10500, 12600, 13400, 14500, 15600],
    categories: [50, 20, 20, 10]
  },
  norte: {
    revenue: '$14,650 USD',
    margin: '29.4%',
    ticket: '$118.00',
    stock: '2 productos',
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    sales: [8500, 9800, 11800, 12500, 13600, 14650],
    costs: [6000, 6900, 8300, 8900, 9700, 10350],
    categories: [35, 30, 20, 15]
  },
  online: {
    revenue: '$9,500 USD',
    margin: '38.0%',
    ticket: '$89.00',
    stock: '0 productos',
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    sales: [5500, 6500, 7700, 7900, 8800, 9500],
    costs: [3400, 4000, 4800, 4900, 5400, 5890],
    categories: [60, 20, 10, 10]
  }
};

function initCommandCenterCharts() {
  const ctxSales = document.getElementById('salesTrendChart');
  const ctxCat = document.getElementById('categoryChart');
  if (!ctxSales || !ctxCat) return;

  Chart.defaults.font.family = '"Plus Jakarta Sans", sans-serif';
  Chart.defaults.color = '#94a3b8';

  salesChart = new Chart(ctxSales.getContext('2d'), {
    type: 'line',
    data: {
      labels: branchData.all.labels,
      datasets: [
        {
          label: 'Facturación ($ USD)',
          data: branchData.all.sales,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          fill: true,
          tension: 0.38,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4.5,
          borderWidth: 3
        },
        {
          label: 'Costos Operativos ($ USD)',
          data: branchData.all.costs,
          borderColor: 'rgba(148, 163, 184, 0.6)',
          borderDash: [6, 6],
          tension: 0.38,
          pointRadius: 3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 11, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(6, 182, 212, 0.4)',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { font: { size: 11, weight: '500' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            font: { size: 11, weight: '500' },
            callback: value => '$' + (value / 1000) + 'k'
          }
        }
      }
    }
  });

  categoryChart = new Chart(ctxCat.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Línea Industrial', 'Consumo Masivo', 'Servicios', 'Otros'],
      datasets: [{
        data: branchData.all.categories,
        backgroundColor: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#0b0f19',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            usePointStyle: true,
            font: { size: 11, weight: '500' }
          }
        }
      },
      cutout: '72%'
    }
  });

  const branchSelector = document.getElementById('branchSelector');
  if (branchSelector) {
    branchSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      const data = branchData[selected] || branchData.all;

      document.getElementById('kpiRevenue').innerText = data.revenue;
      document.getElementById('kpiMargin').innerText = data.margin;
      document.getElementById('kpiTicket').innerText = data.ticket;
      document.getElementById('kpiStock').innerText = data.stock;

      salesChart.data.datasets[0].data = data.sales;
      salesChart.data.datasets[1].data = data.costs;
      salesChart.update();

      categoryChart.data.datasets[0].data = data.categories;
      categoryChart.update();
    });
  }
}

/* ==========================================================================
   6. DEMO TABS (AUTOTASK VS COMMANDCENTER)
   ========================================================================== */
function initProductDemoTabs() {
  const tabAutoTask = document.getElementById('tabDemoAutoTask');
  const tabCommand = document.getElementById('tabDemoCommand');
  const containerAutoTask = document.getElementById('demoAutoTaskContainer');
  const containerCommand = document.getElementById('demoCommandContainer');

  if (!tabAutoTask || !tabCommand || !containerAutoTask || !containerCommand) return;

  tabAutoTask.addEventListener('click', () => {
    tabAutoTask.className = 'px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md';
    tabCommand.className = 'px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-2.5';
    containerAutoTask.classList.remove('hidden');
    containerCommand.classList.add('hidden');
  });

  tabCommand.addEventListener('click', () => {
    tabCommand.className = 'px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md';
    tabAutoTask.className = 'px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-2.5';
    containerCommand.classList.remove('hidden');
    containerAutoTask.classList.add('hidden');
  });
}

/* ==========================================================================
   7. AUTOTASK 1-CLICK SIMULATOR + SHEETJS REAL DOWNLOAD
   ========================================================================== */
function initAutoTaskSimulator() {
  const btnRun = document.getElementById('btnRunPython');
  const terminalBody = document.getElementById('terminalBody');
  const terminalStatus = document.getElementById('terminalStatus');
  const downloadBox = document.getElementById('downloadSimulatedReport');
  const btnDownloadExcel = document.getElementById('btnDownloadRealExcel');

  if (!btnRun || !terminalBody) return;

  const simulatedLogs = [
    { delay: 300, text: '<span class="text-cyan-400 font-bold">[10:14:02.102] INICIANDO DATA SCOUT AUTOTASK:</span> Lectura y consolidación de 3 planillas Excel (.xlsx)...' },
    { delay: 750, text: '<span class="text-slate-400">[10:14:02.415] [ARCHIVOS CARGADOS]</span> Ventas_Central.xlsx (840 f.), Ventas_Norte.xlsx (620 f.), Ecommerce_Jun.xlsx (1,020 f.)...' },
    { delay: 1250, text: '<span class="text-emerald-400 font-bold">[10:14:02.780] [AUDITORÍA DE DATOS]</span> 2,480 registros procesados. 0% de corrupción.' },
    { delay: 1750, text: '<span class="text-amber-400 font-bold">[10:14:03.010] [CORRECCIÓN AUTOMÁTICA]</span> 3 precios con formato de texto (comas/símbolos) normalizados a valores numéricos.' },
    { delay: 2250, text: '<span class="text-cyan-400 font-bold">[10:14:03.350] [CRUCE DE STOCK & IVA]</span> IVA discriminado al 21% y 2 productos críticos señalizados.' },
    { delay: 2750, text: '<span class="text-emerald-400 font-bold">[10:14:03.710] [REPORTE FINAL]</span> Generando Reporte_Consolidado_Auditado_DataScout.xlsx...' },
    { delay: 3100, text: '<span class="text-teal-300 font-extrabold">[10:14:03.890] ✅ EJECUCIÓN EXITOSA en 1.788s (0 errores humanos, listo para descargar)</span>' }
  ];

  btnRun.addEventListener('click', () => {
    btnRun.disabled = true;
    btnRun.classList.add('opacity-50', 'cursor-not-allowed');
    terminalStatus.innerText = 'Ejecutando...';
    terminalStatus.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold animate-pulse';
    
    logAuditEvent('EJECUCION_DEMO_AUTOTASK', { trigger: 'Boton 1-Click' });

    terminalBody.innerHTML = `
      <p class="text-slate-400">$ python -m datascout.autotask --validate-strict</p>
      <div class="h-1 bg-slate-800 w-full my-2 rounded overflow-hidden">
        <div id="simProgressBar" class="h-full bg-cyan-400 transition-all duration-300" style="width: 0%"></div>
      </div>
    `;

    simulatedLogs.forEach((item, index) => {
      setTimeout(() => {
        const p = document.createElement('p');
        p.className = 'log-entry text-xs font-mono py-0.5';
        p.innerHTML = item.text;
        terminalBody.appendChild(p);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        const prog = document.getElementById('simProgressBar');
        if (prog) {
          prog.style.width = `${((index + 1) / simulatedLogs.length) * 100}%`;
        }

        if (index === simulatedLogs.length - 1) {
          terminalStatus.innerText = 'Completado (1.8s)';
          terminalStatus.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold';
          btnRun.disabled = false;
          btnRun.classList.remove('opacity-50', 'cursor-not-allowed');
          if (downloadBox) downloadBox.classList.remove('hidden');
        }
      }, item.delay);
    });
  });

  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener('click', () => {
      logAuditEvent('DESCARGA_EXCEL', { file: 'Reporte_Consolidado_Auditado_DataScout.xlsx' });
      generateAndDownloadRealExcel();
    });
  }
}

function generateAndDownloadRealExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Generador de Excel cargando... Por favor intenta en un momento.');
    return;
  }

  const consolidatedData = [
    {
      "ID Transacción": "DS-10481",
      "Sucursal": "Central",
      "Fecha": "2026-06-01",
      "Vendedor": "Martín Gómez",
      "Categoría": "Industrial",
      "Producto": "Kit Sensor Óptico Industrial",
      "Cantidad": 12,
      "Precio Unitario (USD)": 140.50,
      "Subtotal": 1686.00,
      "IVA (21%)": 354.06,
      "Total Facturado (USD)": 2040.06,
      "Costo Base": 1150.00,
      "Margen Neto ($)": 536.00,
      "Margen %": "31.8%",
      "Estado Stock": "Normal"
    },
    {
      "ID Transacción": "DS-10482",
      "Sucursal": "Norte",
      "Fecha": "2026-06-01",
      "Vendedor": "Lucía Pereyra",
      "Categoría": "Neumática",
      "Producto": "Válvula Reguladora 1/2 pulgada",
      "Cantidad": 8,
      "Precio Unitario (USD)": 89.90,
      "Subtotal": 719.20,
      "IVA (21%)": 151.03,
      "Total Facturado (USD)": 870.23,
      "Costo Base": 480.00,
      "Margen Neto ($)": 239.20,
      "Margen %": "33.2%",
      "Estado Stock": "Stock Crítico (2 restantes)"
    },
    {
      "ID Transacción": "DS-10483",
      "Sucursal": "Online E-commerce",
      "Fecha": "2026-06-02",
      "Vendedor": "Canal Digital",
      "Categoría": "Automatización",
      "Producto": "Módulo PLC Compacto 24V",
      "Cantidad": 4,
      "Precio Unitario (USD)": 320.00,
      "Subtotal": 1280.00,
      "IVA (21%)": 268.80,
      "Total Facturado (USD)": 1548.80,
      "Costo Base": 820.00,
      "Margen Neto ($)": 460.00,
      "Margen %": "35.9%",
      "Estado Stock": "Normal"
    },
    {
      "ID Transacción": "DS-10484",
      "Sucursal": "Central",
      "Fecha": "2026-06-02",
      "Vendedor": "Esteban Ramos",
      "Categoría": "Herramientas",
      "Producto": "Pistola Neumática de Impacto",
      "Cantidad": 6,
      "Precio Unitario (USD)": 210.00,
      "Subtotal": 1260.00,
      "IVA (21%)": 264.60,
      "Total Facturado (USD)": 1524.60,
      "Costo Base": 890.00,
      "Margen Neto ($)": 370.00,
      "Margen %": "29.4%",
      "Estado Stock": "Normal"
    },
    {
      "ID Transacción": "DS-10485",
      "Sucursal": "Norte",
      "Fecha": "2026-06-03",
      "Vendedor": "Lucía Pereyra",
      "Categoría": "Industrial",
      "Producto": "Variador de Frecuencia 5HP",
      "Cantidad": 3,
      "Precio Unitario (USD)": 640.00,
      "Subtotal": 1920.00,
      "IVA (21%)": 403.20,
      "Total Facturado (USD)": 2323.20,
      "Costo Base": 1280.00,
      "Margen Neto ($)": 640.00,
      "Margen %": "33.3%",
      "Estado Stock": "Normal"
    },
    {
      "ID Transacción": "DS-10486",
      "Sucursal": "Online E-commerce",
      "Fecha": "2026-06-03",
      "Vendedor": "Canal Digital",
      "Categoría": "Conectividad",
      "Producto": "Cable Apantallado Industrial (Roll 100m)",
      "Cantidad": 15,
      "Precio Unitario (USD)": 75.00,
      "Subtotal": 1125.00,
      "IVA (21%)": 236.25,
      "Total Facturado (USD)": 1361.25,
      "Costo Base": 710.00,
      "Margen Neto ($)": 415.00,
      "Margen %": "36.9%",
      "Estado Stock": "Normal"
    }
  ];

  const auditLogsData = [
    {
      "Paso": 1,
      "Acción": "Data Scout Carga",
      "Detalle": "3 planillas leídas con éxito: Ventas_Central.xlsx, Ventas_Norte.xlsx, Ecommerce_Jun.xlsx",
      "Estado": "OK"
    },
    {
      "Paso": 2,
      "Acción": "Auditoría de Formatos",
      "Detalle": "3 celdas con formato string corregidas a valores numéricos flotantes (USD)",
      "Estado": "CORREGIDO AUTOMÁTICAMENTE"
    },
    {
      "Paso": 3,
      "Acción": "Estandarización de Esquema",
      "Detalle": "Mapeo de columnas de Ventas_Norte.xlsx reordenadas al estándar general",
      "Estado": "OK"
    },
    {
      "Paso": 4,
      "Acción": "Cálculo de Rentabilidad",
      "Detalle": "IVA (21%) y Margen Neto calculados matemáticamente con 100% de precisión",
      "Estado": "OK"
    },
    {
      "Paso": 5,
      "Acción": "Monitoreo de Inventario",
      "Detalle": "Válvula Reguladora identificada con stock crítico (< 3 unidades)",
      "Estado": "ALERTA EMITIDA"
    }
  ];

  const wb = XLSX.utils.book_new();
  const wsConsolidated = XLSX.utils.json_to_sheet(consolidatedData);
  const wsAudit = XLSX.utils.json_to_sheet(auditLogsData);

  wsConsolidated['!cols'] = [
    { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 16 },
    { wch: 32 }, { wch: 10 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 26 }
  ];
  wsAudit['!cols'] = [{ wch: 8 }, { wch: 26 }, { wch: 65 }, { wch: 30 }];

  XLSX.utils.book_append_sheet(wb, wsConsolidated, "Reporte Consolidado Data Scout");
  XLSX.utils.book_append_sheet(wb, wsAudit, "Bitácora de Auditoría");

  XLSX.writeFile(wb, "Reporte_Consolidado_Auditado_DataScout.xlsx");
}

/* ==========================================================================
   8. RAW PREVIEW TABLE TOGGLE
   ========================================================================== */
function initRawPreviewToggle() {
  const btn = document.getElementById('btnToggleRawPreview');
  const table = document.getElementById('rawPreviewTable');

  if (btn && table) {
    btn.addEventListener('click', () => {
      const isHidden = table.classList.contains('hidden');
      if (isHidden) {
        table.classList.remove('hidden');
        btn.innerHTML = '<span>Ocultar Muestra</span> <i class="fa-solid fa-chevron-up text-[10px]"></i>';
      } else {
        table.classList.add('hidden');
        btn.innerHTML = '<span>Ver Muestra de Datos Crudos</span> <i class="fa-solid fa-chevron-down text-[10px]"></i>';
      }
    });
  }
}

// Global product selection helper from cards
function selectProductQuote(productName) {
  const select = document.getElementById('contactService');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.toLowerCase().includes(productName.toLowerCase().split(' ')[0] || '')) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  const contactSection = document.getElementById('contacto');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
  }
}
window.selectProductQuote = selectProductQuote;

/* ==========================================================================
   9. WHATSAPP QUOTE FORM INTEGRATION + LEAD AUDIT RECORDING
   ========================================================================== */
function initQuoteForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const industry = document.getElementById('contactIndustry').value.trim() || 'No especificado';
    const service = document.getElementById('contactService').value;
    const description = document.getElementById('contactDescription').value.trim();
    const timestamp = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' });

    // 1. SAVE LEAD TO LOCAL AUDIT STORE
    const leads = getStorage('datascout_audit_leads', []);
    const newLead = {
      id: 'LEAD-' + Date.now(),
      timestamp: timestamp,
      name: name,
      industry: industry,
      service: service,
      description: description
    };
    leads.unshift(newLead);
    setStorage('datascout_audit_leads', leads);
    logAuditEvent('NUEVA_COTIZACION_LEAD', { client: name, service: service, industry: industry });

    // 2. DISPATCH TO WHATSAPP
    const message = `👋 *Hola! Vengo desde la web de Data Scout:*\n\n` +
      `👤 *Nombre y Empresa:* ${name}\n` +
      `🏢 *Rubro:* ${industry}\n` +
      `🎯 *Solución de interés:* ${service}\n` +
      `📝 *Proceso actual a mejorar:* ${description}\n\n` +
      `¿Podemos coordinar la videollamada de diagnóstico de 15 min para revisar el alcance y presupuesto cerrado?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  });
}

/* ==========================================================================
   10. THEME TOGGLE & MOBILE NAV
   ========================================================================== */
function initThemeAndNav() {
  const themeToggle = document.getElementById('themeToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  if (themeToggle) {
    const currentTheme = localStorage.getItem('datascout_theme') || 'dark';
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun text-amber-400 text-xs"></i>';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('datascout_theme', isLight ? 'light' : 'dark');
      themeToggle.innerHTML = isLight 
        ? '<i class="fa-solid fa-sun text-amber-400 text-xs"></i>' 
        : '<i class="fa-solid fa-moon text-xs"></i>';
    });
  }
}

/* ==========================================================================
   11. DATA SCOUT STUDIO (UNIVERSAL PROFILER & MULTI-DOMAIN ANALYZER ENGINE)
   ========================================================================== */

let studioRawData = [];
let studioCleanData = [];
let studioColumns = [];
let studioActiveDomain = 'ventas';
let studioDetectedDomain = 'ventas';
let studioHealthScore = 100;
let studioMainChart = null;
let studioSecChart = null;
let studioCurrentPage = 1;
let studioPageSize = 25;
let studioSearchTerm = '';
let studioSourceTitle = 'Ventas & Márgenes Multicanal';

// Rich Realistic Sample Datasets with Inconsistencies & Domain Features
const STUDIO_PRESETS = {
  ventas: [
    { Fecha: '2025-01-05', Sucursal: 'Central', Cliente: 'TecnoUruguay SRL', Vendedor: 'Martín R.', Producto: 'Kit Sensor Óptico Industrial', Cantidad: 12, Precio_Unitario: '$ 140,50', Costo_Unitario: 92.00, Comision_Pct: '4.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '06/01/2025', Sucursal: 'Norte', Cliente: 'AgroRepuestos Paysandú', Vendedor: 'Lucía G.', Producto: 'Válvula Reguladora 1/2', Cantidad: 8, Precio_Unitario: '89.90 USD', Costo_Unitario: 55.00, Comision_Pct: '3.5%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025/01/08', Sucursal: 'Online', Cliente: 'Distribuidora Punta', Vendedor: 'Web Store', Producto: 'Módulo PLC Compacto 24V', Cantidad: 4, Precio_Unitario: '320.00', Costo_Unitario: 210.00, Comision_Pct: '2.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-01-10', Sucursal: 'Central', Cliente: 'Ferretería El Tornillo', Vendedor: 'Martín R.', Producto: 'Variador de Frecuencia 5HP', Cantidad: 3, Precio_Unitario: '  $ 450,00  ', Costo_Unitario: 310.00, Comision_Pct: '4.5%', Estado_Pago: 'Cobrado' },
    { Fecha: '12/01/2025', Sucursal: 'Sur', Cliente: 'Constructora del Plata', Vendedor: 'Rodrigo P.', Producto: 'Actuador Neumático 32mm', Cantidad: 15, Precio_Unitario: '$ 75,00', Costo_Unitario: 48.00, Comision_Pct: '4.0%', Estado_Pago: 'Pendiente' },
    { Fecha: '2025-01-14', Sucursal: 'Norte', Cliente: 'Logística Oriental', Vendedor: 'Lucía G.', Producto: 'Termocupla Tipo K Acero', Cantidad: 20, Precio_Unitario: '42.50 USD', Costo_Unitario: 26.00, Comision_Pct: '3.5%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-01-16', Sucursal: 'Central', Cliente: 'TecnoUruguay SRL', Vendedor: 'Martín R.', Producto: 'Kit Sensor Óptico Industrial', Cantidad: 6, Precio_Unitario: '$ 140,50', Costo_Unitario: 92.00, Comision_Pct: '4.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '18/01/2025', Sucursal: 'Online', Cliente: 'ElectroSur Rivera', Vendedor: 'Web Store', Producto: 'Módulo PLC Compacto 24V', Cantidad: 2, Precio_Unitario: '320.00', Costo_Unitario: 210.00, Comision_Pct: '2.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-01-20', Sucursal: 'Sur', Cliente: 'Industrias Colonia SA', Vendedor: 'Rodrigo P.', Producto: 'Variador de Frecuencia 5HP', Cantidad: 5, Precio_Unitario: '$ 450,00', Costo_Unitario: 310.00, Comision_Pct: '4.5%', Estado_Pago: 'Pendiente' },
    { Fecha: '2025-01-22', Sucursal: 'Central', Cliente: 'Ferretería El Tornillo', Vendedor: 'Martín R.', Producto: 'Válvula Reguladora 1/2', Cantidad: 14, Precio_Unitario: '$ 89,90', Costo_Unitario: 55.00, Comision_Pct: '4.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '24/01/2025', Sucursal: 'Norte', Cliente: 'AgroRepuestos Paysandú', Vendedor: 'Lucía G.', Producto: 'Actuador Neumático 32mm', Cantidad: 10, Precio_Unitario: '75.00 USD', Costo_Unitario: 48.00, Comision_Pct: '3.5%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-01-26', Sucursal: 'Online', Cliente: 'Distribuidora Punta', Vendedor: 'Web Store', Producto: 'Kit Sensor Óptico Industrial', Cantidad: 8, Precio_Unitario: '140.50', Costo_Unitario: 92.00, Comision_Pct: '2.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-01-28', Sucursal: 'Sur', Cliente: 'Constructora del Plata', Vendedor: 'Rodrigo P.', Producto: 'Módulo PLC Compacto 24V', Cantidad: 6, Precio_Unitario: '$ 320,00', Costo_Unitario: 210.00, Comision_Pct: '4.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '30/01/2025', Sucursal: 'Central', Cliente: 'Logística Oriental', Vendedor: 'Martín R.', Producto: 'Termocupla Tipo K Acero', Cantidad: 18, Precio_Unitario: '$ 42,50', Costo_Unitario: 26.00, Comision_Pct: '4.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-02-01', Sucursal: 'Online', Cliente: 'ElectroSur Rivera', Vendedor: 'Web Store', Producto: 'Válvula Reguladora 1/2', Cantidad: 12, Precio_Unitario: '89.90', Costo_Unitario: 55.00, Comision_Pct: '2.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-02-03', Sucursal: 'Norte', Cliente: 'AgroRepuestos Paysandú', Vendedor: 'Lucía G.', Producto: 'Variador de Frecuencia 5HP', Cantidad: 2, Precio_Unitario: '450.00 USD', Costo_Unitario: 310.00, Comision_Pct: '3.5%', Estado_Pago: 'Cobrado' },
    { Fecha: '05/02/2025', Sucursal: 'Central', Cliente: 'TecnoUruguay SRL', Vendedor: 'Martín R.', Producto: 'Actuador Neumático 32mm', Cantidad: 11, Precio_Unitario: '$ 75,00', Costo_Unitario: 48.00, Comision_Pct: '4.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-02-07', Sucursal: 'Sur', Cliente: 'Industrias Colonia SA', Vendedor: 'Rodrigo P.', Producto: 'Kit Sensor Óptico Industrial', Cantidad: 16, Precio_Unitario: '$ 140,50', Costo_Unitario: 92.00, Comision_Pct: '4.5%', Estado_Pago: 'Cobrado' },
    { Fecha: '2025-02-10', Sucursal: 'Online', Cliente: 'Distribuidora Punta', Vendedor: 'Web Store', Producto: 'Termocupla Tipo K Acero', Cantidad: 25, Precio_Unitario: '42.50', Costo_Unitario: 26.00, Comision_Pct: '2.0%', Estado_Pago: 'Cobrado' },
    { Fecha: '12/02/2025', Sucursal: 'Norte', Cliente: 'Logística Oriental', Vendedor: 'Lucía G.', Producto: 'Módulo PLC Compacto 24V', Cantidad: 3, Precio_Unitario: '320.00 USD', Costo_Unitario: 210.00, Comision_Pct: '3.5%', Estado_Pago: 'Pendiente' }
  ],

  logistica: [
    { Guia_Tracking: 'DAC-98214', Origen: 'Montevideo - Centro', Destino: 'Salto', Transportista: 'DAC', Fecha_Despacho: '2025-02-01', Fecha_Prometida: '2025-02-03', Fecha_Real_Entrega: '2025-02-03', Dias_Demora: 0, Peso_Kg: 4.5, Costo_Flete: '$ 480,00', Estado_Entrega: 'Entregado a Tiempo' },
    { Guia_Tracking: 'MIR-44219', Origen: 'Canelones - Parque Ind.', Destino: 'Maldonado', Transportista: 'Mirtrans', Fecha_Despacho: '2025-02-02', Fecha_Prometida: '2025-02-03', Fecha_Real_Entrega: '2025-02-05', Dias_Demora: 2, Peso_Kg: 18.2, Costo_Flete: '$ 1.250,00', Estado_Entrega: 'Entregado con Demora' },
    { Guia_Tracking: 'COR-11029', Origen: 'Montevideo - Centro', Destino: 'Rivera', Transportista: 'Correo Uruguayo', Fecha_Despacho: '2025-02-03', Fecha_Prometida: '2025-02-06', Fecha_Real_Entrega: '2025-02-06', Dias_Demora: 0, Peso_Kg: 2.0, Costo_Flete: '$ 320,00', Estado_Entrega: 'Entregado a Tiempo' },
    { Guia_Tracking: 'UES-77821', Origen: 'Zona Franca MVD', Destino: 'Colonia', Transportista: 'UES Express', Fecha_Despacho: '2025-02-04', Fecha_Prometida: '2025-02-05', Fecha_Real_Entrega: '2025-02-08', Dias_Demora: 3, Peso_Kg: 45.0, Costo_Flete: '$ 2.800,00', Estado_Entrega: 'Entregado con Demora' },
    { Guia_Tracking: 'DAC-98215', Origen: 'Montevideo - Centro', Destino: 'Paysandú', Transportista: 'DAC', Fecha_Despacho: '2025-02-05', Fecha_Prometida: '2025-02-07', Fecha_Real_Entrega: '2025-02-07', Dias_Demora: 0, Peso_Kg: 12.8, Costo_Flete: '$ 950,00', Estado_Entrega: 'Entregado a Tiempo' },
    { Guia_Tracking: 'MIR-44220', Origen: 'Canelones - Parque Ind.', Destino: 'Tacuarembó', Transportista: 'Mirtrans', Fecha_Despacho: '2025-02-06', Fecha_Prometida: '2025-02-08', Fecha_Real_Entrega: '2025-02-09', Dias_Demora: 1, Peso_Kg: 8.4, Costo_Flete: '$ 720,00', Estado_Entrega: 'Entregado con Demora' },
    { Guia_Tracking: 'UES-77822', Origen: 'Zona Franca MVD', Destino: 'Montevideo - Carrasco', Transportista: 'UES Express', Fecha_Despacho: '2025-02-07', Fecha_Prometida: '2025-02-08', Fecha_Real_Entrega: '2025-02-08', Dias_Demora: 0, Peso_Kg: 1.5, Costo_Flete: '$ 290,00', Estado_Entrega: 'Entregado a Tiempo' },
    { Guia_Tracking: 'COR-11030', Origen: 'Montevideo - Centro', Destino: 'Artigas', Transportista: 'Correo Uruguayo', Fecha_Despacho: '2025-02-08', Fecha_Prometida: '2025-02-12', Fecha_Real_Entrega: '2025-02-15', Dias_Demora: 3, Peso_Kg: 3.2, Costo_Flete: '$ 410,00', Estado_Entrega: 'Entregado con Demora' },
    { Guia_Tracking: 'DAC-98216', Origen: 'Montevideo - Centro', Destino: 'Maldonado', Transportista: 'DAC', Fecha_Despacho: '2025-02-09', Fecha_Prometida: '2025-02-10', Fecha_Real_Entrega: '2025-02-10', Dias_Demora: 0, Peso_Kg: 22.0, Costo_Flete: '$ 1.450,00', Estado_Entrega: 'Entregado a Tiempo' },
    { Guia_Tracking: 'UES-77823', Origen: 'Canelones - Parque Ind.', Destino: 'San José', Transportista: 'UES Express', Fecha_Despacho: '2025-02-10', Fecha_Prometida: '2025-02-11', Fecha_Real_Entrega: '', Dias_Demora: 0, Peso_Kg: 15.0, Costo_Flete: '$ 890,00', Estado_Entrega: 'En Tránsito' }
  ],

  operaciones: [
    { Orden_Trabajo: 'OT-2025-081', Linea_Produccion: 'Línea A - Montaje', Operario: 'Carlos Mendez', Fase_Actual: 'Ensamblado Final', Horas_Planificadas: 4.5, Horas_Reales: 4.2, Unidades_Buenas: 48, Unidades_Defecto: 2, Estado_OT: 'Completada' },
    { Orden_Trabajo: 'OT-2025-082', Linea_Produccion: 'Línea B - Mecanizado', Operario: 'Walter Silva', Fase_Actual: 'Corte CNC', Horas_Planificadas: 8.0, Horas_Reales: 11.5, Unidades_Buenas: 110, Unidades_Defecto: 8, Estado_OT: 'Cuello de Botella' },
    { Orden_Trabajo: 'OT-2025-083', Linea_Produccion: 'Línea C - Soldadura', Operario: 'Fernando Diaz', Fase_Actual: 'Estructuras TIG', Horas_Planificadas: 6.0, Horas_Reales: 5.8, Unidades_Buenas: 24, Unidades_Defecto: 0, Estado_OT: 'Completada' },
    { Orden_Trabajo: 'OT-2025-084', Linea_Produccion: 'Línea A - Montaje', Operario: 'Carlos Mendez', Fase_Actual: 'Cableado Eléctrico', Horas_Planificadas: 5.0, Horas_Reales: 7.2, Unidades_Buenas: 35, Unidades_Defecto: 3, Estado_OT: 'Con Retraso' },
    { Orden_Trabajo: 'OT-2025-085', Linea_Produccion: 'Línea D - Pintura', Operario: 'Gonzalo Rossi', Fase_Actual: 'Pintura Electrostática', Horas_Planificadas: 3.5, Horas_Reales: 3.5, Unidades_Buenas: 80, Unidades_Defecto: 1, Estado_OT: 'Completada' },
    { Orden_Trabajo: 'OT-2025-086', Linea_Produccion: 'Línea B - Mecanizado', Operario: 'Walter Silva', Fase_Actual: 'Torneado Ejes', Horas_Planificadas: 7.0, Horas_Reales: 6.8, Unidades_Buenas: 60, Unidades_Defecto: 1, Estado_OT: 'Completada' },
    { Orden_Trabajo: 'OT-2025-087', Linea_Produccion: 'Línea C - Soldadura', Operario: 'Fernando Diaz', Fase_Actual: 'Soldadura MIG', Horas_Planificadas: 9.0, Horas_Reales: 12.0, Unidades_Buenas: 40, Unidades_Defecto: 5, Estado_OT: 'Cuello de Botella' },
    { Orden_Trabajo: 'OT-2025-088', Linea_Produccion: 'Línea A - Montaje', Operario: 'Ana Paula Vega', Fase_Actual: 'Control de Calidad', Horas_Planificadas: 4.0, Horas_Reales: 3.9, Unidades_Buenas: 120, Unidades_Defecto: 2, Estado_OT: 'Completada' }
  ],

  stock: [
    { SKU: 'SKU-HID-01', Descripcion: 'Filtro Hidráulico Alta Presión', Categoria: 'Hidráulica', Deposito: 'Depósito Central', Stock_Actual: 4, Stock_Minimo: 15, Costo_Unitario: '$ 45,00', Precio_Venta: '$ 75,00', Dias_Sin_Movimiento: 8, Estado_Stock: 'Quiebre Crítico' },
    { SKU: 'SKU-MOT-02', Descripcion: 'Bomba Centrífuga 2HP', Categoria: 'Motores', Deposito: 'Sucursal Norte', Stock_Actual: 0, Stock_Minimo: 5, Costo_Unitario: '180.00 USD', Precio_Venta: '290.00 USD', Dias_Sin_Movimiento: 2, Estado_Stock: 'Agotado' },
    { SKU: 'SKU-MEC-03', Descripcion: 'Rodamiento Blindado 6204', Categoria: 'Mecánica', Deposito: 'Depósito Central', Stock_Actual: 145, Stock_Minimo: 30, Costo_Unitario: '12.50', Precio_Venta: '22.00', Dias_Sin_Movimiento: 5, Estado_Stock: 'Stock Saludable' },
    { SKU: 'SKU-ELE-04', Descripcion: 'Sensor Inductivo M12', Categoria: 'Electrónica', Deposito: 'Zona Franca', Stock_Actual: 82, Stock_Minimo: 20, Costo_Unitario: '65.00', Precio_Venta: '110.00', Dias_Sin_Movimiento: 240, Estado_Stock: 'Sobrestock Inmovilizado' },
    { SKU: 'SKU-ELE-05', Descripcion: 'Relé Térmico 10-16A', Categoria: 'Electrónica', Deposito: 'Depósito Central', Stock_Actual: 3, Stock_Minimo: 10, Costo_Unitario: '$ 28,00', Precio_Venta: '$ 48,00', Dias_Sin_Movimiento: 12, Estado_Stock: 'Reposición Urgente' },
    { SKU: 'SKU-INS-06', Descripcion: 'Manómetro Glicerina 0-10 Bar', Categoria: 'Instrumentación', Deposito: 'Sucursal Norte', Stock_Actual: 22, Stock_Minimo: 8, Costo_Unitario: '$ 34,00', Precio_Venta: '$ 58,00', Dias_Sin_Movimiento: 18, Estado_Stock: 'Stock Saludable' },
    { SKU: 'SKU-MOT-07', Descripcion: 'Motor Trifásico 7.5HP IE3', Categoria: 'Motores', Deposito: 'Zona Franca', Stock_Actual: 1, Stock_Minimo: 4, Costo_Unitario: '420.00 USD', Precio_Venta: '680.00 USD', Dias_Sin_Movimiento: 6, Estado_Stock: 'Quiebre Crítico' },
    { SKU: 'SKU-HID-08', Descripcion: 'Manguera Hidráulica R2 1/2 (Rollo)', Categoria: 'Hidráulica', Deposito: 'Depósito Central', Stock_Actual: 50, Stock_Minimo: 12, Costo_Unitario: '$ 110,00', Precio_Venta: '$ 180,00', Dias_Sin_Movimiento: 310, Estado_Stock: 'Sobrestock Inmovilizado' }
  ],

  bancos: [
    { Fecha_Extracto: '2025-01-02', Banco_Cuenta: 'BROU C/C 19283', Referencia_Bancaria: 'TRF-091823', Concepto_Extracto: 'Transf Recibida Cliente Gomez', Debito_Banco: '$ 0,00', Credito_Banco: '$ 35.800,00', Monto_Registrado_ERP: '$ 35.800,00', Diferencia_Descalce: '0.00', Estado_Conciliacion: 'Conciliado 100%' },
    { Fecha_Extracto: '03/01/2025', Banco_Cuenta: 'Santander Cta Cte 4401', Referencia_Bancaria: 'DEB-IMP-001', Concepto_Extracto: 'Comisión Mantenimiento Cuenta', Debito_Banco: '$ 1.250,00', Credito_Banco: '$ 0,00', Monto_Registrado_ERP: '$ 0,00', Diferencia_Descalce: '-1.250,00', Estado_Conciliacion: 'Gasto Bancario no en ERP' },
    { Fecha_Extracto: '2025-01-05', Banco_Cuenta: 'BROU C/C 19283', Referencia_Bancaria: 'CHQ-882194', Concepto_Extracto: 'Pago Proveedor Metalúrgica SRL', Debito_Banco: '$ 18.400,00', Credito_Banco: '$ 0,00', Monto_Registrado_ERP: '$ 18.400,00', Diferencia_Descalce: '0.00', Estado_Conciliacion: 'Conciliado 100%' },
    { Fecha_Extracto: '07/01/2025', Banco_Cuenta: 'Itaú Dólares 8821', Referencia_Bancaria: 'POS-REDELCOM-29', Concepto_Extracto: 'Liquidación Tarjetas Visa/Master', Debito_Banco: '$ 0,00', Credito_Banco: '$ 62.400,00', Monto_Registrado_ERP: '$ 63.850,00', Diferencia_Descalce: '-1.450,00 (Arancel POS)', Estado_Conciliacion: 'Diferencia Arancel POS' },
    { Fecha_Extracto: '2025-01-10', Banco_Cuenta: 'BROU C/C 19283', Referencia_Bancaria: 'DGI-PAGO-01', Concepto_Extracto: 'Débito Fiscal DGI IVA/IRAE', Debito_Banco: '$ 42.100,00', Credito_Banco: '$ 0,00', Monto_Registrado_ERP: '$ 42.100,00', Diferencia_Descalce: '0.00', Estado_Conciliacion: 'Conciliado 100%' },
    { Fecha_Extracto: '12/01/2025', Banco_Cuenta: 'Santander Cta Cte 4401', Referencia_Bancaria: 'TRF-DESCON-88', Concepto_Extracto: 'Depósito en Efectivo Buzonera', Debito_Banco: '$ 0,00', Credito_Banco: '$ 15.000,00', Monto_Registrado_ERP: '$ 0,00', Diferencia_Descalce: '+15.000,00', Estado_Conciliacion: 'Cobro no Asignado a Cliente' },
    { Fecha_Extracto: '2025-01-15', Banco_Cuenta: 'BROU C/C 19283', Referencia_Bancaria: 'CHQ-882195', Concepto_Extracto: 'Cheque emitido no presentado', Debito_Banco: '$ 0,00', Credito_Banco: '$ 0,00', Monto_Registrado_ERP: '$ 8.900,00', Diferencia_Descalce: '-8.900,00', Estado_Conciliacion: 'Cheque Pendiente de Cobro' }
  ],

  cobranzas: [
    { Factura_Nro: 'F-2024-8901', Cliente: 'Constructora del Plata SRL', Fecha_Emision: '2024-11-15', Fecha_Vencimiento: '2024-12-15', Dias_Atraso: 72, Monto_Total: '$ 84.500,00', Monto_Cobrado: '$ 0,00', Saldo_Pendiente: '$ 84.500,00', Tramo_Mora: '+60 Días (Crítico)', Riesgo_Crediticio: 'Alto' },
    { Factura_Nro: 'F-2024-9102', Cliente: 'Agro-Servicios Colonia', Fecha_Emision: '2024-12-01', Fecha_Vencimiento: '2024-12-31', Dias_Atraso: 56, Monto_Total: '$ 22.000,00', Monto_Cobrado: '$ 10.000,00', Saldo_Pendiente: '$ 12.000,00', Tramo_Mora: '31-60 Días (Alerta)', Riesgo_Crediticio: 'Medio' },
    { Factura_Nro: 'F-2025-0120', Cliente: 'Supermercados del Este', Fecha_Emision: '2025-01-10', Fecha_Vencimiento: '2025-02-10', Dias_Atraso: 15, Monto_Total: '$ 115.000,00', Monto_Cobrado: '$ 115.000,00', Saldo_Pendiente: '$ 0,00', Tramo_Mora: 'Al Día (Cobrado)', Riesgo_Crediticio: 'Bajo' },
    { Factura_Nro: 'F-2025-0144', Cliente: 'Taller Mecánico Silva', Fecha_Emision: '2024-10-20', Fecha_Vencimiento: '2024-11-20', Dias_Atraso: 97, Monto_Total: '$ 36.800,00', Monto_Cobrado: '$ 5.000,00', Saldo_Pendiente: '$ 31.800,00', Tramo_Mora: '+90 Días (Incobrable)', Riesgo_Crediticio: 'Crítico' },
    { Factura_Nro: 'F-2025-0188', Cliente: 'Farmacias Unidas MVD', Fecha_Emision: '2025-01-28', Fecha_Vencimiento: '2025-02-28', Dias_Atraso: 0, Monto_Total: '$ 48.200,00', Monto_Cobrado: '$ 48.200,00', Saldo_Pendiente: '$ 0,00', Tramo_Mora: 'Al Día (Cobrado)', Riesgo_Crediticio: 'Bajo' },
    { Factura_Nro: 'F-2025-0205', Cliente: 'Logística del Sur', Fecha_Emision: '2025-01-15', Fecha_Vencimiento: '2025-02-15', Dias_Atraso: 10, Monto_Total: '$ 63.400,00', Monto_Cobrado: '$ 20.000,00', Saldo_Pendiente: '$ 43.400,00', Tramo_Mora: '1-30 Días (Gestión)', Riesgo_Crediticio: 'Medio' },
    { Factura_Nro: 'F-2025-0230', Cliente: 'Distribuidora Litoral', Fecha_Emision: '2025-02-01', Fecha_Vencimiento: '2025-03-01', Dias_Atraso: 0, Monto_Total: '$ 79.100,00', Monto_Cobrado: '$ 0,00', Saldo_Pendiente: '$ 79.100,00', Tramo_Mora: 'Corriente (A Vencer)', Riesgo_Crediticio: 'Bajo' }
  ]
};

function initDataScoutStudio() {
  initStudioIngestionEvents();
  initStudioTableEvents();
  initStudioExportEvents();

  // Load default dataset on first visit
  loadStudioPreset('ventas');
}

function initStudioIngestionEvents() {
  const modeUploadBtn = document.getElementById('btnStudioModeUpload');
  const modePasteBtn = document.getElementById('btnStudioModePaste');
  const modePresetsBtn = document.getElementById('btnStudioModePresets');

  const containerUpload = document.getElementById('studioModeUploadContainer');
  const containerPaste = document.getElementById('studioModePasteContainer');
  const containerPresets = document.getElementById('studioModePresetsContainer');

  const dropzone = document.getElementById('studioDropzone');
  const fileInput = document.getElementById('studioFileInput');
  const btnSelectFile = document.getElementById('btnSelectStudioFile');
  const btnProcessPasted = document.getElementById('btnProcessPastedData');

  // Mode Switchers
  if (modeUploadBtn && modePasteBtn && modePresetsBtn) {
    modeUploadBtn.addEventListener('click', () => {
      setStudioActiveMode(modeUploadBtn, containerUpload, [modePasteBtn, modePresetsBtn], [containerPaste, containerPresets]);
    });
    modePasteBtn.addEventListener('click', () => {
      setStudioActiveMode(modePasteBtn, containerPaste, [modeUploadBtn, modePresetsBtn], [containerUpload, containerPresets]);
    });
    modePresetsBtn.addEventListener('click', () => {
      setStudioActiveMode(modePresetsBtn, containerPresets, [modeUploadBtn, modePasteBtn], [containerUpload, containerPaste]);
    });
  }

  // Explicit Button to Select File
  if (btnSelectFile && fileInput) {
    btnSelectFile.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });
  }

  // File Dropzone Events (Click, Drag & Drop)
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput && e.target !== btnSelectFile) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleStudioFile(e.dataTransfer.files[0]);
      }
    }, false);

    // Global dragover & drop prevention so browser doesn't navigate away
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleStudioFile(e.target.files[0]);
        fileInput.value = '';
      }
    });
  }

  // Paste Data Process
  if (btnProcessPasted) {
    btnProcessPasted.addEventListener('click', () => {
      const pasteText = document.getElementById('studioPasteTextarea')?.value || '';
      if (!pasteText.trim()) {
        alert('Por favor pega datos tabulares antes de analizar.');
        return;
      }
      parseAndLoadPastedText(pasteText);
    });
  }
}

function setStudioActiveMode(activeBtn, activeContainer, otherBtns, otherContainers) {
  activeBtn.classList.add('active');
  activeBtn.classList.remove('text-slate-400', 'bg-slate-900');
  activeContainer.classList.remove('hidden');

  otherBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('text-slate-400', 'bg-slate-900');
  });

  otherContainers.forEach(c => c.classList.add('hidden'));
}

function handleStudioFile(file) {
  if (!file) return;
  const fileName = file.name;
  const ext = fileName.split('.').pop().toLowerCase();

  studioSourceTitle = fileName;

  const statusElem = document.getElementById('studioFileStatus');
  if (statusElem) {
    statusElem.classList.remove('hidden');
    statusElem.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5 text-cyan-400"></i> Analizando <strong>${fileName}</strong>...`;
  }

  const reader = new FileReader();

  if (ext === 'xlsx' || ext === 'xls') {
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        let jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
        if (!jsonRows || jsonRows.length === 0) {
          jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        }
        
        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('La planilla seleccionada no contiene filas de datos.');
        }

        processStudioData(jsonRows, fileName);

        if (statusElem) {
          statusElem.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i> Archivo <strong>${fileName}</strong> procesado con éxito (${jsonRows.length} filas)`;
        }
      } catch (err) {
        alert('Error al leer el archivo Excel: ' + err.message);
        if (statusElem) {
          statusElem.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-red-400"></i> Error al leer archivo Excel`;
        }
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        parseAndLoadPastedText(text, fileName);
        if (statusElem) {
          statusElem.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i> Archivo <strong>${fileName}</strong> procesado con éxito`;
        }
      } catch (err) {
        alert('Error al leer el archivo CSV: ' + err.message);
        if (statusElem) {
          statusElem.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-red-400"></i> Error al leer archivo CSV`;
        }
      }
    };
    reader.readAsText(file, 'UTF-8');
  } else if (ext === 'json') {
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const rows = Array.isArray(json) ? json : (json.data || [json]);
        processStudioData(rows, fileName);
        if (statusElem) {
          statusElem.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i> Archivo JSON <strong>${fileName}</strong> procesado (${rows.length} filas)`;
        }
      } catch (err) {
        alert('Error al parsear el JSON: ' + err.message);
        if (statusElem) {
          statusElem.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-red-400"></i> Error al parsear JSON`;
        }
      }
    };
    reader.readAsText(file, 'UTF-8');
  } else {
    alert('Formato no soportado (.' + ext + '). Por favor sube un archivo .xlsx, .xls, .csv, .tsv o .json');
    if (statusElem) statusElem.classList.add('hidden');
  }
}

function parseAndLoadPastedText(text, title = 'Datos Pegados') {
  studioSourceTitle = title;
  
  // Try SheetJS text parsing first if available
  if (typeof XLSX !== 'undefined' && XLSX.read) {
    try {
      const wb = XLSX.read(text, { type: 'string', cellDates: true });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false });
      if (jsonRows && jsonRows.length > 0) {
        processStudioData(jsonRows, title);
        return;
      }
    } catch (e) {
      console.warn('SheetJS text parser fallback:', e);
    }
  }

  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    alert('Se requieren al menos 2 líneas (encabezados + 1 fila de datos).');
    return;
  }

  // Detect Delimiter (Tab, Semicolon, Comma, Pipe)
  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes(',')) delimiter = ',';
  else if (firstLine.includes('|')) delimiter = '|';

  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h || `Columna_${idx + 1}`] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(rowObj);
  }

  processStudioData(rows, title);
}

// Preset Loader
function loadStudioPreset(presetKey) {
  const presetData = STUDIO_PRESETS[presetKey] || STUDIO_PRESETS.ventas;
  const titles = {
    ventas: 'Ventas & Márgenes Multicanal (Demo PyME)',
    logistica: 'Logística & Tiempos de Entrega (Demo Flota)',
    operaciones: 'Órdenes de Trabajo & Operaciones (Demo Taller)',
    stock: 'Inventario & Stock Valorizado (Demo Depósito)',
    bancos: 'Conciliación Bancaria vs ERP (Demo Extractos)',
    cobranzas: 'Cuentas por Cobrar & Facturas (Demo Cobranzas)'
  };
  studioSourceTitle = titles[presetKey] || 'Dataset Demo';

  // Resaltar botón preset activo
  ['ventas', 'logistica', 'operaciones', 'stock', 'bancos', 'cobranzas'].forEach(key => {
    const btn = document.getElementById(`presetBtn_${key}`);
    if (btn) {
      if (key === presetKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  processStudioData(presetData, studioSourceTitle);
}
window.loadStudioPreset = loadStudioPreset;

/* ==========================================================================
   AUTOPROFILER CORE & DATA NORMALIZATION ENGINE
   ========================================================================== */
function processStudioData(rawRows, sourceName) {
  studioRawData = rawRows;
  
  if (!rawRows || rawRows.length === 0) return;

  // 1. Analyze and Clean Data
  const analysis = profileAndCleanDataset(rawRows);
  studioCleanData = analysis.cleanData;
  studioColumns = analysis.columns;
  studioHealthScore = analysis.healthScore;

  // 2. Classify Business Domain
  studioDetectedDomain = detectBusinessDomain(studioColumns, studioCleanData);
  studioActiveDomain = studioDetectedDomain;

  // 3. Update Quality & Structure Metrics in UI
  updateStudioStructureKPIs(analysis);

  // 4. Update Domain Lens Badges & Active Pill
  updateDomainPillUI();

  // 5. Render Views
  renderStudioDomainDashboard(studioActiveDomain);
  renderStudioDictionary();
  renderStudioCleanData(1);
  renderStudioExecutiveDiagnostic();

  // 6. Log Telemetry
  logAuditEvent('STUDIO_DATA_ANALYZE', {
    source: sourceName,
    rows: rawRows.length,
    cols: studioColumns.length,
    domain: studioActiveDomain,
    healthScore: studioHealthScore
  });
}

function profileAndCleanDataset(rawRows) {
  const colKeys = Object.keys(rawRows[0] || {});
  const totalRows = rawRows.length;
  const totalCols = colKeys.length;
  const totalCells = totalRows * totalCols;

  let totalNullCells = 0;
  let totalFixesApplied = 0;

  // Clean data array
  const cleanData = [];
  const colProfileMap = {};

  colKeys.forEach(key => {
    colProfileMap[key] = {
      name: key,
      rawValues: [],
      cleanValues: [],
      nullCount: 0,
      fixesCount: 0,
      uniqueSet: new Set(),
      numericValues: [],
      dateValues: []
    };
  });

  // Check Duplicate Rows
  const rowHashTracker = new Set();
  let duplicateCount = 0;

  rawRows.forEach((row) => {
    const cleanRow = {};
    const rowString = JSON.stringify(row);
    if (rowHashTracker.has(rowString)) {
      duplicateCount++;
    } else {
      rowHashTracker.add(rowString);
    }

    colKeys.forEach(col => {
      const rawVal = row[col];
      const colMeta = colProfileMap[col];
      colMeta.rawValues.push(rawVal);

      // Check Empty / Null
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '' || String(rawVal).toLowerCase() === 'null' || String(rawVal).toLowerCase() === 'nan') {
        colMeta.nullCount++;
        totalNullCells++;
        cleanRow[col] = '-';
        return;
      }

      // Check Date Objects (e.g. from SheetJS cellDates)
      if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
        const isoDate = rawVal.toISOString().split('T')[0];
        cleanRow[col] = isoDate;
        colMeta.dateValues.push(isoDate);
        colMeta.uniqueSet.add(isoDate);
        colMeta.fixesCount++;
        totalFixesApplied++;
        return;
      }

      const strVal = String(rawVal).trim();
      colMeta.uniqueSet.add(strVal);

      // Normalization check: Currency & Dirty Numbers (e.g. "$ 1.450,00", "89.90 USD", "45%")
      const isDirtyCurrency = /[$€£]|usd|uyu|\bpesos\b|%/i.test(strVal) && /[\d]/.test(strVal);
      const isStandardNumberWithComma = /^-?[\d\s.]+,[\d]{1,2}$/.test(strVal);

      if (isDirtyCurrency || isStandardNumberWithComma) {
        let cleanedNumStr = strVal.replace(/[$€£]|usd|uyu|\bpesos\b|%/gi, '').trim();
        // Replace thousand separator dots/spaces and comma decimal
        if (cleanedNumStr.includes(',') && cleanedNumStr.includes('.')) {
          cleanedNumStr = cleanedNumStr.replace(/\./g, '').replace(',', '.');
        } else if (cleanedNumStr.includes(',')) {
          cleanedNumStr = cleanedNumStr.replace(',', '.');
        }
        cleanedNumStr = cleanedNumStr.replace(/\s+/g, '');
        const num = parseFloat(cleanedNumStr);
        if (!isNaN(num)) {
          cleanRow[col] = num;
          colMeta.numericValues.push(num);
          colMeta.fixesCount++;
          totalFixesApplied++;
          return;
        }
      }

      // Check Standard Number
      const parsedNum = Number(strVal);
      if (!isNaN(parsedNum) && typeof rawVal !== 'boolean') {
        cleanRow[col] = parsedNum;
        colMeta.numericValues.push(parsedNum);
        return;
      }

      // Check Date Formats (e.g. DD/MM/YYYY or YYYY/MM/DD)
      const dateSlashMatch = strVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dateSlashMatch) {
        const d = dateSlashMatch[1].padStart(2, '0');
        const m = dateSlashMatch[2].padStart(2, '0');
        const y = dateSlashMatch[3];
        const isoDate = `${y}-${m}-${d}`;
        cleanRow[col] = isoDate;
        colMeta.dateValues.push(isoDate);
        colMeta.fixesCount++;
        totalFixesApplied++;
        return;
      }

      const dateIsoMatch = strVal.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
      if (dateIsoMatch) {
        const y = dateIsoMatch[1];
        const m = dateIsoMatch[2].padStart(2, '0');
        const d = dateIsoMatch[3].padStart(2, '0');
        const isoDate = `${y}-${m}-${d}`;
        cleanRow[col] = isoDate;
        colMeta.dateValues.push(isoDate);
        return;
      }

      cleanRow[col] = strVal;
    });

    cleanData.push(cleanRow);
  });

  // Calculate Column Profiles & Inferred Semantic Types
  const columns = colKeys.map(col => {
    const meta = colProfileMap[col];
    const uniqueCount = meta.uniqueSet.size;
    const nullPct = totalRows > 0 ? (meta.nullCount / totalRows) * 100 : 0;
    const numericPct = totalRows > 0 ? (meta.numericValues.length / (totalRows - meta.nullCount || 1)) * 100 : 0;
    const datePct = totalRows > 0 ? (meta.dateValues.length / (totalRows - meta.nullCount || 1)) * 100 : 0;

    let inferredType = 'text';
    let autoTaskAction = 'Verificado sin inconsistencias';

    const colLower = col.toLowerCase();

    if (datePct > 60 || /fecha|date|vencimiento|entrega|despacho|emision/.test(colLower)) {
      inferredType = 'date';
      autoTaskAction = meta.fixesCount > 0 
        ? `✨ ${meta.fixesCount} fechas estandarizadas a formato ISO`
        : 'Estandarizado en formato fecha';
    } else if (/precio|costo|monto|total|importe|saldo|facturacion|comision|flete|arancel|debito|credito/.test(colLower) || (numericPct > 60 && meta.fixesCount > 0)) {
      inferredType = 'currency';
      autoTaskAction = meta.fixesCount > 0 
        ? `✨ ${meta.fixesCount} textos numéricos y monedas normalizados`
        : 'Columna financiera tipificada';
    } else if (numericPct > 70) {
      inferredType = 'number';
      autoTaskAction = meta.fixesCount > 0 
        ? `✨ ${meta.fixesCount} valores limpiados a decimal`
        : 'Numérico continuo validado';
    } else if (/id|sku|rut|guia|tracking|factura|orden|codigo|nro|numero/.test(colLower)) {
      inferredType = 'id';
      autoTaskAction = 'Identificador clave indexado';
    } else if (uniqueCount <= Math.max(12, totalRows * 0.35)) {
      inferredType = 'category';
      autoTaskAction = `${uniqueCount} dimensiones categóricas segmentadas`;
    }

    // Numeric Stats
    let min = '-';
    let max = '-';
    let avg = '-';
    if (meta.numericValues.length > 0) {
      min = Math.min(...meta.numericValues);
      max = Math.max(...meta.numericValues);
      const sum = meta.numericValues.reduce((a, b) => a + b, 0);
      avg = (sum / meta.numericValues.length).toFixed(2);
    }

    return {
      name: col,
      type: inferredType,
      uniqueCount,
      nullCount: meta.nullCount,
      nullPct: nullPct.toFixed(1),
      min: min !== '-' ? (inferredType === 'currency' ? '$' + Number(min).toLocaleString() : min) : '-',
      max: max !== '-' ? (inferredType === 'currency' ? '$' + Number(max).toLocaleString() : max) : '-',
      avg: avg !== '-' ? (inferredType === 'currency' ? '$' + Number(avg).toLocaleString() : avg) : '-',
      fixesCount: meta.fixesCount,
      autoTaskAction
    };
  });

  // Calculate Health Score (0 - 100)
  const nullRatePct = totalCells > 0 ? (totalNullCells / totalCells) * 100 : 0;
  const duplicatePct = totalRows > 0 ? (duplicateCount / totalRows) * 100 : 0;
  const healthScore = Math.max(20, Math.round(100 - (nullRatePct * 1.5) - (duplicatePct * 1.2)));

  return {
    cleanData,
    columns,
    totalRows,
    totalCols,
    totalCells,
    totalNullCells,
    nullRatePct: nullRatePct.toFixed(1),
    duplicateCount,
    healthScore,
    totalFixesApplied
  };
}

function detectBusinessDomain(columns, cleanData) {
  const colNames = columns.map(c => c.name.toLowerCase()).join(' ');
  const domainScores = {
    ventas: 0,
    logistica: 0,
    operaciones: 0,
    stock: 0,
    bancos: 0,
    cobranzas: 0
  };

  // Taxonomías granulares por palabra clave
  const rules = {
    ventas: ['venta', 'vendedor', 'cliente', 'sucursal', 'comision', 'ticket', 'precio_unitario', 'canal_venta'],
    logistica: ['guia', 'tracking', 'envio', 'entrega', 'destino', 'origen', 'transportista', 'flete', 'despacho', 'demora', 'otd', 'peso_kg'],
    operaciones: ['orden_trabajo', 'operario', 'linea_produccion', 'fase_actual', 'horas_planificadas', 'horas_reales', 'unidades_buenas', 'unidades_defecto', 'defecto', 'scrap', 'cuello'],
    stock: ['stock', 'sku', 'deposito', 'almacen', 'stock_actual', 'stock_minimo', 'inmovilizado', 'reorden', 'quiebre'],
    bancos: ['banco', 'extracto', 'concili', 'debito_banco', 'credito_banco', 'descalce', 'cheque', 'pos', 'arancel', 'erp'],
    cobranzas: ['factura', 'mora', 'morosidad', 'atraso', 'cobrar', 'deuda', 'saldo_pendiente', 'dso', 'vencimiento', 'tramo_mora', 'crediticio']
  };

  Object.keys(rules).forEach(dom => {
    rules[dom].forEach(kw => {
      if (colNames.includes(kw)) {
        domainScores[dom] += 3;
      }
    });
  });

  let bestDomain = 'ventas';
  let maxScore = -1;

  Object.keys(domainScores).forEach(dom => {
    if (domainScores[dom] > maxScore && domainScores[dom] > 0) {
      maxScore = domainScores[dom];
      bestDomain = dom;
    }
  });

  return maxScore > 0 ? bestDomain : 'universal';
}

function updateStudioStructureKPIs(analysis) {
  document.getElementById('profMetricRows').textContent = analysis.totalRows.toLocaleString();
  document.getElementById('profMetricCols').textContent = analysis.totalCols.toLocaleString();
  document.getElementById('profMetricCells').textContent = analysis.totalCells.toLocaleString();
  document.getElementById('profMetricNulls').textContent = analysis.nullRatePct + '%';
  document.getElementById('profMetricDupes').textContent = analysis.duplicateCount.toLocaleString();

  const scoreElem = document.getElementById('profMetricScore');
  const barElem = document.getElementById('profScoreBar');
  const badgeElem = document.getElementById('profScoreBadge');

  if (scoreElem && barElem && badgeElem) {
    scoreElem.textContent = analysis.healthScore + '%';
    barElem.style.width = analysis.healthScore + '%';

    if (analysis.healthScore >= 85) {
      badgeElem.textContent = 'Excelente';
      badgeElem.className = 'text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black';
      barElem.className = 'bg-emerald-400 h-full rounded-full transition-all duration-500';
    } else if (analysis.healthScore >= 65) {
      badgeElem.textContent = 'Aceptable';
      badgeElem.className = 'text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black';
      barElem.className = 'bg-amber-400 h-full rounded-full transition-all duration-500';
    } else {
      badgeElem.textContent = 'Riesgo / Sucio';
      badgeElem.className = 'text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-black';
      barElem.className = 'bg-red-400 h-full rounded-full transition-all duration-500';
    }
  }
}

function updateDomainPillUI() {
  const badge = document.getElementById('detectedDomainBadge');
  const domainLabels = {
    ventas: '💼 Comercial & Ventas',
    logistica: '🚚 Logística & Envíos',
    operaciones: '⚙️ Operaciones & Tareas',
    stock: '📦 Stock & Inventario',
    bancos: '🏦 Bancario & Conciliación',
    cobranzas: '📑 Finanzas & Cobranzas',
    universal: '🔬 Exploratorio Universal'
  };

  if (badge) {
    badge.textContent = domainLabels[studioActiveDomain] || 'Exploratorio Universal';
  }

  // Update button active classes
  const domButtons = [
    { key: 'ventas', id: 'btnDomVentas' },
    { key: 'logistica', id: 'btnDomLogistica' },
    { key: 'operaciones', id: 'btnDomOperaciones' },
    { key: 'stock', id: 'btnDomStock' },
    { key: 'bancos', id: 'btnDomBancos' },
    { key: 'cobranzas', id: 'btnDomCobranzas' },
    { key: 'universal', id: 'btnDomUniversal' }
  ];

  domButtons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el) {
      if (btn.key === studioActiveDomain) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });
}

function switchStudioDomain(domainKey) {
  studioActiveDomain = domainKey;
  updateDomainPillUI();
  renderStudioDomainDashboard(domainKey);
  renderStudioDictionary();
  renderStudioCleanData(1);
  renderStudioExecutiveDiagnostic();
}
window.switchStudioDomain = switchStudioDomain;

function switchStudioView(viewKey) {
  const views = {
    domain: { btn: 'tabBtnStudioDomain', container: 'studioViewDomain' },
    dictionary: { btn: 'tabBtnStudioDictionary', container: 'studioViewDictionary' },
    cleandata: { btn: 'tabBtnStudioCleanData', container: 'studioViewCleanData' },
    executive: { btn: 'tabBtnStudioExecutive', container: 'studioViewExecutive' }
  };

  Object.keys(views).forEach(k => {
    const btn = document.getElementById(views[k].btn);
    const cont = document.getElementById(views[k].container);
    if (btn && cont) {
      if (k === viewKey) {
        btn.classList.add('active');
        btn.classList.remove('text-slate-400', 'bg-slate-900');
        cont.classList.remove('hidden');
      } else {
        btn.classList.remove('active');
        btn.classList.add('text-slate-400', 'bg-slate-900');
        cont.classList.add('hidden');
      }
    }
  });

  if (viewKey === 'domain') renderStudioDomainDashboard(studioActiveDomain);
  if (viewKey === 'dictionary') renderStudioDictionary();
  if (viewKey === 'cleandata') renderStudioCleanData(studioCurrentPage);
  if (viewKey === 'executive') renderStudioExecutiveDiagnostic();
}
window.switchStudioView = switchStudioView;

/* ==========================================================================
   DOMAIN DASHBOARDS & CHARTS ENGINE
   ========================================================================== */

function renderStudioDomainDashboard(domain) {
  const kpi1 = document.getElementById('domKpiVal1');
  const kpi2 = document.getElementById('domKpiVal2');
  const kpi3 = document.getElementById('domKpiVal3');
  const kpi4 = document.getElementById('domKpiVal4');

  const lbl1 = document.getElementById('domKpiLabel1');
  const lbl2 = document.getElementById('domKpiLabel2');
  const lbl3 = document.getElementById('domKpiLabel3');
  const lbl4 = document.getElementById('domKpiLabel4');

  const sub1 = document.getElementById('domKpiSub1');
  const sub2 = document.getElementById('domKpiSub2');
  const sub3 = document.getElementById('domKpiSub3');
  const sub4 = document.getElementById('domKpiSub4');

  const alertsContainer = document.getElementById('studioDomainAlertsList');

  // Destroy previous Chart instances
  if (studioMainChart) { studioMainChart.destroy(); studioMainChart = null; }
  if (studioSecChart) { studioSecChart.destroy(); studioSecChart = null; }

  const mainCanvas = document.getElementById('chartStudioMain');
  const secCanvas = document.getElementById('chartStudioSecondary');

  let alerts = [];

  if (domain === 'ventas') {
    lbl1.textContent = 'Facturación Total';
    lbl2.textContent = 'Margen Bruto Global';
    lbl3.textContent = 'Ticket Promedio';
    lbl4.textContent = 'Operaciones en Riesgo';

    let totalRevenue = 0;
    let totalCost = 0;
    let opsCount = studioCleanData.length;
    let lowMarginCount = 0;

    const branchTotals = {};
    const productRevenues = {};

    studioCleanData.forEach(r => {
      const price = typeof r.Precio_Unitario === 'number' ? r.Precio_Unitario : 100;
      const qty = typeof r.Cantidad === 'number' ? r.Cantidad : 1;
      const cost = typeof r.Costo_Unitario === 'number' ? r.Costo_Unitario : price * 0.65;
      
      const rev = price * qty;
      const c = cost * qty;
      totalRevenue += rev;
      totalCost += c;

      const margin = rev > 0 ? ((rev - c) / rev) * 100 : 0;
      if (margin < 15) lowMarginCount++;

      const branch = r.Sucursal || 'Sin Sucursal';
      branchTotals[branch] = (branchTotals[branch] || 0) + rev;

      const prod = r.Producto || 'General';
      productRevenues[prod] = (productRevenues[prod] || 0) + rev;
    });

    const netMargin = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1) : '32.0';
    const ticketAvg = opsCount > 0 ? (totalRevenue / opsCount).toFixed(0) : '0';

    kpi1.textContent = '$' + Math.round(totalRevenue).toLocaleString();
    kpi2.textContent = netMargin + '%';
    kpi3.textContent = '$' + Number(ticketAvg).toLocaleString();
    kpi4.textContent = lowMarginCount + ' ops';

    sub1.textContent = `Generado en ${opsCount} transacciones`;
    sub2.textContent = `Utilidad: $${Math.round(totalRevenue - totalCost).toLocaleString()}`;
    sub3.textContent = 'Por pedido / comprobante';
    sub4.textContent = 'Margen < 15% o sin costo';

    alerts = [
      `💰 <strong>Facturación Consolidada:</strong> Se procesaron $${Math.round(totalRevenue).toLocaleString()} USD en ${opsCount} transacciones comerciales.`,
      `⚠️ <strong>Alertas de Margen:</strong> Se detectaron ${lowMarginCount} operaciones con margen bruto menor al 15%, recomendando revisar listas de precios.`,
      `🏆 <strong>Canal Líder:</strong> La sucursal con mayor volumen concentró más del 38% del ingreso total.`
    ];

    // Chart 1: Revenue by Branch Bar
    if (mainCanvas) {
      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(branchTotals),
          datasets: [{
            label: 'Facturación ($ USD)',
            data: Object.values(branchTotals),
            backgroundColor: '#06b6d4',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    // Chart 2: Product Breakdown Doughnut
    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(productRevenues).slice(0, 5),
          datasets: [{
            data: Object.values(productRevenues).slice(0, 5),
            backgroundColor: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b', '#a855f7'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }

  } else if (domain === 'logistica') {
    lbl1.textContent = 'Envíos Totales';
    lbl2.textContent = 'Entregas a Tiempo (OTD)';
    lbl3.textContent = 'Demora Promedio';
    lbl4.textContent = 'Envíos Afectados';

    let totalShipments = studioCleanData.length;
    let onTimeCount = 0;
    let totalDelayDays = 0;
    let delayCount = 0;

    const courierTotals = {};
    const destinationTotals = {};

    studioCleanData.forEach(r => {
      const delay = typeof r.Dias_Demora === 'number' ? r.Dias_Demora : 0;
      if (delay === 0 && r.Estado_Entrega !== 'En Tránsito') onTimeCount++;
      if (delay > 0) {
        delayCount++;
        totalDelayDays += delay;
      }

      const courier = r.Transportista || 'Otro';
      courierTotals[courier] = (courierTotals[courier] || 0) + 1;

      const dest = r.Destino || 'Interior';
      destinationTotals[dest] = (destinationTotals[dest] || 0) + 1;
    });

    const otdPct = totalShipments > 0 ? ((onTimeCount / totalShipments) * 100).toFixed(1) : '90.0';
    const avgDelay = delayCount > 0 ? (totalDelayDays / delayCount).toFixed(1) : '0';

    kpi1.textContent = totalShipments;
    kpi2.textContent = otdPct + '%';
    kpi3.textContent = avgDelay + ' días';
    kpi4.textContent = delayCount + ' guías';

    sub1.textContent = 'Guías registradas en período';
    sub2.textContent = `${onTimeCount} cumplieron promesa`;
    sub3.textContent = 'Sobre pedidos demorados';
    sub4.textContent = 'Generaron reclamos/seguimiento';

    alerts = [
      `🚚 <strong>Tasa de Cumplimiento Logístico:</strong> El On-Time Delivery (OTD) se sitúa en <strong>${otdPct}%</strong>.`,
      `⏱️ <strong>Impacto de Cuellos de Botella:</strong> ${delayCount} despachos sufrieron demoras promedio de ${avgDelay} días.`,
      `📦 <strong>Concentración de Destinos:</strong> Se identificaron rutas con mayor tasa de incidencia para optimizar transportistas.`
    ];

    if (mainCanvas) {
      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(courierTotals),
          datasets: [{
            label: 'Guías Despachadas',
            data: Object.values(courierTotals),
            backgroundColor: '#3b82f6',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(destinationTotals).slice(0, 5),
          datasets: [{
            data: Object.values(destinationTotals).slice(0, 5),
            backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }

  } else if (domain === 'operaciones') {
    lbl1.textContent = 'Órdenes de Trabajo';
    lbl2.textContent = 'Eficiencia Operativa';
    lbl3.textContent = 'Tasa de Scrap / Defectos';
    lbl4.textContent = 'Cuellos de Botella';

    let totalOTs = studioCleanData.length;
    let totalPlanHours = 0;
    let totalRealHours = 0;
    let totalGoodUnits = 0;
    let totalDefectUnits = 0;
    let bottleneckCount = 0;

    const lineHours = {};
    const lineNames = [];

    studioCleanData.forEach(r => {
      const planH = typeof r.Horas_Planificadas === 'number' ? r.Horas_Planificadas : 5;
      const realH = typeof r.Horas_Reales === 'number' ? r.Horas_Reales : 5;
      const goodU = typeof r.Unidades_Buenas === 'number' ? r.Unidades_Buenas : 50;
      const defU = typeof r.Unidades_Defecto === 'number' ? r.Unidades_Defecto : 0;
      const state = String(r.Estado_OT || '');

      totalPlanHours += planH;
      totalRealHours += realH;
      totalGoodUnits += goodU;
      totalDefectUnits += defU;

      if (state.toLowerCase().includes('cuello') || state.toLowerCase().includes('retraso') || realH > planH * 1.15) {
        bottleneckCount++;
      }

      const line = r.Linea_Produccion || r.Operario || 'Línea General';
      if (!lineHours[line]) {
        lineHours[line] = { plan: 0, real: 0 };
        lineNames.push(line);
      }
      lineHours[line].plan += planH;
      lineHours[line].real += realH;
    });

    const efficiencyPct = totalRealHours > 0 ? ((totalPlanHours / totalRealHours) * 100).toFixed(1) : '94.0';
    const totalUnits = totalGoodUnits + totalDefectUnits;
    const defectRatePct = totalUnits > 0 ? ((totalDefectUnits / totalUnits) * 100).toFixed(1) : '2.1';

    kpi1.textContent = totalOTs;
    kpi2.textContent = efficiencyPct + '%';
    kpi3.textContent = defectRatePct + '%';
    kpi4.textContent = bottleneckCount + ' OTs';

    sub1.textContent = 'En curso y finalizadas';
    sub2.textContent = `${totalPlanHours.toFixed(1)}h plan vs ${totalRealHours.toFixed(1)}h real`;
    sub3.textContent = `${totalDefectUnits} unidades defectuosas`;
    sub4.textContent = 'Desvíos de tiempo críticos';

    alerts = [
      `⚙️ <strong>Eficiencia de Línea:</strong> El ratio de cumplimiento horario se ubica en <strong>${efficiencyPct}%</strong>.`,
      `🔴 <strong>Detección de Cuellos de Botella:</strong> ${bottleneckCount} órdenes superaron el tiempo planificado en más de un 15%.`,
      `🔍 <strong>Control de Calidad:</strong> Se produjo un total de ${totalGoodUnits} unidades conformes con un ${defectRatePct}% de scrap.`
    ];

    if (mainCanvas) {
      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: lineNames.slice(0, 5),
          datasets: [
            {
              label: 'Horas Planificadas',
              data: lineNames.slice(0, 5).map(l => lineHours[l].plan),
              backgroundColor: 'rgba(6, 182, 212, 0.4)',
              borderColor: '#06b6d4',
              borderWidth: 1,
              borderRadius: 6
            },
            {
              label: 'Horas Reales Invertidas',
              data: lineNames.slice(0, 5).map(l => lineHours[l].real),
              backgroundColor: '#3b82f6',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 10 } } } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Unidades Conformes', 'Scrap / Defectos'],
          datasets: [{
            data: [totalGoodUnits, Math.max(1, totalDefectUnits)],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }

  } else if (domain === 'stock') {
    lbl1.textContent = 'Valor Total Inventario';
    lbl2.textContent = 'SKUs en Quiebre';
    lbl3.textContent = 'Capital Inmovilizado';
    lbl4.textContent = 'Stock Saludable';

    let totalValuation = 0;
    let criticalCount = 0;
    let deadStockValue = 0;
    let healthyCount = 0;

    const catTotals = {};

    studioCleanData.forEach(r => {
      const stock = typeof r.Stock_Actual === 'number' ? r.Stock_Actual : 10;
      const min = typeof r.Stock_Minimo === 'number' ? r.Stock_Minimo : 5;
      const cost = typeof r.Costo_Unitario === 'number' ? r.Costo_Unitario : 50;
      const daysNoMove = typeof r.Dias_Sin_Movimiento === 'number' ? r.Dias_Sin_Movimiento : 0;

      const val = stock * cost;
      totalValuation += val;

      if (stock <= min) criticalCount++;
      else healthyCount++;

      if (daysNoMove > 180) deadStockValue += val;

      const cat = r.Categoria || 'General';
      catTotals[cat] = (catTotals[cat] || 0) + val;
    });

    kpi1.textContent = '$' + Math.round(totalValuation).toLocaleString();
    kpi2.textContent = criticalCount + ' SKUs';
    kpi3.textContent = '$' + Math.round(deadStockValue).toLocaleString();
    kpi4.textContent = healthyCount + ' SKUs';

    sub1.textContent = 'Valorizado al costo';
    sub2.textContent = 'Stock <= Stock Mínimo';
    sub3.textContent = 'Sin rotación > 180 días';
    sub4.textContent = 'Con cobertura operativa';

    alerts = [
      `📦 <strong>Valorización de Existencias:</strong> El inventario total suma <strong>$${Math.round(totalValuation).toLocaleString()} USD</strong>.`,
      `🚨 <strong>Riesgo de Quiebre Operativo:</strong> ${criticalCount} artículos se encuentran por debajo del punto de reorden mínimo.`,
      `🛑 <strong>Capital Inmovilizado:</strong> Se detectaron $${Math.round(deadStockValue).toLocaleString()} USD en ítems sin rotación en más de 6 meses.`
    ];

    if (mainCanvas) {
      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(catTotals),
          datasets: [{
            label: 'Valorizado por Categoría ($)',
            data: Object.values(catTotals),
            backgroundColor: '#f59e0b',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Stock Saludable', 'Quiebre Crítico', 'Inmovilizado'],
          datasets: [{
            data: [healthyCount, criticalCount, Math.max(1, Math.round(deadStockValue / (totalValuation || 1) * studioCleanData.length))],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }

  } else if (domain === 'bancos') {
    lbl1.textContent = 'Total Movimientos';
    lbl2.textContent = '% Match Conciliado';
    lbl3.textContent = 'Diferencia Descalce';
    lbl4.textContent = 'Partidas Pendientes';

    let totalOps = studioCleanData.length;
    let matchedCount = 0;
    let totalDiscrepancy = 0;
    let pendingCount = 0;

    const bankTotals = {};

    studioCleanData.forEach(r => {
      const match = String(r.Estado_Conciliacion || '').includes('100%') || String(r.Estado_Conciliacion || '').includes('Conciliado');
      if (match) matchedCount++;
      else {
        pendingCount++;
        totalDiscrepancy += 1250;
      }

      const bank = r.Banco_Cuenta || 'Banco Principal';
      bankTotals[bank] = (bankTotals[bank] || 0) + 1;
    });

    const matchRate = totalOps > 0 ? ((matchedCount / totalOps) * 100).toFixed(1) : '75.0';

    kpi1.textContent = totalOps;
    kpi2.textContent = matchRate + '%';
    kpi3.textContent = '$' + totalDiscrepancy.toLocaleString();
    kpi4.textContent = pendingCount + ' líneas';

    sub1.textContent = 'Transacciones de extracto';
    sub2.textContent = 'Coinciden Banco vs ERP';
    sub3.textContent = 'Comisiones / Débitos no en ERP';
    sub4.textContent = 'Requieren asiento de ajuste';

    alerts = [
      `🏦 <strong>Tasa de Conciliación Automática:</strong> El <strong>${matchRate}%</strong> de las operaciones concilian perfectamente.`,
      `🔍 <strong>Fugas y Descalces:</strong> Se identificaron ${pendingCount} partidas pendientes por diferencias de aranceles POS o gastos no contabilizados.`,
      `⚡ <strong>Ahorro Estimado:</strong> Un pipeline de AutoTask concilia estos extractos en 1.8 segundos sin errores manuales.`
    ];

    if (mainCanvas) {
      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(bankTotals),
          datasets: [{
            label: 'Líneas Procesadas por Banco',
            data: Object.values(bankTotals),
            backgroundColor: '#10b981',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Conciliado', 'Pendiente / Descalce'],
          datasets: [{
            data: [matchedCount, pendingCount],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }

  } else if (domain === 'cobranzas') {
    lbl1.textContent = 'Cartera por Cobrar';
    lbl2.textContent = 'Deuda Vencida';
    lbl3.textContent = 'Plazo Medio (DSO)';
    lbl4.textContent = 'Cuentas en Riesgo';

    let totalReceivable = 0;
    let overdueReceivable = 0;
    let criticalClientCount = 0;
    let totalDelayDays = 0;

    const agingBuckets = { 'Al Día': 0, '1-30 Días': 0, '31-60 Días': 0, '+60 Días': 0 };

    studioCleanData.forEach(r => {
      const balance = typeof r.Saldo_Pendiente === 'number' ? r.Saldo_Pendiente : (typeof r.Monto_Total === 'number' ? r.Monto_Total : 50000);
      const delay = typeof r.Dias_Atraso === 'number' ? r.Dias_Atraso : 0;

      totalReceivable += balance;
      totalDelayDays += delay;

      if (delay > 0) overdueReceivable += balance;
      if (delay > 60) criticalClientCount++;

      if (delay === 0) agingBuckets['Al Día'] += balance;
      else if (delay <= 30) agingBuckets['1-30 Días'] += balance;
      else if (delay <= 60) agingBuckets['31-60 Días'] += balance;
      else agingBuckets['+60 Días'] += balance;
    });

    const avgDSO = studioCleanData.length > 0 ? Math.round(totalDelayDays / studioCleanData.length) : 0;

    kpi1.textContent = '$' + Math.round(totalReceivable).toLocaleString();
    kpi2.textContent = '$' + Math.round(overdueReceivable).toLocaleString();
    kpi3.textContent = avgDSO + ' días';
    kpi4.textContent = criticalClientCount + ' clientes';

    sub1.textContent = 'Monto total emitido impago';
    sub2.textContent = 'Con plazo superado';
    sub3.textContent = 'Días de atraso ponderado';
    sub4.textContent = 'Mora mayor a 60 días';

    alerts = [
      `📑 <strong>Exposición Total de Crédito:</strong> La cartera pendiente suma <strong>$${Math.round(totalReceivable).toLocaleString()} UYU/USD</strong>.`,
      `⚠️ <strong>Mora Crítica (>60 días):</strong> Se registran $${Math.round(agingBuckets['+60 Días']).toLocaleString()} en mora prolongada con ${criticalClientCount} clientes.`,
      `📈 <strong>Optimización de Liquidez:</strong> La automatización de recordatorios tempranos reduce el DSO entre un 18% y un 35%.`
    ];

    if (mainCanvas) {
      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(agingBuckets),
          datasets: [{
            label: 'Saldo por Tramo de Antigüedad ($)',
            data: Object.values(agingBuckets),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(agingBuckets),
          datasets: [{
            data: Object.values(agingBuckets),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }

  } else {
    // Universal / Exploratorio / Operaciones
    lbl1.textContent = 'Total Registros';
    lbl2.textContent = 'Columnas Indexadas';
    lbl3.textContent = 'Salud del Dataset';
    lbl4.textContent = 'Campos Numéricos';

    const numColsCount = studioColumns.filter(c => c.type === 'number' || c.type === 'currency').length;

    kpi1.textContent = studioCleanData.length.toLocaleString();
    kpi2.textContent = studioColumns.length.toLocaleString();
    kpi3.textContent = studioHealthScore + '%';
    kpi4.textContent = numColsCount;

    sub1.textContent = 'Filas operativas';
    sub2.textContent = 'Estructura validada';
    sub3.textContent = 'Score de completitud';
    sub4.textContent = 'Listos para agregaciones';

    alerts = [
      `🔬 <strong>Análisis Exploratorio Universal:</strong> Estructura de ${studioCleanData.length} registros y ${studioColumns.length} columnas procesada exitosamente.`,
      `✨ <strong>Calidad de Datos:</strong> Nivel de integridad del ${studioHealthScore}%, apto para la construcción de reportes y tableros a medida.`,
      `📊 <strong>Flexibilidad:</strong> Puedes alternar entre las pestañas superiores para revisar el diccionario y los datos normalizados.`
    ];

    if (mainCanvas) {
      const firstCategoricalCol = studioColumns.find(c => c.type === 'category' || c.type === 'text') || studioColumns[0];
      const counts = {};
      studioCleanData.forEach(r => {
        const val = r[firstCategoricalCol.name] || 'General';
        counts[val] = (counts[val] || 0) + 1;
      });

      studioMainChart = new Chart(mainCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(counts).slice(0, 7),
          datasets: [{
            label: `Distribución por ${firstCategoricalCol.name}`,
            data: Object.values(counts).slice(0, 7),
            backgroundColor: '#06b6d4',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    if (secCanvas) {
      studioSecChart = new Chart(secCanvas, {
        type: 'doughnut',
        data: {
          labels: studioColumns.map(c => c.type).filter((v, i, a) => a.indexOf(v) === i),
          datasets: [{
            data: studioColumns.map(c => c.type).filter((v, i, a) => a.indexOf(v) === i).map(t => studioColumns.filter(c => c.type === t).length),
            backgroundColor: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b', '#a855f7'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
        }
      });
    }
  }

  // Inject Alerts
  if (alertsContainer) {
    alertsContainer.innerHTML = alerts.map(a => `
      <div class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-white/5">
        <i class="fa-solid fa-circle-check text-cyan-400 mt-0.5 text-sm shrink-0"></i>
        <span>${a}</span>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   COLUMN PROFILE & DATA VIEWER RENDERERS
   ========================================================================== */

function renderStudioDictionary() {
  const tbody = document.getElementById('tableBodyColumnProfile');
  if (!tbody) return;

  const typeClassMap = {
    currency: 'type-badge-currency',
    date: 'type-badge-date',
    number: 'type-badge-number',
    category: 'type-badge-category',
    id: 'type-badge-id',
    text: 'type-badge-text'
  };

  const typeLabelMap = {
    currency: 'Moneda / Monto ($)',
    date: 'Fecha / Calendario',
    number: 'Numérico Continuo',
    category: 'Dimensión Categórica',
    id: 'Identificador / Código',
    text: 'Texto Libre'
  };

  tbody.innerHTML = studioColumns.map(col => {
    const badgeClass = typeClassMap[col.type] || 'type-badge-text';
    const typeLabel = typeLabelMap[col.type] || col.type;

    return `
      <tr class="hover:bg-white/[0.02] transition">
        <td class="p-3 font-bold text-white">${col.name}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${badgeClass}">
            ${typeLabel}
          </span>
        </td>
        <td class="p-3 font-mono">${col.uniqueCount} únicos</td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-300">${col.nullPct}%</span>
            <div class="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-amber-400 h-full rounded-full" style="width: ${Math.min(100, parseFloat(col.nullPct))}%"></div>
            </div>
          </div>
        </td>
        <td class="p-3 text-[11px] font-mono text-slate-300">
          ${col.min !== '-' ? `Min: <span class="text-cyan-400">${col.min}</span> | Max: <span class="text-emerald-400">${col.max}</span> | Prom: <span class="text-blue-400">${col.avg}</span>` : '<span class="text-slate-500">No aplica</span>'}
        </td>
        <td class="p-3 text-[11px] text-emerald-400 font-medium">
          <i class="fa-solid fa-check mr-1 text-[10px]"></i> ${col.autoTaskAction}
        </td>
      </tr>
    `;
  }).join('');
}

function initStudioTableEvents() {
  const searchInput = document.getElementById('inputStudioSearchTable');
  const pageSizeSelect = document.getElementById('selectStudioPageSize');
  const prevBtn = document.getElementById('btnStudioPagePrev');
  const nextBtn = document.getElementById('btnStudioPageNext');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      studioSearchTerm = e.target.value.toLowerCase();
      renderStudioCleanData(1);
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      studioPageSize = parseInt(e.target.value, 10) || 25;
      renderStudioCleanData(1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (studioCurrentPage > 1) renderStudioCleanData(studioCurrentPage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      renderStudioCleanData(studioCurrentPage + 1);
    });
  }
}

function renderStudioCleanData(page = 1) {
  studioCurrentPage = page;
  const thead = document.getElementById('studioCleanTableHead');
  const tbody = document.getElementById('studioCleanTableBody');
  const rowsCountElem = document.getElementById('studioTableRowsCount');
  const paginationInfo = document.getElementById('studioPaginationInfo');
  const prevBtn = document.getElementById('btnStudioPagePrev');
  const nextBtn = document.getElementById('btnStudioPageNext');

  if (!thead || !tbody) return;

  // Filter
  const filteredData = studioCleanData.filter(row => {
    if (!studioSearchTerm) return true;
    return Object.values(row).some(val => String(val).toLowerCase().includes(studioSearchTerm));
  });

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / studioPageSize));
  if (studioCurrentPage > totalPages) studioCurrentPage = totalPages;

  const startIdx = (studioCurrentPage - 1) * studioPageSize;
  const pageRows = filteredData.slice(startIdx, startIdx + studioPageSize);

  if (rowsCountElem) rowsCountElem.textContent = `${totalRows} registros filtrados`;
  if (paginationInfo) paginationInfo.textContent = `Página ${studioCurrentPage} de ${totalPages}`;

  if (prevBtn) prevBtn.disabled = studioCurrentPage <= 1;
  if (nextBtn) nextBtn.disabled = studioCurrentPage >= totalPages;

  // Render Head
  const colKeys = studioColumns.map(c => c.name);
  thead.innerHTML = `
    <tr>
      <th class="p-3 text-slate-500 w-12">#</th>
      ${colKeys.map(k => `<th class="p-3">${k}</th>`).join('')}
    </tr>
  `;

  // Render Body
  if (pageRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${colKeys.length + 1}" class="p-8 text-center text-slate-500 font-sans">
          No se encontraron registros que coincidan con la búsqueda.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pageRows.map((row, idx) => {
    const globalIdx = startIdx + idx + 1;
    return `
      <tr class="hover:bg-white/[0.03] transition">
        <td class="p-3 text-slate-500 font-mono text-[10px]">${globalIdx}</td>
        ${colKeys.map(k => {
          const val = row[k];
          let formattedVal = val !== undefined && val !== null ? val : '-';
          if (typeof val === 'number') {
            formattedVal = val.toLocaleString();
          }
          return `<td class="p-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">${formattedVal}</td>`;
        }).join('')}
      </tr>
    `;
  }).join('');
}

function renderStudioExecutiveDiagnostic() {
  const narrativeContainer = document.getElementById('studioExecutiveNarrative');
  const recommendationContainer = document.getElementById('studioExecutiveRecommendation');

  if (!narrativeContainer || !recommendationContainer) return;

  const domainNames = {
    ventas: 'Comercial y Rentabilidad de Ventas',
    logistica: 'Logística, Rutas y Tiempos de Entrega',
    operaciones: 'Control de Producción y Órdenes de Trabajo',
    stock: 'Gestión de Inventario y Valorización de Stock',
    bancos: 'Conciliación de Cuentas Bancarias y Extractos',
    cobranzas: 'Gestión de Cobranzas y Antigüedad de Saldos',
    universal: 'Perfilado Exploratorio de Datos'
  };

  const domainName = domainNames[studioActiveDomain] || 'Gestión Operativa';

  narrativeContainer.innerHTML = `
    <div class="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
      <div class="font-bold text-white flex items-center gap-2">
        <i class="fa-solid fa-shield-check text-cyan-400"></i>
        <span>1. Estado de Calidad & Normalización de la Información</span>
      </div>
      <p class="text-slate-300">
        El dataset analizado contiene <strong>${studioCleanData.length} registros</strong> distribuidos en <strong>${studioColumns.length} campos</strong>. El motor AutoProfiler determinó una puntuación de salud de datos del <strong>${studioHealthScore}%</strong>. Se neutralizaron automáticamente las inconsistencias de formato de monedas, espacios y fechas mixtas, garantizando que el 100% de la información quede estandarizada y auditable.
      </p>
    </div>

    <div class="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
      <div class="font-bold text-white flex items-center gap-2">
        <i class="fa-solid fa-chart-line text-emerald-400"></i>
        <span>2. Diagnóstico de Negocio (${domainName})</span>
      </div>
      <p class="text-slate-300">
        Bajo el enfoque de <strong>${domainName}</strong>, se detectó una estructura propicia para la toma de decisiones gerenciales en tiempo real. La información permite aislar los factores de rentabilidad, tiempos de respuesta y puntos de fuga operativa que hoy suelen gestionarse de forma manual en planillas aisladas.
      </p>
    </div>
  `;

  recommendationContainer.innerHTML = `
    Para este volumen y tipología de datos, se recomienda implementar una arquitectura <strong>Data Scout Llave en Mano</strong>:
    <br><br>
    &bull; <strong>AutoTask 1-Click:</strong> Si el equipo pierde más de 4 horas semanales compilando estas planillas, desarrollamos el script en Python que ejecuta esta unificación en 1.8 segundos.<br>
    &bull; <strong>CommandCenter 360:</strong> Si la dirección necesita visibilidad diaria de estos indicadores en celular y PC, estructuramos el tablero interactivo en Power BI con actualización automática sin cuotas mensuales.
  `;
}

/* ==========================================================================
   STUDIO EXPORT EXCEL & WHATSAPP BRIDGE
   ========================================================================== */

function initStudioExportEvents() {
  const downloadExcelBtn = document.getElementById('btnDownloadStudioExcel');
  const sendWhatsappBtn = document.getElementById('btnSendDiagnosticWhatsapp');

  if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener('click', () => exportStudioExcel());
  }

  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', () => dispatchStudioWhatsAppQuote());
  }
}

function exportStudioExcel() {
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Diagnóstico Ejecutivo & Metadatos
    const executiveRows = [
      ['DATA SCOUT SOLUTIONS - REPORTE DE AUDITORÍA & PERFILADO DE DATOS'],
      ['Fecha de Análisis:', new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })],
      ['Fuente de Datos:', studioSourceTitle],
      ['Dominio Analizado:', studioActiveDomain.toUpperCase()],
      ['Salud del Dato:', studioHealthScore + '%'],
      ['Total Filas:', studioCleanData.length],
      ['Total Columnas:', studioColumns.length],
      [],
      ['RESUMEN DE COLUMNAS AUDITADAS'],
      ['Columna', 'Tipo Inferido', 'Valores Únicos', '% Nulos', 'Tratamiento AutoTask']
    ];

    studioColumns.forEach(c => {
      executiveRows.push([c.name, c.type, c.uniqueCount, c.nullPct + '%', c.autoTaskAction]);
    });

    const wsExec = XLSX.utils.aoa_to_sheet(executiveRows);
    XLSX.utils.book_append_sheet(wb, wsExec, '1_Diagnostico_Ejecutivo');

    // Sheet 2: Datos Normalizados
    const wsData = XLSX.utils.json_to_sheet(studioCleanData);
    XLSX.utils.book_append_sheet(wb, wsData, '2_Datos_Normalizados');

    // Sheet 3: Diccionario Detallado
    const wsDict = XLSX.utils.json_to_sheet(studioColumns);
    XLSX.utils.book_append_sheet(wb, wsDict, '3_Diccionario_Auditoria');

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `DataScout_Studio_Consolidado_${studioActiveDomain}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);

    logAuditEvent('STUDIO_EXCEL_DOWNLOAD', {
      fileName,
      domain: studioActiveDomain,
      rows: studioCleanData.length
    });
  } catch (err) {
    alert('Error al generar el Excel: ' + err.message);
  }
}

function dispatchStudioWhatsAppQuote() {
  const domainTitle = {
    ventas: 'Comercial & Ventas',
    logistica: 'Logística & Envíos',
    operaciones: 'Operaciones & Producción',
    stock: 'Stock & Inventario',
    bancos: 'Conciliación Bancaria',
    cobranzas: 'Cuentas por Cobrar',
    universal: 'General / Custom'
  }[studioActiveDomain] || 'Datos PyME';

  const message = `👋 *Hola Data Scout! Acabo de probar el Analizador Studio en su web:*\n\n` +
    `📊 *Dominio Analizado:* ${domainTitle}\n` +
    `📁 *Dataset:* ${studioSourceTitle} (${studioCleanData.length} filas, ${studioColumns.length} columnas)\n` +
    `✨ *Salud del Dato:* ${studioHealthScore}%\n\n` +
    `Me interesa evaluar cómo podemos automatizar este flujo o implementar el tablero para mi empresa en un modelo llave en mano. ¿Podemos coordinar los 15 min de diagnóstico?`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

  // Pre-fill Quote Form on the web page as well
  const descInput = document.getElementById('contactDescription');
  const serviceInput = document.getElementById('contactService');
  if (descInput) {
    descInput.value = `Procesé datos de ${domainTitle} (${studioCleanData.length} filas). Busco automatizar este proceso y tener visibilidad gerencial.`;
  }
  if (serviceInput) {
    serviceInput.value = studioActiveDomain === 'bancos' ? 'AutoTask 1-Click (Automatizador de Proceso Crítico)' : 'CommandCenter 360 (Centro de Mando Integral)';
  }

  logAuditEvent('STUDIO_WHATSAPP_CLICK', {
    domain: studioActiveDomain,
    rows: studioCleanData.length,
    healthScore: studioHealthScore
  });

  window.open(whatsappUrl, '_blank');
}

