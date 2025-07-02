let TASKS = ["Grab Keys", "Check Wallet", "Turn Off Lights", "Lock Door"];
let state = {};

function loadState() {
  const saved = JSON.parse(localStorage.getItem("mini_routine_data"));
  if (saved) {
    TASKS = saved.tasks;
    state = saved.state || {};
  }
  TASKS.forEach(task => {
    if (state[task] === undefined) state[task] = false;
  });
  saveState();
}


function saveState() {
  const title = document.querySelector("h2").innerText;
  localStorage.setItem("mini_routine_data", JSON.stringify({ tasks: TASKS, state, title }));

}

function renderTasks() {
  const ul = document.getElementById("task-list");
  ul.innerHTML = "";
  let allDone = true;

  TASKS.forEach(task => {
    const li = document.createElement("li");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = state[task];
    box.onchange = () => {
      state[task] = box.checked;
      saveState();
      renderTasks();
  const saved = JSON.parse(localStorage.getItem("mini_routine_data"));
  if (saved && saved.title) {
    document.querySelector("h2").innerText = saved.title;
    const titleBox = document.getElementById("routine-title");
    if (titleBox) titleBox.value = saved.title;
  }
    };
    if (!state[task]) allDone = false;
    li.appendChild(box);
    li.appendChild(document.createTextNode(task));
    ul.appendChild(li);
  });

  
if (allDone && TASKS.length > 0) {
  TASKS.forEach(task => state[task] = false);
  saveState();
  setTimeout(() => window.close(), 300);
}

}

function resetRoutine() {
  TASKS.forEach(task => state[task] = false);
  saveState();
  renderTasks();
  const saved = JSON.parse(localStorage.getItem("mini_routine_data"));
  if (saved && saved.title) {
    document.querySelector("h2").innerText = saved.title;
    const titleBox = document.getElementById("routine-title");
    if (titleBox) titleBox.value = saved.title;
  }
}

function toggleSettings() {
  const menu = document.getElementById("settings-menu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function toggleEdit() {
  const edit = document.getElementById("edit-section");
  const taskList = document.getElementById("task-list");
  const btn = document.querySelector('#settings-menu button[onclick="toggleEdit()"]');
  const isEditing = edit.style.display === "block";
  edit.style.display = isEditing ? "none" : "block";
  taskList.style.display = isEditing ? "block" : "none";
  if (btn) btn.innerText = isEditing ? "Edit Tasks" : "Close Edit";
  renderEditList();
}

function renderEditList() {
  const list = document.getElementById("edit-list");
  list.innerHTML = "";
  TASKS.forEach((task, i) => {
    const li = document.createElement("li");
    li.innerText = task;
    const btn = document.createElement("button");
    btn.innerText = "🗑️";
    btn.onclick = () => {
      TASKS.splice(i, 1);
      delete state[task];
      saveState();
      renderTasks();
  const saved = JSON.parse(localStorage.getItem("mini_routine_data"));
  if (saved && saved.title) {
    document.querySelector("h2").innerText = saved.title;
    const titleBox = document.getElementById("routine-title");
    if (titleBox) titleBox.value = saved.title;
  }
      renderEditList();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById("new-task");
  const task = input.value.trim();
  if (!task || TASKS.includes(task)) return;
  TASKS.push(task);
  state[task] = false;
  saveState();
  input.value = "";
  renderTasks();
  const saved = JSON.parse(localStorage.getItem("mini_routine_data"));
  if (saved && saved.title) {
    document.querySelector("h2").innerText = saved.title;
    const titleBox = document.getElementById("routine-title");
    if (titleBox) titleBox.value = saved.title;
  }
  renderEditList();
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
}

function exportData() {
  const blob = new Blob([JSON.stringify({ tasks: TASKS, state }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mini_routine.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      TASKS = data.tasks || [];
      state = data.state || {};
      saveState();
      location.reload();
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

window.onload = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
  loadState();
  renderTasks();
  const saved = JSON.parse(localStorage.getItem("mini_routine_data"));
  if (saved && saved.title) {
    document.querySelector("h2").innerText = saved.title;
    const titleBox = document.getElementById("routine-title");
    if (titleBox) titleBox.value = saved.title;
  }
  document.querySelectorAll('#settings-menu button, #settings-menu input[type="file"]').forEach(el => {
    el.addEventListener('click', () => {
      const menu = document.getElementById("settings-menu");
      if (menu) menu.style.display = "none";
    });
  });
};


function showReadme() {
  document.getElementById("readme-modal").style.display = "block";
}
function hideReadme() {
  document.getElementById("readme-modal").style.display = "none";
}


function updateTitle() {
  const titleInput = document.getElementById("routine-title");
  const title = titleInput.value.trim();
  document.querySelector("h2").innerText = title || "Quick Routine";

  const saved = JSON.parse(localStorage.getItem("mini_routine_data")) || {};
  saved.title = title;
  saved.tasks = TASKS;
  saved.state = state;
  localStorage.setItem("mini_routine_data", JSON.stringify(saved));
}
