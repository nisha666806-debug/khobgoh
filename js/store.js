// Khobgoh Central State Store with LocalStorage persistence v2.2
import { initialData } from "./data.js";
import { translations } from "./translations.js";
import { syncManager } from "./sync.js";

const STORAGE_KEY = "khobgoh_state_v3_6";

class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("khobgoh_state_v3_5");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...initialData,
            ...parsed,
            tea: {
              recipes: parsed.tea?.recipes && parsed.tea.recipes.length ? parsed.tea.recipes : initialData.tea.recipes,
              classSchedule: parsed.tea?.classSchedule && parsed.tea.classSchedule.length ? parsed.tea.classSchedule : initialData.tea.classSchedule
            },
            activeRole: parsed.activeRole || "manager",
            lang: parsed.lang || "tg",
            theme: parsed.theme || "light",
            currentPage: parsed.currentPage === "chat" ? "dashboard" : (parsed.currentPage || "dashboard")
          };
        }
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
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
    return true; // Any authenticated supervisor, head, or manager can manage students
  }

  canManageRooms() {
    return this.state.activeRole === "manager" || this.state.activeRole === "head";
  }

  canManageSupervisors() {
    return this.state.activeRole === "manager" || this.state.activeRole === "head";
  }

  canManageTea() {
    return this.state.activeRole === "manager" || this.state.activeRole === "head";
  }

  isHeadSupervisor() {
    return this.state.activeRole === "head";
  }

  canManageActivities() {
    return this.state.activeRole === "manager" || this.state.activeRole === "head";
  }

  canRateCleanliness() {
    const inspectorId = this.state.cleanlinessInspectorId;
    // Condition 1: Must have an assigned cleanliness inspector (Requirement 4)
    if (!inspectorId) return false;

    // Admin / Manager can rate/assist
    if (this.state.activeRole === "manager") return true;

    // Check if logged-in supervisor is the appointed inspector
    if (syncManager.currentUser?.email) {
      const inspector = (this.state.supervisors || []).find(s => s.id === inspectorId);
      if (inspector && inspector.email && inspector.email.toLowerCase() === syncManager.currentUser.email.toLowerCase()) {
        return true;
      }
    }

    if (this.state.currentSupervisorId && this.state.currentSupervisorId === inspectorId) {
      return true;
    }

    // Other supervisors cannot grade
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
    this.state.students = this.state.students.filter(s => s.id !== id);
    this.saveState();
    syncManager.syncStudent({ id }, true);
  }

  // Add or configure custom room
  addCustomRoom(id, capacity = 8, floor = 1, type = "student", supervisorId = "", name = "") {
    const roomId = String(id).trim();
    const existing = this.state.rooms.find(r => r.id === roomId);
    const roomName = name ? name.trim() : (type === "supervisor" ? `Мураббиён ${roomId}` : `Ҳуҷраи ${roomId}`);
    if (existing) {
      existing.name = roomName;
      existing.capacity = Number(capacity);
      existing.floor = Number(floor);
      existing.type = type;
      if (supervisorId) existing.supervisorId = supervisorId;
      syncManager.syncRoom(existing);
    } else {
      const newRoom = {
        id: roomId,
        name: roomName,
        floor: Number(floor) || (parseInt(roomId[0]) || 1),
        type,
        capacity: Number(capacity),
        supervisorId: supervisorId || ""
      };
      this.state.rooms.push(newRoom);
      syncManager.syncRoom(newRoom);
    }
    this.saveState();
  }

  // Update Room (name, number, capacity, floor, type, supervisorId)
  updateRoom(oldId, updates) {
    if (!this.canManageRooms()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд ҳуҷраро таҳрир кунанд.");
    }
    const target = this.state.rooms.find(r => r.id === oldId);
    if (!target) return;

    const newId = updates.id ? String(updates.id).trim() : oldId;
    if (newId !== oldId) {
      syncManager.syncRoom({ id: oldId }, true);
      this.state.students.forEach(s => {
        if (s.room === oldId) s.room = newId;
      });
      if (this.state.roomLeaders[oldId]) {
        this.state.roomLeaders[newId] = this.state.roomLeaders[oldId];
        delete this.state.roomLeaders[oldId];
      }
      target.id = newId;
    }

    if (updates.name) target.name = updates.name;
    if (updates.capacity) target.capacity = Number(updates.capacity);
    if (updates.floor) target.floor = Number(updates.floor);
    if (updates.type) target.type = updates.type;
    if (updates.supervisorId !== undefined) target.supervisorId = updates.supervisorId;

    this.saveState();
    syncManager.syncRoom(target);
  }

  deleteRoom(roomId) {
    if (!this.canManageRooms()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд ҳуҷраро хориҷ кунанд.");
    }
    this.state.rooms = this.state.rooms.filter(r => r.id !== roomId);
    delete this.state.roomLeaders[roomId];
    this.saveState();
    syncManager.syncRoom({ id: roomId }, true);
  }

  setRoomSupervisor(roomId, supervisorId) {
    if (!this.canManageRooms()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд масъули ҳуҷраро таъин кунанд.");
    }
    const room = this.state.rooms.find(r => r.id === roomId);
    if (room) {
      room.supervisorId = supervisorId;
      this.saveState();
    }
  }

  setSupervisorRoomLeader(roomId, supervisorId) {
    if (!this.canManageRooms()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд сардори ҳуҷраи мураббиёнро таъин кунанд.");
    }
    this.state.roomLeaders[roomId] = supervisorId;
    this.saveState();
    syncManager.syncMeta({ roomLeaders: this.state.roomLeaders });
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

  // --- Tea Recipes CRUD (Managed by Head Supervisor) ---
  addTeaRecipe(item) {
    if (!this.canManageTea()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд ресептҳои чойро илова кунанд.");
    }
    const newRec = {
      id: "rec_" + Date.now(),
      name: item.name,
      ingredients: item.ingredients || "",
      time: item.time || "10 дақиқа дам хӯрдан",
      author: "Сармураббӣ"
    };
    if (!this.state.tea.recipes) this.state.tea.recipes = [];
    this.state.tea.recipes.push(newRec);
    this.saveState();
    syncManager.syncMeta({ tea: this.state.tea });
    return newRec;
  }

  updateTeaRecipe(id, updates) {
    if (!this.canManageTea()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд ресептро таҳрир кунанд.");
    }
    this.state.tea.recipes = (this.state.tea.recipes || []).map(r => r.id === id ? { ...r, ...updates } : r);
    this.saveState();
    syncManager.syncMeta({ tea: this.state.tea });
  }

  deleteTeaRecipe(id) {
    if (!this.canManageTea()) {
      throw new Error("Танҳо Сармураббӣ ё Мудир метавонанд ресептро хориҷ кунанд.");
    }
    this.state.tea.recipes = (this.state.tea.recipes || []).filter(r => r.id !== id);
    this.saveState();
    syncManager.syncMeta({ tea: this.state.tea });
  }

  // --- Class Tea Schedule CRUD ---
  addClassTeaSchedule(item) {
    if (!this.canManageTea()) {
      throw new Error("Танҳо Сармураббӣ метавонад ҷадвали чойнӯшии синфҳоро таъин кунад.");
    }
    const newSched = {
      id: "ts_" + Date.now(),
      class: item.class || "Синфи 7",
      meal: item.meal || "Субҳона",
      time: item.time || "07:00 - 07:30",
      place: item.place || "Ошхона",
      notes: item.notes || ""
    };
    if (!this.state.tea.classSchedule) this.state.tea.classSchedule = [];
    this.state.tea.classSchedule.push(newSched);
    this.saveState();
    syncManager.syncMeta({ tea: this.state.tea });
    return newSched;
  }

  updateClassTeaSchedule(id, updates) {
    if (!this.canManageTea()) {
      throw new Error("Танҳо Сармураббӣ метавонад ин соати чойнӯширо таҳрир кунад.");
    }
    this.state.tea.classSchedule = (this.state.tea.classSchedule || []).map(s => s.id === id ? { ...s, ...updates } : s);
    this.saveState();
    syncManager.syncMeta({ tea: this.state.tea });
  }

  deleteClassTeaSchedule(id) {
    if (!this.canManageTea()) {
      throw new Error("Танҳо Сармураббӣ метавонад ин соатро хориҷ кунад.");
    }
    this.state.tea.classSchedule = (this.state.tea.classSchedule || []).filter(s => s.id !== id);
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

  // --- Duty Roster (2-3 Supervisors appointed by Head Supervisor - Requirement 6) ---
  setDayRoster(dayKey, supervisorIds) {
    const dayItem = this.state.roster.find(r => r.day === dayKey);
    if (!dayItem) return;

    const ids = Array.isArray(supervisorIds) ? supervisorIds : [supervisorIds];
    const sups = (this.state.supervisors || []).filter(s => ids.includes(s.id));
    
    dayItem.supervisors = sups.slice(0, 3).map((s, idx) => ({
      id: s.id,
      name: s.name,
      phone: s.phone || "",
      order: idx + 1,
      role: idx === 0 ? "Навбатдори асосӣ" : `Навбатдори №${idx + 1}`
    }));

    this.saveState();
    syncManager.syncRoster(this.state.roster);
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

  deleteViolation(id) {
    this.state.violations = this.state.violations.filter(v => v.id !== id);
    this.saveState();
    syncManager.deleteViolation(id);
  }

  // --- Cleanliness 5 criteria (Max 50 points) with Date History (Requirement 5) ---
  rateRoom5(room, appearance, wardrobes, beds, dust, air, notes, date = null) {
    const a = Math.min(15, Math.max(0, parseFloat(appearance) || 0));
    const w = Math.min(10, Math.max(0, parseFloat(wardrobes) || 0));
    const b = Math.min(10, Math.max(0, parseFloat(beds) || 0));
    const d = Math.min(10, Math.max(0, parseFloat(dust) || 0));
    const ar = Math.min(5, Math.max(0, parseFloat(air) || 0));
    const total = parseFloat((a + w + b + d + ar).toFixed(1));
    const ratingDate = date || this.selectedCleanlinessDate || new Date().toISOString().split("T")[0];

    const inspector = (this.state.supervisors || []).find(s => s.id === this.state.cleanlinessInspectorId);
    const inspectorName = inspector ? inspector.name : "Масъули тозагӣ";

    const entry = {
      id: `clean_${room}_${ratingDate}`,
      room,
      date: ratingDate,
      score: total,
      appearance: a,
      wardrobes: w,
      beds: b,
      dust: d,
      air: ar,
      notes: notes || "Санҷиш гузаронида шуд",
      inspectorId: this.state.cleanlinessInspectorId || null,
      inspectorName
    };

    const existingIndex = this.state.cleanliness.findIndex(c => c.room === room && (c.date === ratingDate || !c.date));
    if (existingIndex >= 0) {
      this.state.cleanliness[existingIndex] = entry;
    } else {
      this.state.cleanliness.unshift(entry);
    }

    this.saveState();
    syncManager.syncCleanliness(entry);
  }

  getCleanlinessForDate(date) {
    const today = new Date().toISOString().split("T")[0];
    const targetDate = date || this.selectedCleanlinessDate || today;
    const list = this.state.cleanliness.filter(c => c.date === targetDate);
    if (list.length > 0) {
      return [...list].sort((a, b) => b.score - a.score);
    }
    // If no records for selected date yet, return all rooms with 0 or last recorded
    return [...this.state.cleanliness].filter(c => !c.date || c.date === today).sort((a, b) => b.score - a.score);
  }

  // --- Quick Stats helper (Excludes supervisor quarters from vacant bed counts) ---
  getStats() {
    const totalStudents = this.state.students.length;
    const studentRooms = this.state.rooms.filter(r => r.type === "student");
    let totalCapacity = 0;
    studentRooms.forEach(r => {
      totalCapacity += Number(r.capacity || 0);
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
