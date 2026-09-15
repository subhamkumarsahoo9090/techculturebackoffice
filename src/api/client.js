const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

function authHeaders() {
  const token = localStorage.getItem("tc_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request("/api/auth/me"),
  blogs: (params = "") => request(`/api/blogs${params}`),
  getBlog: (id) => request(`/api/blogs/${id}`),
  createBlog: (body) =>
    request("/api/blogs", { method: "POST", body: JSON.stringify(body) }),
  updateBlog: (id, body) =>
    request(`/api/blogs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBlog: (id) => request(`/api/blogs/${id}`, { method: "DELETE" }),
  jobs: () => request("/api/careers"),
  getJob: (id) => request(`/api/careers/${id}`),
  createJob: (body) =>
    request("/api/careers", { method: "POST", body: JSON.stringify(body) }),
  updateJob: (id, body) =>
    request(`/api/careers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteJob: (id) => request(`/api/careers/${id}`, { method: "DELETE" }),
  team: () => request("/api/team"),
  createTeamMember: (body) =>
    request("/api/team", { method: "POST", body: JSON.stringify(body) }),
  updateTeamMember: (id, body) =>
    request(`/api/team/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteTeamMember: (id) => request(`/api/team/${id}`, { method: "DELETE" }),
  health: () => request("/api/health"),
};

export { API_BASE };
