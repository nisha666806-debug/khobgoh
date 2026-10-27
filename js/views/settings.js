// Khobgoh Settings View v2.2
import { store } from "../store.js";

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

      <!-- Role Simulator -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700;">🎭 ${t('settings_active_role')}</h3>
        <p style="margin:0 0 14px 0; font-size:13px; color:var(--text-muted);">Барои санҷиши сатҳи дастрасӣ ва имкониятҳои ҳар як корбар нақшро иваз кунед:</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:10px;">
          <button class="btn ${state.activeRole === 'manager' ? 'btn-primary' : 'btn-outline'}" onclick="window.khobgoh.changeRole('manager')">
            💼 ${t('role_manager')}
          </button>
          <button class="btn ${state.activeRole === 'head' ? 'btn-primary' : 'btn-outline'}" onclick="window.khobgoh.changeRole('head')">
            🎖️ ${t('role_head')}
          </button>
          <button class="btn ${state.activeRole === 'supervisor' ? 'btn-primary' : 'btn-outline'}" onclick="window.khobgoh.changeRole('supervisor')">
            👥 ${t('role_supervisor')}
          </button>
          <button class="btn ${state.activeRole === 'student' ? 'btn-primary' : 'btn-outline'}" onclick="window.khobgoh.changeRole('student')">
            👨‍🎓 ${t('role_student')}
          </button>
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

      <!-- Preferences: Lang & Theme & PWA -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="margin:0 0 16px 0; font-size:16px; font-weight:700;">⚙️ Танзимоти намуди зоҳирӣ ва насб</h3>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
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

        <button class="btn btn-secondary" style="width:100%;" onclick="window.khobgoh.promptPWAInstall()">
          ${t('install_pwa')}
        </button>
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
