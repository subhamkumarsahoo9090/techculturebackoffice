import { useEffect, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";

const emptyForm = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  heroImage: "",
  tags: "",
  vertical: "all",
  status: "DRAFT",
  readMinutes: 5,
  author: "TechCulture AI",
};

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.blogs(q ? `?q=${encodeURIComponent(q)}` : "");
    setPosts(res.posts || []);
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

  function openEdit(post) {
    setEditingId(post.id || post.slug);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      subtitle: post.subtitle || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      heroImage: post.heroImage || "",
      tags: (post.tags || []).join(", "),
      vertical: post.vertical || "all",
      status: post.status || "DRAFT",
      readMinutes: post.readMinutes || 5,
      author: post.author || "TechCulture AI",
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
        readMinutes: Number(form.readMinutes) || 5,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editingId) await api.updateBlog(editingId, payload);
      else await api.createBlog(payload);
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this blog post?")) return;
    await api.deleteBlog(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE602F]">CMS</p>
          <h1 className="text-3xl font-bold text-[#2E3545]">Blog</h1>
          <p className="text-sm text-slate-500">{posts.length} posts in database</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="input max-w-xs"
            placeholder="Search title / slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn-ghost" type="button" onClick={() => load().catch((e) => setError(e.message))}>
            Search
          </button>
          <button className="btn-primary" type="button" onClick={openCreate}>
            New post
          </button>
        </div>
      </div>

      {error && !modalOpen && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f0fdfa] text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Vertical</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id || p.slug} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#2E3545]">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.vertical}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-ghost !px-3 !py-1.5 text-xs" type="button" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button
                        className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                        type="button"
                        onClick={() => onDelete(p.id || p.slug)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? "Edit post" : "New post"}
        onClose={closeModal}
        wide
      >
        {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          {[
            ["title", "Title"],
            ["slug", "Slug"],
            ["subtitle", "Subtitle"],
            ["heroImage", "Hero image URL"],
            ["author", "Author"],
            ["tags", "Tags (comma separated)"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
              <input
                className="input"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "title"}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Vertical</label>
            <select
              className="input"
              value={form.vertical}
              onChange={(e) => setForm({ ...form, vertical: e.target.value })}
            >
              <option value="all">all</option>
              <option value="brokers">brokers</option>
              <option value="mfd">mfd</option>
              <option value="nbfc">nbfc</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Excerpt</label>
            <textarea
              className="input min-h-20"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Content (markdown)</label>
            <textarea
              className="input min-h-40 font-mono text-sm"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex gap-2 pt-1">
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Update post" : "Create post"}
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
