// Khobgoh Tea & Kitchen View v3.0 (Class Tea Schedule & Head Supervisor Recipes)
import { store } from "../store.js";

export function renderTea() {
  const t = (k) => store.t(k);
  const tea = store.state.tea || {};
  const recipes = tea.recipes || [];
  const classSchedule = tea.classSchedule || [];
  const canManage = store.canManageTea();
  const selectedClass = (typeof window !== "undefined" && window.khobgoh?.selectedTeaClass) || "";

  const classes = ["Синфи 7", "Синфи 8", "Синфи 9", "Синфи 10", "Синфи 11"];

  // Filter class schedule
  const filteredSchedule = classSchedule.filter(s => {
    return !selectedClass || s.class === selectedClass;
  });

  return `
    <div class="page-container">
      <!-- Page Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">Чойнӯшӣ ва ошхона</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">Ҷадвали соатҳои чойнӯшии ҳар як синф ва ретсепти менюи чойнӯшӣ аз ҷониби Сармураббӣ</p>
        </div>
        ${canManage ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-outline" onclick="window.khobgoh.openAddTeaRecipeModal()">
              + Менюи чойнӯшӣ
            </button>
            <button class="btn btn-primary" onclick="window.khobgoh.openAddClassTeaModal()">
              + Иловаи соати чойнӯшӣ
            </button>
          </div>
        ` : `
          <span class="status-pill status-permission" style="font-size:12px;">Идоракунии чойнӯшӣ: Танҳо Сармураббӣ ва Мудир</span>
        `}
      </div>

      <!-- Section 1: Class Tea Schedule (Requirement 8) -->
      <div class="card" style="margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <h3 style="margin:0; font-size:17px; font-weight:800; color:var(--emerald-900); display:flex; align-items:center; gap:8px;">
              <span>⏰ Ҷадвали чойнӯшии синфҳо</span>
            </h3>
            <small style="color:var(--text-muted);">Вақти муайяншудаи чойнӯшӣ барои синфҳои 7, 8, 9, 10 ва 11</small>
          </div>

          <!-- Class Filter Buttons -->
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button 
              class="btn btn-sm ${!selectedClass ? 'btn-primary' : 'btn-outline'}" 
              onclick="window.khobgoh.changeTeaClassFilter('')">
              Ҳамаи синфҳо
            </button>
            ${classes.map(c => `
              <button 
                class="btn btn-sm ${selectedClass === c ? 'btn-primary' : 'btn-outline'}" 
                onclick="window.khobgoh.changeTeaClassFilter('${c}')">
                ${c}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="table-container" style="border:none; box-shadow:none; margin:0;">
          <table class="table">
            <thead>
              <tr>
                <th style="width:140px;">Синф</th>
                <th style="width:140px;">Вақти хӯрок</th>
                <th style="width:160px;">Соат</th>
                <th>Макон</th>
                <th>Маълумот / Номгӯй</th>
                ${canManage ? `<th style="text-align:right; width:100px;">Амалҳо</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredSchedule.length === 0 ? `
                <tr>
                  <td colspan="${canManage ? 6 : 5}" style="text-align:center; padding:32px; color:var(--text-muted);">
                    Барои ин синф ҳанӯз ҷадвали чойнӯшӣ сабт нашудааст.
                  </td>
                </tr>
              ` : filteredSchedule.map(s => `
                <tr>
                  <td>
                    <span class="status-pill status-active" style="font-weight:700;">
                      ${s.class}
                    </span>
                  </td>
                  <td>
                    <strong style="color:var(--text-main); font-size:14px;">${s.meal || 'Субҳона'}</strong>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono); font-weight:800; color:var(--emerald-700); font-size:13px; background:var(--emerald-50); padding:4px 8px; border-radius:6px; border:1px solid var(--emerald-200);">
                      ${s.time}
                    </span>
                  </td>
                  <td style="color:var(--text-muted); font-size:13px;">${s.place || 'Ошхона'}</td>
                  <td style="font-size:13px;">${s.notes || '—'}</td>
                  ${canManage ? `
                    <td style="text-align:right;">
                      <div style="display:inline-flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openEditClassTeaModal('${s.id}')" title="Таҳрир">
                          ✏️
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.khobgoh.deleteClassTeaSchedule('${s.id}')" title="Хориҷ кардан">
                          🗑️
                        </button>
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Tea Recipes (Designated by Head Supervisor - Requirement 7) -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <div>
            <h3 style="margin:0; font-size:17px; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:8px;">
              <span>🌿 Ретсепти менюи чойнӯшӣ</span>
            </h3>
            <small style="color:var(--text-muted);">Ретсептҳо ва номгӯи тасдиқшудаи менюи чойнӯшӣ аз ҷониби Сармураббӣ</small>
          </div>
          ${canManage ? `
            <button class="btn btn-outline btn-sm" onclick="window.khobgoh.openAddTeaRecipeModal()">
              + Иловаи менюи чойнӯшӣ
            </button>
          ` : ''}
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          ${recipes.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align:center; padding:32px; color:var(--text-muted);">
              Ҳоло ягон менюи чойнӯшӣ сабт нашудааст.
            </div>
          ` : recipes.map(r => `
            <div style="padding:18px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); display:flex; flex-direction:column; justify-content:space-between; gap:12px; box-shadow:var(--shadow-sm);">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                  <h4 style="margin:0; font-size:16px; font-weight:800; color:var(--emerald-800);">${r.name}</h4>
                  <span class="status-pill status-permission" style="font-size:10px;">Сармураббӣ</span>
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:10px; line-height:1.5;">
                  <strong>Таркиби меню:</strong> ${r.ingredients || '—'}
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border); padding-top:10px;">
                <div style="font-size:12px; color:var(--emerald-700); font-weight:700;">
                  ⏱ ${r.time || '10 дақиқа'}
                </div>
                ${canManage ? `
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:11px;" onclick="window.khobgoh.openEditTeaRecipeModal('${r.id}')" title="Таҳрир">
                      ✏️ Таҳрир
                    </button>
                    <button class="btn btn-danger btn-sm" style="padding:2px 8px; font-size:11px;" onclick="window.khobgoh.deleteTeaRecipe('${r.id}')" title="Хориҷ">
                      🗑️
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
