import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Todo = {
  id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useMemo(
    () => ({
      async list(): Promise<Todo[]> {
        const res = await fetch(`${API_BASE}/todos`);
        if (!res.ok) throw new Error("Failed to fetch todos");
        return res.json();
      },
      async create(data: {
        title: string;
        description?: string;
      }): Promise<Todo> {
        const res = await fetch(`${API_BASE}/todos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, is_completed: false }),
        });
        if (!res.ok) throw new Error("Failed to create todo");
        return res.json();
      },
      async toggle(id: number, is_completed: boolean): Promise<Todo> {
        const res = await fetch(`${API_BASE}/todos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_completed }),
        });
        if (!res.ok) throw new Error("Failed to update todo");
        return res.json();
      },
      async remove(id: number): Promise<void> {
        const res = await fetch(`${API_BASE}/todos/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete todo");
      },
    }),
    []
  );

  useEffect(() => {
    setLoading(true);
    api
      .list()
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const created = await api.create({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTodos((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Error adding todo");
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      const updated = await api.toggle(todo.id, !todo.is_completed);
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e: any) {
      setError(e.message ?? "Error updating todo");
    }
  }

  async function handleDelete(id: number) {
    const prev = todos;
    setTodos((t) => t.filter((x) => x.id !== id));
    try {
      await api.remove(id);
    } catch (e: any) {
      setTodos(prev);
      setError(e.message ?? "Error deleting todo");
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h1>Todo App</h1>
      <form
        onSubmit={handleAdd}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Todo</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
          {todos.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <input
                type="checkbox"
                checked={t.is_completed}
                onChange={() => handleToggle(t)}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    textDecoration: t.is_completed ? "line-through" : "none",
                    fontWeight: 600,
                  }}
                >
                  {t.title}
                </div>
                {t.description && (
                  <div style={{ color: "#666", fontSize: 14 }}>
                    {t.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                aria-label={`Delete ${t.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
