# Хобгоҳ (Khobgoh 2.0) — Modern Dormitory Management System

A state-of-the-art, responsive Web Application designed for dormitories, boarding schools, and student residences.

Built with a modular ES Module architecture, responsive modern design system, full Tajik (Тоҷикӣ) and English dual-language support, multi-role simulation, and local storage persistence.

---

## 🌟 Key Features

1. **📊 Панели асосӣ (Dashboard)**:
   - Real-time KPI statistics: Total students, bed occupancy rate, vacant beds count, today's attendance rate.
   - Active supervisor on duty today, tea duty assignment, and samovar readiness status.
   - Quick visual room availability cards.
   - Cleanliness competition top-3 podium leaderboard.

2. **👨‍🎓 Донишҷӯён (Residents & Directory)**:
   - Instant search by student name or ID (`KH-2024-XX`).
   - Dynamic filtering by room number and resident status (*Active*, *Absent*, *Transferred*).
   - Add new resident modal with automatic room & bed assignment.
   - Edit student details and delete/transfer actions.
   - **🪪 Printable Student ID Pass**: One-click generation of the official dormitory resident card with print layout.

3. **🛏️ Ҳуҷраҳо ва катҳо (Interactive Room & Bed Layout)**:
   - 10 total rooms:
     - 7 Student rooms (Rooms 101–107, 8 beds each = 56 beds total capacity).
     - 3 Supervisor quarters (Rooms 201–203, 4 beds each).
   - Visual bed slot matrix (Bed 1 to Bed 8). Occupied slots show resident avatar & name; vacant slots can be assigned with a single click.

4. **📋 Давомот (Daily Attendance Tracking)**:
   - Fast date selector (defaults to current date).
   - 4-state instant roll call for every resident: **Ҳозир** (Present), **Ғоиб** (Absent), **Рухсат** (Leave/Permission), and **Бемор** (Sick).
   - "Ҳама ҳозиранд" (Mark All Present) one-click batch action.
   - Printable attendance sheet export.

5. **⚠️ Қоидавайронкунӣ (Disciplinary Log & Infractions)**:
   - Incident tracking with date, room, student, and severity levels (*Огоҳӣ / Low*, *Миёна / Medium*, *Ҷиддӣ / High*).
   - Infraction resolution workflow (*Баррасишаванда* ➔ *Ҳал шуд*).

6. **🏆 Озмуни тозагӣ (Cleanliness Cup)**:
   - Weekly room hygiene & order inspection scoring (1–10 stars across bed tidiness, floor cleanliness, ventilation, and hygiene).
   - Podium trophy presentation: 🥇 Gold (1st), 🥈 Silver (2nd), 🥉 Bronze (3rd).

7. **🗓️ Навбатдорӣ (Duty Roster & Checkpoint Protocol)**:
   - 7-day weekly supervisor shift schedule (Monday to Sunday).
   - Mandatory 24-hour protocol checkpoint guidelines (06:30 Wakeup, 08:00 Classes, 18:00 Tea, 21:00 Evening check).

8. **🍵 Чойнӯшӣ ва ошхона (Tea Time & Kitchen)**:
   - Samovar status and daily student tea duty tracker.
   - Authentic traditional Tajik tea recipes (Чойи кабуди кӯҳӣ, Ширчой, Чойи занҷабил ва асал).
   - Meal & tea schedule.

9. **💬 Чат ва Эълонҳо (Internal Staff Communication)**:
   - Internal staff announcement broadcast and real-time chat between Manager and Supervisors.

10. **⚙️ Танзимот (Settings & Simulation)**:
    - **Role Simulator**: Switch between **Мудир (Manager)**, **Сармураббӣ (Head Supervisor)**, **Мураббӣ (Supervisor)**, and **Талаба (Student)**.
    - **Language**: Instant toggle between **Тоҷикӣ (Tajik)** and **English**.
    - **Theme**: Light & Dark mode support.
    - **Data Backup & Restore**: One-click JSON export and import, plus instant reset to factory demo data.

---

## 🚀 How to Run Locally

You can open `index.html` directly in any modern browser, or launch a lightweight local server:

```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\khobgoh-app
npx serve .
# Or with Python:
python -m http.server 8080
```

Then navigate to `http://localhost:8080/` in your browser.

---

## 🌐 Deploying to GitHub Pages

To deploy to GitHub Pages under `https://nisha666806-debug.github.io/khobgoh/`:
1. Copy the contents of `khobgoh-app` into `khobgoh_repo`.
2. Commit and push:
```bash
git add .
git commit -m "Deploy redesigned Khobgoh 2.0 Web Application"
git push origin main
```
