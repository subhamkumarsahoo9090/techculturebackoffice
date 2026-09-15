import { useEffect, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";

const emptyForm = {
  title: "",
  id: "",
  department: "Engineering",
  location: "India · Hybrid",
  type: "Full-time",
  experience: "",
  stack: "",
  summary: "",
  responsibilities: "",
  requirements: "",
  niceToHave: "",
  active: true,
};

function linesToList(text) {
  return String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.jobs();
    setJobs(res.jobs || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(job) {
    setEditingId(job.id);
    setForm({
      title: job.title || "",
      id: job.id || "",
      department: job.department || "Engineering",
      location: job.location || "",
      type: job.type || "Full-time",
      experience: job.experience || "",
      stack: job.stack || "",
      summary: job.summary || "",
      responsibilities: (job.responsibilities || []).join("\n"),
      requirements: (job.requirements || []).join("\n"),
      niceToHave: (job.niceToHave || []).join("\n"),
      active: job.active !== false,
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        responsibilities: linesToList(form.responsibilities),
        requirements: linesToList(form.requirements),
        niceToHave: linesToList(form.niceToHave),
      };
      if (editingId) await api.updateJob(editingId, payload);
      else await api.createJob(payload);
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this job opening?")) return;
    await api.deleteJob(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE602F]">Hiring</p>
          <h1 className="text-3xl font-bold text-[#2E3545]">Careers</h1>
          <p className="text-sm text-slate-500">{jobs.length} openings · powers /careers page</p>
        </div>
        <button className="btn-primary" type="button" onClick={openCreate}>
          New opening
        </button>
      </div>

      {error && !modalOpen && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-3">
        {jobs.map((job) => (
          <div key={job.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <h3 className="text-lg font-bold text-[#2E3545]">{job.title}</h3>
              <p className="text-sm text-teal-700">{job.stack}</p>
              <p className="mt-1 text-sm text-slate-500">
                {job.department} · {job.experience} · {job.location}
              </p>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{job.summary}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost !px-3 !py-1.5 text-xs" type="button" onClick={() => openEdit(job)}>
                Edit
              </button>
              <button
                className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                type="button"
                onClick={() => onDelete(job.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? "Edit opening" : "New opening"}
        onClose={closeModal}
        wide
      >
        {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          {[
            ["title", "Title"],
            ["id", "ID / slug"],
            ["department", "Department"],
            ["location", "Location"],
            ["type", "Type"],
            ["experience", "Experience"],
            ["stack", "Stack"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
              <input
                className="input"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "title"}
                disabled={key === "id" && !!editingId}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Summary</label>
            <textarea
              className="input min-h-20"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
          {["responsibilities", "requirements", "niceToHave"].map((key) => (
            <div key={key} className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                {key} (one per line)
              </label>
              <textarea
                className="input min-h-24 font-mono text-sm"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active on careers page
          </label>
          <div className="md:col-span-2 flex gap-2 pt-1">
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Update job" : "Create job"}
            </button>
            <button className="btn-ghost" type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
