// gui.js
function toggleEdit() {
  const editor = document.getElementById('editorSection');
  editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
  if (editor.style.display === 'block') loadEditor();
}

function loadEditor() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('listKey');
  const data = JSON.parse(localStorage.getItem(key) || "[]");

  const editor = document.getElementById('editor');
  editor.innerHTML = '';

  data.forEach((item, idx) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = item.label;
    input.dataset.index = idx;
    editor.appendChild(input);
    editor.appendChild(document.createElement('br'));
  });
}

function saveChecklist() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('listKey');

  const inputs = document.querySelectorAll('#editor input[type=text]');
  const updated = Array.from(inputs).map(input => ({ label: input.value, checked: false }));

  localStorage.setItem(key, JSON.stringify(updated));
  location.reload();
}
