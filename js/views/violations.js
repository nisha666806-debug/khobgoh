// Khobgoh Violations View v2.4 (Without Severity / Бе дараҷа)
import { store } from "../store.js";

export function renderViolations() {
  const t = (k) => store.t(k);
  const violations = store.state.violations;

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('viol_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('viol_subtitle')}</p>
        </div>
        <button class="btn btn-primary" onclick="window.khobgoh.openAddViolationModal()">
          ${t('viol_btn_add')}
        </button>
      </div>

      <div class="card" style="margin-bottom:16px; padding:12px 16px; background:var(--surface-muted); font-size:13px; color:var(--text-muted);">
        ℹ️ <b>Озодии сабт:</b> Ҳамаи мураббиён ҳуқуқ доранд қоидавайронкунии ҳамаи талабагони хобгоҳро сабт намоянд.
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>${t('viol_col_date')}</th>
              <th>${t('viol_col_student')}</th>
              <th>${t('viol_col_room')}</th>
              <th>${t('viol_col_reason')}</th>
              <th>Сабткунанда</th>
              <th>${t('viol_col_status')}</th>
              <th style="text-align:right;">${t('students_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${violations.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">
                  Ҳеҷ қоидавайронкунӣ сабт нашудааст. Интизом намунавӣ аст! ✨
                </td>
              </tr>
            ` : violations.map(v => {
              const isResolved = v.status === 'resolved';

              return `
                <tr>
                  <td style="font-family:var(--font-mono); font-size:13px;">${v.date}</td>
                  <td><strong>${v.studentName}</strong></td>
                  <td><span class="status-pill status-permission">Ҳуҷраи ${v.room}</span></td>
                  <td style="max-width:360px;">${v.reason}</td>
                  <td style="font-size:13px; color:var(--text-muted);">${v.reporter || 'Мураббӣ'}</td>
                  <td>
                    <span class="status-pill ${isResolved ? 'status-active' : 'status-absent'}">
                      ${t('viol_status_' + v.status)}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:6px; align-items:center;">
                      ${!isResolved ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.resolveViolation('${v.id}')" title="Ҳал шуд">
                          ✓ Ҳал шуд
                        </button>
                      ` : `<span style="font-size:12px; color:var(--text-muted); padding-right:4px;">Пӯшида шуд</span>`}
                      <button class="btn btn-danger btn-sm" onclick="window.khobgoh.deleteViolation('${v.id}')" title="Нест кардан (Удалить)" style="padding:4px 8px;">
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
  `;
}
