import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import { usePageTopNav } from "../hooks/usePageTopNav";

const PAGE_SIZE = 10;

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
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (pageNum = page, query = searchQ) => {
      setLoading(true);
      setError("");
      try {
        const res = await api.blogs({
          page: pageNum,
          limit: PAGE_SIZE,
          q: query || undefined,
        });
        setPosts(res.posts || []);
        setTotal(res.total || 0);
        setPages(res.pages || 1);
        setPage(res.page || pageNum);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [page, searchQ]
  );

  useEffect(() => {
    load(page, searchQ);
  }, [page, searchQ]);

  function runSearch() {
    setPage(1);
    setSearchQ(q.trim());
  }

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
      await load(editingId ? page : 1, searchQ);
      if (!editingId) setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this blog post?")) return;
    await api.deleteBlog(id);
    const nextTotal = total - 1;
    const nextPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
    const nextPage = Math.min(page, nextPages);
    if (nextPage !== page) setPage(nextPage);
    else await load(nextPage, searchQ);
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const actions = useMemo(
    () => (
      <>
        <div className="relative">
          <input
            className="input max-w-[220px] !rounded-full py-2.5 pr-10 sm:max-w-xs"
            placeholder="Search title / slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <button className="btn-ghost !rounded-full" type="button" onClick={runSearch}>
          Search
        </button>
        <button className="btn-primary !rounded-full" type="button" onClick={openCreate}>
          New post
        </button>
      </>
    ),
    [q]
  );

  usePageTopNav({
    eyebrow: "CMS",
    title: "Blog",
    subtitle: `${total} posts in database`,
    actions,
  });

  return (
    <div className="space-y-6">
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
              {loading && posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    No posts found
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
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
                        <button
                          className="btn-ghost !px-3 !py-1.5 text-xs"
                          type="button"
                          onClick={() => openEdit(p)}
                        >
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E6E1] px-4 py-3">
          <p className="text-sm text-slate-500">
            {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ghost !rounded-full !px-4 !py-2 text-sm disabled:opacity-40"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="min-w-[5.5rem] text-center text-sm font-semibold text-[#2E3545]">
              Page {page} / {pages}
            </span>
            <button
              type="button"
              className="btn-primary !rounded-full !px-4 !py-2 text-sm disabled:opacity-40"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next →
            </button>
          </div>
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
