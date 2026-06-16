import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
import WeeklyPlanEditor from "../components/WeeklyPlanEditor";

export default function WeeklySchedulePro() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserSchool() {
      const user = auth.currentUser;

      if (!user) {
        console.error("No user logged in");
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setSchool(data.school); // ← παίρνουμε το school από Firestore
      } else {
        console.error("User document not found");
      }

      setLoading(false);
    }

    loadUserSchool();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!school) return <p>No school found for this user.</p>;

  return (
    <div style={{ padding: 20, marginTop: 100 }}>
      <WeeklyPlanEditor school={school} />
    </div>
  );
}
