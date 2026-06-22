import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  arrayUnion,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { DEFAULT_CATEGORIES, DEFAULT_MEASURE_TYPES, type AppUser } from "../types";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createHousehold: (name: string) => Promise<string>;
  joinHousehold: (inviteCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const ref = doc(db, "users", firebaseUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUser({ uid: firebaseUser.uid, ...snap.data() } as AppUser);
      }
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  async function signUp(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const newUser: Omit<AppUser, "uid"> = {
      email,
      displayName,
      householdId: null,
      fcmTokens: [],
    };
    await setDoc(doc(db, "users", cred.user.uid), newUser);
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  async function createHousehold(name: string) {
    if (!firebaseUser) throw new Error("Nicht eingeloggt");
    const ref = doc(collection(db, "households"));
    // The household doc must exist before measureTypes are written underneath
    // it, since the security rules for that subcollection call get() on the
    // parent household to check membership.
    await setDoc(ref, {
      name,
      inviteCode: generateInviteCode(),
      memberIds: [firebaseUser.uid],
    });
    const batch = writeBatch(db);
    for (const type of DEFAULT_MEASURE_TYPES) {
      batch.set(doc(collection(db, "households", ref.id, "measureTypes")), type);
    }
    for (const category of DEFAULT_CATEGORIES) {
      batch.set(doc(collection(db, "households", ref.id, "categories")), category);
    }
    batch.update(doc(db, "users", firebaseUser.uid), { householdId: ref.id });
    await batch.commit();
    return ref.id;
  }

  async function joinHousehold(inviteCode: string) {
    if (!firebaseUser) throw new Error("Nicht eingeloggt");
    const q = query(
      collection(db, "households"),
      where("inviteCode", "==", inviteCode.trim().toUpperCase()),
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("Einladungscode nicht gefunden");
    const householdDoc = snap.docs[0];
    await updateDoc(householdDoc.ref, { memberIds: arrayUnion(firebaseUser.uid) });
    await updateDoc(doc(db, "users", firebaseUser.uid), { householdId: householdDoc.id });
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, user, loading, signUp, signIn, signOut, createHousehold, joinHousehold }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
