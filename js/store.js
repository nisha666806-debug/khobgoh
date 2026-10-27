// Khobgoh Central State Store with LocalStorage persistence v2.2
import { initialData } from "./data.js";
import { translations } from "./translations.js";
import { syncManager } from "./sync.js";

const STORAGE_KEY = "khobgoh_state_v2_2";

class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialData,
          ...parsed,
          activeRole: parsed.activeRole || "manager",
          lang: parsed.lang || "tg",
          theme: parsed.theme || "light",
          currentPage: parsed.currentPage === "chat" ? "dashboard" : (parsed.currentPage || "dashboard")
        };
      }
    } catch (e) {
      console.warn("Failed to load local storage state, using seed defaults:", e);
    }

    return {
      ...initialData,
      activeRole: "manager",
      lang: "tg",
      theme: "light",
      currentPage: "dashboard"
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Storage save failed:", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- Translation helper ---
  t(key) {
    const lang = this.state.lang || "tg";
    return translations[lang]?.[key] || translations["tg"]?.[key] || key;
  }

  // Check admin rights
  canManageStudents() {
    return this.state.activeRole === "manager" || this.state.activeRole === "head";
  }

  canManageActivities() {
    return this.state.activeRole === "manager" || this.state.activeRole === "head";
  }

  canRateCleanliness() {
    if (this.state.activeRole === "manager" || this.state.activeRole === "head") return true;
    if (this.state.activeRole === "supervisor") {
      // Check if current user is the designated inspector
      return true; // We allow testing in demo, or limit to designated inspector
    }
    return false;
  }

  // --- Theme & Lang & Role & Navigation ---
  setPage(page) {
    this.state.currentPage = page;
    this.saveState();
  }

  setLang(lang) {
    this.state.lang = lang;
    this.saveState();
  }

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    this.saveState();
  }

  setRole(role) {
    this.state.activeRole = role;
    this.saveState();
  }

  resetToDemo() {
    this.state = {
      ...initialData,
      activeRole: "manager",
      lang: "tg",
      theme: "light",
      currentPage: "dashboard"
    };
    this.saveState();
  }

  exportData() {
    return JSON.stringify(this.state, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.state = { ...this.state, ...data };
      this.saveState();
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Students CRUD ---
  addStudent(student) {
    if (!this.canManageStudents()) {
      throw new Error("Танҳо Мудир ё Сармураббӣ метавонанд донишҷӯёнро дохил кунанд.");
    }

    const id = "std_" + Date.now();
    const roomNum = String(student.room || "101").trim();
    // Auto-create room if not exists
    if (!this.state.rooms.some(r => r.id === roomNum)) {
      this.state.rooms.push({
        id: roomNum,
        name: `Ҳуҷраи ${roomNum}`,
        floor: parseInt(roomNum[0]) || 1,
        type: "student",
        capacity: 8
      });
    }

    const newStudent = {
      id,
      studentId: student.studentId || `KH-${Date.now().toString().slice(-4)}`,
      name: student.name,
      room: roomNum,
      bed: Number(student.bed || 1),
      course: student.course || "Синфи 10",
      phone: student.phone || "",
      admissionDate: student.admissionDate || new Date().toISOString().split("T")[0],
      status: student.status || "Active",
      guardian: student.guardian || ""
    };
    this.state.students.unshift(newStudent);
    this.saveState();
    syncManager.syncStudent(newStudent);
    return newStudent;
  }

  updateStudent(id, updates) {
    this.state.students = this.state.students.map(s => s.id === id ? { ...s, ...updates } : s);
    this.saveState();
    const updated = this.state.students.find(s => s.id === id);
    if (updated) syncManager.syncStudent(updated);
  }

  deleteStudent(id) {
    if (!this.canManageStudents()) {
      throw new Error("Танҳо Мудир ё Сармураббӣ метавонанд донишҷӯро хориҷ кунанд.");
    }
    this.state.students = this.state.students.filter(s => s.id !== id);
    this.saveState();
    syncManager.syncStudent({ id }, true);
  }

  // Add or configure custom room
  addCustomRoom(id, capacity = 8, floor = 1, type = "student") {
    const roomId = String(id).trim();
    const existing = this.state.rooms.find(r => r.id === roomId);
    if (existing) {
      existing.capacity = Number(capacity);
      existing.floor = Number(floor);
      existing.type = type;
    } else {
      this.state.rooms.push({
        id: roomId,
        name: type === "supervisor" ? `Мураббиён ${roomId}` : `Ҳуҷраи ${roomId}`,
        floor: Number(floor) || (parseInt(roomId[0]) || 1),
        type,
        capacity: Number(capacity)
      });
    }
    this.saveState();
  }

  // --- Supervisors CRUD ---
  addSupervisor(sup) {
    if (!this.canManageStudents()) {
      throw new Error("Танҳо Мудир ё Сармураббӣ метавонанд мураббии навро илова кунанд.");
    }
    const id = "sup_" + Date.now();
    const newSup = {
      id,
      name: sup.name,
      phone: sup.phone || "",
      email: sup.email || "",
      role: sup.role || "supervisor",
      room: sup.room || "201",
      bed: Number(sup.bed || 1)
    };
    this.state.supervisors.push(newSup);
    this.saveState();
    return newSup;
  }

  updateSupervisor(id, updates) {
    if (!this.canManageStudents()) {
      throw new Error("Танҳо Мудир ё Сармураббӣ метавонанд маълумоти мураббиро таҳрир кунанд.");
    }
    this.state.supervisors = this.state.supervisors.map(s => s.id === id ? { ...s, ...updates } : s);
    this.saveState();
  }

  deleteSupervisor(id) {
    if (!this.canManageStudents()) {
      throw new Error("Танҳо Мудир метавонад мураббиро хориҷ кунад.");
    }
    this.state.supervisors = this.state.supervisors.filter(s => s.id !== id);
    // If deleted supervisor was cleanliness inspector, reset
    if (this.state.cleanlinessInspectorId === id) {
      this.state.cleanlinessInspectorId = this.state.supervisors[0]?.id || "sup_1";
    }
    this.saveState();
  }

  // Set Room Leader
  setRoomLeader(roomId, studentId) {
    if (!this.canManageStudents()) {
      throw new Error("Танҳо Мудир метавонад сардори ҳуҷраро таъин кунад.");
    }
    this.state.roomLeaders[roomId] = studentId;
    this.saveState();
    syncManager.syncMeta({ roomLeaders: this.state.roomLeaders });
  }

  // Assign Supervisor to Quarters (Rooms 201-203, Beds 1-4)
  assignSupervisor(supervisorId, roomId, bedNum) {
    this.state.supervisors = this.state.supervisors.map(s => {
      if (s.id === supervisorId) {
        return { ...s, room: roomId, bed: Number(bedNum) };
      }
      return s;
    });
    this.saveState();
  }

  // Set Cleanliness Inspector
  setCleanlinessInspector(supervisorId) {
    this.state.cleanlinessInspectorId = supervisorId;
    this.saveState();
    syncManager.syncMeta({ cleanlinessInspectorId: supervisorId });
  }

  // Update Tea duty from any page
  updateTeaDuty(todayDuty, samovarStatus) {
    if (todayDuty) this.state.tea.todayDuty = todayDuty;
    if (samovarStatus) this.state.tea.samovarStatus = samovarStatus;
    this.saveState();
    syncManager.syncMeta({ tea: this.state.tea });
  }

  // --- Activities CRUD ---
  addActivity(item) {
    const newAct = {
      id: "act_" + Date.now(),
      day: item.day,
      class: item.class,
      time: item.time,
      activity: item.activity,
      location: item.location || "Хобгоҳ"
    };
    this.state.activities.push(newAct);
    this.saveState();
    syncManager.syncActivity(newAct);
  }

  deleteActivity(id) {
    this.state.activities = this.state.activities.filter(a => a.id !== id);
    this.saveState();
    syncManager.syncActivity({ id }, true);
  }

  // --- Attendance (Present / Absent) ---
  setAttendance(date, studentId, status) {
    if (!this.state.attendance[date]) {
      this.state.attendance[date] = {};
    }
    this.state.attendance[date][studentId] = status;
    this.saveState();
    syncManager.syncAttendance(date, studentId, status);
  }

  markAllPresent(date) {
    if (!this.state.attendance[date]) {
      this.state.attendance[date] = {};
    }
    this.state.students.forEach(s => {
      this.state.attendance[date][s.id] = "present";
      syncManager.syncAttendance(date, s.id, "present");
    });
    this.saveState();
  }

  // --- Violations ---
  addViolation(violation) {
    const newViol = {
      id: "viol_" + Date.now(),
      studentId: violation.studentId,
      studentName: violation.studentName,
      room: violation.room,
      date: violation.date || new Date().toISOString().split("T")[0],
      reason: violation.reason,
      status: "pending",
      reporter: violation.reporter || "Мураббӣ"
    };
    this.state.violations.unshift(newViol);
    this.saveState();
    syncManager.syncViolation(newViol);
  }

  resolveViolation(id) {
    this.state.violations = this.state.violations.map(v => v.id === id ? { ...v, status: "resolved" } : v);
    this.saveState();
    syncManager.syncViolation({ id }, true);
  }

  // --- Cleanliness 5 criteria (Max 50 points) ---
  rateRoom5(room, appearance, wardrobes, beds, dust, air, notes) {
    const a = Math.min(15, Math.max(0, parseFloat(appearance) || 0));
    const w = Math.min(10, Math.max(0, parseFloat(wardrobes) || 0));
    const b = Math.min(10, Math.max(0, parseFloat(beds) || 0));
    const d = Math.min(10, Math.max(0, parseFloat(dust) || 0));
    const ar = Math.min(5, Math.max(0, parseFloat(air) || 0));
    const total = parseFloat((a + w + b + d + ar).toFixed(1));

    const existingIndex = this.state.cleanliness.findIndex(c => c.room === room);
    const entry = {
      room,
      score: total,
      appearance: a,
      wardrobes: w,
      beds: b,
      dust: d,
      air: ar,
      notes: notes || "Санҷиш гузаронида шуд"
    };

    if (existingIndex >= 0) {
      this.state.cleanliness[existingIndex] = entry;
    } else {
      this.state.cleanliness.push(entry);
    }

    // Re-rank
    this.state.cleanliness.sort((x, y) => y.score - x.score);
    this.state.cleanliness.forEach((item, idx) => {
      item.rank = idx + 1;
    });
    this.saveState();
    syncManager.syncCleanliness(entry);
  }

  // --- Quick Stats helper ---
  getStats() {
    const totalStudents = this.state.students.length;
    let totalCapacity = 0;
    this.state.rooms.forEach(r => {
      totalCapacity += r.capacity;
    });
    const occupiedBeds = this.state.students.filter(s => s.status === "Active").length;
    const vacantBeds = Math.max(0, totalCapacity - occupiedBeds);
    const today = new Date().toISOString().split("T")[0];
    const todayAtt = this.state.attendance[today] || {};
    
    // Count present
    let presentCount = 0;
    let absentCount = 0;
    this.state.students.forEach(s => {
      const st = todayAtt[s.id] || "present";
      if (st === "present") presentCount++;
      else absentCount++;
    });

    const attPercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

    return {
      totalStudents,
      totalCapacity,
      occupiedBeds,
      vacantBeds,
      presentCount,
      absentCount,
      attPercentage
    };
  }
}

export const store = new Store();
