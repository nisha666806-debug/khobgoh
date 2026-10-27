// Khobgoh Rooms View v2.2
import { store } from "../store.js";

export function renderRooms() {
  const t = (k) => store.t(k);
  const rooms = store.state.rooms;
  const students = store.state.students;
  const supervisors = store.state.supervisors;
  const canManage = store.canManageStudents();

  const studentRooms = rooms.filter(r => r.type === 'student');
  const supervisorRooms = rooms.filter(r => r.type === 'supervisor');

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('rooms_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">${t('rooms_subtitle')}</p>
        </div>
      </div>

      <!-- Section 1: Student Rooms (8 beds) -->
      <h2 style="font-size:18px; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
        👨‍🎓 ${t('rooms_student_rooms')}
      </h2>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:18px; margin-bottom:32px;">
        ${studentRooms.map(room => {
          const roomStudents = students.filter(s => s.room === room.id && s.status === 'Active');
          const occupiedCount = roomStudents.length;
          const leaderId = store.state.roomLeaders[room.id];
          const leader = students.find(s => s.id === leaderId);

          return `
            <div class="room-card-modern">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="margin:0; font-size:16px; font-weight:700; color:var(--text-main);">${room.name}</h3>
                  <small style="color:var(--text-muted);">Ошёнаи ${room.floor} • Иқтидор: ${room.capacity} ҷой</small>
                </div>
                <span class="status-pill ${occupiedCount >= room.capacity ? 'status-absent' : 'status-active'}">
                  ${occupiedCount} / ${room.capacity}
                </span>
              </div>

              <!-- Room Leader Badge & Change Button -->
              <div style="padding:8px 12px; background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:12px; color:var(--amber-700); font-weight:700; display:flex; align-items:center; gap:6px;">
                  <span>👑 Сардори ҳуҷра:</span>
                  <span style="color:var(--text-main);">${leader ? leader.name : 'Таъин нашудааст'}</span>
                </div>
                ${canManage ? `
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:11px;" onclick="window.khobgoh.openSetRoomLeaderModal('${room.id}')">
                    Таъин
                  </button>
                ` : ''}
              </div>

              <!-- Bed Slots (1 to 8) -->
              <div class="bed-slots-grid">
                ${Array.from({ length: room.capacity }).map((_, idx) => {
                  const bedNum = idx + 1;
                  const occupant = roomStudents.find(s => Number(s.bed) === bedNum);
                  const isOccupantLeader = occupant && occupant.id === leaderId;

                  if (occupant) {
                    return `
                      <div class="bed-slot occupied" title="${occupant.name} (${occupant.course})" onclick="window.khobgoh.viewStudentPass('${occupant.id}')">
                        <span style="font-size:11px; font-weight:800; display:flex; align-items:center; gap:2px;">
                          №${bedNum} ${isOccupantLeader ? '👑' : ''}
                        </span>
                        <span style="font-size:10px; max-width:90%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${occupant.name.split(' ')[0]}</span>
                      </div>
                    `;
                  } else {
                    return `
                      <div class="bed-slot empty" title="Ҷойи холӣ. Барои таъин кардан клик кунед." onclick="window.khobgoh.openAssignBedModal('${room.id}', ${bedNum})">
                        <span>№ ${bedNum}</span>
                        <span style="font-size:9px;">+ Холӣ</span>
                      </div>
                    `;
                  }
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Section 2: Supervisor Quarters (4 beds each) -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:12px;">
        <h2 style="font-size:18px; font-weight:700; margin:0; display:flex; align-items:center; gap:8px;">
          👥 ${t('rooms_supervisor_rooms')}
        </h2>
        ${canManage ? `
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.openAssignSupervisorModal()">
            + Таъин кардани мураббӣ ба ҳуҷра
          </button>
        ` : ''}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:18px;">
        ${supervisorRooms.map(room => {
          const roomSupervisors = supervisors.filter(s => s.room === room.id);

          return `
            <div class="room-card-modern" style="border-left:4px solid var(--indigo-500);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="margin:0; font-size:16px; font-weight:700; color:var(--text-main);">${room.name}</h3>
                  <small style="color:var(--text-muted);">Ҳуҷраи мураббиён • Иқтидор: 4 ҷой</small>
                </div>
                <span class="status-pill status-permission">
                  ${roomSupervisors.length} / 4 мураббӣ
                </span>
              </div>

              <!-- 4 Beds for Supervisors -->
              <div class="bed-slots-grid" style="grid-template-columns:repeat(4, 1fr);">
                ${Array.from({ length: 4 }).map((_, idx) => {
                  const bedNum = idx + 1;
                  const sup = roomSupervisors.find(s => Number(s.bed) === bedNum);

                  if (sup) {
                    return `
                      <div class="bed-slot" style="background:#e0e7ff; color:#3730a3; border:1px solid #818cf8;" title="${sup.name} (${sup.phone})">
                        <span style="font-size:11px; font-weight:800;">№${bedNum}</span>
                        <span style="font-size:10px; max-width:90%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${sup.name.split(' ')[0]}</span>
                      </div>
                    `;
                  } else {
                    return `
                      <div class="bed-slot empty" style="border-style:dashed;" title="Ҷойи холии мураббӣ">
                        <span>№${bedNum}</span>
                        <span style="font-size:9px;">Холӣ</span>
                      </div>
                    `;
                  }
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
