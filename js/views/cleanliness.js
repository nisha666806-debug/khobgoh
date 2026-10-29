// Khobgoh Cleanliness View v3.0 (Inspector-only grading & Daily History tracking)
import { store } from "../store.js";

export function renderCleanliness() {
  const t = (k) => store.t(k);
  const selectedDate = window.khobgoh?.selectedCleanlinessDate || new Date().toISOString().split("T")[0];
  const items = store.getCleanlinessForDate(selectedDate);
  const canRate = store.canRateCleanliness();
  const inspector = (store.state.supervisors || []).find(s => s.id === store.state.cleanlinessInspectorId);
  const hasInspector = !!store.state.cleanlinessInspectorId;

  const gold = items[0];
  const silver = items[1];
  const bronze = items[2];

  // Distinct dates for history
  const allHistory = [...store.state.cleanliness].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const dates = [...new Set(allHistory.map(c => c.date).filter(Boolean))];

  return `
    <div class="page-container">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('clean_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">Озмуни тозагии ҳуҷраҳо аз рӯи 5 меъёр ва таърихи ҳаррӯзаи балҳо</p>
        </div>
        ${canRate ? `
          <button class="btn btn-primary" onclick="window.khobgoh.openRateRoomModal()">
            + Баҳогузории нав
          </button>
        ` : (hasInspector ? `
          <span class="status-pill status-permission" style="font-size:12px; padding:6px 12px;">
            🔒 Баҳогузорӣ танҳо барои масъули тозагӣ: <b>${inspector ? inspector.name : 'Масъул'}</b>
          </span>
        ` : `
          <span class="status-pill status-absent" style="font-size:12px; padding:6px 12px;">
            ⚠️ Масъули тозагӣ таъин нашудааст (Баҳогузорӣ маҳкам аст)
          </span>
        `)}
      </div>

      <!-- Inspector Badge & Status Banner (Requirement 4) -->
      <div class="card" style="margin-bottom:20px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:${hasInspector ? 'var(--surface-muted)' : '#fef2f2'}; border-color:${hasInspector ? 'var(--border)' : '#fca5a5'};">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${hasInspector ? '🛡️' : '⚠️'}</span>
          <div>
            <div style="font-size:11px; color:${hasInspector ? 'var(--text-muted)' : '#991b1b'}; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
              ${hasInspector ? 'МАСЪУЛИ ТАЪИНШУДАИ ОЗМУНИ ТОЗАГӢ' : 'МАСЪУЛ ТАЪИН НАШУДААСТ'}
            </div>
            <div style="font-size:15px; font-weight:800; color:var(--text-main);">
              ${inspector ? `${inspector.name} (${inspector.phone || ''})` : 'Барои баҳогузорӣ аввал масъули тозагиро таъин кунед'}
            </div>
          </div>
        </div>
        ${store.canManageRooms() ? `
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openSetInspectorModal()">
            ${hasInspector ? 'Ивази масъул' : 'Таъин кардани масъул'}
          </button>
        ` : ''}
      </div>

      <!-- Date Selector for Cleanliness (Requirement 5) -->
      <div class="card" style="margin-bottom:24px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:20px;">📅</span>
          <div>
            <div style="font-weight:700; font-size:14px;">Санаи санҷиш (Таърихи рӯз):</div>
            <div style="font-size:12px; color:var(--text-muted);">Холҳои додашудаи ҳамин санаро нишон медиҳад</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input 
            type="date" 
            id="cleanDateInput" 
            value="${selectedDate}" 
            class="form-control" 
            style="width:auto; font-weight:700; padding:6px 12px;"
            onchange="window.khobgoh.changeCleanlinessDate(this.value)">
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.changeCleanlinessDate(new Date().toISOString().split('T')[0])">
            Имрӯз
          </button>
        </div>
      </div>

      <!-- 5 Criteria Info Banner -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-bottom:24px;">
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

      <!-- Podium Top 3 for Selected Date -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:18px; margin-bottom:28px;">
        <!-- Gold 1st -->
        <div class="card" style="border:2px solid #eab308; background:linear-gradient(180deg, rgba(254, 240, 138, 0.25) 0%, var(--surface) 100%); text-align:center; padding:24px;">
          <div style="font-size:42px; margin-bottom:6px;">🥇</div>
          <div style="font-size:12px; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.05em;">${t('clean_podium_gold')}</div>
          <h2 style="font-size:22px; font-weight:800; margin:4px 0 8px 0;">Ҳуҷраи ${gold ? gold.room : '—'}</h2>
          <div style="font-size:28px; font-weight:800; color:var(--emerald-600); margin-bottom:8px;">${gold ? gold.score : '0'} <span style="font-size:13px; color:var(--text-muted); font-weight:500;">/ 50 хол</span></div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${gold ? gold.notes : 'Санҷиш нашудааст'}</p>
        </div>

        <!-- Silver 2nd -->
        <div class="card" style="border:2px solid #94a3b8; background:linear-gradient(180deg, rgba(226, 232, 240, 0.35) 0%, var(--surface) 100%); text-align:center; padding:24px;">
          <div style="font-size:42px; margin-bottom:6px;">🥈</div>
          <div style="font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">${t('clean_podium_silver')}</div>
          <h2 style="font-size:22px; font-weight:800; margin:4px 0 8px 0;">Ҳуҷраи ${silver ? silver.room : '—'}</h2>
          <div style="font-size:28px; font-weight:800; color:var(--emerald-600); margin-bottom:8px;">${silver ? silver.score : '0'} <span style="font-size:13px; color:var(--text-muted); font-weight:500;">/ 50 хол</span></div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${silver ? silver.notes : 'Санҷиш нашудааст'}</p>
        </div>

        <!-- Bronze 3rd -->
        <div class="card" style="border:2px solid #d97706; background:linear-gradient(180deg, rgba(254, 215, 170, 0.3) 0%, var(--surface) 100%); text-align:center; padding:24px;">
          <div style="font-size:42px; margin-bottom:6px;">🥉</div>
          <div style="font-size:12px; font-weight:800; color:#b45309; text-transform:uppercase; letter-spacing:0.05em;">${t('clean_podium_bronze')}</div>
          <h2 style="font-size:22px; font-weight:800; margin:4px 0 8px 0;">Ҳуҷраи ${bronze ? bronze.room : '—'}</h2>
          <div style="font-size:28px; font-weight:800; color:var(--emerald-600); margin-bottom:8px;">${bronze ? bronze.score : '0'} <span style="font-size:13px; color:var(--text-muted); font-weight:500;">/ 50 хол</span></div>
          <p style="font-size:13px; color:var(--text-muted); margin:0;">${bronze ? bronze.notes : 'Санҷиш нашудааст'}</p>
        </div>
      </div>

      <!-- Leaderboard Table for Selected Date -->
      <div class="card" style="margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
          <h3 style="margin:0; font-size:16px; font-weight:700;">📊 Ҷадвали холҳои тозагӣ дар санаи ${selectedDate}</h3>
          <span style="font-size:12px; color:var(--text-muted);">Масъули санҷиш: <b>${inspector ? inspector.name : '—'}</b></span>
        </div>

        <div class="table-container" style="border:none; box-shadow:none;">
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
              ${items.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);">
                    Дар ин сана (${selectedDate}) ҳанӯз баҳогузорӣ сабт нашудааст.
                  </td>
                </tr>
              ` : items.map((item, idx) => `
                <tr>
                  <td><strong>#${idx + 1}</strong></td>
                  <td><strong style="color:var(--emerald-700);">Ҳуҷраи ${item.room}</strong></td>
                  <td><strong style="font-size:16px; color:var(--emerald-600);">${item.score}</strong></td>
                  <td>${item.appearance ?? '—'}</td>
                  <td>${item.wardrobes ?? '—'}</td>
                  <td>${item.beds ?? '—'}</td>
                  <td>${item.dust ?? '—'}</td>
                  <td>${item.air ?? '—'}</td>
                  <td style="color:var(--text-muted); font-size:13px;">${item.notes || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section: Cleanliness History by Date (Requirement 5) -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700;">📜 Таърихи баҳогузории рӯзҳои гузашта</h3>
            <p style="margin:2px 0 0 0; font-size:13px; color:var(--text-muted);">Мураббиён метавонанд холҳои гирифтаи ҳуҷраҳои талабагонашонро дар ҳар як рӯз бубинанд</p>
          </div>
        </div>

        <div class="table-container" style="border:none; box-shadow:none;">
          <table class="table">
            <thead>
              <tr>
                <th style="width:120px;">Сана</th>
                <th>Ҳуҷра</th>
                <th>Бали умумӣ</th>
                <th>Масъули санҷиш</th>
                <th>Эзоҳ ва тавсия</th>
                <th style="text-align:right;">Амал</th>
              </tr>
            </thead>
            <tbody>
              ${allHistory.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">
                    Таърихи санҷиш холӣ аст.
                  </td>
                </tr>
              ` : allHistory.slice(0, 20).map(h => `
                <tr>
                  <td style="font-family:var(--font-mono); font-size:13px; font-weight:700;">${h.date || '—'}</td>
                  <td><strong style="color:var(--emerald-800);">Ҳуҷраи ${h.room}</strong></td>
                  <td>
                    <span class="status-pill status-active" style="font-weight:800;">
                      ${h.score} / 50 хол
                    </span>
                  </td>
                  <td style="font-size:13px; color:var(--text-muted);">${h.inspectorName || 'Масъули тозагӣ'}</td>
                  <td style="font-size:13px; color:var(--text-muted);">${h.notes || '—'}</td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.changeCleanlinessDate('${h.date}')" style="padding:2px 8px; font-size:11px;">
                      Дидани ин сана ➔
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
