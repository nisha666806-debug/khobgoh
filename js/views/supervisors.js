// Khobgoh Supervisors View v3.0 (Restricted to Manager & Head Supervisor)
import { store } from "../store.js";

export function renderSupervisors() {
  const t = (k) => store.t(k);
  const state = store.state;
  const supervisors = state.supervisors || [];
  const rooms = state.rooms || [];
  const canManage = store.canManageSupervisors();

  // Strict permission check (Requirement 1)
  if (!canManage) {
    return `
      <div class="page-container">
        <div class="card" style="text-align:center; padding:50px 20px; max-width:540px; margin:40px auto;">
          <div style="font-size:48px; margin-bottom:12px;">🔒</div>
          <h2 style="color:var(--text-main); margin:0 0 8px 0; font-size:20px; font-weight:800;">Дастрасӣ маҳдуд аст</h2>
          <p style="color:var(--text-muted); font-size:14px; margin:0 0 20px 0;">
            Рӯйхат ва идоракунии мураббиён танҳо барои <b>Мудир (Админ)</b> ва <b>Сармураббӣ</b> дастрас мебошад.
          </p>
          <button class="btn btn-primary" onclick="window.khobgoh.navigate('dashboard')">
            ← Ба саҳифаи асосӣ
          </button>
        </div>
      </div>
    `;
  }

  const headCount = supervisors.filter(s => s.role === 'head').length;
  const supCount = supervisors.filter(s => s.role === 'supervisor').length;

  return `
    <div class="page-container">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">Идоракунии мураббиён</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">Маълумоти пурраи мураббиён, бақайдгирӣ ва ҳуҷраҳои вобасташуда</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="window.khobgoh.openCreateInviteModal()">
            📨 Коди даъват
          </button>
          <button class="btn btn-primary" onclick="window.khobgoh.openAddSupervisorModal()">
            + Мураббии нав
          </button>
        </div>
      </div>

      <!-- Quick KPI Stats -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="card" style="padding:16px; display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:var(--emerald-100); color:var(--emerald-800); display:flex; align-items:center; justify-content:center; font-size:22px;">
            👥
          </div>
          <div>
            <div style="font-size:12px; color:var(--text-muted); font-weight:600;">Ҳамаи мураббиён</div>
            <div style="font-size:20px; font-weight:800; color:var(--text-main);">${supervisors.length} нафар</div>
          </div>
        </div>

        <div class="card" style="padding:16px; display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:#fef3c7; color:#b45309; display:flex; align-items:center; justify-content:center; font-size:22px;">
            👑
          </div>
          <div>
            <div style="font-size:12px; color:var(--text-muted); font-weight:600;">Сармураббиён</div>
            <div style="font-size:20px; font-weight:800; color:var(--text-main);">${headCount} нафар</div>
          </div>
        </div>

        <div class="card" style="padding:16px; display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:#e0e7ff; color:#4338ca; display:flex; align-items:center; justify-content:center; font-size:22px;">
            👔
          </div>
          <div>
            <div style="font-size:12px; color:var(--text-muted); font-weight:600;">Мураббиёни хобгоҳ</div>
            <div style="font-size:20px; font-weight:800; color:var(--text-main);">${supCount} нафар</div>
          </div>
        </div>
      </div>

      <!-- Supervisors Table -->
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="padding:16px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <h3 style="margin:0; font-size:16px; font-weight:700;">Рӯйхати расмии мураббиён</h3>
          <div style="font-size:12px; color:var(--text-muted);">
            Намоён танҳо барои: <b>Админ</b> ва <b>Сармураббӣ</b>
          </div>
        </div>

        <div class="table-container" style="border:none; box-shadow:none; margin:0;">
          <table class="table">
            <thead>
              <tr>
                <th>Ному насаб</th>
                <th>Вазифа / Нақш</th>
                <th>Ҳуҷраи зисти мураббӣ</th>
                <th>Ҳуҷраҳои вобасташуда</th>
                <th>Телефон</th>
                <th>Email</th>
                <th style="text-align:right;">Амалҳо</th>
              </tr>
            </thead>
            <tbody>
              ${supervisors.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; padding:36px; color:var(--text-muted);">
                    Ҳоло ягон мураббӣ сабт нашудааст.
                  </td>
                </tr>
              ` : supervisors.map(sup => {
                const isHead = sup.role === 'head';
                const assigned = (sup.assignedRoomIds && sup.assignedRoomIds.length) 
                  ? sup.assignedRoomIds.map(rid => `Ҳуҷраи ${rid}`).join(', ')
                  : (sup.room ? `Ҳуҷраи ${sup.room}` : 'Таъин нашудааст');

                return `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:38px; height:38px; border-radius:50%; background:${isHead ? 'var(--amber-500)' : 'var(--indigo-500)'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; box-shadow:var(--shadow-sm);">
                          ${(sup.name || 'М')[0]}
                        </div>
                        <div>
                          <div style="font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px;">
                            <span>${sup.name || '—'}</span>
                            ${isHead ? `<span title="Сармураббӣ" style="font-size:13px;">👑</span>` : ''}
                          </div>
                          <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${sup.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill ${isHead ? 'status-active' : 'status-permission'}" style="font-weight:700;">
                        ${isHead ? '👑 Сармураббӣ' : 'Мураббӣ'}
                      </span>
                    </td>
                    <td>
                      <div style="font-size:13px; font-weight:700; color:var(--text-main);">
                        Ҳуҷраи ${sup.room || '201'}
                      </div>
                      <div style="font-size:11px; color:var(--text-muted);">Кат: №${sup.bed || 1}</div>
                    </td>
                    <td>
                      <span style="font-size:13px; color:var(--text-main); font-weight:600;">
                        ${assigned}
                      </span>
                    </td>
                    <td style="font-family:var(--font-mono); font-size:13px;">${sup.phone || '—'}</td>
                    <td style="font-size:13px; color:var(--text-muted);">${sup.email || '—'}</td>
                    <td style="text-align:right;">
                      <div style="display:inline-flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openEditSupervisorModal('${sup.id}')" title="Таҳрири маълумот">
                          ✏️
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.toggleSupervisorRole('${sup.id}')" title="${isHead ? 'Табдил ба мураббии оддӣ' : 'Таъин чун Сармураббӣ'}">
                          ${isHead ? '⬇️' : '👑'}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.khobgoh.deleteSupervisor('${sup.id}')" title="Хориҷ кардан">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
