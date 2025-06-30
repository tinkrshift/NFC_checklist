const STORAGE_KEY = 'nfc_task_data_v2';
const MAX_DAYS = 30;

function loadData() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tasks: ["Brush Teeth", "Stretch", "Journal"],
    history: {}  // format: { "Task Name": ["2025-06-30", "2025-06-28"] }
  };
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function renderTasks() {
  const data = loadData();
  const today = getTodayKey();
  const ul = document.getElementById("task-list");
  ul.innerHTML = "";

  data.tasks.forEach(task => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    const last30 = getLast30Days();
    const completedDates = (data.history[task] || []).filter(date => last30.includes(date));
    const isChecked = completedDates.includes(today);
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;

    checkbox.onchange = () => {
      const taskDates = new Set(data.history[task] || []);
      if (checkbox.checked) taskDates.add(today);
      else taskDates.delete(today);
      data.history[task] = Array.from(taskDates);
      trimHistory(data.history);
      saveData(data);
      renderCompletion();
      if (data.tasks.every(t => (data.history[t] || []).includes(today))) window.close();
    };

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(" " + task));
    ul.appendChild(li);
  });

  renderCompletion();
}

function getLast30Days() {
  const days = [];
  for (let i = 0; i < MAX_DAYS; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function renderCompletion() {
  const data = loadData();
  const recentDays = getLast30Days();
  const taskStats = data.tasks.map(task => {
    const completedDates = (data.history[task] || []).filter(date => recentDays.includes(date));
    return {
      task,
      percent: Math.round((completedDates.length / MAX_DAYS) * 100)
    };
  });

  const summary = taskStats.map(stat => `${stat.task}: ${stat.percent}%`).join('<br>');
  document.getElementById("completion-rate").innerHTML = `Last 30 Days:<br>${summary}`;
}

function toggleEditMode() {
  const edit = document.getElementById("edit-section");
  const button = document.querySelector("button[onclick='toggleEditMode()']");
  const isVisible = edit.style.display !== "none";
  edit.style.display = isVisible ? "none" : "block";
  button.innerText = isVisible ? "Edit Tasks" : "Close Edit";
  if (!isVisible) renderEditList();
}

function renderEditList() {
  const data = loadData();
  const ul = document.getElementById("edit-list");
  ul.innerHTML = "";
  data.tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.innerText = task;
    const btn = document.createElement("button");
    btn.innerText = "🗑️";
    btn.onclick = () => {
      data.tasks.splice(i, 1);
      delete data.history[task];
      saveData(data);
      renderTasks();
      renderEditList();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById("new-task");
  const newTask = input.value.trim();
  if (!newTask) return;
  const data = loadData();
  if (!data.tasks.includes(newTask)) {
    data.tasks.push(newTask);
    data.history[newTask] = [];
    saveData(data);
    renderTasks();
    renderEditList();
  }
  input.value = "";
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
}

function trimHistory(history) {
  const cutoff = getLast30Days();
  for (let task in history) {
    history[task] = history[task].filter(date => cutoff.includes(date));
  }
}

// Initialize
renderTasks();