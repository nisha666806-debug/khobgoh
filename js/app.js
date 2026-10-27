// Khobgoh Main Application Controller v2.2
import { store } from "./store.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderStudents } from "./views/students.js";
import { renderRooms } from "./views/rooms.js";
import { renderAttendance } from "./views/attendance.js";
import { renderActivities } from "./views/activities.js";
import { renderViolations } from "./views/violations.js";
import { renderCleanliness } from "./views/cleanliness.js";
import { renderRoster } from "./views/roster.js";
import { renderTea } from "./views/tea.js";
import { renderSettings } from "./views/settings.js";

// Toast notifications
export function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Modal helper: Closes smoothly when clicking the backdrop
export function openModal(title, bodyHtml, footerHtml = "") {
  const backdrop = document.getElementById("modal-backdrop");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalFooter = document.getElementById("modal-footer");

  if (!backdrop) return;

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modalFooter.innerHTML = footerHtml;
  backdrop.style.display = "flex";
}

export function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (backdrop) backdrop.style.display = "none";
}

// Global PWA prompt holder
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById("pwa-install-banner");
  if (banner) banner.style.display = "flex";
});

// Render Shell and Page View
function renderApp() {
  const state = store.state;
  const t = (k) => store.t(k);
  const root = document.getElementById("app-root");
  if (!root) return;

  // Apply theme
  document.documentElement.setAttribute("data-theme", state.theme);

  const roleLabels = {
    manager: t('role_manager'),
    head: t('role_head'),
    supervisor: t('role_supervisor'),
    student: t('role_student')
  };

  const currentRoleLabel = roleLabels[state.activeRole] || t('role_manager');

  root.innerHTML = `
    <div id="app-layout">
      <!-- Sidebar Overlay for mobile -->
      <div id="sidebar-overlay" class="sidebar-overlay" style="display:none;" onclick="window.khobgoh.toggleMobileSidebar()"></div>

      <!-- Left Sidebar -->
      <aside class="sidebar" id="sidebar">
        <!-- Brand Header: Clicking returns to Dashboard (Requirement 1) -->
        <div class="brand" onclick="window.khobgoh.navigate('dashboard')" style="cursor:pointer;" title="Ба саҳифаи асосӣ (Dashboard)">
          <div class="brand-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <div class="brand-title">${t('brand_title')}</div>
            <div class="brand-subtitle">${t('brand_subtitle')}</div>
          </div>
        </div>

        <nav class="nav-links">
          <button class="nav-link ${state.currentPage === 'dashboard' ? 'active' : ''}" onclick="window.khobgoh.navigate('dashboard')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            ${t('nav_dashboard')}
          </button>

          <button class="nav-link ${state.currentPage === 'students' ? 'active' : ''}" onclick="window.khobgoh.navigate('students')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${t('nav_students')}
            <span class="badge">${state.students.length}</span>
          </button>

          <button class="nav-link ${state.currentPage === 'rooms' ? 'active' : ''}" onclick="window.khobgoh.navigate('rooms')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7h18v10H3z"/><path d="M6 17v4"/><path d="M18 17v4"/></svg>
            ${t('nav_rooms')}
          </button>

          <button class="nav-link ${state.currentPage === 'attendance' ? 'active' : ''}" onclick="window.khobgoh.navigate('attendance')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            ${t('nav_attendance')}
          </button>

          <button class="nav-link ${state.currentPage === 'activities' ? 'active' : ''}" onclick="window.khobgoh.navigate('activities')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${t('nav_activities')}
          </button>

          <button class="nav-link ${state.currentPage === 'violations' ? 'active' : ''}" onclick="window.khobgoh.navigate('violations')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ${t('nav_violations')}
            ${state.violations.filter(v => v.status === 'pending').length > 0 ? `<span class="badge" style="background:#fee2e2; color:#b91c1c;">${state.violations.filter(v => v.status === 'pending').length}</span>` : ''}
          </button>

          <button class="nav-link ${state.currentPage === 'cleanliness' ? 'active' : ''}" onclick="window.khobgoh.navigate('cleanliness')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
            ${t('nav_cleanliness')}
          </button>

          <button class="nav-link ${state.currentPage === 'roster' ? 'active' : ''}" onclick="window.khobgoh.navigate('roster')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            ${t('nav_roster')}
          </button>

          <button class="nav-link ${state.currentPage === 'tea' ? 'active' : ''}" onclick="window.khobgoh.navigate('tea')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            ${t('nav_tea')}
          </button>

          <button class="nav-link ${state.currentPage === 'settings' ? 'active' : ''}" onclick="window.khobgoh.navigate('settings')">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            ${t('nav_settings')}
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile-card">
            <div class="user-avatar">${currentRoleLabel[0]}</div>
            <div class="user-info">
              <div class="user-name">${currentRoleLabel}</div>
              <div class="user-role-badge">Ҳолати фаъол</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Topbar: Logo / Title also returns to Dashboard on click (Requirement 1) -->
        <header class="topbar">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-secondary btn-sm" id="btn-toggle-menu" onclick="window.khobgoh.toggleMobileSidebar()" style="display:none;">
              ☰
            </button>
            <div onclick="window.khobgoh.navigate('dashboard')" style="cursor:pointer; display:flex; align-items:center; gap:8px;" title="Баргаштан ба Dashboard">
              <img src="assets/dormitory-logo.png" style="width:28px; height:28px; border-radius:6px;">
              <span style="font-weight:800; font-size:15px; color:var(--text-main);">Хобгоҳ</span>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:10px;">
            <!-- Language Quick Switcher -->
            <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.toggleLanguage()" title="Ивази забон (Language)">
              🌐 ${state.lang.toUpperCase()}
            </button>

            <!-- Theme Quick Switcher -->
            <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.toggleTheme()" title="Рӯшан / Торик (Theme)">
              ${state.theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        <!-- Dynamic Page View -->
        <div id="view-container">
          ${renderCurrentPageView(state.currentPage)}
        </div>
      </main>
    </div>
  `;

  // Responsive check
  if (window.innerWidth <= 860) {
    const menuBtn = document.getElementById("btn-toggle-menu");
    if (menuBtn) menuBtn.style.display = "inline-flex";
  }
}

function renderCurrentPageView(page) {
  switch (page) {
    case "dashboard": return renderDashboard();
    case "students": return renderStudents();
    case "rooms": return renderRooms();
    case "attendance": return renderAttendance();
    case "activities": return renderActivities();
    case "violations": return renderViolations();
    case "cleanliness": return renderCleanliness();
    case "roster": return renderRoster();
    case "tea": return renderTea();
    case "settings": return renderSettings();
    default: return renderDashboard();
  }
}

// Global actions exposed on window.khobgoh
window.khobgoh = {
  navigate(page) {
    store.setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.style.display = "none";
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar && overlay) {
      const isOpen = sidebar.classList.toggle("open");
      overlay.style.display = isOpen ? "block" : "none";
    }
  },

  toggleTheme() {
    const next = store.state.theme === "light" ? "dark" : "light";
    store.setTheme(next);
  },

  changeTheme(theme) {
    store.setTheme(theme);
  },

  toggleLanguage() {
    const next = store.state.lang === "tg" ? "en" : "tg";
    store.setLang(next);
    showToast(next === 'tg' ? "Забон ба Тоҷикӣ иваз карда шуд" : "Language switched to English", "info");
  },

  changeLanguage(lang) {
    store.setLang(lang);
  },

  changeRole(role) {
    store.setRole(role);
    showToast(`Нақш ба «${role}» иваз шуд!`, "info");
  },

  resetToDemo() {
    store.resetToDemo();
    showToast("Ҳамаи додаҳо ба ҳолати намунавӣ барқарор шуданд!", "success");
  },

  exportJsonData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(store.exportData());
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `khobgoh_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Нусхаи эҳтиётӣ бо муваффақият боргирӣ шуд!", "success");
  },

  importJsonData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (store.importData(content)) {
        showToast("Додаҳо бо муваффақият ворид карда шуданд!", "success");
      } else {
        showToast("Хатогӣ дар воридоти файл. Формат нодуруст аст.", "error");
      }
    };
    reader.readAsText(file);
  },

  // PWA Install prompt trigger
  async promptPWAInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        showToast("Барнома бо муваффақият дар экрани шумо насб карда мешавад!", "success");
      }
      deferredPrompt = null;
    } else {
      // Guide user
      alert("Барои насби барнома дар телефон:\n1. Дар браузери Chrome/Safari тугмаи менюи се нуқтаро (ё тугмаи Поделиться) пахш намоед.\n2. «Добавить на главный экран» (Add to Home screen)-ро интихоб кунед.");
    }
  },

  // Activities handlers
  changeActDay(day) {
    window.khobgoh.selectedActDay = day;
    renderApp();
  },

  changeActClass(cls) {
    window.khobgoh.selectedActClass = cls;
    renderApp();
  },

  openAddActivityModal() {
    if (!store.canManageActivities()) return;

    const days = [
      { key: "mon", label: "Душанбе" },
      { key: "tue", label: "Сешанбе" },
      { key: "wed", label: "Чоршанбе" },
      { key: "thu", label: "Панҷшанбе" },
      { key: "fri", label: "Ҷумъа" },
      { key: "sat", label: "Шанбе" },
      { key: "sun", label: "Якшанбе" }
    ];

    const body = `
      <form id="addActForm" onsubmit="window.khobgoh.submitNewActivity(event)">
        <div class="form-group">
          <label class="form-label">Рӯзи ҳафта</label>
          <select id="actDay" class="form-control">
            ${days.map(d => `<option value="${d.key}">${d.label}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Синф / Гурӯҳ</label>
          <select id="actClass" class="form-control">
            <option value="Синфи 8">Синфи 8</option>
            <option value="Синфи 9">Синфи 9</option>
            <option value="Синфи 10">Синфи 10</option>
            <option value="Синфи 11">Синфи 11</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Вақти гузаронидан (масалан: 16:00 - 17:30)</label>
          <input type="text" id="actTime" class="form-control" required placeholder="15:00 - 16:30">
        </div>

        <div class="form-group">
          <label class="form-label">Номи фаъолият / Дарс</label>
          <input type="text" id="actName" class="form-control" required placeholder="Масалан: Тайёрии вазифаи хонагӣ, Китобхонӣ...">
        </div>

        <div class="form-group">
          <label class="form-label">Макон (Ҷойгиршавӣ)</label>
          <input type="text" id="actLocation" class="form-control" placeholder="Китобхона, Майдончаи варзишӣ...">
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="document.getElementById('addActForm').requestSubmit()">Сабт кардан</button>
    `;

    openModal("Иловаи фаъолият ба ҷадвал", body, footer);
  },

  submitNewActivity(e) {
    e.preventDefault();
    const day = document.getElementById("actDay")?.value;
    const cls = document.getElementById("actClass")?.value;
    const time = document.getElementById("actTime")?.value.trim();
    const activity = document.getElementById("actName")?.value.trim();
    const location = document.getElementById("actLocation")?.value.trim();

    if (!day || !cls || !time || !activity) return;

    store.addActivity({ day, class: cls, time, activity, location });
    closeModal();
    showToast("Фаъолияти нав бо муваффақият илова шуд!", "success");
  },

  deleteActivity(id) {
    if (!store.canManageActivities()) return;
    if (confirm("Оё ин фаъолиятро аз ҷадвал нест кардан мехоҳед?")) {
      store.deleteActivity(id);
      showToast("Фаъолият аз ҷадвал хориҷ шуд!", "info");
    }
  },

  // Room Leader handler
  openSetRoomLeaderModal(roomId) {
    if (!store.canManageStudents()) return;
    const roomStudents = store.state.students.filter(s => s.room === roomId);
    const currentLeaderId = store.state.roomLeaders[roomId];

    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби Сардори Ҳуҷраи ${roomId}:</label>
        <select id="roomLeaderSelect" class="form-control">
          ${roomStudents.map(s => `
            <option value="${s.id}" ${currentLeaderId === s.id ? 'selected' : ''}>
              ${s.name} (${s.course}, Ҷойи №${s.bed})
            </option>
          `).join('')}
        </select>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitSetRoomLeader('${roomId}')">Таъин кардан</button>
    `;

    openModal(`Таъин кардани Сардори Ҳуҷраи ${roomId}`, body, footer);
  },

  submitSetRoomLeader(roomId) {
    const studentId = document.getElementById("roomLeaderSelect")?.value;
    if (!studentId) return;

    store.setRoomLeader(roomId, studentId);
    closeModal();
    const student = store.state.students.find(s => s.id === studentId);
    showToast(`${student?.name} сардори Ҳуҷраи ${roomId} таъин шуд!`, "success");
  },

  // Supervisor quarters assignment
  openAssignSupervisorModal() {
    if (!store.canManageStudents()) return;
    const supervisors = store.state.supervisors;
    const supervisorRooms = store.state.rooms.filter(r => r.type === 'supervisor');

    const body = `
      <div class="form-group">
        <label class="form-label">Мураббӣ</label>
        <select id="assignSupSelect" class="form-control">
          ${supervisors.map(s => `<option value="${s.id}">${s.name} (${s.phone})</option>`).join('')}
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Ҳуҷра</label>
          <select id="assignSupRoom" class="form-control">
            ${supervisorRooms.map(r => `<option value="${r.id}">${r.name} (4 ҷойӣ)</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ҷой (1-4)</label>
          <input type="number" id="assignSupBed" min="1" max="4" value="1" class="form-control">
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitAssignSupervisor()">Таъин кардан</button>
    `;

    openModal("Таъин кардани мураббӣ ба ҳуҷра", body, footer);
  },

  submitAssignSupervisor() {
    const supId = document.getElementById("assignSupSelect")?.value;
    const roomId = document.getElementById("assignSupRoom")?.value;
    const bedNum = document.getElementById("assignSupBed")?.value;

    if (!supId || !roomId || !bedNum) return;

    store.assignSupervisor(supId, roomId, bedNum);
    closeModal();
    showToast("Мураббӣ ба ҳуҷра таъин шуд!", "success");
  },

  // Cleanliness Inspector
  openSetInspectorModal() {
    if (!store.canManageStudents()) return;
    const supervisors = store.state.supervisors;

    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби масъули тозагӣ:</label>
        <select id="inspectorSelect" class="form-control">
          ${supervisors.map(s => `
            <option value="${s.id}" ${store.state.cleanlinessInspectorId === s.id ? 'selected' : ''}>
              ${s.name} (${s.phone})
            </option>
          `).join('')}
        </select>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitSetInspector()">Тасдиқ</button>
    `;

    openModal("Таъин кардани масъули озмуни тозагӣ", body, footer);
  },

  submitSetInspector() {
    const id = document.getElementById("inspectorSelect")?.value;
    if (!id) return;
    store.setCleanlinessInspector(id);
    closeModal();
    const sup = store.state.supervisors.find(s => s.id === id);
    showToast(`${sup?.name} масъули тозагӣ таъин шуд!`, "success");
  },

  setCleanlinessInspector(id) {
    store.setCleanlinessInspector(id);
    showToast("Масъули тозагӣ сабт шуд!", "success");
  },

  // Students filtering
  filterStudents() {
    const search = document.getElementById("studentSearchInput")?.value.toLowerCase().trim() || "";
    const room = document.getElementById("studentRoomFilter")?.value || "";
    const status = document.getElementById("studentStatusFilter")?.value || "";

    const rows = document.querySelectorAll("#studentsTable tbody tr");
    rows.forEach(row => {
      const name = row.getAttribute("data-name") || "";
      const sid = row.getAttribute("data-id") || "";
      const sroom = row.getAttribute("data-room") || "";
      const sstatus = row.getAttribute("data-status") || "";

      const matchesSearch = !search || name.includes(search) || sid.includes(search);
      const matchesRoom = !room || sroom === room;
      const matchesStatus = !status || sstatus === status;

      row.style.display = matchesSearch && matchesRoom && matchesStatus ? "" : "none";
    });
  },

  // Modals for Students
  openAddStudentModal() {
    if (!store.canManageStudents()) {
      showToast("Танҳо Мудир ё Сармураббӣ метавонанд донишҷӯёнро дохил кунанд.", "error");
      return;
    }

    const rooms = store.state.rooms.filter(r => r.type === 'student');
    const t = (k) => store.t(k);

    const body = `
      <form id="addStudentForm" onsubmit="window.khobgoh.submitNewStudent(event)">
        <div class="form-group">
          <label class="form-label">${t('students_col_name')} *</label>
          <input type="text" id="newStdName" class="form-control" required placeholder="Масалан: Ҷамшед Раҳимов">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">${t('students_col_room')} *</label>
            <select id="newStdRoom" class="form-control" required>
              ${rooms.map(r => `<option value="${r.id}">${r.name} (${r.capacity} ҷойӣ)</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${t('students_col_bed')} (1-8) *</label>
            <input type="number" id="newStdBed" min="1" max="8" value="1" class="form-control" required>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">${t('students_col_course')}</label>
            <input type="text" id="newStdCourse" class="form-control" placeholder="Синфи 10-А">
          </div>

          <div class="form-group">
            <label class="form-label">${t('students_col_phone')}</label>
            <input type="text" id="newStdPhone" class="form-control" placeholder="+992 900 00 00 00">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ному рақами волидайн (Guardian)</label>
          <input type="text" id="newStdGuardian" class="form-control" placeholder="Падар/Модар: +992...">
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">${t('cancel')}</button>
      <button class="btn btn-primary" onclick="document.getElementById('addStudentForm').requestSubmit()">${t('save')}</button>
    `;

    openModal(t('students_btn_add'), body, footer);
  },

  submitNewStudent(e) {
    e.preventDefault();
    const name = document.getElementById("newStdName")?.value.trim();
    const room = document.getElementById("newStdRoom")?.value;
    const bed = document.getElementById("newStdBed")?.value;
    const course = document.getElementById("newStdCourse")?.value.trim();
    const phone = document.getElementById("newStdPhone")?.value.trim();
    const guardian = document.getElementById("newStdGuardian")?.value.trim();

    if (!name || !room || !bed) return;

    store.addStudent({ name, room, bed, course, phone, guardian });
    closeModal();
    showToast(`Донишҷӯ ${name} бо муваффақият сабт шуд!`, "success");
  },

  openAssignBedModal(roomId, bedNum) {
    if (!store.canManageStudents()) {
      showToast("Танҳо Мудир ё Сармураббӣ метавонанд ҷойро таъин кунанд.", "error");
      return;
    }
    const unassigned = store.state.students.filter(s => s.room !== roomId || Number(s.bed) !== bedNum);
    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби донишҷӯ барои Ҳуҷраи ${roomId}, Ҷойи №${bedNum}:</label>
        <select id="assignStudentSelect" class="form-control">
          ${unassigned.map(s => `<option value="${s.id}">${s.name} (${s.room ? 'Ҳуҷраи ' + s.room : 'Бе ҷой'})</option>`).join('')}
        </select>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitAssignBed('${roomId}', ${bedNum})">Таъин кардан</button>
    `;

    openModal(`Таъин кардани ҷой (Ҳуҷраи ${roomId})`, body, footer);
  },

  submitAssignBed(roomId, bedNum) {
    const studentId = document.getElementById("assignStudentSelect")?.value;
    if (!studentId) return;

    store.updateStudent(studentId, { room: roomId, bed: bedNum, status: "Active" });
    closeModal();
    showToast(`Ҷойи №${bedNum} ба донишҷӯ бо муваффақият таъин шуд!`, "success");
  },

  deleteStudent(id) {
    const s = store.state.students.find(x => x.id === id);
    if (!s) return;
    if (confirm(`Оё мутмаин ҳастед, ки ${s.name}-ро хориҷ кардан мехоҳед?`)) {
      try {
        store.deleteStudent(id);
        showToast(`${s.name} аз рӯйхат хориҷ карда шуд!`, "info");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  },

  editStudent(id) {
    if (!store.canManageStudents()) return;
    const s = store.state.students.find(x => x.id === id);
    if (!s) return;

    const body = `
      <div class="form-group">
        <label class="form-label">Ному насаб</label>
        <input type="text" id="editStdName" class="form-control" value="${s.name}">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Ҳуҷра</label>
          <input type="text" id="editStdRoom" class="form-control" value="${s.room}">
        </div>
        <div class="form-group">
          <label class="form-label">Ҷой (Bed)</label>
          <input type="number" id="editStdBed" class="form-control" value="${s.bed}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Курс / Синф</label>
        <input type="text" id="editStdCourse" class="form-control" value="${s.course || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Телефон</label>
        <input type="text" id="editStdPhone" class="form-control" value="${s.phone || ''}">
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.saveStudentEdits('${s.id}')">Сабт кардан</button>
    `;

    openModal("Таҳрири маълумоти донишҷӯ", body, footer);
  },

  saveStudentEdits(id) {
    const name = document.getElementById("editStdName")?.value.trim();
    const room = document.getElementById("editStdRoom")?.value.trim();
    const bed = Number(document.getElementById("editStdBed")?.value);
    const course = document.getElementById("editStdCourse")?.value.trim();
    const phone = document.getElementById("editStdPhone")?.value.trim();

    store.updateStudent(id, { name, room, bed, course, phone });
    closeModal();
    showToast("Тағйирот сабт шуд!", "success");
  },

  viewStudentPass(id) {
    const s = store.state.students.find(x => x.id === id);
    if (!s) return;
    const isLeader = store.state.roomLeaders[s.room] === s.id;

    const body = `
      <div id="studentPassCard" style="border:2px solid var(--emerald-600); border-radius:var(--radius-lg); padding:20px; background:#fff; color:#0f172a; box-shadow:var(--shadow-md);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--emerald-600); padding-bottom:12px; margin-bottom:16px;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--emerald-800);">КОРТИ ХОБГОҲИ ДОНИШҶӮ</h3>
            <div style="font-size:11px; color:#64748b;">DORMITORY RESIDENT PASS</div>
          </div>
          <div style="font-family:var(--font-mono); font-weight:800; color:var(--emerald-700); font-size:14px;">${s.studentId}</div>
        </div>

        <div style="display:flex; gap:18px; align-items:center;">
          <div style="width:72px; height:80px; background:#e2e8f0; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:28px; border:1px solid #cbd5e1;">
            👤
          </div>
          <div style="flex:1;">
            <h2 style="font-size:18px; font-weight:800; margin:0 0 4px 0; display:flex; align-items:center; gap:6px;">
              <span>${s.name}</span>
              ${isLeader ? `<span style="font-size:13px;" title="Сардори ҳуҷра">👑 Сардори ҳуҷра</span>` : ''}
            </h2>
            <div style="font-size:13px; color:#475569; margin-bottom:4px;"><b>Синф/Курс:</b> ${s.course}</div>
            <div style="font-size:13px; color:#475569; margin-bottom:4px;"><b>Ҳуҷра:</b> №${s.room} • <b>Кат (Ҷой):</b> №${s.bed}</div>
            <div style="font-size:13px; color:#475569;"><b>Санаи қабул:</b> ${s.admissionDate || '2024-09-01'}</div>
          </div>
        </div>

        <div style="margin-top:16px; padding-top:12px; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; font-size:11px; color:#64748b;">
          <div>Тамос: ${s.phone || '+992 000 00 00'}</div>
          <div>Имзои мудир: ____________</div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Пӯшидан</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Чоп кардан (Print)</button>
    `;

    openModal("Шаҳодатномаи истиқоматкунанда", body, footer);
  },

  // Attendance
  changeAttDate(date) {
    window.khobgoh.selectedAttDate = date;
    renderApp();
  },

  setAttStatus(date, studentId, status) {
    store.setAttendance(date, studentId, status);
    renderApp();
  },

  markAllPresent(date) {
    store.markAllPresent(date);
    showToast("Ҳамаи донишҷӯён «Ҳаст» сабт шуданд!", "success");
    renderApp();
  },

  // Violations: ALL supervisors have access to ALL students (Requirement 9)
  openAddViolationModal() {
    const students = store.state.students;
    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби донишҷӯ (аз ҳамаи ҳуҷраҳо)</label>
        <select id="violStudentSelect" class="form-control">
          ${students.map(s => `<option value="${s.id}">${s.name} (Ҳуҷраи ${s.room}, Ҷойи №${s.bed} - ${s.course})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Сабаб ё шарҳи ҳодиса</label>
        <textarea id="violReason" class="form-control" placeholder="Масалан: Дер омадан ба хобгоҳ, вайрон кардани интизом..."></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Дараҷаи ҷиддият (Severity)</label>
        <select id="violSeverity" class="form-control">
          <option value="low">Огоҳӣ (Low)</option>
          <option value="medium">Миёна (Medium)</option>
          <option value="high">Ҷиддӣ (High)</option>
        </select>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitViolation()">Сабт кардан</button>
    `;

    openModal("Сабти қоидавайронкунӣ", body, footer);
  },

  submitViolation() {
    const studentId = document.getElementById("violStudentSelect")?.value;
    const reason = document.getElementById("violReason")?.value.trim();
    const severity = document.getElementById("violSeverity")?.value;

    const student = store.state.students.find(s => s.id === studentId);
    if (!student || !reason) return;

    store.addViolation({
      studentId,
      studentName: student.name,
      room: student.room,
      reason,
      severity
    });

    closeModal();
    showToast("Қоидавайронкунӣ сабт карда шуд!", "info");
  },

  resolveViolation(id) {
    store.resolveViolation(id);
    showToast("Қоидавайронкунӣ ҳал карда шуд!", "success");
  },

  // Cleanliness 5 Criteria Scoring (Requirements 10 & 11)
  openRateRoomModal() {
    if (!store.canRateCleanliness()) {
      showToast("Танҳо мураббии масъули тозагӣ ва Мудир метавонанд баҳо гузоранд.", "error");
      return;
    }

    const rooms = store.state.rooms.filter(r => r.type === 'student');
    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби ҳуҷра</label>
        <select id="rateRoomSelect" class="form-control">
          ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">1. Намуди умумии ҳуҷра (макс. 15 хол)</label>
          <input type="number" id="rateAppearance" min="0" max="15" step="0.5" value="14" class="form-control">
        </div>
        <div class="form-group">
          <label class="form-label">2. Ҷевонҳо / Шкафҳо (макс. 10 хол)</label>
          <input type="number" id="rateWardrobes" min="0" max="10" step="0.5" value="9" class="form-control">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">3. Ҷойи хоб / Катҳо (макс. 10 хол)</label>
          <input type="number" id="rateBeds" min="0" max="10" step="0.5" value="9" class="form-control">
        </div>
        <div class="form-group">
          <label class="form-label">4. Чанги ҳуҷра (макс. 10 хол)</label>
          <input type="number" id="rateDust" min="0" max="10" step="0.5" value="9" class="form-control">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">5. Тароват ва ҳавокашӣ (макс. 5 хол)</label>
        <input type="number" id="rateAir" min="0" max="5" step="0.5" value="4.5" class="form-control">
      </div>

      <div class="form-group">
        <label class="form-label">Хулоса ва эзоҳи санҷиш</label>
        <input type="text" id="rateRoomNotes" class="form-control" placeholder="Масалан: Ҳуҷра намунавӣ, либосҳо мураттаб...">
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitRateRoom5()">Сабти холҳо (50)</button>
    `;

    openModal("Баҳогузории озмуни тозагӣ (5 меъёр)", body, footer);
  },

  submitRateRoom5() {
    const room = document.getElementById("rateRoomSelect")?.value;
    const appearance = document.getElementById("rateAppearance")?.value;
    const wardrobes = document.getElementById("rateWardrobes")?.value;
    const beds = document.getElementById("rateBeds")?.value;
    const dust = document.getElementById("rateDust")?.value;
    const air = document.getElementById("rateAir")?.value;
    const notes = document.getElementById("rateRoomNotes")?.value.trim();

    if (!room) return;

    store.rateRoom5(room, appearance, wardrobes, beds, dust, air, notes);
    closeModal();
    showToast(`Баҳогузории Ҳуҷраи ${room} бо муваффақият сабт шуд!`, "success");
  },

  closeModal
};

// Keyboard shortcut: Escape closes modal (Requirement 5)
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Auto subscribe to state updates
store.subscribe(() => {
  renderApp();
});

// Initial boot
document.addEventListener("DOMContentLoaded", () => {
  renderApp();
});
