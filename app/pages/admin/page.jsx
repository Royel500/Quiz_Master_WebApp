// pages/admin/questions.js
'use client'
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    text: "",
    // exactly 4 options
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const r = await fetch("/api/questions");
        if (!r.ok) throw new Error("Failed to load questions");
        const data = await r.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setOption(i, key, val) {
    setForm(f => {
      const options = [...f.options];
      options[i] = { ...options[i], [key]: val };
      return { ...f, options };
    });
  }

  function setText(v) {
    setForm(f => ({ ...f, text: v }));
  }

  function validateForm() {
    setError("");
    if (!form.text.trim()) {
      setError("Question text is required.");
      return false;
    }
    // ensure all 4 option texts are filled
    for (let i = 0; i < 4; i++) {
      if (!form.options[i].text || !form.options[i].text.trim()) {
        setError(`Option ${i + 1} must not be empty.`);
        return false;
      }
    }
    // ensure exactly one correct option
    const correctCount = form.options.filter(o => !!o.isCorrect).length;
    if (correctCount === 0) {
      setError("Please mark exactly one correct option.");
      return false;
    }
    if (correctCount > 1) {
      setError("Only one option can be marked correct.");
      return false;
    }
    return true;
  }

  async function createQ() {
    try {
      setError("");
      if (!validateForm()) return;
      setSaving(true);
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Unknown server error" }));
        throw new Error(body.message || "Failed to create question");
      }
      // reset form to empty 4 options
      setForm({
        text: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]
      });
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // extracted loader so we can call it from createQ/del as well
  async function loadQuestions() {
    try {
      setLoading(true);
      const r = await fetch("/api/questions");
      if (!r.ok) throw new Error("Failed to load questions");
      const data = await r.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this question?")) return;
    try {
      setError("");
      const res = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Unknown server error" }));
        throw new Error(body.message || "Failed to delete");
      }
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Questions</h2>

        <div className="mb-6 p-4 bg-white rounded shadow">
          <h3 className="font-medium mb-2">Add Question (4 options required)</h3>
          {error && <div className="mb-3 text-red-600">{error}</div>}

          <input
            placeholder="Question text"
            value={form.text}
            onChange={e => setText(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          />

          <div className="space-y-3">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-10 text-sm font-medium">{i + 1})</div>
                <input
                  value={opt.text}
                  onChange={e => setOption(i, "text", e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 p-2 border rounded"
                />
                <label className="flex items-center gap-1 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={opt.isCorrect}
                    onChange={e => {
                      // when setting an option to true, ensure others become false
                      const checked = e.target.checked;
                      setForm(f => {
                        const options = f.options.map((o, idx) => {
                          if (idx === i) return { ...o, isCorrect: checked };
                          // if checking this one, uncheck others
                          return checked ? { ...o, isCorrect: false } : o;
                        });
                        return { ...f, options };
                      });
                    }}
                  />
                  correct
                </label>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            {/* No Add/Remove option buttons — exactly 4 required */}
            <button
              onClick={createQ}
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-60"
              disabled={saving}
              type="button"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div>Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="text-sm text-gray-500">No questions yet</div>
          ) : (
            questions.map(q => (
              <div key={q._id} className="p-3 bg-white rounded shadow flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="font-medium">{q.text}</div>
                  <div className="text-sm mt-2 space-y-1">
                    {q.options.map((o, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-8 text-sm">{idx + 1})</div>
                        <div className="flex-1">
                          {o.text}
                          {o.isCorrect ? <span className="ml-2 text-green-600">✓</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button onClick={() => del(q._id)} className="px-2 py-1 border rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
