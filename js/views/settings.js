// Khobgoh Settings View v3.0
import { store } from "../store.js";
import { syncManager } from "../sync.js";

export function renderSettings() {
  const t = (k) => store.t(k);
  const state = store.state;
  const supervisors = store.state.supervisors;

  return `
    <div class="page-container" style="max-width:800px;">
      <div style="margin-bottom:24px;">
        <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('settings_title')}</h1>
        <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('settings_subtitle')}</p>
      </div>

      <!-- Cloud Synchronization & Account (Moved from Topbar/Dashboard - Requirement 3) -->
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--primary);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0 0 4px 0; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
              <span>☁️ Синхронизатсияи абрӣ ва пайвастшавӣ</span>
            </h3>
            <p style="margin:0; font-size:13px; color:var(--text-muted);">
              Ҳамоҳангсозии зинда байни телефонҳои ҳамаи мураббиён ва ҳифзи иттилоот
            </p>
          </div>
          <div>
            ${syncManager.currentUser ? `
              <span class="status-pill status-active" style="font-size:12px; font-weight:700;">🟢 Синхронизатсия фаъол</span>
            ` : `
              <span class="status-pill status-absent" style="font-size:12px; font-weight:700;">⚠️ Ҳолати офлайн</span>
            `}
          </div>
        </div>

        ${syncManager.currentUser ? `
          <div style="padding:14px; background:var(--surface-muted); border-radius:var(--radius-md); margin-bottom:12px; font-size:13px; line-height:1.5;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <div>Почтаи пайвастшуда: <b>${syncManager.currentUser.email}</b></div>
              <div style="color:var(--emerald-700); font-weight:700;">Ҳамаи тағйирот дар сония сабт мешаванд</div>
            </div>
            <div style="font-size:12px; color:var(--text-muted);">
              Ҳангоми сабти давомот, тозагӣ ё навбатдории чой, иттилоот дарҳол ба дигар кормандон дастрас мегардад.
            </div>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openUserAccountModal()">
              ⚙️ Идоракунии ҳисоб
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.khobgoh.logoutUser()" style="color:#ef4444; border-color:#fca5a5;">
              🚪 Баромадан аз ҳисоб
            </button>
          </div>
        ` : `
          <div style="padding:14px; background:#fffbeb; border:1px solid #fde68a; border-radius:var(--radius-md); margin-bottom:12px; font-size:13px; color:#92400e; line-height:1.5;">
            <b>Ҳолати офлайн:</b> Дар ин ҳолат маълумот танҳо дар ҳамин дастгоҳ нигоҳ дошта мешавад. Барои пайваст шудан ба базаи ягона ва ҳамкорӣ бо дигар мураббиён ба ҳисоб ворид шавед ё худро ба қайд гиред.
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.khobgoh.openLoginModal('login')">
              🔑 Воридшавӣ ба ҳисоб
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.khobgoh.openLoginModal('register')">
              📋 Бақайдгирии мураббии нав
            </button>
          </div>
        `}
      </div>

      <!-- Official User Profile & Role (Requirement 7: Security - No Arbitrary Switching) -->
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--emerald-600);">
        <h3 style="margin:0 0 6px 0; font-size:16px; font-weight:700;">👤 Ҳисоб ва вазифаи расмии корманд</h3>
        <p style="margin:0 0 14px 0; font-size:13px; color:var(--text-muted);">
          Вазифаи ҳар як корманд аз рӯи бақайдгирии расмии ӯ муайян карда мешавад ва худсарона иваз карда намешавад.
        </p>

        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--surface-muted); border-radius:var(--radius-md); flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-size:12px; color:var(--text-muted);">Вазифаи тасдиқшудаи шумо:</div>
            <div style="font-size:16px; font-weight:800; color:var(--emerald-800); margin-top:2px; display:flex; align-items:center; gap:6px;">
              <span>${state.activeRole === 'manager' ? '💼 Мудир (Админ)' : state.activeRole === 'head' ? '👑 Сармураббӣ' : '👔 Мураббӣ'}</span>
              <span class="status-pill status-active" style="font-size:10px;">Фаъол</span>
            </div>
          </div>
          <div style="font-size:12px; color:var(--text-muted); max-width:280px; line-height:1.4;">
            🔒 Иваз кардани вазифаи мураббиён танҳо дар бахши расмии <b>«Мураббиён»</b> аз ҷониби Мудир ва Сармураббӣ иҷро карда мешавад.
          </div>
        </div>
      </div>

      <!-- Designations: Cleanliness Inspector -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700;">🛡️ ${t('settings_clean_inspector')}</h3>
        <p style="margin:0 0 14px 0; font-size:13px; color:var(--text-muted);">Танзими мураббие, ки масъули гузаронидани озмуни тозагӣ ва гузоштани холҳо мебошад:</p>

        <div class="form-group">
          <select class="form-control" onchange="window.khobgoh.setCleanlinessInspector(this.value)">
            ${supervisors.map(s => `
              <option value="${s.id}" ${state.cleanlinessInspectorId === s.id ? 'selected' : ''}>
                ${s.name} (${s.role === 'head' ? 'Сармураббӣ' : 'Мураббӣ'}) — ${s.phone}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Preferences: Lang & Theme -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="margin:0 0 16px 0; font-size:16px; font-weight:700;">⚙️ Танзимоти намуди зоҳирӣ</h3>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label">${t('settings_lang')}</label>
            <select class="form-control" onchange="window.khobgoh.changeLanguage(this.value)">
              <option value="tg" ${state.lang === 'tg' ? 'selected' : ''}>Тоҷикӣ (Tajik)</option>
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${t('settings_theme')}</label>
            <select class="form-control" onchange="window.khobgoh.changeTheme(this.value)">
              <option value="light" ${state.theme === 'light' ? 'selected' : ''}>☀️ Рӯшан (Light)</option>
              <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>🌙 Торик (Dark)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Backup & Data Management -->
      <div class="card">
        <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700;">💾 ${t('settings_backup_title')}</h3>
        <p style="margin:0 0 16px 0; font-size:13px; color:var(--text-muted);">Шумо метавонед ҳамаи маълумотро ба файли JSON сабт намоед ё барқарор кунед:</p>

        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="window.khobgoh.exportJsonData()">
            📥 ${t('settings_btn_export_json')}
          </button>

          <label class="btn btn-outline" style="cursor:pointer; margin:0;">
            📤 ${t('settings_btn_import_json')}
            <input type="file" accept=".json" style="display:none;" onchange="window.khobgoh.importJsonData(event)">
          </label>

          <button class="btn btn-danger" onclick="if(confirm('Оё мутмаин ҳастед? Ҳамаи додаҳо ба ҳолати намунавии аввала бармегарданд.')) window.khobgoh.resetToDemo()">
            🔄 ${t('settings_btn_reset_demo')}
          </button>
        </div>
      </div>
    </div>
  `;
}
