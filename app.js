/**
 * Data Scout Solutions - Master Interactive Controller (NM Edition)
 * Controls: Dynamic Spotlights, FAQs Accordion, Chart.js Dashboard, AutoTask Simulator, SheetJS Real Excel Downloader & WhatsApp Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Mouse Spotlight Effect for Cards
  initSpotlightEffect();

  // 2. Interactive FAQ Accordion
  initFAQAccordion();

  // 3. Initialize Chart.js for CommandCenter 360
  initCommandCenterCharts();

  // 4. Tab Switcher for Demos (AutoTask vs CommandCenter)
  initProductDemoTabs();

  // 5. AutoTask 1-Click Python Simulator + Excel Download
  initAutoTaskSimulator();

  // 6. Raw Input Data Preview Toggle
  initRawPreviewToggle();

  // 7. WhatsApp Quote Form Integration
  initQuoteForm();

  // 8. Theme Toggle & Mobile Nav
  initThemeAndNav();
});

/* ==========================================================================
   1. DYNAMIC MOUSE SPOTLIGHT EFFECT
   ========================================================================= */
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
   2. FAQ ACCORDION
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
   3. COMMANDCENTER 360 CHARTS (POWER BI STYLE)
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
   4. DEMO TABS (AUTOTASK VS COMMANDCENTER)
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
   5. AUTOTASK 1-CLICK SIMULATOR + SHEETJS REAL DOWNLOAD
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
   6. RAW PREVIEW TABLE TOGGLE
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
window.selectProductQuote = function(productName) {
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
};

/* ==========================================================================
   7. WHATSAPP QUOTE FORM INTEGRATION (URUGUAY: +598 91 802 402)
   ========================================================================== */
function initQuoteForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  // NÚMERO OFICIAL DE WHATSAPP (URUGUAY)
  const WHATSAPP_PHONE = '59891802402';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const industry = document.getElementById('contactIndustry').value.trim() || 'No especificado';
    const service = document.getElementById('contactService').value;
    const description = document.getElementById('contactDescription').value.trim();

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
   8. THEME TOGGLE & MOBILE NAV
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
