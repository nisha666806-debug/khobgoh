// Khobgoh Firebase Real-Time Synchronization Service v1.1 (Non-blocking / Fail-safe)
class SyncManager {
  constructor() {
    this.store = null;
    this.fb = null;
    this.unsubscribers = [];
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.isReady = false;

    window.addEventListener("online", () => {
      this.isOnline = true;
      if (window.khobgoh?.showToast) window.khobgoh.showToast("Пайвасти интернет барқарор шуд.", "info");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      if (window.khobgoh?.showToast) window.khobgoh.showToast("Реҷаи офлайн фаъол аст.", "info");
    });
  }

  async init(store) {
    this.store = store;

    // Dynamically load Firebase in background so it never blocks UI rendering
    try {
      this.fb = await import("./firebase.js");
      this.isReady = true;

      // Listen to Firebase Auth state
      this.fb.onAuthStateChanged(this.fb.auth, async (user) => {
        if (user) {
          this.currentUser = user;
          this.store.state.currentUserEmail = user.email;
          this.store.state.isFirebaseConnected = true;

          try {
            const userDoc = await this.fb.getDoc(this.fb.doc(this.fb.db, "users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              this.store.state.profile = data;
              if (data.role) {
                this.store.setRole(data.role);
              }
            }
          } catch (e) {
            console.debug("User doc fetch info:", e);
          }

          this.subscribeCollections();
        } else {
          this.currentUser = null;
          this.store.state.currentUserEmail = null;
          this.store.state.isFirebaseConnected = false;
          this.unsubscribeCollections();
        }
        this.store.notify();
      });
    } catch (err) {
      console.warn("Firebase background initialization deferred/offline:", err);
    }
  }

  subscribeCollections() {
    if (!this.fb || !this.currentUser) return;
    this.unsubscribeCollections();

    const db = this.fb.db;

    // 1. Students
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "students"), (snap) => {
        if (!snap.empty) {
          this.store.state.students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.saveState();
        }
      }, err => console.debug("Students snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {}

    // 2. Attendance
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "attendance"), (snap) => {
        snap.docs.forEach(d => {
          const date = d.id;
          const data = d.data();
          if (!this.store.state.attendance[date]) {
            this.store.state.attendance[date] = {};
          }
          this.store.state.attendance[date] = { ...this.store.state.attendance[date], ...data };
        });
        this.store.saveState();
      }, err => console.debug("Attendance snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {}

    // 3. Violations
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "violations"), (snap) => {
        if (!snap.empty) {
          this.store.state.violations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.saveState();
        }
      }, err => console.debug("Violations snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {}

    // 4. Cleanliness
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "cleanliness_inspections"), (snap) => {
        if (!snap.empty) {
          const cleanData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.state.cleanliness = cleanData.sort((a, b) => b.score - a.score);
          this.store.saveState();
        }
      }, err => console.debug("Cleanliness snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {}

    // 5. Activities
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "activities"), (snap) => {
        if (!snap.empty) {
          this.store.state.activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.saveState();
        }
      }, err => console.debug("Activities snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {}

    // 6. Metadata
    try {
      const unsub = this.fb.onSnapshot(this.fb.doc(db, "app_settings", "dormitory_meta"), (snap) => {
        if (snap.exists()) {
          const meta = snap.data();
          if (meta.tea) this.store.state.tea = meta.tea;
          if (meta.roomLeaders) this.store.state.roomLeaders = meta.roomLeaders;
          if (meta.cleanlinessInspectorId) this.store.state.cleanlinessInspectorId = meta.cleanlinessInspectorId;
          this.store.saveState();
        }
      }, err => console.debug("Meta snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {}
  }

  unsubscribeCollections() {
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.unsubscribers = [];
  }

  // --- Write operations ---
  async syncStudent(student, isDelete = false) {
    if (!this.fb || !this.currentUser) return;
    try {
      if (isDelete) {
        await this.fb.deleteDoc(this.fb.doc(this.fb.db, "students", student.id));
      } else {
        await this.fb.setDoc(this.fb.doc(this.fb.db, "students", student.id), {
          ...student,
          updatedAt: this.fb.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.debug("syncStudent info:", e);
    }
  }

  async syncAttendance(date, studentId, status) {
    if (!this.fb || !this.currentUser) return;
    try {
      await this.fb.setDoc(this.fb.doc(this.fb.db, "attendance", date), {
        [studentId]: status,
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.debug("syncAttendance info:", e);
    }
  }

  async syncViolation(violation, isResolve = false) {
    if (!this.fb || !this.currentUser) return;
    try {
      await this.fb.setDoc(this.fb.doc(this.fb.db, "violations", violation.id), {
        ...violation,
        status: isResolve ? "resolved" : (violation.status || "pending"),
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.debug("syncViolation info:", e);
    }
  }

  async syncCleanliness(item) {
    if (!this.fb || !this.currentUser) return;
    try {
      await this.fb.setDoc(this.fb.doc(this.fb.db, "cleanliness_inspections", `room_${item.room}`), {
        ...item,
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.debug("syncCleanliness info:", e);
    }
  }

  async syncActivity(item, isDelete = false) {
    if (!this.fb || !this.currentUser) return;
    try {
      if (isDelete) {
        await this.fb.deleteDoc(this.fb.doc(this.fb.db, "activities", item.id));
      } else {
        await this.fb.setDoc(this.fb.doc(this.fb.db, "activities", item.id), {
          ...item,
          updatedAt: this.fb.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.debug("syncActivity info:", e);
    }
  }

  async syncMeta(metaUpdates) {
    if (!this.fb || !this.currentUser) return;
    try {
      await this.fb.setDoc(this.fb.doc(this.fb.db, "app_settings", "dormitory_meta"), {
        ...metaUpdates,
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.debug("syncMeta info:", e);
    }
  }

  async login(email, password) {
    if (!this.fb) {
      this.fb = await import("./firebase.js");
    }
    return await this.fb.signInWithEmailAndPassword(this.fb.auth, email, password);
  }

  async logout() {
    if (this.fb) {
      return await this.fb.signOut(this.fb.auth);
    }
  }
}

export const syncManager = new SyncManager();
