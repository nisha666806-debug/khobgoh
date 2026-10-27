// Khobgoh Students View v2.2
import { store } from "../store.js";

export function renderStudents() {
  const t = (k) => store.t(k);
  const students = store.state.students;
  const rooms = store.state.rooms;
  const canAdd = store.canManageStudents();

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('students_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('students_subtitle')}</p>
        </div>
        ${canAdd ? `
          <button class="btn btn-primary" onclick="window.khobgoh.openAddStudentModal()">
            ${t('students_btn_add')}
          </button>
        ` : `
          <span class="status-pill status-permission" style="font-size:12px;">Иловаи донишҷӯ: Танҳо Мудир ва Сармураббӣ</span>
        `}
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card" style="padding:14px 18px; margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <div style="flex:1; min-width:240px; position:relative;">
          <input type="text" id="studentSearchInput" class="form-control" placeholder="${t('students_search')}" oninput="window.khobgoh.filterStudents()">
        </div>

        <select id="studentRoomFilter" class="form-control" style="width:auto; min-width:160px;" onchange="window.khobgoh.filterStudents()">
          <option value="">${t('students_filter_room')}</option>
          ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
        </select>

        <select id="studentStatusFilter" class="form-control" style="width:auto; min-width:160px;" onchange="window.khobgoh.filterStudents()">
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
            ${students.map(s => {
              const isAbsent = s.status === 'Absent';
              const statusClass = s.status === 'Active' ? 'status-active' : isAbsent ? 'status-absent' : 'status-permission';
              const isLeader = store.state.roomLeaders[s.room] === s.id;

              return `
                <tr data-name="${s.name.toLowerCase()}" data-id="${s.studentId.toLowerCase()}" data-room="${s.room}" data-status="${s.status}">
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div style="width:34px; height:34px; border-radius:50%; background:var(--emerald-100); color:var(--emerald-800); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">
                        ${s.name.split(' ')[0][0]}${s.name.split(' ')[1] ? s.name.split(' ')[1][0] : ''}
                      </div>
                      <div>
                        <div style="font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px;">
                          <span>${s.name}</span>
                          ${isLeader ? `<span title="Сардори ҳуҷра" style="font-size:12px; cursor:help;">👑</span>` : ''}
                        </div>
                        <div style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${s.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill status-permission" style="font-weight:700;">Ҳуҷраи ${s.room}</span>
                  </td>
                  <td><strong>№ ${s.bed}</strong></td>
                  <td>${s.course}</td>
                  <td style="font-family:var(--font-mono); font-size:13px;">${s.phone || '—'}</td>
                  <td>
                    <span class="status-pill ${statusClass}">
                      ${isAbsent ? '🔴 Ғоиб' : '🟢 Ҳозир'}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:6px;">
                      <button class="btn btn-secondary btn-sm" title="Дидани корти донишҷӯӣ" onclick="window.khobgoh.viewStudentPass('${s.id}')">🪪 ID</button>
                      ${canAdd ? `
                        <button class="btn btn-secondary btn-sm" title="Таҳрир" onclick="window.khobgoh.editStudent('${s.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" title="Нобуд кардан" onclick="window.khobgoh.deleteStudent('${s.id}')">🗑️</button>
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
