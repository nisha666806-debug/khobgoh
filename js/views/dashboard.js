// Khobgoh Dashboard View v2.2
import { store } from "../store.js";

export function renderDashboard() {
  const stats = store.getStats();
  const t = (k) => store.t(k);
  const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = daysMap[new Date().getDay()];
  const todayRoster = (store.state.roster || []).find(r => r.day === todayKey) || (store.state.roster || [])[0] || { label: "Имрӯз", supervisors: [] };
  const todaySups = (todayRoster.supervisors && todayRoster.supervisors.length > 0)
    ? todayRoster.supervisors
    : (todayRoster.supervisorName ? [{ name: todayRoster.supervisorName, phone: todayRoster.phone, role: "Навбатдори асосӣ" }] : []);
  const canAddStudent = store.canManageStudents();

  return `
    <div class="page-container">
      <!-- Supervisor on duty alert banner -->
      <div class="card" style="margin-bottom:20px; border-left:5px solid var(--emerald-500); background:var(--emerald-50); padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">🔔</span>
          <div>
            <div style="font-weight:800; font-size:14px; color:var(--emerald-900);">${t('roster_alert_active')} (${todayRoster.label || 'Имрӯз'})</div>
            <div style="font-size:12px; color:var(--emerald-700);">
              ${todaySups.length > 0 
                ? `Мураббиёни навбатдори имрӯза (${todaySups.length} нафар): <b>${todaySups.map(s => s.name).join(' • ')}</b>` 
                : 'Навбатдорони имрӯза ҳанӯз таъин нашудаанд'}
            </div>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="window.khobgoh.navigate('roster')">
          Дидани ҷадвал
        </button>
      </div>

      <!-- Welcome Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${t('nav_dashboard')}</h1>
          <p style="margin:0; color:var(--text-muted); font-size:14px;">Идоракунии муосири хобгоҳ ва назорати талабагон</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.navigate('attendance')">
            📋 ${t('dash_btn_mark_attendance')}
          </button>
          ${canAddStudent ? `
            <button class="btn btn-primary btn-sm" onclick="window.khobgoh.openAddStudentModal()">
              + ${t('dash_btn_add_student')}
            </button>
          ` : ''}
        </div>
      </div>

      <!-- KPI Stat Cards (Clickable navigation) -->
      <div class="stats-grid">
        <!-- Card 1: Students (Click goes directly to Students page) -->
        <div class="stat-card card-hover" style="cursor:pointer;" onclick="window.khobgoh.navigate('students')" title="Пахш кунед барои гузаштан ба бахши талабагон">
          <div class="stat-icon" style="background:#ecfdf5; color:#059669;">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="stat-val">${stats.totalStudents}</div>
            <div class="stat-label">${t('dash_total_students')} <span style="font-size:11px; color:var(--emerald-600);">➔</span></div>
          </div>
        </div>

        <div class="stat-card card-hover" style="cursor:pointer;" onclick="window.khobgoh.navigate('rooms')">
          <div class="stat-icon" style="background:#eff6ff; color:#2563eb;">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7h18v10H3z"/><path d="M6 17v4"/><path d="M18 17v4"/></svg>
          </div>
          <div>
            <div class="stat-val">${stats.occupiedBeds} <span style="font-size:16px; font-weight:500; color:var(--text-muted)">/ ${stats.totalCapacity}</span></div>
            <div class="stat-label">${t('dash_occupancy')}</div>
          </div>
        </div>

        <div class="stat-card card-hover" style="cursor:pointer;" onclick="window.khobgoh.navigate('rooms')">
          <div class="stat-icon" style="background:#fef3c7; color:#d97706;">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          </div>
          <div>
            <div class="stat-val">${stats.vacantBeds}</div>
            <div class="stat-label">${t('dash_vacant_beds')}</div>
          </div>
        </div>

        <!-- Card 4: Attendance (Click goes directly to Attendance page) -->
        <div class="stat-card card-hover" style="cursor:pointer;" onclick="window.khobgoh.navigate('attendance')" title="Пахш кунед барои гузаштан ба бахши давомот">
          <div class="stat-icon" style="background:#fdf2f8; color:#db2777;">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <div class="stat-val" style="display:flex; align-items:center; gap:8px;">
              <span>${stats.presentCount} ҳозир</span>
              ${stats.absentCount > 0 ? `<span style="font-size:13px; color:#ef4444; font-weight:700;">(${stats.absentCount} нест)</span>` : ''}
            </div>
            <div class="stat-label">${t('dash_attendance_today')} <span style="font-size:11px; color:#db2777;">➔</span></div>
          </div>
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-bottom:24px;">
        
        <!-- Duty Supervisor & Kitchen Status -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="margin:0; font-size:16px; font-weight:700;">⭐️ ${t('dash_supervisor_on_duty')}</h3>
            <span class="status-pill status-active">${todayRoster.label || 'Имрӯз'}</span>
          </div>

          ${todaySups.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
              ${todaySups.map(sup => `
                <div style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--surface-muted); border-radius:var(--radius-md);">
                  <div style="width:38px; height:38px; border-radius:50%; background:var(--emerald-600); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0;">
                    ${(sup.name || 'М')[0]}
                  </div>
                  <div style="flex:1; min-width:0;">
                    <div style="font-weight:700; font-size:14px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${sup.name}
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); display:flex; justify-content:space-between;">
                      <span>${sup.role || 'Навбатдор'}</span>
                      <span style="font-family:var(--font-mono);">${sup.phone || ''}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="padding:16px; background:var(--surface-muted); border-radius:var(--radius-md); text-align:center; margin-bottom:16px;">
              <div style="font-size:24px; margin-bottom:4px;">👥</div>
              <div style="font-size:13px; color:var(--text-muted);">Навбатдорони имрӯза ҳанӯз таъин нашудаанд.</div>
              <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.navigate('roster')" style="margin-top:8px;">
                Ба бахши навбатдорӣ ➔
              </button>
            </div>
          `}

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="padding:12px; background:var(--surface-muted); border-radius:var(--radius-sm); text-align:center; cursor:pointer;" onclick="window.khobgoh.navigate('tea')" title="Кушодани ҷадвали чойнӯшӣ">
              <div style="font-size:12px; color:var(--text-muted); margin-bottom:2px;">Ҷадвали чойнӯшӣ</div>
              <div style="font-weight:700; font-size:13px; color:var(--emerald-700);">5 синф (7-11) 🍵</div>
            </div>
            <div style="padding:12px; background:var(--surface-muted); border-radius:var(--radius-sm); text-align:center; cursor:pointer;" onclick="window.khobgoh.navigate('tea')" title="Ресептҳои чойи хобгоҳ">
              <div style="font-size:12px; color:var(--text-muted); margin-bottom:2px;">Ресептҳои чой</div>
              <div style="font-weight:700; font-size:13px; color:var(--emerald-700);">${(store.state.tea?.recipes || []).length} намуд 🌿</div>
            </div>
          </div>
        </div>

        <!-- Cleanliness Podium preview (50 points scoring) -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:700;">🏆 ${t('clean_title')}</h3>
              <small style="color:var(--text-muted);">Баҳогузорӣ аз рӯи 5 меъёр (макс. 50 хол)</small>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.navigate('cleanliness')">${t('view')}</button>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${store.state.cleanliness.slice(0, 3).map((item, idx) => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--surface-muted); border-radius:var(--radius-md);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:20px;">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <div>
                    <strong style="font-size:14px;">Ҳуҷраи ${item.room}</strong>
                    <div style="font-size:12px; color:var(--text-muted);">${item.notes}</div>
                  </div>
                </div>
                <div style="font-weight:800; font-size:16px; color:var(--emerald-600);">${item.score} <span style="font-size:11px; color:var(--text-muted); font-weight:500;">/ 50</span></div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Quick Room Availability Strip: Separated Student & Supervisor Rooms (Requirement 2) -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700;">🛏️ Вазъияти ҷойгиршавӣ дар ҳуҷраҳо</h3>
            <p style="margin:2px 0 0 0; font-size:13px; color:var(--text-muted);">Ҷойгиршавии алоҳидаи талабагон ва мураббиён дар хобгоҳ</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.navigate('rooms')">${t('rooms_title')}</button>
        </div>

        <!-- Section 1: Student Rooms -->
        <div style="margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
            <h4 style="margin:0; font-size:14px; font-weight:700; color:var(--emerald-800); display:flex; align-items:center; gap:6px;">
              <span>👨‍🎓 Ҳуҷраҳои талабагон</span>
              <span class="status-pill status-active" style="font-size:11px;">${store.state.rooms.filter(r => r.type === 'student').length} ҳуҷра</span>
            </h4>
            <span style="font-size:12px; color:var(--text-muted);">${stats.occupiedBeds} ҷойи банд • ${stats.vacantBeds} ҷойи холӣ</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(135px, 1fr)); gap:10px;">
            ${store.state.rooms.filter(r => r.type === 'student').map(room => {
              const occupied = store.state.students.filter(s => s.room === room.id && s.status === 'Active').length;
              const isFull = occupied >= room.capacity;
              const supInCharge = (store.state.supervisors || []).find(s => s.id === room.supervisorId);

              return `
                <div onclick="window.khobgoh.navigate('rooms')" style="cursor:pointer; padding:10px 8px; border:1px solid var(--border); border-radius:var(--radius-md); background:${isFull ? 'var(--surface-muted)' : 'var(--surface)'}; text-align:center; transition:transform 0.1s ease;">
                  <div style="font-weight:700; font-size:13px; margin-bottom:2px; color:var(--text-main);">${room.name || 'Ҳуҷра'}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;">Рақам: <b>№ ${room.id}</b></div>
                  <div style="font-size:12px; font-weight:700; color:${isFull ? '#ef4444' : '#10b981'}; margin-bottom:4px;">
                    ${occupied} / ${room.capacity} ҷой
                  </div>
                  ${supInCharge ? `
                    <div style="font-size:9px; color:var(--indigo-700); font-weight:600; background:rgba(99, 102, 241, 0.1); padding:2px 4px; border-radius:4px;" title="Мураббии масъул: ${supInCharge.name}">
                      👔 ${(supInCharge.name || '').split(' ')[0]}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: Supervisor Rooms (Alohida / Separated) -->
        <div style="border-top:1px dashed var(--border); padding-top:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
            <h4 style="margin:0; font-size:14px; font-weight:700; color:var(--indigo-700); display:flex; align-items:center; gap:6px;">
              <span>👔 Ҳуҷраҳои мураббиён</span>
              <span class="status-pill status-permission" style="font-size:11px;">${store.state.rooms.filter(r => r.type === 'supervisor').length} ҳуҷра</span>
            </h4>
            <span style="font-size:12px; color:var(--text-muted);">Барои истиқомати мураббиёни хобгоҳ</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(135px, 1fr)); gap:10px;">
            ${store.state.rooms.filter(r => r.type === 'supervisor').map(room => {
              const roomSups = (store.state.supervisors || []).filter(s => s.room === room.id);
              const leaderId = store.state.roomLeaders ? store.state.roomLeaders[room.id] : null;
              const leader = (store.state.supervisors || []).find(s => s.id === leaderId);

              return `
                <div onclick="window.khobgoh.navigate('rooms')" style="cursor:pointer; padding:10px 8px; border:1px solid #c7d2fe; border-left:3px solid var(--indigo-500); border-radius:var(--radius-md); background:#f8fafc; text-align:center;">
                  <div style="font-weight:700; font-size:13px; margin-bottom:2px; color:var(--text-main);">${room.name || 'Мураббиён ' + room.id}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;">Рақам: <b>№ ${room.id}</b></div>
                  <div style="font-size:12px; font-weight:600; color:var(--indigo-700); margin-bottom:4px;">
                    ${roomSups.length} / ${room.capacity || 4} мураббӣ
                  </div>
                  ${leader ? `
                    <div style="font-size:10px; color:#b45309; font-weight:700; background:rgba(245, 158, 11, 0.12); padding:2px 4px; border-radius:4px;" title="Сардори ҳуҷраи мураббиён: ${leader.name}">
                      👑 ${(leader.name || '').split(' ')[0]}
                    </div>
                  ` : `
                    <div style="font-size:9px; color:var(--text-muted);">Бе сардор</div>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}
