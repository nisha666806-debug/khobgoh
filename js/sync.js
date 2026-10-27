// Khobgoh Firebase Real-Time Synchronization Service v1.0
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
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

class SyncManager {
  constructor() {
    this.store = null;
    this.unsubscribers = [];
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.isSyncing = false;

    window.addEventListener("online", () => {
      this.isOnline = true;
      if (window.khobgoh?.showToast) window.khobgoh.showToast("Пайвасти интернет барқарор шуд. Синхронизатсия фаъол!", "info");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      if (window.khobgoh?.showToast) window.khobgoh.showToast("Пайвасти интернет қатъ шуд. Реҷаи худкори офлайн.", "info");
    });
  }

  init(store) {
    this.store = store;

    // Listen to Firebase Auth state
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        this.store.state.currentUserEmail = user.email;
        this.store.state.isFirebaseConnected = true;

        // Fetch user profile from Firestore `users/{uid}`
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            this.store.state.profile = data;
            if (data.role) {
              this.store.setRole(data.role);
            }
          }
        } catch (e) {
          console.debug("User doc fetch optional:", e);
        }

        // Start listening to all Firestore collections in real-time
        this.subscribeCollections();
      } else {
        this.currentUser = null;
        this.store.state.currentUserEmail = null;
        this.store.state.isFirebaseConnected = false;
        this.unsubscribeCollections();
      }
      this.store.notify();
    });
  }

  // Subscribe to real-time updates from Firebase
  subscribeCollections() {
    this.unsubscribeCollections();

    // 1. Students real-time snapshot
    try {
      const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
        if (!snap.empty) {
          const remoteStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.state.students = remoteStudents;
          this.store.saveState();
        }
      }, (err) => console.debug("Students sync info:", err));
      this.unsubscribers.push(unsubStudents);
    } catch (e) {
      console.debug("Students sub error:", e);
    }

    // 2. Attendance real-time snapshot
    try {
      const unsubAtt = onSnapshot(collection(db, "attendance"), (snap) => {
        snap.docs.forEach(d => {
          const date = d.id;
          const data = d.data();
          if (!this.store.state.attendance[date]) {
            this.store.state.attendance[date] = {};
          }
          this.store.state.attendance[date] = { ...this.store.state.attendance[date], ...data };
        });
        this.store.saveState();
      }, (err) => console.debug("Attendance sync info:", err));
      this.unsubscribers.push(unsubAtt);
    } catch (e) {
      console.debug("Attendance sub error:", e);
    }

    // 3. Violations real-time snapshot
    try {
      const unsubViolations = onSnapshot(collection(db, "violations"), (snap) => {
        if (!snap.empty) {
          this.store.state.violations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.saveState();
        }
      }, (err) => console.debug("Violations sync info:", err));
      this.unsubscribers.push(unsubViolations);
    } catch (e) {
      console.debug("Violations sub error:", e);
    }

    // 4. Cleanliness real-time snapshot
    try {
      const unsubClean = onSnapshot(collection(db, "cleanliness_inspections"), (snap) => {
        if (!snap.empty) {
          const cleanData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.state.cleanliness = cleanData.sort((a, b) => b.score - a.score);
          this.store.saveState();
        }
      }, (err) => console.debug("Cleanliness sync info:", err));
      this.unsubscribers.push(unsubClean);
    } catch (e) {
      console.debug("Cleanliness sub error:", e);
    }

    // 5. Activities real-time snapshot
    try {
      const unsubAct = onSnapshot(collection(db, "activities"), (snap) => {
        if (!snap.empty) {
          this.store.state.activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.store.saveState();
        }
      }, (err) => console.debug("Activities sync info:", err));
      this.unsubscribers.push(unsubAct);
    } catch (e) {
      console.debug("Activities sub error:", e);
    }

    // 6. App settings (Tea, Roster, Room Leaders)
    try {
      const unsubSettings = onSnapshot(doc(db, "app_settings", "dormitory_meta"), (snap) => {
        if (snap.exists()) {
          const meta = snap.data();
          if (meta.tea) this.store.state.tea = meta.tea;
          if (meta.roomLeaders) this.store.state.roomLeaders = meta.roomLeaders;
          if (meta.cleanlinessInspectorId) this.store.state.cleanlinessInspectorId = meta.cleanlinessInspectorId;
          this.store.saveState();
        }
      }, (err) => console.debug("Settings sync info:", err));
      this.unsubscribers.push(unsubSettings);
    } catch (e) {
      console.debug("Settings sub error:", e);
    }
  }

  unsubscribeCollections() {
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.unsubscribers = [];
  }

  // --- Write Operations that sync to Firebase ---
  async syncStudent(student, isDelete = false) {
    if (!this.currentUser) return;
    try {
      if (isDelete) {
        await deleteDoc(doc(db, "students", student.id));
      } else {
        await setDoc(doc(db, "students", student.id), {
          ...student,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firebase syncStudent error:", e);
    }
  }

  async syncAttendance(date, studentId, status) {
    if (!this.currentUser) return;
    try {
      await setDoc(doc(db, "attendance", date), {
        [studentId]: status,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firebase syncAttendance error:", e);
    }
  }

  async syncViolation(violation, isResolve = false) {
    if (!this.currentUser) return;
    try {
      await setDoc(doc(db, "violations", violation.id), {
        ...violation,
        status: isResolve ? "resolved" : (violation.status || "pending"),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firebase syncViolation error:", e);
    }
  }

  async syncCleanliness(item) {
    if (!this.currentUser) return;
    try {
      await setDoc(doc(db, "cleanliness_inspections", `room_${item.room}`), {
        ...item,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firebase syncCleanliness error:", e);
    }
  }

  async syncActivity(item, isDelete = false) {
    if (!this.currentUser) return;
    try {
      if (isDelete) {
        await deleteDoc(doc(db, "activities", item.id));
      } else {
        await setDoc(doc(db, "activities", item.id), {
          ...item,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firebase syncActivity error:", e);
    }
  }

  async syncMeta(metaUpdates) {
    if (!this.currentUser) return;
    try {
      await setDoc(doc(db, "app_settings", "dormitory_meta"), {
        ...metaUpdates,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firebase syncMeta error:", e);
    }
  }

  // --- Auth methods ---
  async login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async logout() {
    return await signOut(auth);
  }
}

export const syncManager = new SyncManager();
