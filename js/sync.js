// Khobgoh Firebase Real-Time Cloud Synchronization Service v2.0
class SyncManager {
  constructor() {
    this.store = null;
    this.fb = null;
    this.unsubscribers = [];
    this.currentUser = null;
    this.userProfile = null;
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
              this.userProfile = { id: user.uid, ...data };
              this.store.state.profile = this.userProfile;
              if (data.role) {
                this.store.setRole(data.role);
              }
            } else {
              this.userProfile = { id: user.uid, email: user.email, role: this.store.state.activeRole || "manager" };
            }
          } catch (e) {
            console.debug("User doc fetch info:", e);
          }

          this.subscribeCollections();
          if (window.khobgoh?.showToast) {
            window.khobgoh.showToast(`Пайваст бо абр: ${user.email}`, "success");
          }
        } else {
          this.currentUser = null;
          this.userProfile = null;
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

  isElevated() {
    const role = this.userProfile?.role || this.store?.state?.activeRole;
    return role === "manager" || role === "head";
  }

  subscribeCollections() {
    if (!this.fb || !this.currentUser) return;
    this.unsubscribeCollections();

    const db = this.fb.db;
    const elevated = this.isElevated();
    const uid = this.currentUser.uid;

    // 1. Students collection listener
    try {
      const q = elevated
        ? this.fb.collection(db, "students")
        : this.fb.query(this.fb.collection(db, "students"), this.fb.where("supervisorId", "==", uid));

      const unsub = this.fb.onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (elevated) {
            this.store.state.students = remoteList;
          } else {
            // Merge with local state so supervisor sees their own plus cached
            const map = new Map(this.store.state.students.map(s => [s.id, s]));
            remoteList.forEach(s => map.set(s.id, s));
            this.store.state.students = [...map.values()];
          }
          this.store.saveState();
        }
      }, err => console.debug("Students snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {
      console.debug("Students listener init error:", e);
    }

    // 2. Attendance collection listener
    try {
      const q = elevated
        ? this.fb.collection(db, "attendance")
        : this.fb.query(this.fb.collection(db, "attendance"), this.fb.where("supervisorId", "==", uid));

      const unsub = this.fb.onSnapshot(q, (snap) => {
        if (!snap.empty) {
          snap.docs.forEach(d => {
            const data = d.data();
            if (data.date && data.studentId) {
              if (!this.store.state.attendance[data.date]) {
                this.store.state.attendance[data.date] = {};
              }
              this.store.state.attendance[data.date][data.studentId] = data.status || "present";
            } else {
              const date = d.id;
              if (!this.store.state.attendance[date]) {
                this.store.state.attendance[date] = {};
              }
              this.store.state.attendance[date] = { ...this.store.state.attendance[date], ...data };
            }
          });
          this.store.saveState();
        }
      }, err => console.debug("Attendance snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {
      console.debug("Attendance listener init error:", e);
    }

    // 3. Violations collection listener
    try {
      const q = elevated
        ? this.fb.collection(db, "violations")
        : this.fb.query(this.fb.collection(db, "violations"), this.fb.where("supervisorId", "==", uid));

      const unsub = this.fb.onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.state.violations = list;
          this.store.saveState();
        }
      }, err => console.debug("Violations snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {
      console.debug("Violations listener init error:", e);
    }

    // 4. Cleanliness Inspections listener
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "cleanliness_inspections"), (snap) => {
        if (!snap.empty) {
          const cleanData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.state.cleanliness = cleanData.sort((a, b) => b.score - a.score);
          this.store.saveState();
        }
      }, err => console.debug("Cleanliness snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {
      console.debug("Cleanliness listener init error:", e);
    }

    // 5. Activities Matrix listener
    try {
      const unsub = this.fb.onSnapshot(this.fb.collection(db, "activities"), (snap) => {
        if (!snap.empty) {
          this.store.state.activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.saveState();
        }
      }, err => console.debug("Activities snapshot info:", err));
      this.unsubscribers.push(unsub);
    } catch (e) {
      console.debug("Activities listener init error:", e);
    }

    // 6. Metadata (Tea, Room leaders, Inspector)
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
    } catch (e) {
      console.debug("Meta listener init error:", e);
    }

    // 7. Supervisors list (for elevated users)
    if (elevated) {
      try {
        const q = this.fb.query(this.fb.collection(db, "users"), this.fb.where("role", "in", ["supervisor", "head"]));
        const unsub = this.fb.onSnapshot(q, (snap) => {
          if (!snap.empty) {
            this.store.state.supervisors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            this.store.saveState();
          }
        }, err => console.debug("Supervisors snapshot info:", err));
        this.unsubscribers.push(unsub);
      } catch (e) {
        console.debug("Supervisors listener init error:", e);
      }
    }
  }

  unsubscribeCollections() {
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.unsubscribers = [];
  }

  // --- Real-time Write Operations to Firestore ---
  async syncStudent(student, isDelete = false) {
    if (!this.fb || !this.currentUser) return;
    try {
      const ref = this.fb.doc(this.fb.db, "students", student.id);
      if (isDelete) {
        await this.fb.deleteDoc(ref);
      } else {
        await this.fb.setDoc(ref, {
          ...student,
          supervisorId: student.supervisorId || this.currentUser.uid,
          updatedAt: this.fb.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("syncStudent cloud write:", e);
    }
  }

  async syncAttendance(date, studentId, status) {
    if (!this.fb || !this.currentUser) return;
    try {
      const docId = `${date}_${studentId}`;
      await this.fb.setDoc(this.fb.doc(this.fb.db, "attendance", docId), {
        date,
        studentId,
        status,
        supervisorId: this.currentUser.uid,
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("syncAttendance cloud write:", e);
    }
  }

  async syncViolation(violation, isResolve = false) {
    if (!this.fb || !this.currentUser) return;
    try {
      await this.fb.setDoc(this.fb.doc(this.fb.db, "violations", violation.id), {
        ...violation,
        supervisorId: violation.supervisorId || this.currentUser.uid,
        status: isResolve ? "resolved" : (violation.status || "pending"),
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("syncViolation cloud write:", e);
    }
  }

  async syncCleanliness(item) {
    if (!this.fb || !this.currentUser) return;
    try {
      await this.fb.setDoc(this.fb.doc(this.fb.db, "cleanliness_inspections", `room_${item.room}`), {
        ...item,
        supervisorId: this.currentUser.uid,
        updatedAt: this.fb.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("syncCleanliness cloud write:", e);
    }
  }

  async syncActivity(item, isDelete = false) {
    if (!this.fb || !this.currentUser) return;
    try {
      const ref = this.fb.doc(this.fb.db, "activities", item.id);
      if (isDelete) {
        await this.fb.deleteDoc(ref);
      } else {
        await this.fb.setDoc(ref, {
          ...item,
          updatedAt: this.fb.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("syncActivity cloud write:", e);
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
      console.warn("syncMeta cloud write:", e);
    }
  }

  // --- Auth & Supervisor Registration Operations ---
  async login(email, password) {
    if (!this.fb) {
      this.fb = await import("./firebase.js");
    }
    return await this.fb.signInWithEmailAndPassword(this.fb.auth, email, password);
  }

  async registerManager(email, password) {
    if (!this.fb) {
      this.fb = await import("./firebase.js");
    }
    return await this.fb.createUserWithEmailAndPassword(this.fb.auth, email.trim(), password);
  }

  async resetPassword(email) {
    if (!this.fb) {
      this.fb = await import("./firebase.js");
    }
    return await this.fb.sendPasswordResetEmail(this.fb.auth, email.trim());
  }

  async logout() {
    if (this.fb) {
      return await this.fb.signOut(this.fb.auth);
    }
  }

  // Create an invitation for a supervisor (Manager / Head only)
  async createInvitation({ name, email, phone, roomIds }) {
    if (!this.fb || !this.currentUser) throw new Error("Аввал ба система ворид шавед.");
    if (!this.isElevated()) throw new Error("Танҳо роҳбар метавонад даъватнома созад.");

    // Generate random code KHG-XXXXXXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint32Array(8);
    crypto.getRandomValues(bytes);
    let code = "KHG-";
    for (let i = 0; i < 8; i++) code += chars[bytes[i] % chars.length];

    await this.fb.setDoc(this.fb.doc(this.fb.db, "invitations", code), {
      name,
      email: email.trim().toLowerCase(),
      phone,
      roomIds,
      role: "supervisor",
      status: "pending",
      createdBy: this.currentUser.uid,
      createdAt: this.fb.serverTimestamp()
    });

    return code;
  }

  // Register a new supervisor with invite code
  async registerSupervisor({ email, code, password }) {
    if (!this.fb) this.fb = await import("./firebase.js");

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().toUpperCase();

    // 1. Verify invitation in Firestore
    const invRef = this.fb.doc(this.fb.registrationDb, "invitations", cleanCode);
    const invSnap = await this.fb.getDoc(invRef);

    if (!invSnap.exists()) {
      throw new Error("Коди даъват ёфт нашуд ё нодуруст аст.");
    }

    const inv = invSnap.data();
    if (inv.status !== "pending") {
      throw new Error("Ин коди даъват қаблан истифода шудааст.");
    }

    if (String(inv.email).toLowerCase() !== cleanEmail) {
      throw new Error("Email ба ин коди даъват мувофиқат намекунад.");
    }

    // 2. Create user with registrationAuth
    let cred;
    try {
      cred = await this.fb.createUserWithEmailAndPassword(this.fb.registrationAuth, cleanEmail, password);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        cred = await this.fb.signInWithEmailAndPassword(this.fb.registrationAuth, cleanEmail, password);
      } else {
        throw e;
      }
    }

    // 3. Batch write user document and mark invitation used
    const batch = this.fb.writeBatch(this.fb.registrationDb);
    batch.set(this.fb.doc(this.fb.registrationDb, "users", cred.user.uid), {
      name: inv.name,
      email: inv.email,
      phone: inv.phone || "",
      role: inv.role || "supervisor",
      assignedRoomIds: inv.roomIds || [],
      inviteCode: cleanCode,
      createdAt: this.fb.serverTimestamp()
    });

    batch.update(invRef, {
      status: "used",
      uid: cred.user.uid,
      usedAt: this.fb.serverTimestamp()
    });

    await batch.commit();

    // 4. Sign out registration app and sign in main app
    await this.fb.signOut(this.fb.registrationAuth);
    return await this.login(cleanEmail, password);
  }
}

export const syncManager = new SyncManager();
