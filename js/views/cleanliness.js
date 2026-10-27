// Khobgoh Cleanliness View v2.2 (5 criteria, 50 points max)
import { store } from "../store.js";

export function renderCleanliness() {
  const t = (k) => store.t(k);
  const items = [...store.state.cleanliness].sort((a, b) => b.score - a.score);
  const canRate = store.canRateCleanliness();
  const inspector = store.state.supervisors.find(s => s.id === store.state.cleanlinessInspectorId);

  const gold = items[0];
  const silver = items[1];
  const bronze = items[2];

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('clean_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('clean_subtitle')}</p>
        </div>
        ${canRate ? `
          <button class="btn btn-primary" onclick="window.khobgoh.openRateRoomModal()">
            ${t('clean_btn_rate')}
          </button>
        ` : `
          <span class="status-pill status-permission" style="font-size:12px;">Баҳогузорӣ: Танҳо масъули тозагӣ ва Мудир</span>
        `}
      </div>

      <!-- Inspector Badge -->
      <div class="card" style="margin-bottom:20px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--surface-muted);">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:20px;">🛡️</span>
          <div>
            <div style="font-size:12px; color:var(--text-muted); font-weight:700;">МАСЪУЛИ ТАЪИНШУДАИ ОЗМУНИ ТОЗАГӢ:</div>
            <div style="font-size:14px; font-weight:800; color:var(--text-main);">${inspector ? inspector.name : 'Мудир (Админ)'} (${inspector ? inspector.phone : ''})</div>
          </div>
        </div>
        ${store.canManageStudents() ? `
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openSetInspectorModal()">
            Ивази масъул
          </button>
        ` : ''}
      </div>

      <!-- 5 Criteria Info Banner -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:24px;">
        <div style="padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:11px; color:var(--text-muted);">Намуди умумии ҳуҷра</div>
          <div style="font-weight:800; font-size:15px; color:var(--emerald-600);">то 15 хол</div>
        </div>
        <div style="padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:11px; color:var(--text-muted);">Ҷевонҳо (Шкафҳо)</div>
          <div style="font-weight:800; font-size:15px; color:var(--emerald-600);">то 10 хол</div>
        </div>
        <div style="padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:11px; color:var(--text-muted);">Ҷойи хоб (Катҳо)</div>
          <div style="font-weight:800; font-size:15px; color:var(--emerald-600);">то 10 хол</div>
        </div>
        <div style="padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:11px; color:var(--text-muted);">Чанги ҳуҷра</div>
          <div style="font-weight:800; font-size:15px; color:var(--emerald-600);">то 10 хол</div>
        </div>
        <div style="padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:11px; color:var(--text-muted);">Тароват ва ҳаво</div>
          <div style="font-weight:800; font-size:15px; color:var(--emerald-600);">то 5 хол</div>
        </div>
      </div>

      <!-- Podium Top 3 (Max 50 points) -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:18px; margin-bottom:28px;">
        <!-- Gold 1st -->
        <div class="card" style="border:2px solid #eab308; background:linear-gradient(180deg, rgba(254, 240, 138, 0.25) 0%, var(--surface) 100%); text-align:center; padding:24px;">
          <div style="font-size:42px; margin-bottom:6px;">🥇</div>
          <div style="font-size:12px; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.05em;">${t('clean_podium_gold')}</div>
          <h2 style="font-size:22px; font-weight:800; margin:4px 0 8px 0;">Ҳуҷраи ${gold ? gold.room : '—'}</h2>
          <div style="font-size:28px; font-weight:800; color:var(--emerald-600); margin-bottom:8px;">${gold ? gold.score : '0'} <span style="font-size:13px; color:var(--text-muted); font-weight:500;">/ 50 хол</span></div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${gold ? gold.notes : ''}</p>
        </div>

        <!-- Silver 2nd -->
        <div class="card" style="border:2px solid #94a3b8; background:linear-gradient(180deg, rgba(226, 232, 240, 0.35) 0%, var(--surface) 100%); text-align:center; padding:24px;">
          <div style="font-size:42px; margin-bottom:6px;">🥈</div>
          <div style="font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">${t('clean_podium_silver')}</div>
          <h2 style="font-size:22px; font-weight:800; margin:4px 0 8px 0;">Ҳуҷраи ${silver ? silver.room : '—'}</h2>
          <div style="font-size:28px; font-weight:800; color:var(--emerald-600); margin-bottom:8px;">${silver ? silver.score : '0'} <span style="font-size:13px; color:var(--text-muted); font-weight:500;">/ 50 хол</span></div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${silver ? silver.notes : ''}</p>
        </div>

        <!-- Bronze 3rd -->
        <div class="card" style="border:2px solid #d97706; background:linear-gradient(180deg, rgba(254, 215, 170, 0.3) 0%, var(--surface) 100%); text-align:center; padding:24px;">
          <div style="font-size:42px; margin-bottom:6px;">🥉</div>
          <div style="font-size:12px; font-weight:800; color:#b45309; text-transform:uppercase; letter-spacing:0.05em;">${t('clean_podium_bronze')}</div>
          <h2 style="font-size:22px; font-weight:800; margin:4px 0 8px 0;">Ҳуҷраи ${bronze ? bronze.room : '—'}</h2>
          <div style="font-size:28px; font-weight:800; color:var(--emerald-600); margin-bottom:8px;">${bronze ? bronze.score : '0'} <span style="font-size:13px; color:var(--text-muted); font-weight:500;">/ 50 хол</span></div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${bronze ? bronze.notes : ''}</p>
        </div>
      </div>

      <!-- Full Leaderboard Table with 5 criteria -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th style="width:50px;">Ҷой</th>
              <th>Ҳуҷра</th>
              <th>Ҷамъ (50)</th>
              <th>Намуди умумӣ (15)</th>
              <th>Ҷевонҳо (10)</th>
              <th>Ҷойи хоб (10)</th>
              <th>Чанги ҳуҷра (10)</th>
              <th>Тароват (5)</th>
              <th>Хулосаи санҷиш</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr>
                <td><strong>#${idx + 1}</strong></td>
                <td><strong style="color:var(--emerald-700);">Ҳуҷраи ${item.room}</strong></td>
                <td><strong style="font-size:16px; color:var(--emerald-600);">${item.score}</strong></td>
                <td>${item.appearance ?? '—'}</td>
                <td>${item.wardrobes ?? '—'}</td>
                <td>${item.beds ?? '—'}</td>
                <td>${item.dust ?? '—'}</td>
                <td>${item.air ?? '—'}</td>
                <td style="color:var(--text-muted); font-size:13px;">${item.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
