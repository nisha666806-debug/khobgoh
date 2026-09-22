import {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  runTransaction
} from "./firebase.js";


/* =========================================================
   STATE
========================================================= */

const state = {
  page: "dashboard",
  user: null,
  profile: null,
  students: [],
  rooms: [],
  supervisors: [],
  attendance: [],
  violations: [],
  cleanliness: [],
  loading: false
};


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const content = () => $("#content");

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function uid() {
  return auth.currentUser?.uid || "";
}

function isManager() {
  return state.profile?.role === "manager";
}

function isSupervisor() {
  return state.profile?.role === "supervisor";
}

function roomById(id) {
  return state.rooms.find(r => r.id === id);
}

function studentById(id) {
  return state.students.find(s => s.id === id);
}

function supervisorById(id) {
  return state.supervisors.find(s => s.id === id);
}

function roomName(id) {
  return roomById(id)?.name || "—";
}

function supervisorName(id) {
  return supervisorById(id)?.name || "—";
}

function formatDate(value) {
  if (!value) return "—";

  if (typeof value === "string") {
    return new Date(value + "T00:00:00").toLocaleDateString("tg-TJ");
  }

  if (value?.toDate) {
    return value.toDate().toLocaleDateString("tg-TJ");
  }

  return "—";
}

function showLoading(text = "Бор карда истодааст...") {
  content().innerHTML = `
    <div class="card" style="padding:40px;text-align:center">
      <div style="font-size:35px">⏳</div>
      <p>${esc(text)}</p>
    </div>
  `;
}

function notify(message, type = "success") {
  const old = document.querySelector(".app-notification");
  if (old) old.remove();

  const el = document.createElement("div");
  el.className = "app-notification";

  el.style.cssText = `
    position:fixed;
    right:20px;
    bottom:20px;
    z-index:9999;
    max-width:360px;
    padding:14px 18px;
    border-radius:12px;
    color:white;
    background:${type === "error" ? "#b42318" : "#0b5d3b"};
    box-shadow:0 10px 30px rgba(0,0,0,.2);
    font-size:14px;
  `;

  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 3500);
}

function errorMessage(error) {
  console.error(error);

  const code = error?.code || "";

  const messages = {
    "auth/invalid-credential": "Email ё парол нодуруст аст.",
    "auth/user-not-found": "Ин корбар ёфт нашуд.",
    "auth/wrong-password": "Парол нодуруст аст.",
    "auth/too-many-requests": "Кӯшишҳо зиёд шуданд. Каме баъдтар санҷед.",
    "permission-denied": "Шумо барои ин амал иҷозат надоред.",
    "failed-precondition": "Амалиёт иҷро нашуд. Қоидаҳо ё сохтори база санҷида шавад."
  };

  return messages[code] || error?.message || "Хатои номаълум.";
}


/* =========================================================
   LOGIN
========================================================= */

function renderLogin() {
  document.body.innerHTML = `
    <div id="loginScreen" style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#f4f7f5;
      padding:20px;
      font-family:Arial,sans-serif;
    ">

      <div style="
        width:100%;
        max-width:420px;
        background:white;
        border-radius:22px;
        padding:32px;
        box-shadow:0 20px 60px rgba(0,0,0,.12);
      ">

        <div style="text-align:center;margin-bottom:28px">

          <img
            src="assets/dormitory-logo.png"
            alt="Dormitory"
            style="width:82px;height:82px;object-fit:contain"
          >

          <h1 style="margin:12px 0 5px">
            Dormitory
          </h1>

          <p style="margin:0;color:#667085">
            Management System
          </p>

        </div>

        <form id="loginForm">

          <label style="display:block;margin-bottom:7px">
            Email
          </label>

          <input
            id="loginEmail"
            type="email"
            required
            autocomplete="email"
            placeholder="example@gmail.com"
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              border:1px solid #d0d5dd;
              border-radius:10px;
              margin-bottom:16px;
            "
          >

          <label style="display:block;margin-bottom:7px">
            Парол
          </label>

          <input
            id="loginPassword"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              border:1px solid #d0d5dd;
              border-radius:10px;
              margin-bottom:18px;
            "
          >

          <button
            type="submit"
            id="loginButton"
            style="
              width:100%;
              border:0;
              border-radius:10px;
              padding:14px;
              background:#0b5d3b;
              color:white;
              font-size:16px;
              cursor:pointer;
            "
          >
            Ворид шудан
          </button>

          <div
            id="loginError"
            style="
              margin-top:15px;
              color:#b42318;
              font-size:14px;
              text-align:center;
            "
          ></div>

        </form>

      </div>
    </div>
  `;

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;

    const button = $("#loginButton");
    const error = $("#loginError");

    button.disabled = true;
    button.textContent = "Ворид шуда истодааст...";
    error.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      error.textContent = errorMessage(err);
      button.disabled = false;
      button.textContent = "Ворид шудан";
    }
  });
}


/* =========================================================
   APP SHELL
========================================================= */

function renderAppShell() {

  document.body.innerHTML = `
    <div id="app">

      <aside class="sidebar">

        <div class="brand">

          <div class="logo brand-icon">
            <img
              src="assets/dormitory-logo.png"
              alt="Dormitory"
            >
          </div>

          <div>
            <b>Dormitory</b>
            <small>Management System</small>
          </div>

        </div>

        <nav id="nav">

          <button data-page="dashboard">
            📊 Dashboard
          </button>

          <button data-page="students">
            👨‍🎓 Донишҷӯён
          </button>

          <button data-page="rooms">
            🛏️ Ҳуҷраҳо
          </button>

          <button data-page="attendance">
            📋 Attendance
          </button>

          <button data-page="violations">
            ⚠️ Қоидавайронкунӣ
          </button>

          <button data-page="cleanliness">
            🏆 Озмуни тозагӣ
          </button>

          ${
            isManager()
              ? `<button data-page="supervisors">👥 Мураббиён</button>`
              : ""
          }

        </nav>

        <div class="sidebar-bottom">

          <span id="roleBadge">
            ${isManager() ? "Manager" : "Supervisor"}
          </span>

          <button id="logout">
            Баромадан
          </button>

        </div>

      </aside>


      <main class="main">

        <header>

          <button id="menu">
            ☰
          </button>

          <div>
            <h1 id="title">Dashboard</h1>
            <p id="subtitle">
              Идоракунии хобгоҳи мактаб
            </p>
          </div>

          <div class="user">
            👤
            <span id="userName">
              ${esc(state.profile?.name || auth.currentUser?.email || "")}
            </span>
          </div>

        </header>

        <section id="content"></section>

      </main>

    </div>

    <div id="modal" class="modal hidden">

      <div class="modal-card">

        <button class="close" id="closeModal">
          ×
        </button>

        <div id="modalContent"></div>

      </div>

    </div>
  `;

  document.querySelectorAll("#nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.page);
    });
  });

  $("#logout").addEventListener("click", async () => {
    await signOut(auth);
  });

  $("#closeModal").addEventListener("click", closeModal);

  $("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });

  navigate("dashboard");
}


/* =========================================================
   MODAL
========================================================= */

function openModal(html) {
  const modal = $("#modal");

  if (!modal) return;

  $("#modalContent").innerHTML = html;
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = $("#modal");

  if (!modal) return;

  modal.classList.add("hidden");
}


/* =========================================================
   DATA LOADING
========================================================= */

async function loadData() {

  state.loading = true;

  try {

    /* USERS / SUPERVISORS */

    if (isManager()) {

      const usersSnap = await getDocs(
        collection(db, "users")
      );

      state.supervisors = usersSnap.docs
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
        .filter(u => u.role === "supervisor");

    } else {

      state.supervisors = [];

      if (state.profile?.role === "supervisor") {
        state.supervisors = [{
          id: uid(),
          ...state.profile
        }];
      }
    }


    /* STUDENTS */

    let studentsQuery;

    if (isManager()) {

      studentsQuery = collection(db, "students");

    } else {

      studentsQuery = query(
        collection(db, "students"),
        where("supervisorId", "==", uid())
      );
    }

    const studentsSnap = await getDocs(studentsQuery);

    state.students = studentsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));


    /* ROOMS */

    let roomsQuery;

    if (isManager()) {

      roomsQuery = collection(db, "rooms");

    } else {

      roomsQuery = query(
        collection(db, "rooms"),
        where("supervisorId", "==", uid())
      );
    }

    const roomsSnap = await getDocs(roomsQuery);

    state.rooms = roomsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));


    /* ATTENDANCE */

    let attendanceQuery;

    if (isManager()) {

      attendanceQuery = collection(db, "attendance");

    } else {

      attendanceQuery = query(
        collection(db, "attendance"),
        where("supervisorId", "==", uid())
      );
    }

    const attendanceSnap = await getDocs(attendanceQuery);

    state.attendance = attendanceSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));


    /* VIOLATIONS */

    let violationsQuery;

    if (isManager()) {

      violationsQuery = collection(db, "violations");

    } else {

      violationsQuery = query(
        collection(db, "violations"),
        where("supervisorId", "==", uid())
      );
    }

    const violationsSnap = await getDocs(violationsQuery);

    state.violations = violationsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));


    /* CLEANLINESS */

    let cleanlinessQuery;

    if (isManager()) {

      cleanlinessQuery = collection(
        db,
        "cleanliness_inspections"
      );

    } else {

      cleanlinessQuery = query(
        collection(db, "cleanliness_inspections"),
        where("supervisorId", "==", uid())
      );
    }

    const cleanlinessSnap = await getDocs(
      cleanlinessQuery
    );

    state.cleanliness = cleanlinessSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));


    /* SEED ROOMS */

    if (isManager() && state.rooms.length === 0) {
      await createInitialRooms();

      const roomsSnap2 = await getDocs(
        collection(db, "rooms")
      );

      state.rooms = roomsSnap2.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
    }

  } finally {

    state.loading = false;

  }
}


/* =========================================================
   INITIAL ROOMS
========================================================= */

async function createInitialRooms() {

  const batchRooms = [];

  for (let i = 1; i <= 10; i++) {

    const id = `room${String(i).padStart(2, "0")}`;

    batchRooms.push({
      id,
      name: `Ҳуҷра №${i}`,
      number: i,
      type: i <= 7 ? "student" : "supervisor",
      capacity: i <= 7 ? 8 : 4,
      supervisorId: null,
      createdAt: serverTimestamp()
    });
  }

  for (const room of batchRooms) {

    await setDoc(
      doc(db, "rooms", room.id),
      room
    );
  }
}


/* =========================================================
   NAVIGATION
========================================================= */

async function navigate(page) {

  state.page = page;

  const titles = {
    dashboard: ["Dashboard", "Идоракунии хобгоҳи мактаб"],
    students: ["Донишҷӯён", "Идоракунии донишҷӯён"],
    rooms: ["Ҳуҷраҳо", "Ҳуҷраҳо ва ҷойҳои хоб"],
    attendance: ["Attendance", "Ҳозиршавӣ"],
    violations: ["Қоидавайронкунӣ", "Назорати қоидавайронкунӣ"],
    cleanliness: ["Озмуни тозагӣ", "Натиҷаҳои тозагии ҳуҷраҳо"],
    supervisors: ["Мураббиён", "Идоракунии мураббиён"]
  };

  const title = titles[page] || titles.dashboard;

  if ($("#title")) $("#title").textContent = title[0];
  if ($("#subtitle")) $("#subtitle").textContent = title[1];

  if (page === "dashboard") return dashboard();
  if (page === "students") return studentsPage();
  if (page === "rooms") return roomsPage();
  if (page === "attendance") return attendancePage();
  if (page === "violations") return violationsPage();
  if (page === "cleanliness") return cleanlinessPage();
  if (page === "supervisors") return supervisorsPage();
}


/* =========================================================
   DASHBOARD
========================================================= */

async function dashboard() {

  showLoading("Dashboard бор шуда истодааст...");

  try {
    await loadData();
  } catch (err) {
    content().innerHTML = `
      <div class="card">
        <h3>Хато</h3>
        <p>${esc(errorMessage(err))}</p>
      </div>
    `;
    return;
  }

  const activeStudents = state.students.filter(
    s => (s.status || "active") === "active"
  );

  const totalCapacity = state.rooms.reduce(
    (sum, r) => sum + Number(r.capacity || 0),
    0
  );

  const occupied = activeStudents.filter(
    s => s.roomId && s.place
  ).length;

  const available = Math.max(
    0,
    totalCapacity - occupied
  );

  content().innerHTML = `

    <div class="stats-grid">

      <div class="stat-card">
        <span>👨‍🎓</span>
        <b>${activeStudents.length}</b>
        <small>Донишҷӯёни фаъол</small>
      </div>

      <div class="stat-card">
        <span>🛏️</span>
        <b>${state.rooms.length}</b>
        <small>Ҳуҷраҳо</small>
      </div>

      <div class="stat-card">
        <span>📍</span>
        <b>${occupied}</b>
        <small>Ҷойҳои ишғолшуда</small>
      </div>

      <div class="stat-card">
        <span>🟢</span>
        <b>${available}</b>
        <small>Ҷойҳои озод</small>
      </div>

    </div>


    <div class="card">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        flex-wrap:wrap
      ">

        <div>
          <h2>Ҳолати ҳуҷраҳо</h2>
          <p>Ишғолшавии ҷойҳо</p>
        </div>

        ${
          isManager()
            ? `
              <button
                class="primary"
                onclick="window.__openAddStudent()"
              >
                + Донишҷӯи нав
              </button>
            `
            : ""
        }

      </div>

      <div class="room-grid">

        ${state.rooms.map(room => {

          const count = activeStudents.filter(
            s => s.roomId === room.id
          ).length;

          const capacity = Number(room.capacity || 0);

          return `
            <div class="room-card">

              <div class="room-header">

                <strong>${esc(room.name)}</strong>

                <span>
                  ${count}/${capacity}
                </span>

              </div>

              <div class="progress">
                <div
                  style="
                    width:${capacity ? Math.min(100, count / capacity * 100) : 0}%
                  "
                ></div>
              </div>

              <small>
                ${room.type === "student"
                  ? "Донишҷӯён"
                  : "Мураббиён"}
              </small>

            </div>
          `;
        }).join("")}

      </div>

    </div>


    <div class="quick-actions">

      <button class="card" onclick="window.__navigate('students')">
        👨‍🎓
        <b>Донишҷӯён</b>
        <small>Идоракунӣ</small>
      </button>

      <button class="card" onclick="window.__navigate('attendance')">
        📋
        <b>Attendance</b>
        <small>Ҳозиршавӣ</small>
      </button>

      <button class="card" onclick="window.__navigate('violations')">
        ⚠️
        <b>Қоидавайронкунӣ</b>
        <small>Назорат</small>
      </button>

      <button class="card" onclick="window.__navigate('cleanliness')">
        🏆
        <b>Озмуни тозагӣ</b>
        <small>Натиҷаҳо</small>
      </button>

    </div>
  `;
}


/* =========================================================
   STUDENTS
========================================================= */

async function studentsPage() {

  showLoading();

  try {
    await loadData();
  } catch (err) {
    notify(errorMessage(err), "error");
    return;
  }

  renderStudents();
}

function renderStudents(filter = "") {

  const q = filter.toLowerCase().trim();

  const list = state.students.filter(s => {

    if (!q) return true;

    return [
      s.name,
      s.phone,
      s.className,
      s.teacher,
      roomName(s.roomId)
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  content().innerHTML = `

    <div class="page-toolbar">

      <input
        id="studentSearch"
        placeholder="Ҷустуҷӯи донишҷӯ..."
        value="${esc(filter)}"
      >

      ${
        isManager()
          ? `
            <button
              class="primary"
              onclick="window.__openAddStudent()"
            >
              + Донишҷӯ
            </button>
          `
          : ""
      }

    </div>


    <div class="card">

      <div class="table-wrap">

        <table>

          <thead>
            <tr>
              <th>Ном</th>
              <th>Синф</th>
              <th>Телефон</th>
              <th>Ҳуҷра</th>
              <th>Ҷой</th>
              <th>Мураббӣ</th>
              <th>Ҳолат</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            ${
              list.length
                ? list.map(studentRow).join("")
                : `
                  <tr>
                    <td colspan="8" style="text-align:center">
                      Донишҷӯ ёфт нашуд.
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;

  $("#studentSearch").addEventListener("input", e => {
    renderStudents(e.target.value);
  });
}

function studentRow(s) {

  const statusText = {
    active: "Фаъол",
    absent: "Муваққатан ғоиб",
    transferred: "Гузаронида шуд",
    removed: "Хориҷ шуд"
  };

  return `
    <tr>

      <td>
        <b>${esc(s.name)}</b>
      </td>

      <td>${esc(s.className || "—")}</td>

      <td>${esc(s.phone || "—")}</td>

      <td>${esc(roomName(s.roomId))}</td>

      <td>${s.place || "—"}</td>

      <td>${esc(supervisorName(s.supervisorId))}</td>

      <td>
        ${esc(statusText[s.status || "active"] || s.status || "—")}
      </td>

      <td>

        <button
          onclick="window.__viewStudent('${esc(s.id)}')"
        >
          Дидан
        </button>

        ${
          isManager()
            ? `
              <button
                onclick="window.__editStudent('${esc(s.id)}')"
              >
                Таҳрир
              </button>
            `
            : ""
        }

      </td>

    </tr>
  `;
}


/* =========================================================
   STUDENT PROFILE
========================================================= */

async function viewStudent(id) {

  const student = studentById(id);

  if (!student) return;

  const attendance = state.attendance
    .filter(a => a.studentId === id)
    .sort((a,b) => String(b.date).localeCompare(String(a.date)));

  const violations = state.violations
    .filter(v => v.studentId === id)
    .sort((a,b) => String(b.date).localeCompare(String(a.date)));

  openModal(`

    <h2>${esc(student.name)}</h2>

    <div class="profile-grid">

      <div>
        <small>Санаи таваллуд</small>
        <b>${formatDate(student.dob)}</b>
      </div>

      <div>
        <small>Телефон</small>
        <b>${esc(student.phone || "—")}</b>
      </div>

      <div>
        <small>Суроға</small>
        <b>${esc(student.address || "—")}</b>
      </div>

      <div>
        <small>Телефони падар</small>
        <b>${esc(student.fatherPhone || "—")}</b>
      </div>

      <div>
        <small>Синф</small>
        <b>${esc(student.className || "—")}</b>
      </div>

      <div>
        <small>Муаллим</small>
        <b>${esc(student.teacher || "—")}</b>
      </div>

      <div>
        <small>Ҳуҷра</small>
        <b>${esc(roomName(student.roomId))}</b>
      </div>

      <div>
        <small>Ҷой</small>
        <b>${student.place || "—"}</b>
      </div>

    </div>

    <hr>

    <h3>Attendance</h3>

    ${
      attendance.length
        ? attendance.slice(0, 20).map(a => `
          <div class="history-item">
            <b>${formatDate(a.date)}</b>
            <span>${esc(a.status)}</span>
            <small>${esc(a.note || "")}</small>
          </div>
        `).join("")
        : "<p>Ҳоло маълумот нест.</p>"
    }

    <hr>

    <h3>Қоидавайронкунӣ</h3>

    ${
      violations.length
        ? violations.slice(0, 20).map(v => `
          <div class="history-item">
            <b>${formatDate(v.date)}</b>
            <span>${esc(v.severity || "Оддӣ")}</span>
            <small>${esc(v.description || "")}</small>
          </div>
        `).join("")
        : "<p>Қоидавайронкунӣ нест.</p>"
    }

  `);
}


/* =========================================================
   ADD STUDENT
========================================================= */

function openAddStudent() {

  if (!isManager()) return;

  const supervisors = state.supervisors;

  openModal(`

    <h2>Иловаи донишҷӯ</h2>

    <form id="studentForm">

      <label>Ному насаб</label>
      <input name="name" required>

      <label>Санаи таваллуд</label>
      <input name="dob" type="date">

      <label>Телефон</label>
      <input name="phone" inputmode="numeric">

      <label>Суроға</label>
      <input name="address">

      <label>Телефони падар</label>
      <input name="fatherPhone" inputmode="numeric">

      <label>Синф</label>
      <input name="className">

      <label>Муаллими синф</label>
      <input name="teacher">

      <label>Мураббӣ</label>

      <select name="supervisorId">

        <option value="">
          Интихоб кунед
        </option>

        ${supervisors.map(s => `
          <option value="${esc(s.id)}">
            ${esc(s.name || s.email || s.id)}
          </option>
        `).join("")}

      </select>

      <label>Ҳолат</label>

      <select name="status">
        <option value="active">Фаъол</option>
        <option value="absent">Муваққатан ғоиб</option>
        <option value="transferred">Гузаронида шуд</option>
        <option value="removed">Хориҷ шуд</option>
      </select>

      <button class="primary" type="submit">
        Захира кардан
      </button>

    </form>
  `);

  $("#studentForm").addEventListener("submit", async e => {

    e.preventDefault();

    const form = new FormData(e.target);

    try {

      const studentRef = doc(
        collection(db, "students")
      );

      await setDoc(studentRef, {

        name: form.get("name"),
        dob: form.get("dob") || "",
        phone: form.get("phone") || "",
        address: form.get("address") || "",
        fatherPhone: form.get("fatherPhone") || "",
        className: form.get("className") || "",
        teacher: form.get("teacher") || "",
        supervisorId: form.get("supervisorId") || null,
        roomId: null,
        place: null,
        status: form.get("status") || "active",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()

      });

      closeModal();
      notify("Донишҷӯ илова шуд.");

      await studentsPage();

    } catch (err) {

      notify(errorMessage(err), "error");

    }
  });
}


/* =========================================================
   EDIT STUDENT
========================================================= */

function editStudent(id) {

  if (!isManager()) return;

  const s = studentById(id);

  if (!s) return;

  openModal(`

    <h2>Таҳрири донишҷӯ</h2>

    <form id="editStudentForm">

      <label>Ному насаб</label>
      <input name="name" value="${esc(s.name)}" required>

      <label>Санаи таваллуд</label>
      <input
        name="dob"
        type="date"
        value="${esc(s.dob || "")}"
      >

      <label>Телефон</label>
      <input
        name="phone"
        value="${esc(s.phone || "")}"
      >

      <label>Суроға</label>
      <input
        name="address"
        value="${esc(s.address || "")}"
      >

      <label>Телефони падар</label>
      <input
        name="fatherPhone"
        value="${esc(s.fatherPhone || "")}"
      >

      <label>Синф</label>
      <input
        name="className"
        value="${esc(s.className || "")}"
      >

      <label>Муаллими синф</label>
      <input
        name="teacher"
        value="${esc(s.teacher || "")}"
      >

      <label>Мураббӣ</label>

      <select name="supervisorId">

        <option value="">
          Бе мураббӣ
        </option>

        ${state.supervisors.map(x => `
          <option
            value="${esc(x.id)}"
            ${x.id === s.supervisorId ? "selected" : ""}
          >
            ${esc(x.name || x.email || x.id)}
          </option>
        `).join("")}

      </select>

      <label>Ҳолат</label>

      <select name="status">

        ${[
          ["active", "Фаъол"],
          ["absent", "Муваққатан ғоиб"],
          ["transferred", "Гузаронида шуд"],
          ["removed", "Хориҷ шуд"]
        ].map(([v,t]) => `
          <option value="${v}" ${s.status === v ? "selected" : ""}>
            ${t}
          </option>
        `).join("")}

      </select>

      <button class="primary" type="submit">
        Захира кардан
      </button>

    </form>
  `);

  $("#editStudentForm").addEventListener("submit", async e => {

    e.preventDefault();

    const form = new FormData(e.target);

    try {

      await updateDoc(
        doc(db, "students", id),
        {
          name: form.get("name"),
          dob: form.get("dob") || "",
          phone: form.get("phone") || "",
          address: form.get("address") || "",
          fatherPhone: form.get("fatherPhone") || "",
          className: form.get("className") || "",
          teacher: form.get("teacher") || "",
          supervisorId: form.get("supervisorId") || null,
          status: form.get("status") || "active",
          updatedAt: serverTimestamp()
        }
      );

      closeModal();
      notify("Маълумот нав шуд.");

      await studentsPage();

    } catch (err) {

      notify(errorMessage(err), "error");

    }
  });
}


/* =========================================================
   ROOMS
========================================================= */

async function roomsPage() {

  showLoading();

  try {
    await loadData();
  } catch (err) {
    notify(errorMessage(err), "error");
    return;
  }

  content().innerHTML = `

    <div class="room-grid">

      ${state.rooms.map(room => {

        const students = state.students.filter(
          s => s.roomId === room.id
        );

        return `

          <div class="room-card large">

            <div class="room-header">

              <div>
                <h3>${esc(room.name)}</h3>

                <small>
                  ${room.type === "student"
                    ? "Ҳуҷраи донишҷӯён"
                    : "Ҳуҷраи мураббӣ"}
                </small>
              </div>

              <strong>
                ${students.length}/${room.capacity}
              </strong>

            </div>

            <div class="places">

              ${Array.from(
                {length:Number(room.capacity || 0)},
                (_,i) => {

                  const place = i + 1;

                  const student = students.find(
                    s => Number(s.place) === place
                  );

                  if (student) {

                    return `
                      <button
                        class="place occupied"
                        onclick="window.__viewStudent('${esc(student.id)}')"
                      >
                        <b>${place}</b>
                        <span>${esc(student.name)}</span>
                      </button>
                    `;
                  }

                  return `
                    <button
                      class="place free"
                      ${
                        isManager()
                          ? `onclick="window.__assignStudent('${esc(room.id)}',${place})"`
                          : ""
                      }
                    >
                      <b>${place}</b>
                      <span>Озод</span>
                    </button>
                  `;
                }
              ).join("")}

            </div>

            ${
              isManager()
                ? `
                  <button
                    onclick="window.__assignRoom('${esc(room.id)}')"
                  >
                    Танзими ҳуҷра
                  </button>
                `
                : ""
            }

          </div>
        `;

      }).join("")}

    </div>
  `;
}


/* =========================================================
   ASSIGN ROOM / PLACE
========================================================= */

function assignStudent(roomId, place) {

  if (!isManager()) return;

  const room = roomById(roomId);

  const availableStudents = state.students.filter(
    s => (s.status || "active") === "active"
      && (!s.roomId || !s.place)
  );

  openModal(`

    <h2>
      Ҷойгиркунӣ — ${esc(room?.name || "")}
    </h2>

    <p>
      Ҷойи №${place}
    </p>

    <form id="assignForm">

      <label>Донишҷӯ</label>

      <select name="studentId" required>

        <option value="">
          Интихоб кунед
        </option>

        ${availableStudents.map(s => `
          <option value="${esc(s.id)}">
            ${esc(s.name)} — ${esc(s.className || "")}
          </option>
        `).join("")}

      </select>

      <button class="primary" type="submit">
        Ҷойгир кардан
      </button>

    </form>
  `);

  $("#assignForm").addEventListener("submit", async e => {

    e.preventDefault();

    const studentId = new FormData(e.target).get("studentId");

    try {

      await assignStudentTransaction(
        studentId,
        roomId,
        place
      );

      closeModal();

      notify("Донишҷӯ ба ҷой таъин шуд.");

      await roomsPage();

    } catch (err) {

      notify(errorMessage(err), "error");

    }
  });
}


async function assignStudentTransaction(
  studentId,
  roomId,
  place
) {

  const studentRef = doc(
    db,
    "students",
    studentId
  );

  const roomRef = doc(
    db,
    "rooms",
    roomId
  );

  const placementRef = doc(
    db,
    "placements",
    `${roomId}_${place}`
  );

  await runTransaction(db, async transaction => {

    const studentSnap = await transaction.get(
      studentRef
    );

    const roomSnap = await transaction.get(
      roomRef
    );

    const placementSnap = await transaction.get(
      placementRef
    );

    if (!studentSnap.exists()) {
      throw new Error("Донишҷӯ ёфт нашуд.");
    }

    if (!roomSnap.exists()) {
      throw new Error("Ҳуҷра ёфт нашуд.");
    }

    if (placementSnap.exists()) {
      throw new Error("Ин ҷой аллакай ишғол шудааст.");
    }

    const student = studentSnap.data();
    const room = roomSnap.data();

    if (student.roomId && student.place) {
      throw new Error(
        "Ин донишҷӯ аллакай ҷой дорад. Аввал ҷойивазкунӣ кунед."
      );
    }

    if (
      Number(place) < 1 ||
      Number(place) > Number(room.capacity)
    ) {
      throw new Error("Ин ҷой дар ҳуҷра вуҷуд надорад.");
    }

    const supervisorId =
      room.supervisorId || student.supervisorId || null;

    transaction.set(
      placementRef,
      {
        studentId,
        roomId,
        place: Number(place),
        supervisorId,
        assignedAt: serverTimestamp()
      }
    );

    transaction.update(
      studentRef,
      {
        roomId,
        place: Number(place),
        supervisorId,
        updatedAt: serverTimestamp()
      }
    );

  });
}


/* =========================================================
   ATTENDANCE
========================================================= */

async function attendancePage() {

  showLoading();

  try {
    await loadData();
  } catch (err) {
    notify(errorMessage(err), "error");
    return;
  }

  const sorted = [...state.attendance]
    .sort((a,b) => String(b.date).localeCompare(String(a.date)));

  content().innerHTML = `

    <div class="page-toolbar">

      ${
        state.students.length
          ? `
            <button
              class="primary"
              onclick="window.__openAttendance()"
            >
              + Attendance
            </button>
          `
          : ""
      }

    </div>

    <div class="card">

      <div class="table-wrap">

        <table>

          <thead>
            <tr>
              <th>Сана</th>
              <th>Донишҷӯ</th>
              <th>Ҳуҷра</th>
              <th>Ҳолат</th>
              <th>Шарҳ</th>
            </tr>
          </thead>

          <tbody>

            ${
              sorted.length
                ? sorted.slice(0, 100).map(a => {

                    const s = studentById(a.studentId);

                    return `
                      <tr>

                        <td>${formatDate(a.date)}</td>

                        <td>
                          ${esc(s?.name || "—")}
                        </td>

                        <td>
                          ${esc(roomName(a.roomId))}
                        </td>

                        <td>
                          ${esc(a.status || "—")}
                        </td>

                        <td>
                          ${esc(a.note || "")}
                        </td>

                      </tr>
                    `;

                  }).join("")
                : `
                  <tr>
                    <td colspan="5" style="text-align:center">
                      Attendance ҳоло вуҷуд надорад.
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


function openAttendance() {

  const students = state.students.filter(
    s => (s.status || "active") === "active"
  );

  openModal(`

    <h2>Attendance</h2>

    <form id="attendanceForm">

      <label>Сана</label>

      <input
        name="date"
        type="date"
        value="${today()}"
        required
      >

      <label>Донишҷӯ</label>

      <select name="studentId" required>

        <option value="">
          Интихоб кунед
        </option>

        ${students.map(s => `
          <option value="${esc(s.id)}">
            ${esc(s.name)} — ${esc(roomName(s.roomId))}
          </option>
        `).join("")}

      </select>

      <label>Ҳолат</label>

      <select name="status" required>

        <option value="Present">Ҳозир</option>
        <option value="Absent">Ғоиб</option>
        <option value="Permission">Иҷозат</option>
        <option value="Sick">Бемор</option>

      </select>

      <label>Шарҳ</label>

      <textarea name="note"></textarea>

      <button class="primary">
        Захира кардан
      </button>

    </form>
  `);

  $("#attendanceForm").addEventListener("submit", async e => {

    e.preventDefault();

    const form = new FormData(e.target);
    const student = studentById(form.get("studentId"));

    if (!student) return;

    try {

      await addDoc(
        collection(db, "attendance"),
        {
          studentId: student.id,
          supervisorId:
            isManager()
              ? (student.supervisorId || uid())
              : uid(),

          roomId: student.roomId || null,

          date: form.get("date"),
          status: form.get("status"),
          note: form.get("note") || "",

          createdAt: serverTimestamp(),
          createdBy: uid()
        }
      );

      closeModal();

      notify("Attendance захира шуд.");

      await attendancePage();

    } catch (err) {

      notify(errorMessage(err), "error");

    }
  });
}


/* =========================================================
   VIOLATIONS
========================================================= */

async function violationsPage() {

  showLoading();

  try {
    await loadData();
  } catch (err) {
    notify(errorMessage(err), "error");
    return;
  }

  const sorted = [...state.violations]
    .sort((a,b) => String(b.date).localeCompare(String(a.date)));

  content().innerHTML = `

    <div class="page-toolbar">

      <button
        class="primary"
        onclick="window.__openViolation()"
      >
        + Қоидавайронкунӣ
      </button>

    </div>


    <div class="card">

      <div class="table-wrap">

        <table>

          <thead>

            <tr>
              <th>Сана</th>
              <th>Донишҷӯ</th>
              <th>Ҳуҷра</th>
              <th>Дараҷа</th>
              <th>Тавсиф</th>
            </tr>

          </thead>

          <tbody>

            ${
              sorted.length
                ? sorted.slice(0,100).map(v => {

                    const s = studentById(v.studentId);

                    return `
                      <tr>

                        <td>${formatDate(v.date)}</td>

                        <td>${esc(s?.name || "—")}</td>

                        <td>${esc(roomName(v.roomId))}</td>

                        <td>${esc(v.severity || "Оддӣ")}</td>

                        <td>${esc(v.description || "")}</td>

                      </tr>
                    `;

                  }).join("")
                : `
                  <tr>
                    <td colspan="5" style="text-align:center">
                      Маълумот нест.
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


function openViolation() {

  const students = state.students.filter(
    s => (s.status || "active") === "active"
  );

  openModal(`

    <h2>Қоидавайронкунӣ</h2>

    <form id="violationForm">

      <label>Сана</label>

      <input
        name="date"
        type="date"
        value="${today()}"
        required
      >

      <label>Донишҷӯ</label>

      <select name="studentId" required>

        <option value="">
          Интихоб кунед
        </option>

        ${students.map(s => `
          <option value="${esc(s.id)}">
            ${esc(s.name)}
          </option>
        `).join("")}

      </select>

      <label>Дараҷа</label>

      <select name="severity">

        <option value="Оддӣ">Оддӣ</option>
        <option value="Миёна">Миёна</option>
        <option value="Ҷиддӣ">Ҷиддӣ</option>

      </select>

      <label>Тавсиф</label>

      <textarea
        name="description"
        required
      ></textarea>

      <button class="primary">
        Захира кардан
      </button>

    </form>
  `);

  $("#violationForm").addEventListener("submit", async e => {

    e.preventDefault();

    const form = new FormData(e.target);
    const student = studentById(form.get("studentId"));

    if (!student) return;

    try {

      await addDoc(
        collection(db, "violations"),
        {
          studentId: student.id,

          supervisorId:
            isManager()
              ? (student.supervisorId || uid())
              : uid(),

          roomId: student.roomId || null,

          date: form.get("date"),

          severity: form.get("severity"),

          description: form.get("description"),

          createdAt: serverTimestamp(),

          createdBy: uid()
        }
      );

      closeModal();

      notify("Қоидавайронкунӣ сабт шуд.");

      await violationsPage();

    } catch (err) {

      notify(errorMessage(err), "error");

    }
  });
}


/* =========================================================
   CLEANLINESS
========================================================= */

async function cleanlinessPage() {

  showLoading();

  try {
    await loadData();
  } catch (err) {
    notify(errorMessage(err), "error");
    return;
  }

  const ranking = {};

  state.cleanliness.forEach(item => {

    if (!ranking[item.roomId]) {
      ranking[item.roomId] = {
        total: 0,
        count: 0
      };
    }

    ranking[item.roomId].total += Number(item.total || 0);
    ranking[item.roomId].count++;
  });

  const rows = Object.entries(ranking)
    .map(([roomId, x]) => ({
      roomId,
      total: x.total,
      count: x.count,
      average: x.count
        ? (x.total / x.count).toFixed(1)
        : "0"
    }))
    .sort((a,b) => Number(b.average) - Number(a.average));

  content().innerHTML = `

    <div class="page-toolbar">

      <button
        class="primary"
        onclick="window.__openCleanliness()"
      >
        + Санҷиши тозагӣ
      </button>

    </div>


    <div class="card">

      <h2>Рейтинг</h2>

      <p>
        Ҳар санҷиш максимум 50 хол дорад.
      </p>

      <div class="table-wrap">

        <table>

          <thead>

            <tr>
              <th>Ҳуҷра</th>
              <th>Санҷишҳо</th>
              <th>Ҳамагӣ</th>
              <th>Миёна</th>
            </tr>

          </thead>

          <tbody>

            ${
              rows.length
                ? rows.map(r => `
                    <tr>
                      <td>${esc(roomName(r.roomId))}</td>
                      <td>${r.count}</td>
                      <td>${r.total}</td>
                      <td><b>${r.average}/50</b></td>
                    </tr>
                  `).join("")
                : `
                  <tr>
                    <td colspan="4" style="text-align:center">
                      Ҳоло санҷиш гузаронида нашудааст.
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>


    <div class="card">

      <h2>Таърихи санҷишҳо</h2>

      <div class="table-wrap">

        <table>

          <thead>

            <tr>
              <th>Сана</th>
              <th>Ҳуҷра</th>
              <th>Хол</th>
              <th>Мураббӣ</th>
            </tr>

          </thead>

          <tbody>

            ${state.cleanliness
              .sort((a,b) =>
                String(b.date).localeCompare(String(a.date))
              )
              .slice(0,100)
              .map(x => `
                <tr>
                  <td>${formatDate(x.date)}</td>
                  <td>${esc(roomName(x.roomId))}</td>
                  <td><b>${Number(x.total || 0)}/50</b></td>
                  <td>${esc(supervisorName(x.supervisorId))}</td>
                </tr>
              `)
              .join("")}

          </tbody>

        </table>

      </div>

    </div>
  `;
}


function openCleanliness() {

  const rooms = state.rooms.filter(
    r => r.type === "student"
  );

  openModal(`

    <h2>Санҷиши тозагӣ</h2>

    <form id="cleanlinessForm">

      <label>Сана</label>

      <input
        name="date"
        type="date"
        value="${today()}"
        required
      >

      <label>Ҳуҷра</label>

      <select name="roomId" required>

        <option value="">
          Интихоб кунед
        </option>

        ${rooms.map(r => `
          <option value="${esc(r.id)}">
            ${esc(r.name)}
          </option>
        `).join("")}

      </select>

      ${[
        ["floor", "Тозагии фарш"],
        ["beds", "Тартиби катҳо"],
        ["windows", "Тирезаҳо"],
        ["desk", "Миз ва ҷевонҳо"],
        ["general", "Тозагии умумӣ"]
      ].map(([name,label]) => `
        <label>
          ${label} — 0 то 10
        </label>

        <input
          name="${name}"
          type="number"
          min="0"
          max="10"
          value="10"
          required
        >
      `).join("")}

      <label>Шарҳ</label>

      <textarea name="note"></textarea>

      <button class="primary">
        Захира кардан
      </button>

    </form>
  `);

  $("#cleanlinessForm").addEventListener("submit", async e => {

    e.preventDefault();

    const form = new FormData(e.target);

    const scores = [
      Number(form.get("floor")),
      Number(form.get("beds")),
      Number(form.get("windows")),
      Number(form.get("desk")),
      Number(form.get("general"))
    ];

    if (scores.some(x => x < 0 || x > 10)) {
      notify("Ҳар хол бояд аз 0 то 10 бошад.", "error");
      return;
    }

    const roomId = form.get("roomId");
    const room = roomById(roomId);

    if (!room) return;

    try {

      await addDoc(
        collection(db, "cleanliness_inspections"),
        {

          roomId,

          supervisorId:
            isManager()
              ? (room.supervisorId || uid())
              : uid(),

          date: form.get("date"),

          floor: scores[0],
          beds: scores[1],
          windows: scores[2],
          desk: scores[3],
          general: scores[4],

          total: scores.reduce(
            (sum, x) => sum + x,
            0
          ),

          note: form.get("note") || "",

          createdAt: serverTimestamp(),

          createdBy: uid()
        }
      );

      closeModal();

      notify("Санҷиши тозагӣ сабт шуд.");

      await cleanlinessPage();

    } catch (err) {

      notify(errorMessage(err), "error");

    }
  });
}


/* =========================================================
   SUPERVISORS
========================================================= */

async function supervisorsPage() {

  if (!isManager()) {

    content().innerHTML = `
      <div class="card">
        <h2>Дастрасӣ манъ аст</h2>
        <p>Ин бахш танҳо барои Manager аст.</p>
      </div>
    `;

    return;
  }

  showLoading();

  try {
    await loadData();
  } catch (err) {
    notify(errorMessage(err), "error");
    return;
  }

  content().innerHTML = `

    <div class="card">

      <h2>Мураббиён</h2>

      <p>
        Мураббиён бояд аввал дар Firebase Authentication
        ҳамчун User сохта шаванд.
      </p>

      <div class="table-wrap">

        <table>

          <thead>

            <tr>
              <th>Ном</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Ҳуҷраҳо</th>
              <th>Амал</th>
            </tr>

          </thead>

          <tbody>

            ${
              state.supervisors.length
                ? state.supervisors.map(s => {

                    const assignedRooms =
                      state.rooms.filter(
                        r => r.supervisorId === s.id
                      );

                    return `
                      <tr>

                        <td>
                          <b>${esc(s.name || "—")}</b>
                        </td>

                        <td>
                          ${esc(s.email || "—")}
                        </td>

                        <td>
                          ${esc(s.phone || "—")}
                        </td>

                        <td>
                          ${assignedRooms
                            .map(r => esc(r.name))
                            .join(", ") || "—"}
                        </td>

                        <td>

                          <button
                            onclick="window.__assignSupervisor('${esc(s.id)}')"
                          >
                            Танзим
                          </button>

                        </td>

                      </tr>
                    `;

                  }).join("")
                : `
                  <tr>
                    <td colspan="5" style="text-align:center">
                      Ҳоло supervisor вуҷуд надорад.
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/* =========================================================
   ASSIGN SUPERVISOR TO ROOMS
========================================================= */

function assignSupervisor(supervisorId) {

  if (!isManager()) return;

  const supervisor = supervisorById(
    supervisorId
  );

  const rooms = state.rooms.filter(
    r => r.type === "student"
  );

  openModal(`

    <h2>
      Ҳуҷраҳои ${esc(supervisor?.name || "")}
    </h2>

    <form id="supervisorRoomsForm">

      ${rooms.map(room => {

        const checked =
          room.supervisorId === supervisorId;

        return `
          <label style="
            display:flex;
            align-items:center;
            gap:10px;
            margin:10px 0;
          ">

            <input
              type="checkbox"
              name="room"
              value="${esc(room.id)}"
              ${checked ? "checked" : ""}
            >

            ${esc(room.name)}

          </label>
        `;

      }).join("")}

      <button class="primary">
        Захира кардан
      </button>

    </form>
  `);

  $("#supervisorRoomsForm").addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      const selected = [
        ...e.target.querySelectorAll(
          'input[name="room"]:checked'
        )
      ].map(x => x.value);

      try {

        for (const room of rooms) {

          const shouldAssign =
            selected.includes(room.id);

          if (
            shouldAssign &&
            room.supervisorId !== supervisorId
          ) {

            await updateDoc(
              doc(db, "rooms", room.id),
              {
                supervisorId,
                updatedAt: serverTimestamp()
              }
            );
          }

          if (
            !shouldAssign &&
            room.supervisorId === supervisorId
          ) {

            await updateDoc(
              doc(db, "rooms", room.id),
              {
                supervisorId: null,
                updatedAt: serverTimestamp()
              }
            );
          }
        }

        await setDoc(
          doc(db, "users", supervisorId),
          {
            assignedRoomIds: selected,
            updatedAt: serverTimestamp()
          },
          {merge:true}
        );

        closeModal();

        notify("Ҳуҷраҳои мураббӣ нав шуданд.");

        await supervisorsPage();

      } catch (err) {

        notify(errorMessage(err), "error");

      }
    }
  );
}


/* =========================================================
   GLOBAL ACTIONS
========================================================= */

window.__navigate = navigate;
window.__openAddStudent = openAddStudent;
window.__viewStudent = viewStudent;
window.__editStudent = editStudent;
window.__assignStudent = assignStudent;
window.__openAttendance = openAttendance;
window.__openViolation = openViolation;
window.__openCleanliness = openCleanliness;
window.__assignSupervisor = assignSupervisor;


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, async user => {

  if (!user) {

    state.user = null;
    state.profile = null;

    renderLogin();

    return;
  }

  try {

    state.user = user;

    const profileSnap = await getDoc(
      doc(db, "users", user.uid)
    );

    if (!profileSnap.exists()) {

      await signOut(auth);

      renderLogin();

      notify(
        "Барои ин корбар профили users вуҷуд надорад.",
        "error"
      );

      return;
    }

    state.profile = {
      id: profileSnap.id,
      ...profileSnap.data()
    };

    if (
      state.profile.role !== "manager" &&
      state.profile.role !== "supervisor"
    ) {

      await signOut(auth);

      renderLogin();

      notify(
        "Нақши ин корбар муайян нашудааст.",
        "error"
      );

      return;
    }

    renderAppShell();

  } catch (err) {

    console.error(err);

    renderLogin();

    notify(errorMessage(err), "error");
  }

});
