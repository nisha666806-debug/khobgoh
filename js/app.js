// Khobgoh Main Application Controller v2.2
import { store } from "./store.js";
import { syncManager } from "./sync.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderStudents } from "./views/students.js";
import { renderRooms } from "./views/rooms.js";
import { renderAttendance } from "./views/attendance.js";
import { renderActivities } from "./views/activities.js";
import { renderViolations } from "./views/violations.js";
import { renderCleanliness } from "./views/cleanliness.js";
import { renderRoster } from "./views/roster.js";
import { renderSupervisors } from "./views/supervisors.js";
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

          ${(state.activeRole === 'manager' || state.activeRole === 'head') ? `
            <button class="nav-link ${state.currentPage === 'supervisors' ? 'active' : ''}" onclick="window.khobgoh.navigate('supervisors')">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${t('nav_supervisors')}
              <span class="badge" style="background:var(--indigo-100); color:var(--indigo-800);">${state.supervisors ? state.supervisors.length : 0}</span>
            </button>
          ` : ''}

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

          <!-- Quick Tea Access across ALL pages -->
          <div style="display:flex; align-items:center; gap:8px;">
            <button 
              class="btn btn-secondary btn-sm" 
              onclick="window.khobgoh.navigate('tea')" 
              style="display:flex; align-items:center; gap:6px; background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.35); color:var(--emerald-800); font-weight:700;"
              title="Ҷадвали чойнӯшии синфҳо ва рецептҳо">
              <span>🍵</span>
              <span>Чойнӯшӣ</span>
            </button>

            <!-- Real-time Cloud Sync & Auth Button -->
            ${syncManager.currentUser ? `
              <button 
                class="btn btn-secondary btn-sm" 
                onclick="window.khobgoh.openUserAccountModal()"
                style="display:flex; align-items:center; gap:6px; background:#ecfdf5; border-color:#a7f3d0; color:#065f46; font-weight:700;"
                title="Синхронизатсияи зинда бо дигар кормандон фаъол аст!">
                <span style="font-size:12px;">☁️</span>
                <span style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px;">
                  ${syncManager.currentUser.email.split('@')[0]}
                </span>
              </button>
            ` : `
              <button 
                class="btn btn-primary btn-sm" 
                onclick="window.khobgoh.openLoginModal()" 
                style="padding:6px 12px; font-size:12px;"
                title="Воридшавӣ барои синхронизатсия">
                🔑 Воридшавӣ
              </button>
            `}

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

        <!-- Prominent Real-time Cloud Sync Banner -->
        ${syncManager.currentUser ? `
          <div class="sync-banner sync-banner-success">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">🟢</span>
              <div>
                <b>Синхронизатсияи зинда фаъол аст:</b> Пайваст бо <b>${syncManager.currentUser.email}</b> (${currentRoleLabel})
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openUserAccountModal()" style="font-size:12px; padding:4px 10px;">
              Ҳолати ҳисоб ⚙️
            </button>
          </div>
        ` : `
          <div class="sync-banner sync-banner-warning">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">☁️</span>
              <div>
                <b>Ҳолати офлайн (Синхронизатсия пайваст нест):</b> Барои пайваст шудан ба база ва ҳамзамон дидани амалҳои дигар кормандон ба ҳисоб ворид шавед.
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.khobgoh.openLoginModal()" style="font-weight:700; padding:6px 14px; font-size:12px;">
              🔑 Пайвастшавӣ / Бақайдгирӣ
            </button>
          </div>
        `}

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
    case "supervisors": return renderSupervisors();
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
            <option value="Синфи 7">Синфи 7</option>
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

  // Supervisor CRUD Modals
  openAddSupervisorModal() {
    if (!store.canManageStudents()) return;
    const supervisorRooms = store.state.rooms.filter(r => r.type === 'supervisor');

    const body = `
      <form id="addSupForm" onsubmit="window.khobgoh.submitNewSupervisor(event)">
        <div class="form-group">
          <label class="form-label">Ному насаби мураббӣ *</label>
          <input type="text" id="newSupName" class="form-control" required placeholder="Масалан: Ҷамшед Саидов">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Телефон *</label>
            <input type="text" id="newSupPhone" class="form-control" required placeholder="+992 900 00 00 00">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="newSupEmail" class="form-control" placeholder="jamshed@khobgoh.tj">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Вазифа / Нақш</label>
            <select id="newSupRole" class="form-control">
              <option value="supervisor">Мураббӣ</option>
              <option value="head">Сармураббӣ</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ҳуҷра</label>
            <select id="newSupRoom" class="form-control">
              ${supervisorRooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ҷой (1-4)</label>
            <input type="number" id="newSupBed" min="1" max="4" value="1" class="form-control">
          </div>
        </div>

        <div style="margin-top:12px; padding:10px; background:var(--surface-muted); border-radius:var(--radius-md); font-size:13px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="newSupInviteCheck" checked>
            <span>Эҷоди «Коди даъват» барои бақайдгирии мураббӣ дар системаи абрӣ</span>
          </label>
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="document.getElementById('addSupForm').requestSubmit()">Сабт кардан</button>
    `;

    openModal("Иловаи мураббии нав", body, footer);
  },

  async submitNewSupervisor(e) {
    e.preventDefault();
    const name = document.getElementById("newSupName")?.value.trim();
    const phone = document.getElementById("newSupPhone")?.value.trim();
    const email = document.getElementById("newSupEmail")?.value.trim();
    const role = document.getElementById("newSupRole")?.value;
    const room = document.getElementById("newSupRoom")?.value;
    const bed = document.getElementById("newSupBed")?.value;
    const createInvite = document.getElementById("newSupInviteCheck")?.checked;

    if (!name || !phone) return;

    store.addSupervisor({ name, phone, email, role, room, bed });

    if (createInvite && email && syncManager.currentUser && syncManager.isElevated()) {
      try {
        const code = await syncManager.createInvitation({ name, email, phone, roomIds: [room] });
        closeModal();
        openModal("Коди даъват сохта шуд ✅", `
          <div style="text-align:center; padding:12px 0;">
            <div style="font-size:42px; margin-bottom:8px;">📨</div>
            <h3 style="margin:0 0 6px 0; font-size:17px; font-weight:800; color:var(--emerald-800);">Даъватнома барои мураббӣ</h3>
            <p style="font-size:13px; color:var(--text-muted); margin:0 0 16px 0;">
              Ин коди даъватро ба <b>${name}</b> расонед, то бо воситаи он дар телефон ё компютери худ ворид шавад:
            </p>
            <div style="font-size:26px; font-weight:900; letter-spacing:3px; background:var(--surface-muted); padding:12px 18px; border-radius:10px; margin:0 auto 16px auto; border:2px dashed var(--emerald-600); color:var(--emerald-800); display:inline-block;">
              ${code}
            </div>
            <div style="font-size:13px; color:var(--text-muted);">Почтаи электронии таъиншуда: <b>${email}</b></div>
          </div>
        `, `<button class="btn btn-primary" onclick="window.khobgoh.closeModal()">Фаҳмо, нусхабардорӣ шуд</button>`);
        return;
      } catch (err) {
        console.warn("Invite creation info:", err);
      }
    }

    closeModal();
    showToast(`Мураббӣ ${name} бо муваффақият илова шуд!`, "success");
  },

  openEditSupervisorModal(id) {
    if (!store.canManageStudents()) return;
    const sup = store.state.supervisors.find(s => s.id === id);
    if (!sup) return;
    const supervisorRooms = store.state.rooms.filter(r => r.type === 'supervisor');

    const body = `
      <form id="editSupForm" onsubmit="window.khobgoh.saveSupervisorEdits(event, '${sup.id}')">
        <div class="form-group">
          <label class="form-label">Ному насаб</label>
          <input type="text" id="editSupName" class="form-control" value="${sup.name}" required>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input type="text" id="editSupPhone" class="form-control" value="${sup.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="editSupEmail" class="form-control" value="${sup.email || ''}">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Вазифа</label>
            <select id="editSupRole" class="form-control">
              <option value="supervisor" ${sup.role === 'supervisor' ? 'selected' : ''}>Мураббӣ</option>
              <option value="head" ${sup.role === 'head' ? 'selected' : ''}>Сармураббӣ</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ҳуҷра</label>
            <select id="editSupRoom" class="form-control">
              ${supervisorRooms.map(r => `<option value="${r.id}" ${sup.room === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ҷой (1-4)</label>
            <input type="number" id="editSupBed" min="1" max="4" value="${sup.bed || 1}" class="form-control">
          </div>
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="document.getElementById('editSupForm').requestSubmit()">Сабт кардан</button>
    `;

    openModal("Таҳрири маълумоти мураббӣ", body, footer);
  },

  saveSupervisorEdits(arg1, arg2) {
    const id = typeof arg1 === 'string' ? arg1 : arg2;
    const name = document.getElementById("editSupName")?.value.trim();
    const phone = document.getElementById("editSupPhone")?.value.trim();
    const email = document.getElementById("editSupEmail")?.value.trim();
    const role = document.getElementById("editSupRole")?.value;
    const room = document.getElementById("editSupRoom")?.value;
    const bed = Number(document.getElementById("editSupBed")?.value);

    store.updateSupervisor(id, { name, phone, email, role, room, bed });
    closeModal();
    showToast("Маълумоти мураббӣ нав карда шуд!", "success");
  },

  deleteSupervisor(id) {
    if (!store.canManageSupervisors()) {
      showToast("Дастрасӣ танҳо барои Мудир ва Сармураббӣ!", "error");
      return;
    }
    const sup = store.state.supervisors.find(s => s.id === id);
    if (!sup) return;

    if (confirm(`Оё мутмаин ҳастед, ки ${sup.name}-ро хориҷ кардан мехоҳед?`)) {
      try {
        store.deleteSupervisor(id);
        showToast(`${sup.name} хориҷ карда шуд!`, "info");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  },

  toggleSupervisorRole(id) {
    if (!store.canManageSupervisors()) {
      showToast("Дастрасӣ танҳо барои Мудир ва Сармураббӣ!", "error");
      return;
    }
    const sup = store.state.supervisors.find(s => s.id === id);
    if (!sup) return;
    const nextRole = sup.role === 'head' ? 'supervisor' : 'head';
    store.updateSupervisor(id, { role: nextRole });
    showToast(`Вазифаи ${sup.name} ба «${nextRole === 'head' ? 'Сармураббӣ' : 'Мураббӣ'}» иваз шуд!`, "success");
  },

  copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast("Нусхабардорӣ шуд!", "success");
    } else {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("Нусхабардорӣ шуд!", "success");
    }
  },

  openCreateInviteModal() {
    if (!store.canManageSupervisors()) {
      showToast("Дастрасӣ танҳо барои Мудир ва Сармураббӣ!", "error");
      return;
    }
    const studentRooms = store.state.rooms.filter(r => r.type === 'student');

    const body = `
      <form id="createInviteForm" onsubmit="window.khobgoh.submitCreateInvite(event)">
        <div class="form-group">
          <label class="form-label">Ному насаби мураббӣ *</label>
          <input type="text" id="invSupName" class="form-control" required placeholder="Масалан: Алиев Беҳрӯз">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Email мураббӣ *</label>
            <input type="email" id="invSupEmail" class="form-control" required placeholder="behruz@khobgoh.tj">
          </div>
          <div class="form-group">
            <label class="form-label">Телефон *</label>
            <input type="text" id="invSupPhone" class="form-control" required placeholder="+992 900 12 34 56">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Ҳуҷраҳои вобасташуда (Интихоб кунед)</label>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:8px; max-height:140px; overflow-y:auto; padding:8px; background:var(--surface-muted); border-radius:6px;">
            ${studentRooms.map(r => `
              <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                <input type="checkbox" name="invRoom" value="${r.id}">
                <span>Ҳуҷраи ${r.id}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitCreateInvite()">Сохтани код</button>
    `;

    openModal("Эҷоди коди даъват барои Мураббӣ", body, footer);
  },

  async submitCreateInvite(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById("invSupName")?.value.trim();
    const email = document.getElementById("invSupEmail")?.value.trim();
    const phone = document.getElementById("invSupPhone")?.value.trim();
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="invRoom"]:checked')).map(cb => cb.value);

    if (!name || !email || !phone) {
      showToast("Лутфан ном, email ва телефонро пур кунед.", "error");
      return;
    }

    try {
      const code = await syncManager.createInvitation({ name, email, phone, roomIds: checkedBoxes });
      closeModal();
      openModal("Коди даъват омода аст ✅", `
        <div style="text-align:center; padding:12px 0;">
          <div style="font-size:42px; margin-bottom:8px;">📨</div>
          <h3 style="margin:0 0 6px 0; font-size:17px; font-weight:800; color:var(--emerald-800);">Коди даъвати нав сохта шуд</h3>
          <p style="font-size:13px; color:var(--text-muted); margin:0 0 16px 0;">
            Ин кодро ба мураббӣ <b>${name}</b> (${email}) расонед:
          </p>
          <div style="font-size:24px; font-weight:900; letter-spacing:2px; background:var(--surface-muted); padding:12px 18px; border-radius:10px; margin:0 auto 16px auto; border:2px dashed var(--emerald-600); color:var(--emerald-800); display:inline-block; user-select:all;">
            ${code}
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.copyText('${code}')">
              📋 Нусхабардории код
            </button>
          </div>
        </div>
      `, `<button class="btn btn-primary" onclick="window.khobgoh.closeModal()">Пӯшидан</button>`);
    } catch (err) {
      console.error(err);
      showToast("Хатогӣ дар сохтани даъватнома: " + (err.message || ''), "error");
    }
  },

  // Supervisor quarters assignment
  openAssignSupervisorModal(defaultRoomId, defaultBedNum) {
    if (!store.canManageRooms()) {
      showToast("Дастрасӣ танҳо барои Сармураббӣ ва Мудир!", "error");
      return;
    }
    const supervisors = store.state.supervisors;
    const supervisorRooms = store.state.rooms.filter(r => r.type === 'supervisor');

    const body = `
      <div class="form-group">
        <label class="form-label">Мураббӣ</label>
        <select id="assignSupSelect" class="form-control">
          ${supervisors.map(s => `<option value="${s.id}">${s.name} (${s.phone || ''})</option>`).join('')}
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Ҳуҷра</label>
          <select id="assignSupRoom" class="form-control">
            ${supervisorRooms.map(r => `<option value="${r.id}" ${defaultRoomId === r.id ? 'selected' : ''}>${r.name || 'Мураббиён ' + r.id} (${r.capacity || 4} ҷойӣ)</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ҷой (1-4)</label>
          <input type="number" id="assignSupBed" min="1" max="10" value="${defaultBedNum || 1}" class="form-control">
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitAssignSupervisor()">Таъин кардан</button>
    `;

    openModal("Таъин кардани мураббӣ ба ҳуҷра", body, footer);
  },
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
    const filterClass = document.getElementById("studentClassFilter")?.value.toLowerCase().trim() || "";
    const room = document.getElementById("studentRoomFilter")?.value || "";
    const status = document.getElementById("studentStatusFilter")?.value || "";

    const rows = document.querySelectorAll("#studentsTable tbody tr");
    rows.forEach(row => {
      const name = row.getAttribute("data-name") || "";
      const sid = row.getAttribute("data-id") || "";
      const sroom = row.getAttribute("data-room") || "";
      const scourse = row.getAttribute("data-course") || "";
      const sstatus = row.getAttribute("data-status") || "";

      const matchesSearch = !search || name.includes(search) || sid.includes(search) || scourse.includes(search);
      const matchesClass = !filterClass || scourse.includes(filterClass);
      const matchesRoom = !room || sroom === room;
      const matchesStatus = !status || sstatus === status;

      row.style.display = matchesSearch && matchesClass && matchesRoom && matchesStatus ? "" : "none";
    });
  },

  // Custom Room Modal
  openAddCustomRoomModal() {
    if (!store.canManageStudents()) return;
    const body = `
      <form id="addRoomForm" onsubmit="window.khobgoh.submitAddCustomRoom(event)">
        <div class="form-group">
          <label class="form-label">Рақами ҳуҷра (масалан: 108, 204, 301) *</label>
          <input type="text" id="customRoomId" class="form-control" required placeholder="Рақами ҳуҷраро нависед...">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Иқтидор (Миқдори катҳо) *</label>
            <input type="number" id="customRoomCap" min="1" max="24" value="8" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Ошёна</label>
            <input type="number" id="customRoomFloor" min="1" max="5" value="1" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Навъи ҳуҷра</label>
          <select id="customRoomType" class="form-control">
            <option value="student">Ҳуҷраи талабагон</option>
            <option value="supervisor">Ҳуҷраи мураббиён</option>
          </select>
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="document.getElementById('addRoomForm').requestSubmit()">Сабт кардан</button>
    `;

    openModal("Илова ё танзими ҳуҷра", body, footer);
  },

  submitAddCustomRoom(e) {
    e.preventDefault();
    const id = document.getElementById("customRoomId")?.value.trim();
    const cap = document.getElementById("customRoomCap")?.value;
    const floor = document.getElementById("customRoomFloor")?.value;
    const type = document.getElementById("customRoomType")?.value;

    if (!id) return;
    store.addCustomRoom(id, cap, floor, type);
    closeModal();
    showToast(`Ҳуҷраи ${id} бомуваффақият сабт шуд!`, "success");
  },

  openAddSupervisorRoomModal() {
    if (!store.canManageRooms()) {
      showToast("Дастрасӣ танҳо барои Сармураббӣ ва Мудир!", "error");
      return;
    }
    const body = `
      <form id="addSupRoomForm" onsubmit="window.khobgoh.submitAddSupervisorRoom(event)">
        <div class="form-group">
          <label class="form-label">Рақами ҳуҷраи мураббиён (масалан: 201, 202, 203, 204) *</label>
          <input type="text" id="supRoomId" class="form-control" required placeholder="Рақами ҳуҷра...">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Иқтидор (Катҳои хоб) *</label>
            <input type="number" id="supRoomCap" min="1" max="10" value="4" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Ошёна</label>
            <input type="number" id="supRoomFloor" min="1" max="5" value="2" class="form-control">
          </div>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitAddSupervisorRoom()">Сабт кардан</button>
    `;
    openModal("Иловаи ҳуҷраи нави мураббиён", body, footer);
  },

  submitAddSupervisorRoom(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById("supRoomId")?.value.trim();
    const cap = Number(document.getElementById("supRoomCap")?.value) || 4;
    const floor = Number(document.getElementById("supRoomFloor")?.value) || 2;
    if (!id) return;
    store.addCustomRoom(id, cap, floor, "supervisor");
    closeModal();
    showToast(`Ҳуҷраи мураббиён №${id} илова шуд!`, "success");
  },

  openEditRoomModal(roomId) {
    if (!store.canManageRooms()) {
      showToast("Дастрасӣ танҳо барои Сармураббӣ ва Мудир!", "error");
      return;
    }
    const room = store.state.rooms.find(r => r.id === roomId);
    if (!room) return;

    const body = `
      <form id="editRoomForm" onsubmit="window.khobgoh.saveRoomEdits('${roomId}', event)">
        <div class="form-group">
          <label class="form-label">Номи ҳуҷра *</label>
          <input type="text" id="editRoomName" class="form-control" value="${room.name || (room.type === 'supervisor' ? 'Мураббиён ' + room.id : 'Ҳуҷраи ' + room.id)}" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Иқтидор (Ҷой / Кат) *</label>
            <input type="number" id="editRoomCap" class="form-control" value="${room.capacity}" min="1" max="24" required>
          </div>
          <div class="form-group">
            <label class="form-label">Ошёна *</label>
            <input type="number" id="editRoomFloor" class="form-control" value="${room.floor || 1}" min="1" max="5" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Навъи ҳуҷра</label>
          <select id="editRoomType" class="form-control">
            <option value="student" ${room.type === 'student' ? 'selected' : ''}>Ҳуҷраи талабагон</option>
            <option value="supervisor" ${room.type === 'supervisor' ? 'selected' : ''}>Ҳуҷраи мураббиён</option>
          </select>
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.saveRoomEdits('${roomId}')">Сабт кардан</button>
    `;

    openModal(`Таҳрири Ҳуҷраи ${roomId}`, body, footer);
  },

  saveRoomEdits(roomId, e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById("editRoomName")?.value.trim();
    const capacity = Number(document.getElementById("editRoomCap")?.value);
    const floor = Number(document.getElementById("editRoomFloor")?.value);
    const type = document.getElementById("editRoomType")?.value;

    if (!capacity) return;

    store.updateRoom(roomId, { name, capacity, floor, type });
    closeModal();
    showToast(`Ҳуҷраи ${roomId} бомуваффақият нав карда шуд!`, "success");
  },

  deleteRoom(roomId) {
    if (!store.canManageRooms()) {
      showToast("Дастрасӣ танҳо барои Сармураббӣ ва Мудир!", "error");
      return;
    }
    const room = store.state.rooms.find(r => r.id === roomId);
    if (!room) return;

    if (confirm(`Оё мутмаин ҳастед, ки Ҳуҷраи ${roomId}-ро хориҷ кардан мехоҳед? Ҳамаи таъиноти марбут ба ин ҳуҷра пок мешаванд.`)) {
      try {
        store.deleteRoom(roomId);
        showToast(`Ҳуҷраи ${roomId} хориҷ карда шуд!`, "info");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  },

  openAssignSupervisorToRoomModal(roomId) {
    if (!store.canManageRooms()) {
      showToast("Дастрасӣ танҳо барои Сармураббӣ ва Мудир!", "error");
      return;
    }
    const room = store.state.rooms.find(r => r.id === roomId);
    if (!room) return;
    const supervisors = store.state.supervisors || [];

    const body = `
      <div class="form-group">
        <label class="form-label">Мураббии масъулро барои Ҳуҷраи ${roomId} интихоб кунед:</label>
        <select id="supInChargeSelect" class="form-control">
          <option value="">-- Бе мураббии масъул --</option>
          ${supervisors.map(s => `
            <option value="${s.id}" ${room.supervisorId === s.id ? 'selected' : ''}>
              ${s.name} (${s.role === 'head' ? '👑 Сармураббӣ' : 'Мураббӣ'}, ${s.phone || ''})
            </option>
          `).join('')}
        </select>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.saveRoomSupervisorAssignment('${roomId}')">Таъин кардан</button>
    `;

    openModal(`Таъини мураббии масъули Ҳуҷраи ${roomId}`, body, footer);
  },

  saveRoomSupervisorAssignment(roomId) {
    const supervisorId = document.getElementById("supInChargeSelect")?.value || null;
    store.setRoomSupervisor(roomId, supervisorId);
    closeModal();
    const sup = store.state.supervisors.find(s => s.id === supervisorId);
    showToast(sup ? `${sup.name} мураббии масъули Ҳуҷраи ${roomId} таъин шуд!` : `Мураббии масъул барои Ҳуҷраи ${roomId} бекор шуд.`, "success");
  },

  openSetSupervisorRoomLeaderModal(roomId) {
    if (!store.canManageRooms()) {
      showToast("Дастрасӣ танҳо барои Сармураббӣ ва Мудир!", "error");
      return;
    }
    const supervisors = (store.state.supervisors || []).filter(s => s.room === roomId);
    const currentLeaderId = store.state.roomLeaders ? store.state.roomLeaders[roomId] : null;

    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби Сардори Ҳуҷраи Мураббиён (${roomId}):</label>
        ${supervisors.length === 0 ? `
          <p style="color:var(--text-muted); font-size:13px; padding:12px 0;">Дар ин ҳуҷра ҳоло ягон мураббӣ сабт нашудааст. Аввал мураббиро ба ин ҳуҷра вобаста кунед.</p>
        ` : `
          <select id="supRoomLeaderSelect" class="form-control">
            <option value="">-- Бе сардори ҳуҷра --</option>
            ${supervisors.map(s => `
              <option value="${s.id}" ${currentLeaderId === s.id ? 'selected' : ''}>
                ${s.name} (${s.role === 'head' ? '👑 Сармураббӣ' : 'Мураббӣ'}, Ҷойи №${s.bed || 1})
              </option>
            `).join('')}
          </select>
        `}
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      ${supervisors.length > 0 ? `
        <button class="btn btn-primary" onclick="window.khobgoh.saveSupervisorRoomLeader('${roomId}')">Таъин кардан</button>
      ` : ''}
    `;

    openModal(`Сардори ҳуҷраи мураббиён (${roomId})`, body, footer);
  },

  saveSupervisorRoomLeader(roomId) {
    const supervisorId = document.getElementById("supRoomLeaderSelect")?.value || null;
    store.setSupervisorRoomLeader(roomId, supervisorId);
    closeModal();
    const sup = store.state.supervisors.find(s => s.id === supervisorId);
    showToast(sup ? `${sup.name} сардори Ҳуҷраи ${roomId} таъин шуд!` : "Сардори ҳуҷра бекор карда шуд.", "success");
  },

  // Tea & Kitchen Actions
  selectedTeaClass: "",

  changeTeaClassFilter(cls) {
    window.khobgoh.selectedTeaClass = cls;
    renderApp();
  },

  openAddTeaRecipeModal() {
    if (!store.canManageTea()) {
      showToast("Танҳо Сармураббӣ ё Мудир метавонанд ресептро илова кунанд!", "error");
      return;
    }
    const body = `
      <form id="teaRecipeForm" onsubmit="window.khobgoh.submitNewTeaRecipe(event)">
        <div class="form-group">
          <label class="form-label">Номи чой *</label>
          <input type="text" id="recipeName" class="form-control" required placeholder="Масалан: Чойи кабуд бо лиму ва наъно">
        </div>
        <div class="form-group">
          <label class="form-label">Таркиб ва компонентҳо *</label>
          <textarea id="recipeIngredients" class="form-control" rows="3" required placeholder="Чойи кабуди рақами 95, наъно, лиму, шакар ё набот..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Вақти дамхӯрӣ *</label>
          <input type="text" id="recipeTime" class="form-control" value="10 дақиқа" required placeholder="Масалан: 10 дақиқа, 15 дақиқа">
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitNewTeaRecipe()">Сабт кардан</button>
    `;
    openModal("Иловаи ресепти нави чой (Сармураббӣ)", body, footer);
  },

  submitNewTeaRecipe(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById("recipeName")?.value.trim();
    const ingredients = document.getElementById("recipeIngredients")?.value.trim();
    const time = document.getElementById("recipeTime")?.value.trim();
    if (!name || !ingredients) return;
    store.addTeaRecipe({ name, ingredients, time });
    closeModal();
    showToast(`Ресепти «${name}» бомуваффақият сабт шуд!`, "success");
  },

  openEditTeaRecipeModal(id) {
    if (!store.canManageTea()) return;
    const r = (store.state.tea?.recipes || []).find(x => x.id === id);
    if (!r) return;

    const body = `
      <form id="editTeaRecipeForm" onsubmit="window.khobgoh.saveTeaRecipeEdits('${id}', event)">
        <div class="form-group">
          <label class="form-label">Номи чой *</label>
          <input type="text" id="editRecipeName" class="form-control" value="${r.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Таркиб ва компонентҳо *</label>
          <textarea id="editRecipeIngredients" class="form-control" rows="3" required>${r.ingredients || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Вақти дамхӯрӣ *</label>
          <input type="text" id="editRecipeTime" class="form-control" value="${r.time || '10 дақиқа'}" required>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.saveTeaRecipeEdits('${id}')">Сабт кардан</button>
    `;
    openModal("Таҳрири ресепти чой", body, footer);
  },

  saveTeaRecipeEdits(id, e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById("editRecipeName")?.value.trim();
    const ingredients = document.getElementById("editRecipeIngredients")?.value.trim();
    const time = document.getElementById("editRecipeTime")?.value.trim();
    if (!name || !ingredients) return;

    store.updateTeaRecipe(id, { name, ingredients, time });
    closeModal();
    showToast("Ресепт нав карда шуд!", "success");
  },

  deleteTeaRecipe(id) {
    if (!store.canManageTea()) return;
    const r = (store.state.tea?.recipes || []).find(x => x.id === id);
    if (!r) return;
    if (confirm(`Оё мехоҳед ресепти «${r.name}»-ро хориҷ кунед?`)) {
      store.deleteTeaRecipe(id);
      showToast(`Ресепт хориҷ карда шуд!`, "info");
    }
  },

  openAddClassTeaModal() {
    if (!store.canManageTea()) {
      showToast("Танҳо Сармураббӣ ё Мудир метавонанд соати чойнӯширо таъин кунанд!", "error");
      return;
    }
    const classes = ["Синфи 7", "Синфи 8", "Синфи 9", "Синфи 10", "Синфи 11"];

    const body = `
      <form id="addClassTeaForm" onsubmit="window.khobgoh.submitNewClassTea(event)">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Синф *</label>
            <select id="classTeaClass" class="form-control" required>
              ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Вақти хӯрок / Навбат *</label>
            <select id="classTeaMeal" class="form-control" required>
              <option value="Субҳона">Субҳона</option>
              <option value="Нисфирӯзӣ">Нисфирӯзӣ</option>
              <option value="Шомгоҳӣ">Шомгоҳӣ</option>
              <option value="Шабона">Шабона (Чойнӯшии шабона)</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Соати чойнӯшӣ *</label>
            <input type="text" id="classTeaTime" class="form-control" required placeholder="07:30 - 08:00">
          </div>
          <div class="form-group">
            <label class="form-label">Макон *</label>
            <input type="text" id="classTeaPlace" class="form-control" value="Ошхонаи асосӣ" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Маълумот / Номгӯй / Эзоҳ</label>
          <input type="text" id="classTeaNotes" class="form-control" placeholder="Масалан: Чойи кабуд, ширчой, кулчақанд">
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.submitNewClassTea()">Сабт кардан</button>
    `;

    openModal("Иловаи соати чойнӯшӣ барои синф", body, footer);
  },

  submitNewClassTea(e) {
    if (e && e.preventDefault) e.preventDefault();
    const cls = document.getElementById("classTeaClass")?.value;
    const meal = document.getElementById("classTeaMeal")?.value;
    const time = document.getElementById("classTeaTime")?.value.trim();
    const place = document.getElementById("classTeaPlace")?.value.trim();
    const notes = document.getElementById("classTeaNotes")?.value.trim();

    if (!cls || !time) return;

    store.addClassTeaSchedule({ class: cls, meal, time, place, notes });
    closeModal();
    showToast(`Вақти чойнӯшии ${cls} бомуваффақият сабт шуд!`, "success");
  },

  openEditClassTeaModal(id) {
    if (!store.canManageTea()) return;
    const item = (store.state.tea?.classSchedule || []).find(x => x.id === id);
    if (!item) return;
    const classes = ["Синфи 7", "Синфи 8", "Синфи 9", "Синфи 10", "Синфи 11"];

    const body = `
      <form id="editClassTeaForm" onsubmit="window.khobgoh.saveClassTeaEdits('${id}', event)">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Синф *</label>
            <select id="editClassTeaClass" class="form-control" required>
              ${classes.map(c => `<option value="${c}" ${item.class === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Вақти хӯрок / Навбат *</label>
            <select id="editClassTeaMeal" class="form-control" required>
              <option value="Субҳона" ${item.meal === 'Субҳона' ? 'selected' : ''}>Субҳона</option>
              <option value="Нисфирӯзӣ" ${item.meal === 'Нисфирӯзӣ' ? 'selected' : ''}>Нисфирӯзӣ</option>
              <option value="Шомгоҳӣ" ${item.meal === 'Шомгоҳӣ' ? 'selected' : ''}>Шомгоҳӣ</option>
              <option value="Шабона" ${item.meal === 'Шабона' ? 'selected' : ''}>Шабона (Чойнӯшии шабона)</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Соати чойнӯшӣ *</label>
            <input type="text" id="editClassTeaTime" class="form-control" value="${item.time}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Макон *</label>
            <input type="text" id="editClassTeaPlace" class="form-control" value="${item.place || 'Ошхона'}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Маълумот / Номгӯй / Эзоҳ</label>
          <input type="text" id="editClassTeaNotes" class="form-control" value="${item.notes || ''}">
        </div>
      </form>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.saveClassTeaEdits('${id}')">Сабт кардан</button>
    `;

    openModal(`Таҳрири соати чойнӯшӣ (${item.class})`, body, footer);
  },

  saveClassTeaEdits(id, e) {
    if (e && e.preventDefault) e.preventDefault();
    const cls = document.getElementById("editClassTeaClass")?.value;
    const meal = document.getElementById("editClassTeaMeal")?.value;
    const time = document.getElementById("editClassTeaTime")?.value.trim();
    const place = document.getElementById("editClassTeaPlace")?.value.trim();
    const notes = document.getElementById("editClassTeaNotes")?.value.trim();

    if (!cls || !time) return;

    store.updateClassTeaSchedule(id, { class: cls, meal, time, place, notes });
    closeModal();
    showToast("Ҷадвали чойнӯшӣ нав карда шуд!", "success");
  },

  deleteClassTeaSchedule(id) {
    if (!store.canManageTea()) return;
    const item = (store.state.tea?.classSchedule || []).find(x => x.id === id);
    if (!item) return;

    if (confirm(`Оё мехоҳед вақти чойнӯшии ${item.class} (${item.meal} - ${item.time})-ро хориҷ кунед?`)) {
      store.deleteClassTeaSchedule(id);
      showToast("Вақти чойнӯшӣ хориҷ карда шуд!", "info");
    }
  },

  // Modals for Students
  openAddStudentModal() {
    if (!store.canManageStudents()) {
      showToast("Танҳо Мудир ё Сармураббӣ метавонанд талабагонро дохил кунанд.", "error");
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
            <label class="form-label">${t('students_col_room')} (Муайянкунии озод) *</label>
            <input type="text" id="newStdRoom" list="roomListOptions" class="form-control" required placeholder="Масалан: 101, 102, 205...">
            <datalist id="roomListOptions">
              ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label">${t('students_col_bed')} (Ҷой) *</label>
            <input type="number" id="newStdBed" min="1" max="20" value="1" class="form-control" required>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">${t('students_col_course')}</label>
            <input type="text" id="newStdCourse" class="form-control" placeholder="Синфи 7-А, 8, 9, 10, 11">
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
    showToast(`Талаба ${name} бо муваффақият сабт шуд!`, "success");
  },

  openAssignBedModal(roomId, bedNum) {
    if (!store.canManageStudents()) {
      showToast("Танҳо Мудир ё Сармураббӣ метавонанд ҷойро таъин кунанд.", "error");
      return;
    }
    const unassigned = store.state.students.filter(s => s.room !== roomId || Number(s.bed) !== bedNum);
    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби талаба барои Ҳуҷраи ${roomId}, Ҷойи №${bedNum}:</label>
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
    showToast(`Ҷойи №${bedNum} ба талаба бо муваффақият таъин шуд!`, "success");
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

    openModal("Таҳрири маълумоти талаба", body, footer);
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
            <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--emerald-800);">КОРТИ ХОБГОҲИ ТАЛАБА</h3>
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
    showToast("Ҳамаи талабагон «Ҳаст» сабт шуданд!", "success");
    renderApp();
  },

  // Violations: ALL supervisors have access to ALL students (Requirement 9, No severity)
  openAddViolationModal() {
    const students = store.state.students;
    const body = `
      <div class="form-group">
        <label class="form-label">Интихоби талаба (аз ҳамаи ҳуҷраҳо)</label>
        <select id="violStudentSelect" class="form-control">
          ${students.map(s => `<option value="${s.id}">${s.name} (Ҳуҷраи ${s.room}, Ҷойи №${s.bed} - ${s.course})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Сабаб ё шарҳи ҳодиса</label>
        <textarea id="violReason" class="form-control" placeholder="Масалан: Дер омадан ба хобгоҳ, вайрон кардани интизом..."></textarea>
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

    const student = store.state.students.find(s => s.id === studentId);
    if (!student || !reason) return;

    store.addViolation({
      studentId,
      studentName: student.name,
      room: student.room,
      reason
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

  // Quick Tea Access across ALL pages
  openQuickTeaModal() {
    const tea = store.state.tea;
    const rooms = store.state.rooms.filter(r => r.type === 'student');
    const canManage = store.canManageStudents();

    const body = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Quick Status Cards -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="padding:14px; background:var(--surface-muted); border-radius:var(--radius-md); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">🍵</div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">НАВБАТДОРИ ИМРӮЗ</div>
            <div style="font-weight:800; font-size:14px; color:var(--text-main); margin-top:2px;">${tea.todayDuty}</div>
          </div>

          <div style="padding:14px; background:var(--surface-muted); border-radius:var(--radius-md); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">⚡️</div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">ҲОЛАТИ САМОВОР</div>
            <div style="font-weight:800; font-size:14px; color:var(--emerald-600); margin-top:2px;">${tea.samovarStatus}</div>
          </div>
        </div>

        <!-- Meal Times Quick Strip -->
        <div style="padding:12px; background:rgba(16, 185, 129, 0.08); border-radius:var(--radius-md); border:1px solid rgba(16, 185, 129, 0.2);">
          <div style="font-size:12px; font-weight:700; color:var(--emerald-900); margin-bottom:6px;">⏰ Вақтҳои чойнӯшӣ:</div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--emerald-800);">
            <span>🌅 Субҳ: 07:00-08:00</span>
            <span>🌇 Шом: 17:30-18:30</span>
            <span>🌙 Шаб: 21:00-21:30</span>
          </div>
        </div>

        ${canManage ? `
          <!-- Quick Assignment form for Admin / Supervisors -->
          <div style="border-top:1px solid var(--border); padding-top:14px;">
            <label class="form-label" style="font-weight:700;">Тағйири фаврии навбатдорӣ ё ҳолат:</label>
            <div class="form-group" style="margin-bottom:10px;">
              <input type="text" id="quickTeaDutyInput" class="form-control" value="${tea.todayDuty}" placeholder="Масалан: Ҳуҷраи 103 (Муҳаммадҷон Ғафуров)">
            </div>
            <div class="form-group">
              <select id="quickSamovarStatusSelect" class="form-control">
                <option value="Омода ва гарм" ${tea.samovarStatus === 'Омода ва гарм' ? 'selected' : ''}>⚡️ Омода ва гарм</option>
                <option value="Дар ҳоли ҷӯшидан" ${tea.samovarStatus === 'Дар ҳоли ҷӯшидан' ? 'selected' : ''}>🔥 Дар ҳоли ҷӯшидан</option>
                <option value="Хомӯш" ${tea.samovarStatus === 'Хомӯш' ? 'selected' : ''}>❄️ Хомӯш</option>
              </select>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.navigate('tea'); window.khobgoh.closeModal();">
        Бахши пурраи ошхона ➔
      </button>
      ${canManage ? `
        <button class="btn btn-primary" onclick="window.khobgoh.saveQuickTeaDuty()">
          Сабт кардан
        </button>
      ` : `
        <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">
          Пӯшидан
        </button>
      `}
    `;

    openModal("🍵 Назорати фаврии чойнӯшӣ ва самовор", body, footer);
  },

  saveQuickTeaDuty() {
    const duty = document.getElementById("quickTeaDutyInput")?.value.trim();
    const status = document.getElementById("quickSamovarStatusSelect")?.value;

    if (duty) {
      store.updateTeaDuty(duty, status);
      closeModal();
      showToast("Маълумоти чойнӯшӣ нав карда шуд!", "success");
    }
  },

  // Auth & Cloud Sync Modals
  openLoginModal(tab = 'login') {
    const isLogin = tab === 'login';
    const isRegister = tab === 'register';
    const isHelp = tab === 'help';

    const body = `
      <div class="auth-tabs">
        <button class="auth-tab-btn ${isLogin ? 'active' : ''}" onclick="window.khobgoh.openLoginModal('login')">
          Воридшавӣ
        </button>
        <button class="auth-tab-btn ${isRegister ? 'active' : ''}" onclick="window.khobgoh.openLoginModal('register')">
          Бақайдгирии мураббӣ
        </button>
        <button class="auth-tab-btn ${isHelp ? 'active' : ''}" onclick="window.khobgoh.openLoginModal('help')">
          Ёрӣ ва дастур
        </button>
      </div>

      ${isLogin ? `
        <form id="loginForm" onsubmit="window.khobgoh.submitLogin(event); return false;">
          <div style="text-align:center; margin-bottom:14px;">
            <img src="assets/dormitory-logo.png" style="width:48px; height:48px; border-radius:10px; margin-bottom:6px;">
            <h3 style="margin:0; font-size:16px; font-weight:800;">Воридшавӣ ба базаи ягона</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:var(--text-muted);">Барои синхронизатсияи зинда бо ҳамаи телефонҳои кормандон</p>
          </div>

          <div id="loginErrorBox" style="display:none; padding:10px 14px; margin-bottom:12px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; font-size:13px; color:#991b1b; line-height:1.4;"></div>

          <div class="form-group">
            <label class="form-label">Email корманд (Роҳбар ё мураббӣ) *</label>
            <input type="email" id="loginEmail" class="form-control" required placeholder="nom@khobgoh.tj">
          </div>

          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label class="form-label">Парол *</label>
              <a href="javascript:void(0)" onclick="window.khobgoh.forgotPassword()" style="font-size:12px; color:var(--primary); text-decoration:none;">Фаромӯш кардед?</a>
            </div>
            <input type="password" id="loginPassword" class="form-control" required placeholder="••••••••">
          </div>

          <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">
            Мураббии нав ҳастед? <a href="javascript:void(0)" onclick="window.khobgoh.openLoginModal('register')" style="color:var(--primary); font-weight:700;">Бо коди даъват бақайд гиред →</a>
          </div>
        </form>
      ` : isRegister ? `
        <form id="regForm" onsubmit="window.khobgoh.submitSupervisorRegistration(event); return false;">
          <div style="text-align:center; margin-bottom:14px;">
            <div style="font-size:36px; margin-bottom:4px;">📋</div>
            <h3 style="margin:0; font-size:16px; font-weight:800;">Бақайдгирии мураббӣ</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:var(--text-muted);">Коди даъватро аз Роҳбар (Manager) гиред</p>
          </div>

          <div id="regErrorBox" style="display:none; padding:10px 14px; margin-bottom:12px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; font-size:13px; color:#991b1b; line-height:1.4;"></div>

          <div class="form-group">
            <label class="form-label">Email мураббӣ *</label>
            <input type="email" id="regEmail" class="form-control" required placeholder="murabbi@khobgoh.tj">
          </div>

          <div class="form-group">
            <label class="form-label">Коди даъват (Invite Code) *</label>
            <input type="text" id="regCode" class="form-control" required placeholder="KHG-XXXXXXXX" style="font-weight:700; letter-spacing:1px; text-transform:uppercase;">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group">
              <label class="form-label">Пароли нав *</label>
              <input type="password" id="regPassword" class="form-control" required minlength="6" placeholder="камаш 6 аломат">
            </div>
            <div class="form-group">
              <label class="form-label">Такрори парол *</label>
              <input type="password" id="regPassword2" class="form-control" required minlength="6" placeholder="••••••••">
            </div>
          </div>
        </form>
      ` : `
        <div style="padding:4px 0; font-size:13px; line-height:1.6; color:var(--text-main);">
          <h4 style="margin:0 0 8px 0; color:var(--emerald-800);">Барои чӣ синхронизатсия лозим аст?</h4>
          <p style="margin:0 0 12px 0;">Ҳангоме ки кормандон ба система ворид мешаванд, ҳар як қайди давомот (ҳозир/ғоиб), қоидавайронкунӣ, ҷойи хоб ва навбатдории чой дар ҳамон сония ба телефони ҳамаи кормандони дигар интиқол меёбад.</p>

          <h4 style="margin:12px 0 6px 0; color:var(--emerald-800);">Тарзи корбарӣ:</h4>
          <ol style="margin:0; padding-left:18px;">
            <li><b>Роҳбар (Manager):</b> Бо Email ва пароли роҳбарият ворид мешавад ва метавонад тамоми маълумотҳоро идора кунад.</li>
            <li><b>Иловаи мураббӣ:</b> Роҳбар дар бахши Мураббиён мураббиро илова карда, барои ӯ «Коди даъват» месозад.</li>
            <li><b>Мураббиён:</b> Дар ҳамин равзана дар ҷадвали «Бақайдгирии мураббӣ» коди даъват ва почтаи худро навишта, парол интихоб мекунанд.</li>
          </ol>
        </div>
      `}
    `;

    const footer = isLogin ? `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" id="loginSubmitBtn" onclick="window.khobgoh.submitLogin()">Ворид шудан</button>
    ` : isRegister ? `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Бекор кардан</button>
      <button class="btn btn-primary" id="regSubmitBtn" onclick="window.khobgoh.submitSupervisorRegistration()">Бақайдгирӣ ва воридшавӣ</button>
    ` : `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Пӯшидан</button>
      <button class="btn btn-primary" onclick="window.khobgoh.openLoginModal('login')">Ба бахши воридшавӣ</button>
    `;

    openModal("Ҳисоб ва Синхронизатсияи абрӣ", body, footer);
  },

  async submitLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById("loginEmail")?.value?.trim();
    const password = document.getElementById("loginPassword")?.value;
    const errorBox = document.getElementById("loginErrorBox");
    const submitBtn = document.getElementById("loginSubmitBtn");

    if (!email || !password) {
      if (errorBox) {
        errorBox.textContent = "Лутфан Email ва паролро ворид намоед.";
        errorBox.style.display = "block";
      }
      return;
    }

    if (errorBox) errorBox.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Дар ҳоли санҷиш...";
    }

    try {
      showToast("Дар ҳоли санҷиш ва пайвастшавӣ...", "info");
      await syncManager.login(email, password);
      closeModal();
      showToast("Шумо бомуваффақият ворид шудед! Синхронизатсияи зинда фаъол шуд.", "success");
    } catch (err) {
      console.error("Login failed:", err);
      let message = "Email ё парол нодуруст аст.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        message = "Email ё парол нодуруст аст (ё чунин корбар ҳанӯз дар база вуҷуд надорад).";
      } else if (err.code === "auth/invalid-email") {
        message = "Формати Email нодуруст аст.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Пайвасти интернет бо сервер қатъ шуд.";
      } else if (err.message) {
        message = err.message;
      }

      if (errorBox) {
        errorBox.innerHTML = `
          <div style="font-weight:700;">❌ ${message}</div>
          <div style="margin-top:8px; font-size:12px; color:#4b5563;">
            Оё мехоҳед ин ҳисобро ҳамчун роҳбари нав (Manager) сабти ном кунед?
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.khobgoh.registerDirectManager('${email}')" style="margin-top:8px; width:100%; font-size:12px;">
            ✨ Сабти номи ин ҳисоб дар база
          </button>
        `;
        errorBox.style.display = "block";
      }
      showToast(message, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Ворид шудан";
      }
    }
  },

  async registerDirectManager(email) {
    const password = document.getElementById("loginPassword")?.value;
    const errorBox = document.getElementById("loginErrorBox");

    if (!email || !password || password.length < 6) {
      if (errorBox) {
        errorBox.textContent = "Парол бояд камаш 6 аломат дошта бошад.";
        errorBox.style.display = "block";
      }
      return;
    }

    try {
      showToast("Дар ҳоли сабти ҳисоб...", "info");
      await syncManager.registerManager(email, password);
      closeModal();
      showToast("Ҳисоби нав бомуваффақият сохта шуд ва ворид гардид!", "success");
    } catch (err) {
      console.error("Direct register error:", err);
      if (errorBox) {
        errorBox.innerHTML = `❌ Хатогӣ дар сабти ном: ${err.message || 'Лутфан маълумотро санҷед'}`;
        errorBox.style.display = "block";
      }
    }
  },

  async forgotPassword() {
    const email = document.getElementById("loginEmail")?.value?.trim();
    if (!email) {
      alert("Лутфан аввал Email-и худро нависед.");
      return;
    }
    try {
      await syncManager.resetPassword(email);
      alert(`Истинод барои барқароркунии парол ба ${email} фиристода шуд. Лутфан почтаатонро санҷед.`);
    } catch (err) {
      alert("Хатогӣ: " + (err.message || "Истинод фиристода нашуд."));
    }
  },

  async submitSupervisorRegistration(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById("regEmail")?.value?.trim();
    const code = document.getElementById("regCode")?.value?.trim();
    const p1 = document.getElementById("regPassword")?.value;
    const p2 = document.getElementById("regPassword2")?.value;
    const errorBox = document.getElementById("regErrorBox");
    const submitBtn = document.getElementById("regSubmitBtn");

    if (!email || !code || !p1 || !p2) {
      if (errorBox) {
        errorBox.textContent = "Ҳамаи майдонҳоро пур кунед.";
        errorBox.style.display = "block";
      }
      return;
    }
    if (p1 !== p2) {
      if (errorBox) {
        errorBox.textContent = "Паролҳо мувофиқат намекунанд!";
        errorBox.style.display = "block";
      }
      return;
    }
    if (p1.length < 6) {
      if (errorBox) {
        errorBox.textContent = "Парол бояд на камтар аз 6 аломат бошад!";
        errorBox.style.display = "block";
      }
      return;
    }

    if (errorBox) errorBox.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Дар ҳоли бақайдгирӣ...";
    }

    try {
      showToast("Дар ҳоли бақайдгирӣ дар система...", "info");
      await syncManager.registerSupervisor({ email, code, password: p1 });
      closeModal();
      showToast("Мураббӣ бомуваффақият сабт шуд! Синхронизатсия фаъол гардид.", "success");
    } catch (err) {
      console.error("Registration error:", err);
      if (errorBox) {
        errorBox.textContent = "Хатогӣ: " + (err.message || "Коди даъват ё email нодуруст аст.");
        errorBox.style.display = "block";
      }
      showToast(err.message || "Хатогӣ дар бақайдгирӣ.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Бақайдгирӣ ва воридшавӣ";
      }
    }
  },

  openUserAccountModal() {
    const user = syncManager.currentUser;
    const body = `
      <div style="text-align:center; padding:12px 0;">
        <div style="font-size:36px; margin-bottom:6px;">☁️</div>
        <h3 style="margin:0 0 4px 0; font-size:16px; font-weight:800; color:var(--emerald-800);">Синхронизатсияи абрӣ фаъол аст</h3>
        <p style="font-size:13px; color:var(--text-muted); margin:0 0 16px 0;">Ҳамаи амалҳои шумо дар як сония дар телефони дигар кормандон нав мешаванд.</p>

        <div style="background:var(--surface-muted); padding:12px; border-radius:var(--radius-md); text-align:left; font-size:13px; margin-bottom:16px;">
          <div><b>Email:</b> ${user?.email || '—'}</div>
          <div style="margin-top:4px;"><b>Вазифа:</b> ${store.state.activeRole}</div>
          <div style="margin-top:4px;"><b>Ҳолати шабака:</b> 🟢 Пайваст (Online)</div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="window.khobgoh.closeModal()">Пӯшидан</button>
      <button class="btn btn-danger" onclick="window.khobgoh.logoutUser()">Баромадан аз ҳисоб</button>
    `;

    openModal("Ҳисоби корманд ва ҳолати абр", body, footer);
  },

  async logoutUser() {
    try {
      await syncManager.logout();
      closeModal();
      showToast("Шумо аз ҳисоб баромадед. Реҷаи офлайн фаъол шуд.", "info");
    } catch (e) {
      console.error("Logout error:", e);
    }
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

// Immediate Fail-Safe Boot (Never blocked by DOMContentLoaded or network)
function bootApp() {
  try {
    renderApp();
  } catch (err) {
    console.error("Initial renderApp error:", err);
  }

  // Connect background cloud sync asynchronously
  setTimeout(() => {
    syncManager.init(store);
  }, 100);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootApp);
} else {
  bootApp();
}
