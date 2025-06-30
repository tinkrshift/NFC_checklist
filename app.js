const STORAGE_KEY = 'nfc_task_data_v5';
const MAX_DAYS = 30;
let currentEditPeriod = getTimePeriod();

function getTimePeriod() {
  const hour = new Date().getHours();
  return hour < 12 ? "AM" : "PM";
}

function loadData() {
  const defaultTasks = {
    AM: ["Brush Teeth", "Take Meds", "Shave"],
    PM: ["Brush Teeth", "Apply Lotion", "Floss"]
  };
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tasks: defaultTasks,
    history: { AM: {}, PM: {} }
  };
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
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

function renderTasks() {
  const timePeriod = getTimePeriod();
  const data = loadData();
  const today = getTodayKey();
  const list = data.tasks[timePeriod] || [];

  if (!data.history[timePeriod][today]) {
    data.history[timePeriod][today] = {};
    list.forEach(t => data.history[timePeriod][today][t] = false);
    trimHistory(data.history[timePeriod]);
    saveData(data);
  }

  const ul = document.getElementById("task-list");
  ul.innerHTML = "";
  list.forEach(task => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data.history[timePeriod][today][task];
    checkbox.onchange = () => {
      data.history[timePeriod][today][task] = checkbox.checked;
      saveData(data);
      renderCompletion();
      if (list.every(t => data.history[timePeriod][today][t])) window.close();
    };
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(" " + task));
    ul.appendChild(li);
  });

  renderCompletion();
}

function renderCompletion() {
  const data = loadData();
  const timePeriod = getTimePeriod();
  const recentDays = getLast30Days();
  const list = data.tasks[timePeriod];

  const taskStats = list.map(task => {
    let count = 0;
    recentDays.forEach(day => {
      if (data.history[timePeriod][day]?.[task]) count++;
    });
    return {
      task,
      percent: Math.round((count / MAX_DAYS) * 100)
    };
  });

  const summary = taskStats.map(stat => `${stat.task}: ${stat.percent}%`).join('<br>');
  document.getElementById("completion-rate").innerHTML =
    `30-day Task Completion (${timePeriod}):<br>${summary}`;
}

function toggleEditMode() {
  const edit = document.getElementById("edit-section");
  const select = document.getElementById("edit-period");
  const button = document.querySelector("button[onclick='toggleEditMode()']");
  const isVisible = edit.style.display !== "none";
  edit.style.display = isVisible ? "none" : "block";
  button.innerText = isVisible ? "Edit Tasks" : "Close Edit";

  if (!isVisible) {
    select.value = currentEditPeriod = getTimePeriod();
    renderEditList();
  }
}

function renderEditList() {
  const data = loadData();
  const ul = document.getElementById("edit-list");
  ul.innerHTML = "";
  (data.tasks[currentEditPeriod] || []).forEach((task, i) => {
    const li = document.createElement("li");
    li.innerText = task;
    const btn = document.createElement("button");
    btn.innerText = "🗑️";
    btn.onclick = () => {
      data.tasks[currentEditPeriod].splice(i, 1);
      deleteFromHistory(data.history[currentEditPeriod], task);
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
  if (!data.tasks[currentEditPeriod].includes(newTask)) {
    data.tasks[currentEditPeriod].push(newTask);
    Object.keys(data.history[currentEditPeriod]).forEach(day => {
      data.history[currentEditPeriod][day][newTask] = false;
    });
    saveData(data);
    renderTasks();
    renderEditList();
  }
  input.value = "";
}

function setEditPeriod(value) {
  currentEditPeriod = value;
  populateTitleInput();
  currentEditPeriod = value;
  renderEditList();
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
}

function deleteFromHistory(historySection, task) {
  for (let day in historySection) {
    delete historySection[day][task];
  }
}

function trimHistory(historySection) {
  const cutoff = getLast30Days();
  for (let day in historySection) {
    if (!cutoff.includes(day)) delete historySection[day];
  }
}

function updateTitle() {
  const input = document.getElementById("list-title");
  const data = loadData();
  if (!data.titles) data.titles = {};
  data.titles[currentEditPeriod] = input.value;
  saveData(data);
  renderTasks();
}

function updateHeaderTitle() {
  const data = loadData();
  const timePeriod = getTimePeriod();
  const title = data.titles?.[timePeriod] || (timePeriod + " Tasks");
  document.getElementById("task-header").innerText = title;
}

function populateTitleInput() {
  const data = loadData();
  const input = document.getElementById("list-title");
  input.value = data.titles?.[currentEditPeriod] || "";
}

// Initialize
renderTasks();
updateHeaderTitle();