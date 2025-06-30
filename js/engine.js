// engine.js
window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('listKey');
  const data = JSON.parse(localStorage.getItem(key) || "[]");

  const container = document.getElementById('checklistContainer');
  const title = document.getElementById('checklistTitle');
  title.textContent = key;

  data.forEach((item, idx) => {
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `item-${idx}`;
    input.checked = item.checked || false;
    const label = document.createElement('label');
    label.textContent = item.label;
    div.appendChild(input);
    div.appendChild(label);
    container.appendChild(div);
  });

  document.getElementById('nfcLink').textContent = window.location.href.split('?')[0];
};

function copyLink() {
  const text = document.getElementById('nfcLink').textContent;
  navigator.clipboard.writeText(text);
}
