const STORAGE_KEY = "taskpetal:v1";
const DEFAULT_CATEGORIES = [
  { id: "personal", name: "Personal", color: "#f3afcb" },
  { id: "study", name: "Study", color: "#cdbcf4" },
  { id: "projects", name: "Projects", color: "#9d8ad6" },
  { id: "other", name: "Other", color: "#f0d48a" },
];
const SAMPLE_TASKS = [
  {
    title: "Finish Hacktoberfest challenge",
    categoryId: "projects",
    completed: false,
    daysFromToday: 0,
  },
  {
    title: "Read a book for 30 minutes",
    categoryId: "personal",
    completed: true,
    daysFromToday: -1,
  },
  {
    title: "Study DSA",
    categoryId: "study",
    completed: false,
    daysFromToday: 1,
  },
  {
    title: "Workout",
    categoryId: "personal",
    completed: true,
    daysFromToday: -2,
  },
  {
    title: "Build something cool",
    categoryId: "projects",
    completed: false,
    daysFromToday: 2,
  },
  {
    title: "Organize my workspace",
    categoryId: "other",
    completed: false,
    daysFromToday: 3,
  },
];
const els = {
  greeting: document.getElementById("greeting"),
  todayDate: document.getElementById("today-date"),
  taskForm: document.getElementById("task-form"),
  title: document.getElementById("task-title"),
  category: document.getElementById("task-category"),
  categoryDot: document.getElementById("category-dot"),
  dueDate: document.getElementById("task-date"),
  list: document.getElementById("task-list"),
  empty: document.getElementById("empty-state"),
  sidebarCats: document.getElementById("sidebar-categories"),
  railCats: document.getElementById("rail-categories"),
  modal: document.getElementById("category-modal"),
  categoryName: document.getElementById("category-name"),
  themeToggle: document.getElementById("theme-toggle"),
  progressFill: document.querySelector(".progress-fill"),
  progressBar: document.querySelector(".progress-track"),
};
const state = {
  tasks: [],
  categories: [],
  filter: "all",
  categoryFilter: null,
  theme: "dark",
};
function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Dreamer";
  if (hour < 18) return "Good afternoon, Dreamer";
  return "Good evening, Dreamer";
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    const categories = Array.isArray(parsed.categories)
      ? parsed.categories.filter((c) => c && c.id && c.name)
      : DEFAULT_CATEGORIES;
    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.filter((t) => t && typeof t.title === "string")
      : [];
    state.categories = categories.length
      ? categories
      : DEFAULT_CATEGORIES.slice();
    state.tasks = tasks.map((t) => ({
      id: t.id || uid(),
      title: String(t.title).slice(0, 120),
      categoryId: t.categoryId || "other",
      completed: Boolean(t.completed),
      dueDate: t.dueDate || isoDate(),
    }));
    state.theme = parsed.theme === "light" ? "light" : "dark";
  } catch {
    seed();
  }
}
function seed() {
  state.categories = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  state.tasks = SAMPLE_TASKS.map((t) => ({
    id: uid(),
    title: t.title,
    categoryId: t.categoryId,
    completed: t.completed,
    dueDate: isoDate(t.daysFromToday),
  }));
  persist();
}
function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: state.tasks,
        categories: state.categories,
        theme: state.theme,
      }),
    );
  } catch {
    /* storage might be blocked */
  }
}
function counts() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, percent };
}
function categoryById(id) {
  return state.categories.find((c) => c.id === id) || state.categories[0];
}
function visibleTasks() {
  return state.tasks.filter((task) => {
    if (state.filter === "pending" && task.completed) return false;
    if (state.filter === "completed" && !task.completed) return false;
    if (state.categoryFilter && task.categoryId !== state.categoryFilter)
      return false;
    return true;
  });
}
function setText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
}
