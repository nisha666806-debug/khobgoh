// Khobgoh Duty Roster View v3.0 (2-3 Supervisors per day, appointed by Head Supervisor)
import { store } from "../store.js";

export function renderRoster() {
  const t = (k) => store.t(k);
  const roster = store.state.roster || [];
  const canManage = store.canManageRooms(); // Head Supervisor & Manager
  const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = daysMap[new Date().getDay()];

  const todayItem = roster.find(r => r.day === todayKey) || roster[0] || {};
  const todaySupervisors = todayItem.supervisors || [];

  return `
    <div class="page-container">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('roster_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">Ҷадвали навбатдории ҳаррӯзаи мураббиён (2 ё 3 нафар дар як баст)</p>
        </div>
        ${canManage ? `
          <span class="status-pill status-active" style="font-size:12px; padding:6px 12px;">
            👑 Ҳуқуқи таъинкунӣ: Сармураббӣ ва Мудир
          </span>
        ` : `
          <span class="status-pill status-permission" style="font-size:12px;">
            Ҷадвали расмии навбатдорӣ (Танҳо барои хониш)
          </span>
        `}
      </div>

      <!-- Supervisor on Duty Alert Notification for Today (Requirement 6) -->
      <div class="card" style="margin-bottom:24px; border:2px solid var(--emerald-500); background:linear-gradient(135deg, var(--emerald-50) 0%, var(--surface) 100%); padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:14px;">
          <div>
            <div style="font-size:11px; font-weight:800; color:var(--emerald-800); text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:6px;">
              <span>🔔</span>
              <span>МУРАББИЁНИ НАВБАТДОРИ ИМРӮЗА (${todayItem.label || 'Имрӯз'})</span>
            </div>
            <h2 style="margin:4px 0 0 0; font-size:19px; font-weight:800; color:var(--text-main);">
              ${todaySupervisors.length > 0 ? `${todaySupervisors.length} нафар мураббии навбатдор дар баст` : 'Навбатдорони имрӯза ҳанӯз таъин нашудаанд'}
            </h2>
          </div>
          ${canManage ? `
            <button class="btn btn-primary btn-sm" onclick="window.khobgoh.openEditDutyRosterModal('${todayItem.day}')">
              ✏️ Танзими навбатдорони имрӯз
            </button>
          ` : ''}
        </div>

        ${todaySupervisors.length > 0 ? `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
            ${todaySupervisors.map(sup => `
              <div style="display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--surface); border:1px solid var(--emerald-200); border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
                <div style="width:44px; height:44px; border-radius:50%; background:var(--emerald-600); color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; flex-shrink:0;">
                  ${(sup.name || 'М')[0]}
                </div>
                <div>
                  <div style="font-size:10px; font-weight:700; color:var(--emerald-700); text-transform:uppercase;">${sup.role || 'Навбатдор'}</div>
                  <div style="font-weight:800; font-size:14px; color:var(--text-main);">${sup.name}</div>
                  <div style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">📞 ${sup.phone || '—'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="margin:0; font-size:13px; color:var(--text-muted);">
            Барои таъин кардани 2 ё 3 нафар мураббии навбатдор тугмаи «Танзими навбатдорон»-ро пахш намоед.
          </p>
        `}
      </div>

      <!-- 7-day Weekly Shift Cards -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
        <h2 style="font-size:17px; font-weight:700; margin:0; color:var(--text-main);">
          Ҷадвали пурраи ҳафтаинаи навбатдорон
        </h2>
        <span style="font-size:12px; color:var(--text-muted);">Ҳар як рӯз метавонад 2 ё 3 навбатдор дошта бошад</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:16px;">
        ${roster.map(item => {
          const isToday = item.day === todayKey;
          const sups = item.supervisors || [];

          return `
            <div class="card" style="${isToday ? 'border:2px solid var(--emerald-500); background:#f0fdf4;' : ''}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--text-main);">${item.label}</h3>
                <div style="display:flex; align-items:center; gap:6px;">
                  ${isToday ? `<span class="status-pill status-active" style="font-size:10px;">Имрӯз</span>` : ''}
                  ${canManage ? `
                    <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openEditDutyRosterModal('${item.day}')" style="padding:2px 8px; font-size:11px;" title="Таъин кардани 2-3 навбатдор">
                      ✏️ Таъин
                    </button>
                  ` : ''}
                </div>
              </div>

              ${sups.length > 0 ? `
                <div style="display:flex; flex-direction:column; gap:8px;">
                  ${sups.map(sup => `
                    <div style="display:flex; align-items:center; gap:10px; padding:8px 10px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm);">
                      <div style="width:32px; height:32px; border-radius:50%; background:var(--indigo-500); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0;">
                        ${(sup.name || 'М')[0]}
                      </div>
                      <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; font-size:13px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${sup.name}
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                          <span>${sup.role || 'Навбатдор'}</span>
                          <span style="font-family:var(--font-mono);">${sup.phone || ''}</span>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="text-align:center; padding:20px 10px; background:var(--surface-muted); border-radius:var(--radius-sm); border:1px dashed var(--border);">
                  <div style="font-size:20px; margin-bottom:4px;">👥</div>
                  <div style="font-size:12px; color:var(--text-muted);">Навбатдорон таъин нашудаанд</div>
                  ${canManage ? `
                    <button class="btn btn-outline btn-sm" onclick="window.khobgoh.openEditDutyRosterModal('${item.day}')" style="margin-top:8px; font-size:11px;">
                      + Таъин кардани 2-3 мураббӣ
                    </button>
                  ` : ''}
                </div>
              `}

              <div style="border-top:1px solid var(--border); margin-top:12px; padding-top:8px; font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                <span>Муддати баст: 24 соат</span>
                <span>${sups.length} нафар</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
