// Khobgoh Tea & Kitchen View
import { store } from "../store.js";

export function renderTea() {
  const t = (k) => store.t(k);
  const tea = store.state.tea;

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('tea_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('tea_subtitle')}</p>
        </div>
      </div>

      <!-- Quick Status -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin-bottom:28px;">
        <div class="card" style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:36px;">🍵</div>
          <div>
            <div style="font-size:12px; color:var(--text-muted); font-weight:600;">Навбатдори имрӯзаи чой</div>
            <div style="font-size:16px; font-weight:800; color:var(--text-main);">${tea.todayDuty}</div>
          </div>
        </div>

        <div class="card" style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:36px;">🫖</div>
          <div>
            <div style="font-size:12px; color:var(--text-muted); font-weight:600;">Ҳолати самовори хобгоҳ</div>
            <div style="font-size:16px; font-weight:800; color:var(--emerald-600);">${tea.samovarStatus}</div>
          </div>
        </div>
      </div>

      <!-- Meal & Tea Times -->
      <div class="card" style="margin-bottom:28px;">
        <h3 style="margin:0 0 16px 0; font-size:16px; font-weight:700;">⏰ Ҷадвали вақтҳои чойнӯшӣ</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
          ${tea.schedule.map(s => `
            <div style="padding:16px; background:var(--surface-muted); border-radius:var(--radius-md); border-left:3px solid var(--emerald-600);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="font-size:14px;">${s.meal}</strong>
                <span class="status-pill status-active" style="font-size:11px;">${s.time}</span>
              </div>
              <p style="margin:0; font-size:12px; color:var(--text-muted);">${s.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tea Recipes -->
      <div class="card">
        <h3 style="margin:0 0 16px 0; font-size:16px; font-weight:700;">🌿 ${tea.recipes ? 'Ресептҳои чой ва нӯшокиҳо' : 'Recipes'}</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          ${tea.recipes.map(r => `
            <div style="padding:16px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface);">
              <h4 style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:var(--text-main);">${r.name}</h4>
              <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">
                <strong>Таркиб:</strong> ${r.ingredients}
              </div>
              <div style="font-size:12px; color:var(--emerald-700); font-weight:600;">
                ⏱ Вақти дам хӯрдан: ${r.time}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
