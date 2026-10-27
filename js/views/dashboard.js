// Khobgoh Dashboard View v2.2
import { store } from "../store.js";

export function renderDashboard() {
  const stats = store.getStats();
  const t = (k) => store.t(k);
  const todayRoster = store.state.roster.find(r => r.active) || store.state.roster[1];
  const canAddStudent = store.canManageStudents();

  return `
    <div class="page-container">
      <!-- Supervisor on duty alert banner -->
      <div class="card" style="margin-bottom:20px; border-left:5px solid var(--emerald-500); background:var(--emerald-50); padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">🔔</span>
          <div>
            <div style="font-weight:800; font-size:14px; color:var(--emerald-900);">${t('roster_alert_active')}</div>
            <div style="font-size:12px; color:var(--emerald-700);">Мураббии навбатдори имрӯза: <b>${todayRoster.supervisorName}</b> (${todayRoster.phone})</div>
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
            <span class="status-pill status-active">${todayRoster.label}</span>
          </div>
          <div style="display:flex; align-items:center; gap:16px; padding:16px; background:var(--surface-muted); border-radius:var(--radius-md); margin-bottom:16px;">
            <div style="width:50px; height:50px; border-radius:50%; background:var(--emerald-600); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;">
              ${(todayRoster?.supervisorName || 'Мураббӣ').split(' ')[0][0] || 'М'}
            </div>
            <div>
              <div style="font-weight:700; font-size:16px;">${todayRoster?.supervisorName || 'Мураббӣ'}</div>
              <div style="font-size:13px; color:var(--text-muted);">${todayRoster?.phone || '—'}</div>
            </div>
          </div>

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

      <!-- Quick Room Availability Strip -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700;">🛏️ Вазъияти ҷойгиршавӣ дар ҳуҷраҳо</h3>
            <p style="margin:2px 0 0 0; font-size:13px; color:var(--text-muted);">Барои дидани ҷойҳо ва таъин кардани сардори ҳуҷра клик кунед</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.khobgoh.navigate('rooms')">${t('rooms_title')}</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">
          ${store.state.rooms.map(room => {
            const occupied = store.state.students.filter(s => s.room === room.id && s.status === 'Active').length;
            const isFull = occupied >= room.capacity;
            const leaderId = store.state.roomLeaders[room.id];
            const leader = store.state.students.find(s => s.id === leaderId);

            return `
              <div onclick="window.khobgoh.navigate('rooms')" style="cursor:pointer; padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:${isFull ? 'var(--surface-muted)' : 'var(--surface)'}; text-align:center; transition:transform 0.1s ease;">
                <div style="font-weight:700; font-size:13px; margin-bottom:2px;">${room.name}</div>
                <div style="font-size:12px; font-weight:600; color:${isFull ? '#ef4444' : '#10b981'}; margin-bottom:4px;">
                  ${occupied} / ${room.capacity} ${t('rooms_bed')}
                </div>
                ${leader ? `
                  <div style="font-size:10px; color:var(--amber-500); font-weight:700; background:rgba(245, 158, 11, 0.1); padding:2px 4px; border-radius:4px;">
                    👑 ${leader.name.split(' ')[0]}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}
