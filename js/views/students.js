// Khobgoh Students View v3.0 (Bulletproof & Responsive)
import { store } from "../store.js";

export function renderStudents() {
  const t = (k) => store.t(k);
  const students = store.state.students || [];
  const rooms = (store.state.rooms || []).filter(r => r.type === 'student');
  const canAdd = store.canManageStudents();

  const classes = ["Синфи 7", "Синфи 8", "Синфи 9", "Синфи 10", "Синфи 11"];

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('students_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('students_subtitle')} (Ҳамагӣ: <b>${students.length}</b> талаба)</p>
        </div>
        ${canAdd ? `
          <button class="btn btn-primary" onclick="window.khobgoh.openAddStudentModal()">
            ${t('students_btn_add')}
          </button>
        ` : `
          <span class="status-pill status-permission" style="font-size:12px;">Иловаи талаба: Танҳо Мудир ва Сармураббӣ</span>
        `}
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card" style="padding:14px 18px; margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <div style="flex:1; min-width:220px; position:relative;">
          <input 
            type="text" 
            id="studentSearchInput" 
            class="form-control" 
            placeholder="Ҷустуҷӯ аз рӯи ном, ID ё синф..." 
            oninput="window.khobgoh.filterStudents()">
        </div>

        <!-- Class Filter (Includes Grade 7) -->
        <select id="studentClassFilter" class="form-control" style="width:auto; min-width:140px;" onchange="window.khobgoh.filterStudents()">
          <option value="">Ҳамаи синфҳо</option>
          ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>

        <!-- Room Filter -->
        <select id="studentRoomFilter" class="form-control" style="width:auto; min-width:140px;" onchange="window.khobgoh.filterStudents()">
          <option value="">${t('students_filter_room')}</option>
          ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
        </select>

        <!-- Status Filter -->
        <select id="studentStatusFilter" class="form-control" style="width:auto; min-width:140px;" onchange="window.khobgoh.filterStudents()">
          <option value="">${t('students_filter_status')}</option>
          <option value="Active">${t('students_status_active')}</option>
          <option value="Absent">${t('students_status_absent')}</option>
          <option value="Transferred">${t('students_status_transferred')}</option>
        </select>
      </div>

      <!-- Students Table -->
      <div class="table-container">
        <table class="table" id="studentsTable">
          <thead>
            <tr>
              <th>${t('students_col_name')}</th>
              <th>${t('students_col_room')}</th>
              <th>${t('students_col_bed')}</th>
              <th>${t('students_col_course')}</th>
              <th>${t('students_col_phone')}</th>
              <th>${t('students_col_status')}</th>
              <th style="text-align:right;">${t('students_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${students.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align:center; padding:36px; color:var(--text-muted);">
                  Ҳоло ягон талаба сабт нашудааст.
                </td>
              </tr>
            ` : students.map(s => {
              const name = String(s.name || 'Беном').trim();
              const studentId = String(s.studentId || s.id || 'KH-0000');
              const room = String(s.room || '—');
              const bed = s.bed || 1;
              const course = String(s.course || 'Синфи 10');
              const phone = s.phone || '—';
              const isAbsent = s.status === 'Absent';
              const statusClass = s.status === 'Active' ? 'status-active' : isAbsent ? 'status-absent' : 'status-permission';
              const isLeader = store.state.roomLeaders && store.state.roomLeaders[room] === s.id;

              // Safe initials
              const parts = name.split(' ');
              const initials = (parts[0] ? parts[0][0] : 'Т') + (parts[1] ? parts[1][0] : '');

              return `
                <tr 
                  data-name="${name.toLowerCase()}" 
                  data-id="${studentId.toLowerCase()}" 
                  data-room="${room}" 
                  data-course="${course.toLowerCase()}" 
                  data-status="${s.status || 'Active'}">
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div style="width:34px; height:34px; border-radius:50%; background:var(--emerald-100); color:var(--emerald-800); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0;">
                        ${initials.toUpperCase()}
                      </div>
                      <div>
                        <div style="font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px;">
                          <span>${name}</span>
                        </div>
                        <div style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill status-permission" style="font-weight:700;">Ҳуҷраи ${room}</span>
                  </td>
                  <td><strong>№ ${bed}</strong></td>
                  <td>
                    <span class="status-pill" style="background:var(--surface-muted); color:var(--text-main); font-weight:600;">
                      ${course}
                    </span>
                  </td>
                  <td style="font-family:var(--font-mono); font-size:13px;">${phone}</td>
                  <td>
                    <span class="status-pill ${statusClass}">
                      ${isAbsent ? '🔴 Ғоиб' : '🟢 Ҳозир'}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:6px;">
                      <button class="btn btn-secondary btn-sm" title="Корти дохилшавии талаба" onclick="window.khobgoh.viewStudentPass('${s.id}')">
                        🪪 ID
                      </button>
                      ${canAdd ? `
                        <button class="btn btn-secondary btn-sm" title="Таҳрир" onclick="window.khobgoh.editStudent('${s.id}')">
                          ✏️
                        </button>
                        <button class="btn btn-danger btn-sm" title="Хориҷ кардан" onclick="window.khobgoh.deleteStudent('${s.id}')">
                          🗑️
                        </button>
                      ` : ''}
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
