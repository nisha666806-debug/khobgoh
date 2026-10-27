// Khobgoh Rooms View v3.0 (Custom Room Numbering, Leaders & Supervisor Quarters)
import { store } from "../store.js";

export function renderRooms() {
  const t = (k) => store.t(k);
  const rooms = store.state.rooms || [];
  const students = store.state.students || [];
  const supervisors = store.state.supervisors || [];
  const canManage = store.canManageRooms();

  const studentRooms = rooms.filter(r => r.type === 'student');
  const supervisorRooms = rooms.filter(r => r.type === 'supervisor');

  return `
    <div class="page-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('rooms_title')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">Танзими рақами ҳуҷраҳо, масъулони ҳуҷра ва сардорон аз ҷониби Сармураббӣ</p>
        </div>
        ${canManage ? `
          <button class="btn btn-primary" onclick="window.khobgoh.openAddCustomRoomModal()">
            + Илова ё танзими ҳуҷраи нав
          </button>
        ` : ''}
      </div>

      <!-- Section 1: Student Rooms -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:12px;">
        <h2 style="font-size:18px; font-weight:700; margin:0; display:flex; align-items:center; gap:8px;">
          👨‍🎓 ${t('rooms_student_rooms')} (${studentRooms.length} ҳуҷра)
        </h2>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-bottom:36px;">
        ${studentRooms.map(room => {
          const roomStudents = students.filter(s => s.room === room.id && s.status === 'Active');
          const occupiedCount = roomStudents.length;
          const leaderId = store.state.roomLeaders ? store.state.roomLeaders[room.id] : null;
          const leader = students.find(s => s.id === leaderId);
          const supInCharge = supervisors.find(s => s.id === room.supervisorId);

          return `
            <div class="room-card-modern">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="margin:0; font-size:17px; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:8px;">
                    <span>${room.name || 'Ҳуҷраи ' + room.id}</span>
                  </h3>
                  <small style="color:var(--text-muted);">Рақам: <b>${room.id}</b> • Ошёнаи ${room.floor || 1} • Иқтидор: ${room.capacity} ҷой</small>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="status-pill ${occupiedCount >= room.capacity ? 'status-absent' : 'status-active'}">
                    ${occupiedCount} / ${room.capacity}
                  </span>
                  ${canManage ? `
                    <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:11px;" onclick="window.khobgoh.openEditRoomModal('${room.id}')" title="Таҳрири рақам ва иқтидор">
                      ✏️
                    </button>
                    <button class="btn btn-danger btn-sm" style="padding:2px 6px; font-size:11px;" onclick="window.khobgoh.deleteRoom('${room.id}')" title="Хориҷи ҳуҷра">
                      🗑️
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Supervisor in charge (Requirement 4) -->
              <div style="padding:8px 12px; background:rgba(99, 102, 241, 0.08); border:1px solid rgba(99, 102, 241, 0.25); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:12px; color:var(--indigo-700); font-weight:700; display:flex; align-items:center; gap:6px;">
                  <span>👔 Мураббии масъул:</span>
                  <span style="color:var(--text-main); font-weight:800;">${supInCharge ? supInCharge.name : 'Таъин нашудааст'}</span>
                </div>
                ${canManage ? `
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:11px;" onclick="window.khobgoh.openAssignSupervisorToRoomModal('${room.id}')">
                    Иваз
                  </button>
                ` : ''}
              </div>

              <!-- Student Room Leader (Сардори ҳуҷра) -->
              <div style="padding:8px 12px; background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:12px; color:var(--amber-700); font-weight:700; display:flex; align-items:center; gap:6px;">
                  <span>👑 Сардори ҳуҷра:</span>
                  <span style="color:var(--text-main); font-weight:800;">${leader ? leader.name : 'Таъин нашудааст'}</span>
                </div>
                ${canManage ? `
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:11px;" onclick="window.khobgoh.openSetRoomLeaderModal('${room.id}')">
                    Таъин
                  </button>
                ` : ''}
              </div>

              <!-- Bed Slots Grid -->
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

      <!-- Section 2: Supervisor Quarters (Requirement 6) -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="font-size:18px; font-weight:700; margin:0; display:flex; align-items:center; gap:8px;">
            👥 ${t('rooms_supervisor_rooms')} (${supervisorRooms.length} ҳуҷра)
          </h2>
          <small style="color:var(--text-muted);">Идоракунии ҳуҷраҳои мураббиён, сардорони ҳуҷра ва ҷойҳои хоб</small>
        </div>
        ${canManage ? `
          <button class="btn btn-primary btn-sm" onclick="window.khobgoh.openAddSupervisorRoomModal()">
            + Иловаи ҳуҷраи мураббиён
          </button>
        ` : ''}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-bottom:28px;">
        ${supervisorRooms.map(room => {
          const roomSupervisors = supervisors.filter(s => s.room === room.id);
          const leaderId = store.state.roomLeaders ? store.state.roomLeaders[room.id] : null;
          const leader = supervisors.find(s => s.id === leaderId);

          return `
            <div class="room-card-modern" style="border-left:4px solid var(--indigo-500);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="margin:0; font-size:17px; font-weight:800; color:var(--text-main);">${room.name || 'Мураббиён ' + room.id}</h3>
                  <small style="color:var(--text-muted);">Рақами ҳуҷра: <b>${room.id}</b> • Ошёнаи ${room.floor || 2} • Иқтидор: ${room.capacity || 4} ҷой</small>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="status-pill status-permission">
                    ${roomSupervisors.length} / ${room.capacity || 4} мураббӣ
                  </span>
                  ${canManage ? `
                    <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:11px;" onclick="window.khobgoh.openEditRoomModal('${room.id}')" title="Таҳрири рақам ва иқтидор">
                      ✏️
                    </button>
                    <button class="btn btn-danger btn-sm" style="padding:2px 6px; font-size:11px;" onclick="window.khobgoh.deleteRoom('${room.id}')" title="Хориҷи ҳуҷра">
                      🗑️
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Supervisor Room Leader (Requirement 6) -->
              <div style="padding:8px 12px; background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:12px; color:var(--amber-700); font-weight:700; display:flex; align-items:center; gap:6px;">
                  <span>👑 Сардори ҳуҷраи мураббиён:</span>
                  <span style="color:var(--text-main); font-weight:800;">${leader ? leader.name : 'Таъин нашудааст'}</span>
                </div>
                ${canManage ? `
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:11px;" onclick="window.khobgoh.openSetSupervisorRoomLeaderModal('${room.id}')">
                    Таъин
                  </button>
                ` : ''}
              </div>

              <!-- Beds for Supervisors -->
              <div class="bed-slots-grid" style="grid-template-columns:repeat(${Math.min(4, room.capacity || 4)}, 1fr);">
                ${Array.from({ length: room.capacity || 4 }).map((_, idx) => {
                  const bedNum = idx + 1;
                  const sup = roomSupervisors.find(s => Number(s.bed) === bedNum);
                  const isSupLeader = sup && sup.id === leaderId;

                  if (sup) {
                    return `
                      <div class="bed-slot" style="background:#e0e7ff; color:#3730a3; border:1px solid #818cf8; cursor:pointer;" title="${sup.name} (${sup.phone})" onclick="window.khobgoh.openEditSupervisorModal('${sup.id}')">
                        <span style="font-size:11px; font-weight:800; display:flex; align-items:center; gap:2px;">
                          №${bedNum} ${isSupLeader ? '👑' : ''}
                        </span>
                        <span style="font-size:10px; max-width:90%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${sup.name.split(' ')[0]}</span>
                      </div>
                    `;
                  } else {
                    return `
                      <div class="bed-slot empty" style="border-style:dashed;" title="Ҷойи холии мураббӣ" onclick="window.khobgoh.openAssignSupervisorModal('${room.id}', ${bedNum})">
                        <span>№${bedNum}</span>
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
    </div>
  `;
}
