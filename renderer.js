const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const notesList = document.getElementById("notesList");
const minimizeBtn = document.getElementById("minimizeBtn");
const closeBtn = document.getElementById("closeBtn");
const emptyState = document.getElementById("emptyState");
const notesCount = document.getElementById("notesCount");
const editorTitle = document.getElementById("editorTitle");
const charCount = document.getElementById("charCount");

let editIndex = null;

minimizeBtn.addEventListener("click", () => {
  window.api.minimizeWindow();
});

closeBtn.addEventListener("click", () => {
  window.api.closeWindow();
});

// Formatiere Datum für Notiz
function formatDate(date) {
  const now = new Date();
  const noteDate = new Date(date);
  const diffTime = Math.abs(now - noteDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  
  return noteDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

// Notiz-Element in Sidebar erstellen
function createNoteListItem(note, index) {
  const li = document.createElement("li");
  li.className = "note-item p-5 cursor-pointer hover:bg-gray-50 select-text flex gap-4 items-start border-b border-gray-100 transition-all";
  
  // Icon Container
  const iconDiv = document.createElement("div");
  iconDiv.className = "flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center";
  iconDiv.innerHTML = `<i data-feather="file-text" class="stroke-indigo-600 w-5 h-5"></i>`;
  
  // Content Container
  const contentDiv = document.createElement("div");
  contentDiv.className = "flex-grow min-w-0";
  contentDiv.onclick = () => {
    editIndex = index;
    loadNoteToEditor(note);
    updateUIEditing(true);
  };
  
  // Notiz-Text (erste Zeile als Titel)
  const lines = note.split('\n');
  const title = lines[0] || note;
  const preview = lines.length > 1 ? lines.slice(1).join(' ') : '';
  
  const titleSpan = document.createElement("div");
  titleSpan.className = "font-semibold text-gray-800 truncate mb-1 text-sm";
  titleSpan.textContent = title.length > 40 ? title.slice(0, 37) + "…" : title;
  
  const previewSpan = document.createElement("div");
  previewSpan.className = "text-xs text-gray-500 truncate";
  previewSpan.textContent = preview.length > 60 ? preview.slice(0, 57) + "…" : preview || "Keine weiteren Inhalte";
  
  // Datum
  const dateSpan = document.createElement("div");
  dateSpan.className = "text-xs text-gray-400 mt-2";
  dateSpan.textContent = formatDate(Date.now()); // Du kannst hier echte Timestamps speichern
  
  contentDiv.appendChild(titleSpan);
  contentDiv.appendChild(previewSpan);
  contentDiv.appendChild(dateSpan);
  
  // Lösch-Button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100";
  deleteBtn.title = "Notiz löschen";
  deleteBtn.innerHTML = `<i data-feather="trash-2" class="w-4 h-4"></i>`;
  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    if (confirm("Möchtest du diese Notiz wirklich löschen?")) {
      await window.api.deleteNote(index);
      if (editIndex === index) editIndex = null;
      loadNotes();
      updateUIEditing(false);
      noteInput.value = "";
      updateCharCount();
    }
  };
  
  li.appendChild(iconDiv);
  li.appendChild(contentDiv);
  li.appendChild(deleteBtn);
  
  // Aktive Notiz hervorheben
  if (editIndex === index) {
    li.classList.add("active", "bg-indigo-50");
  }
  
  // Hover-Effekt für Delete-Button
  li.classList.add("group");
  
  return li;
}

function loadNoteToEditor(note) {
  noteInput.value = note;
  updateCharCount();
}

async function loadNotes() {
  const notes = await window.api.loadNotes();
  notesList.innerHTML = "";
  
  // Notizen-Zähler aktualisieren
  notesCount.textContent = `${notes.length} ${notes.length === 1 ? 'Notiz' : 'Notizen'}`;
  
  // Empty State anzeigen/verstecken
  if (notes.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    notes.forEach((note, index) => {
      notesList.appendChild(createNoteListItem(note, index));
    });
  }
  
  // Wenn keine Notiz gerade bearbeitet wird, Editor leeren
  if (editIndex === null) {
    noteInput.value = "";
    updateUIEditing(false);
    updateCharCount();
  }
  
  feather.replace();
}

function updateCharCount() {
  const count = noteInput.value.length;
  charCount.textContent = `${count} Zeichen`;
}

function updateUIEditing(isEditing) {
  if (isEditing) {
    editorTitle.textContent = "Notiz bearbeiten";
    saveBtn.innerHTML = `<i data-feather="save" class="w-5 h-5"></i><span>Änderungen speichern</span>`;
    cancelEditBtn.classList.remove("hidden");
  } else {
    editorTitle.textContent = "Neue Notiz";
    saveBtn.innerHTML = `<i data-feather="save" class="w-5 h-5"></i><span>Speichern</span>`;
    cancelEditBtn.classList.add("hidden");
    editIndex = null;
  }
  feather.replace();
}

saveBtn.addEventListener("click", async () => {
  const text = noteInput.value.trim();
  if (!text) {
    // Sanfte Warnung statt Alert
    noteInput.classList.add("border-red-300", "ring-4", "ring-red-100");
    setTimeout(() => {
      noteInput.classList.remove("border-red-300", "ring-4", "ring-red-100");
    }, 1500);
    noteInput.focus();
    return;
  }
  
  if (editIndex === null) {
    await window.api.saveNote(text);
  } else {
    await window.api.updateNote(editIndex, text);
  }
  
  editIndex = null;
  await loadNotes();
  updateUIEditing(false);
  noteInput.value = "";
  updateCharCount();
});

cancelEditBtn.addEventListener("click", () => {
  editIndex = null;
  noteInput.value = "";
  updateUIEditing(false);
  updateCharCount();
  loadNotes();
});

// Zeichenzähler live updaten
noteInput.addEventListener("input", updateCharCount);

window.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  updateCharCount();
});