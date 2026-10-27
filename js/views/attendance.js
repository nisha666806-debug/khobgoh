// Khobgoh Attendance View v2.2
import { store } from "../store.js";

export function renderAttendance() {
  const t = (k) => store.t(k);
  const students = store.state.students.filter(s => s.status !== 'Removed');
  const today = new Date().toISOString().split("T")[0];
  const currentDate = window.khobgoh?.selectedAttDate || today;
  const currentAttendance = store.state.attendance[currentDate] || {};

  // Group by room
  const roomGroups = {};
  students.forEach(s => {
    if (!roomGroups[s.room]) roomGroups[s.room] = [];
    roomGroups[s.room].push(s);
  });

  // Calculate statistics and find absent students
  const absentStudents = [];
  const presentStudents = [];

  students.forEach(s => {
    const status = currentAttendance[s.id] || "present";
    if (status === "absent") {
      absentStudents.push(s);
    } else {
      presentStudents.push(s);
    }
  });

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('att_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('att_subtitle')}</p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.markAllPresent('${currentDate}')">
            ✅ ${t('att_btn_all_present')}
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.print()">
            🖨️ ${t('att_btn_export')}
          </button>
        </div>
      </div>

      <!-- Date selector & Top Summary -->
      <div class="card" style="padding:14px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <label style="font-weight:700; margin:0; font-size:13px;">${t('att_date')}:</label>
          <input type="date" value="${currentDate}" class="form-control" style="width:auto; padding:6px 12px;" onchange="window.khobgoh.changeAttDate(this.value)">
        </div>

        <div style="display:flex; gap:16px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:16px;">🟢</span>
            <span style="font-size:13px; font-weight:700; color:#15803d;">Ҳаст: ${presentStudents.length}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:16px;">🔴</span>
            <span style="font-size:13px; font-weight:700; color:#b91c1c;">Нест: ${absentStudents.length}</span>
          </div>
        </div>
      </div>

      <!-- TOP PRIORITY BLOCK: Absent Students Today (Талабаҳое, ки имрӯз дар хобгоҳ нестанд) -->
      <div class="card" style="margin-bottom:24px; border:2px solid #fca5a5; background:#fff5f5; padding:18px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-weight:800; font-size:15px; color:#991b1b; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span>
            <span>${t('att_absent_list_title')}</span>
            <span class="status-pill status-absent" style="font-size:11px;">${absentStudents.length} нафар</span>
          </div>
        </div>

        ${absentStudents.length === 0 ? `
          <div style="font-size:13px; color:#15803d; font-weight:600; padding:8px 0;">
            Ҳамаи талабагон имрӯз дар хобгоҳ ҳузур доранд. Ҳеҷ кас ғоиб нест! 🎉
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
            ${absentStudents.map(student => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#ffffff; border:1px solid #fecaca; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
                <div>
                  <div style="font-weight:700; font-size:14px; color:#7f1d1d;">${student.name}</div>
                  <div style="font-size:12px; color:var(--text-muted);">Ҳуҷраи ${student.room} • Ҷойи №${student.bed} (${student.course})</div>
                  <div style="font-size:11px; color:#b91c1c; font-family:var(--font-mono); margin-top:2px;">📞 ${student.phone || student.guardian || 'Бе рақам'}</div>
                </div>
                <button 
                  class="btn btn-sm btn-primary" 
                  style="border-radius:9999px; padding:6px 14px; font-size:12px; background:#10b981;"
                  title="Баргардонидан ба ҳолати «Ҳаст»"
                  onclick="window.khobgoh.setAttStatus('${currentDate}', '${student.id}', 'present')">
                  🟢 Ҳаст
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Main Room Attendance List with Green / Red Toggles -->
      <h2 style="font-size:17px; font-weight:700; margin-bottom:14px; color:var(--text-main);">
        Ҳамаи ҳуҷраҳо ва сабти ҳаррӯза
      </h2>

      <div style="display:flex; flex-direction:column; gap:16px;">
        ${Object.keys(roomGroups).sort().map(roomId => {
          const roomStudents = roomGroups[roomId];

          return `
            <div class="card" style="padding:16px 20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">
                <h3 style="margin:0; font-size:16px; font-weight:700;">Ҳуҷраи ${roomId}</h3>
                <span style="font-size:12px; color:var(--text-muted); font-weight:600;">${roomStudents.length} талаба</span>
              </div>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:10px;">
                ${roomStudents.map(student => {
                  const status = currentAttendance[student.id] || "present";
                  const isPresent = status === "present";

                  return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:${isPresent ? 'var(--surface-muted)' : '#fef2f2'}; border:1px solid ${isPresent ? 'var(--border)' : '#fecaca'}; border-radius:var(--radius-md);">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:800; font-size:12px; color:var(--emerald-700); width:26px;">№${student.bed}</span>
                        <div>
                          <div style="font-weight:700; font-size:14px; color:var(--text-main);">${student.name}</div>
                          <div style="font-size:11px; color:var(--text-muted);">${student.course}</div>
                        </div>
                      </div>

                      <!-- Distinct Green / Red Toggle Buttons -->
                      <div style="display:flex; gap:6px;">
                        <button 
                          class="btn btn-sm ${isPresent ? 'btn-primary' : 'btn-outline'}" 
                          style="border-radius:9999px; padding:5px 12px; font-weight:700; ${isPresent ? 'background:#10b981; border-color:#059669;' : 'color:#15803d;'}"
                          onclick="window.khobgoh.setAttStatus('${currentDate}', '${student.id}', 'present')">
                          🟢 Ҳаст
                        </button>

                        <button 
                          class="btn btn-sm ${!isPresent ? 'btn-danger' : 'btn-outline'}" 
                          style="border-radius:9999px; padding:5px 12px; font-weight:700; ${!isPresent ? 'background:#ef4444; color:#fff;' : 'color:#b91c1c;'}"
                          onclick="window.khobgoh.setAttStatus('${currentDate}', '${student.id}', 'absent')">
                          🔴 Нест
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
