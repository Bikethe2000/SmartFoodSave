import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function MealDictionary() {
  const [dictionary, setDictionary] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;

      const [dictRes, tagsRes] = await Promise.all([
        fetch("/api/meals/dictionary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/meals/tags", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDictionary(await dictRes.json());
      setTags(await tagsRes.json());
      setLoading(false);
    }

    load();
  }, []);

  const handleSave = async () => {
    const token = await getToken();
    if (!token) return;

    await fetch("/api/meals/dictionary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dictionary }),
    });

    await fetch("/api/meals/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tags }),
    });
  };

  const addMeal = () => {
    const name = prompt("Meal name (e.g. Pasta Bolognese)");
    if (!name) return;
    setDictionary({ ...dictionary, [name]: [] });
    setTags({ ...tags, [name]: [] });
  };

  if (loading) return <div className="p-4">Loading meals...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Meal Dictionary</h1>
        <button
          onClick={addMeal}
          className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm"
        >
          + Add meal
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(dictionary).map(([meal, keywords]) => (
          <div
            key={meal}
            className="border border-slate-200 rounded-xl p-3 bg-white space-y-2"
          >
            <div className="font-semibold text-slate-800">{meal}</div>

            <div className="text-xs text-slate-500 uppercase">Keywords</div>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm"
              value={keywords.join(", ")}
              onChange={(e) =>
                setDictionary({
                  ...dictionary,
                  [meal]: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />

            <div className="text-xs text-slate-500 uppercase mt-2">Tags</div>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm"
              value={(tags[meal] || []).join(", ")}
              onChange={(e) =>
                setTags({
                  ...tags,
                  [meal]: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold"
      >
        Save dictionary & tags
      </button>
    </div>
  );
}
