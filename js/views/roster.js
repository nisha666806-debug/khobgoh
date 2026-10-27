// Khobgoh Duty Roster View v2.2
import { store } from "../store.js";

export function renderRoster() {
  const t = (k) => store.t(k);
  const roster = store.state.roster;
  const activeDuty = roster.find(r => r.active) || roster[1];

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('roster_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('roster_subtitle')}</p>
        </div>
      </div>

      <!-- Supervisor on Duty Alert Notification -->
      <div class="card" style="margin-bottom:24px; border:2px solid var(--emerald-500); background:linear-gradient(135deg, var(--emerald-50) 0%, var(--surface) 100%); padding:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:54px; height:54px; border-radius:50%; background:var(--emerald-600); color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; box-shadow:0 4px 12px rgba(5,150,105,0.3);">
            ${activeDuty.supervisorName[0]}
          </div>
          <div>
            <div style="font-size:12px; font-weight:700; color:var(--emerald-800); text-transform:uppercase; letter-spacing:0.05em;">${t('roster_alert_active')}</div>
            <h2 style="margin:2px 0 4px 0; font-size:20px; font-weight:800; color:var(--text-main);">${activeDuty.supervisorName} (${activeDuty.label})</h2>
            <div style="font-size:13px; color:var(--text-muted);">Рақами тамос: <b>${activeDuty.phone}</b> • Муддати баст: 24 соат</div>
          </div>
        </div>
      </div>

      <!-- 7-day Weekly Shift Cards -->
      <h2 style="font-size:17px; font-weight:700; margin-bottom:14px; color:var(--text-main);">
        Ҷадвали ҳафтаинаи мураббиёни навбатдор
      </h2>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
        ${roster.map(item => `
          <div class="card" style="${item.active ? 'border:2px solid var(--emerald-500); background:var(--emerald-50);' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 style="margin:0; font-size:16px; font-weight:700;">${item.label}</h3>
              ${item.active ? `<span class="status-pill status-active" style="font-size:11px;">Имрӯз фаъол</span>` : ''}
            </div>

            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
              <div style="width:38px; height:38px; border-radius:50%; background:var(--emerald-600); color:white; display:flex; align-items:center; justify-content:center; font-weight:700;">
                ${item.supervisorName[0]}
              </div>
              <div>
                <div style="font-weight:700; font-size:14px;">${item.supervisorName}</div>
                <div style="font-size:12px; color:var(--text-muted);">${item.phone}</div>
              </div>
            </div>

            <div style="border-top:1px solid var(--border); padding-top:8px; font-size:12px; color:var(--text-muted);">
              Назорати интизом ва тартиботи хобгоҳ
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}
