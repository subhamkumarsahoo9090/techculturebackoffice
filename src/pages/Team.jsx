import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { usePageTopNav } from "../hooks/usePageTopNav";

const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:3000";

function resolveImageUrl(url, name = "") {
  if (!url) return "";
  let value = String(url).trim();
  if (value.startsWith("/")) value = `${SITE_URL}${value}`;
  if (value.startsWith("http://res.cloudinary.com")) {
    value = value.replace(/^http:/, "https:");
  }
  if (
    name === "Rahul Goel" &&
    value.includes("res.cloudinary.com") &&
    value.includes("/upload/") &&
    !/\/upload\/[^/]*c_/.test(value)
  ) {
    value = value.replace(
      "/upload/",
      "/upload/c_fill,g_face,h_560,w_420,q_auto/"
    );
  }
  return value;
}

const emptyForm = {
  name: "",
  role: "",
  order: 1,
  isActive: true,
  bio: "",
  linkedIn: "",
  imageUrl: "",
  email: "",
};

export default function Team() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.team();
    setMembers(res.data || []);
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

  function openEdit(member) {
    setEditingId(member.id || member._id);
    setForm({
      name: member.name || "",
      role: member.roleId?.name || member.role || "",
      order: member.order ?? 1,
      isActive: member.isActive !== false,
      bio: member.bio || "",
      linkedIn: member.linkedIn || "",
      imageUrl: member.imageUrl || "",
      email: member.email || "",
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
        order: Number(form.order) || 1,
        roleId: { name: form.role },
      };
      if (editingId) await api.updateTeamMember(editingId, payload);
      else await api.createTeamMember(payload);
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this team member?")) return;
    await api.deleteTeamMember(id);
    await load();
  }

  const actions = useMemo(
    () => (
      <button className="btn-primary !rounded-full" type="button" onClick={openCreate}>
        New member
      </button>
    ),
    []
  );

  usePageTopNav({
    eyebrow: "People",
    title: "Our Team",
    subtitle: `${members.length} members · powers /team page`,
    actions,
  });

  return (
    <div className="space-y-6">
      {error && !modalOpen && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div key={m.id || m._id} className="card overflow-hidden">
            <div className="relative h-52 overflow-hidden bg-slate-100">
              {m.imageUrl ? (
                <img
                  src={resolveImageUrl(m.imageUrl, m.name)}
                  alt={m.name}
                  className={
                    m.name === "Rahul Goel"
                      ? "h-full w-full scale-110 object-cover object-[center_12%]"
                      : "h-full w-full object-cover object-top"
                  }
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">No image</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-[#2E3545]">{m.name}</h3>
                  <p className="text-sm text-teal-700">{m.roleId?.name || m.role}</p>
                  <p className="mt-1 text-xs text-slate-400">Order {m.order}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    m.isActive !== false
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {m.isActive !== false ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-ghost !px-3 !py-1.5 text-xs" type="button" onClick={() => openEdit(m)}>
                  Edit
                </button>
                <button
                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                  type="button"
                  onClick={() => onDelete(m.id || m._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? "Edit member" : "New member"}
        onClose={closeModal}
        wide
      >
        {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          {[
            ["name", "Name"],
            ["role", "Role / designation"],
            ["order", "Display order"],
            ["email", "Email"],
            ["linkedIn", "LinkedIn URL"],
            ["imageUrl", "Image URL"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
              <input
                className="input"
                type={key === "order" ? "number" : "text"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "name"}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Bio</label>
            <textarea
              className="input min-h-24"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <div className="md:col-span-2 flex gap-2 pt-1">
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Update member" : "Create member"}
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
