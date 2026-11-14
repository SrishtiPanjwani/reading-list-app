const STORAGE_KEY = "little-bookshelf-items";
const form = document.getElementById("book-form");
const titleInput = document.getElementById("book-title");
const statusInput = document.getElementById("book-status");
const message = document.getElementById("form-message");
const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");
const charCount = document.getElementById("char-count");
let books = loadBooks();
let activeFilter = "All";

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
function saveBooks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(books)); }
function normalizedTitle(value) { return value.trim().replace(/\s+/g, " ").toLowerCase(); }

titleInput.addEventListener("input", () => {
  charCount.textContent = titleInput.value.length;
  message.textContent = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim().replace(/\s+/g, " ");
  if (!title) { showMessage("Please enter a book title."); titleInput.focus(); return; }
  if (title.length > 60) { showMessage("Book title must be 60 characters or fewer."); return; }
  if (books.some(book => normalizedTitle(book.title) === normalizedTitle(title))) {
    showMessage("This book is already in your reading list."); return;
  }
  books.unshift({ id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), title, status: statusInput.value });
  saveBooks();
  titleInput.value = "";
  charCount.textContent = "0";
  message.textContent = "";
  activeFilter = "All";
  updateFilterButtons();
  render();
  titleInput.focus();
});
function showMessage(text) { message.textContent = text; }

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateFilterButtons();
    render();
  });
});
function updateFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach(button => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}
function updateStats() {
  document.getElementById("total-count").textContent = books.length;
  document.getElementById("reading-count").textContent = books.filter(b => b.status === "Reading").length;
  document.getElementById("finished-count").textContent = books.filter(b => b.status === "Finished").length;
  document.getElementById("collection-label").textContent = `${books.length} ${books.length === 1 ? "book" : "books"}`;
}
function render() {
  updateStats();
  const visibleBooks = activeFilter === "All" ? books : books.filter(book => book.status === activeFilter);
  bookList.innerHTML = "";
  visibleBooks.forEach(book => {
    const card = document.createElement("article");
    card.className = "book-card";
    const top = document.createElement("div"); top.className = "book-topline";
    const symbol = document.createElement("span"); symbol.className = "book-symbol"; symbol.textContent = "✧";
    top.append(symbol);
    const heading = document.createElement("h3"); heading.textContent = book.title;
    const bottom = document.createElement("div"); bottom.className = "card-bottom";
    const select = document.createElement("select"); select.className = "status-select"; select.setAttribute("aria-label", `Reading status for ${book.title}`);
    ["Want to Read", "Reading", "Finished"].forEach(status => {
      const option = document.createElement("option"); option.value = status; option.textContent = status; select.append(option);
    });
    select.value = book.status;
    select.addEventListener("change", () => { book.status = select.value; saveBooks(); render(); });
    const del = document.createElement("button"); del.className = "delete-btn"; del.type = "button"; del.textContent = "Delete";
    del.setAttribute("aria-label", `Delete ${book.title}`);
    del.addEventListener("click", () => { books = books.filter(item => item.id !== book.id); saveBooks(); render(); });
    bottom.append(select, del);
    card.append(top, heading, bottom);
    bookList.append(card);
  });
  emptyState.classList.toggle("hidden", visibleBooks.length > 0);
  if (books.length === 0) {
    emptyState.querySelector("h3").textContent = "Your reading list is empty.";
    emptyState.querySelector("p").textContent = "Add your first book and let the adventure begin.";
  } else if (visibleBooks.length === 0) {
    emptyState.querySelector("h3").textContent = "No books in this category yet.";
    emptyState.querySelector("p").textContent = "Try another filter or add a new book.";
  }
  document.getElementById("showing-label").textContent = activeFilter === "All" ? "Showing all books" : `Showing: ${activeFilter}`;
}
updateFilterButtons();
render();
