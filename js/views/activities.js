// Khobgoh Daily Activities View
import { store } from "../store.js";

export function renderActivities() {
  const t = (k) => store.t(k);
  const canEdit = store.canManageActivities();
  const selectedDay = window.khobgoh?.selectedActDay || "mon";
  const selectedClass = window.khobgoh?.selectedActClass || "";

  const days = [
    { key: "mon", label: "Душанбе" },
    { key: "tue", label: "Сешанбе" },
    { key: "wed", label: "Чоршанбе" },
    { key: "thu", label: "Панҷшанбе" },
    { key: "fri", label: "Ҷумъа" },
    { key: "sat", label: "Шанбе" },
    { key: "sun", label: "Якшанбе" }
  ];

  const classes = ["Синфи 8", "Синфи 9", "Синфи 10", "Синфи 11"];

  // Filter activities
  const filtered = store.state.activities.filter(a => {
    const matchDay = a.day === selectedDay;
    const matchClass = !selectedClass || a.class === selectedClass;
    return matchDay && matchClass;
  });

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('act_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('act_subtitle')}</p>
        </div>
        ${canEdit ? `
          <button class="btn btn-primary" onclick="window.khobgoh.openAddActivityModal()">
            ${t('act_btn_add')}
          </button>
        ` : `
          <span class="status-pill status-permission" style="font-size:12px;">Танзими ҷадвал: Танҳо Мудир ва Сармураббӣ</span>
        `}
      </div>

      <!-- Days of Week Pills Navigation -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:18px;">
        ${days.map(d => `
          <button 
            class="btn btn-sm ${d.key === selectedDay ? 'btn-primary' : 'btn-secondary'}" 
            style="border-radius:9999px; padding:8px 18px; font-weight:700; white-space:nowrap;"
            onclick="window.khobgoh.changeActDay('${d.key}')">
            ${d.label}
          </button>
        `).join('')}
      </div>

      <!-- Class Filter Toolbar -->
      <div class="card" style="padding:14px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-weight:700; margin:0; font-size:13px;">Филтри синфҳо:</label>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-sm ${!selectedClass ? 'btn-primary' : 'btn-outline'}" onclick="window.khobgoh.changeActClass('')">Ҳамаи синфҳо</button>
            ${classes.map(c => `
              <button class="btn btn-sm ${selectedClass === c ? 'btn-primary' : 'btn-outline'}" onclick="window.khobgoh.changeActClass('${c}')">${c}</button>
            `).join('')}
          </div>
        </div>

        <span style="font-size:13px; color:var(--text-muted); font-weight:600;">
          Ҳамагӣ: <b>${filtered.length}</b> фаъолият
        </span>
      </div>

      <!-- Visual Matrix Table -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th style="width:140px;">${t('act_class')}</th>
              <th style="width:160px;">${t('act_time')}</th>
              <th>${t('act_activity')}</th>
              <th style="width:200px;">${t('act_room')}</th>
              ${canEdit ? `<th style="text-align:right; width:90px;">Амалҳо</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="${canEdit ? 5 : 4}" style="text-align:center; padding:36px; color:var(--text-muted);">
                  Барои ин рӯз ва ин синф ҳоло фаъолияте сабт нашудааст.
                </td>
              </tr>
            ` : filtered.map(item => `
              <tr>
                <td>
                  <span class="status-pill status-active" style="font-weight:700;">
                    ${item.class}
                  </span>
                </td>
                <td style="font-family:var(--font-mono); font-weight:700; color:var(--emerald-700);">
                  ⏰ ${item.time}
                </td>
                <td>
                  <strong style="font-size:14px; color:var(--text-main);">${item.activity}</strong>
                </td>
                <td>
                  <span style="font-size:13px; color:var(--text-muted);">📍 ${item.location}</span>
                </td>
                ${canEdit ? `
                  <td style="text-align:right;">
                    <button class="btn btn-danger btn-sm" onclick="window.khobgoh.deleteActivity('${item.id}')" title="Нобуд кардан">
                      🗑️
                    </button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}
