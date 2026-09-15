import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Dashboard() {
  const [stats, setStats] = useState({ blogs: 0, jobs: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.health(), api.blogs(), api.jobs(), api.team()])
      .then(([health, blogs, jobs, team]) => {
        setStats({
          blogs: health.blogs ?? blogs.total ?? 0,
          jobs: health.jobs ?? jobs.total ?? 0,
          team: health.team ?? team.count ?? 0,
          published: (blogs.posts || []).filter((p) => p.status === "PUBLISHED").length,
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  const cards = [
    {
      label: "Blog posts",
      value: stats.blogs,
      hint: `${stats.published || 0} published`,
      to: "/blogs",
      tone: "from-teal-50 to-emerald-50 border-teal-100",
    },
    {
      label: "Career openings",
      value: stats.jobs,
      hint: "Jobs on careers page",
      to: "/careers",
      tone: "from-orange-50 to-amber-50 border-orange-100",
    },
    {
      label: "Team members",
      value: stats.team || 0,
      hint: "Shown on /team page",
      to: "/team",
      tone: "from-slate-50 to-teal-50 border-slate-200",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE602F]">Overview</p>
        <h1 className="mt-1 text-3xl font-bold text-[#2E3545]">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          APIs power{" "}
          <a className="font-semibold text-teal-700" href="http://localhost:3000/blog" target="_blank" rel="noreferrer">
            /blog
          </a>
          ,{" "}
          <a className="font-semibold text-teal-700" href="http://localhost:3000/careers" target="_blank" rel="noreferrer">
            /careers
          </a>
          {" "}and{" "}
          <a className="font-semibold text-teal-700" href="http://localhost:3000/team" target="_blank" rel="noreferrer">
            /team
          </a>
          .
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`card border bg-gradient-to-br p-6 ${c.tone}`}>
            <p className="text-sm font-semibold text-slate-500">{c.label}</p>
            <p className="mt-2 text-4xl font-bold text-[#2E3545]">{c.value}</p>
            <p className="mt-1 text-sm text-slate-500">{c.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
