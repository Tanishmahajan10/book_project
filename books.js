
/*
  Change API_BASE if your FastAPI server runs on another address.
  These endpoint paths match the routes from the beginner SQLAlchemy project:
  GET/POST /books, PUT /books/updated/{id}, DELETE /books/deleted/{id}.
*/
const API_BASE = "http://127.0.0.1:8000";
const ROUTES = { list: "/books", create: "/books", update: id => `/books/${id}`, remove: id => `/books/${id}` };
let books = [];
let editingId = null;
const $ = id => document.getElementById(id);
const statusEl = $("status");
function setStatus(message, type="") { statusEl.textContent = message; statusEl.className = "status " + type; }
function valueOf(book, key) { return book[key] ?? book[key.toLowerCase()] ?? ""; }
function normalizeBook(book) {
  return {id: book.id, title: book.title ?? "", author: book.author ?? "", description: book.description ?? "", rating: Number(book.rating ?? 0), published_year: Number(book.published_year ?? book.publishedYear ?? 0)};
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
async function api(path, options={}) {
  const response = await fetch(API_BASE + path, { ...options, headers: { "Content-Type":"application/json", ...(options.headers || {}) } });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const detail = data && typeof data === "object" ? (data.detail || data.message) : data;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${response.status})`);
  }
  return data;
}
function fillYearFilter() {
  const select = $("yearFilter"), current = select.value;
  const years = [...new Set(books.map(b => b.published_year).filter(Boolean))].sort((a,b)=>b-a);
  select.innerHTML = '<option value="">All years</option>' + years.map(y=>`<option value="${y}">${y}</option>`).join("");
  select.value = years.includes(Number(current)) ? current : "";
}
function renderBooks() {
  const search = $("search").value.trim().toLowerCase();
  const rating = $("ratingFilter").value;
  const year = $("yearFilter").value;
  const filtered = books.filter(b =>
    (`${b.title} ${b.author}`.toLowerCase().includes(search)) &&
    (!rating || b.rating === Number(rating)) &&
    (!year || b.published_year === Number(year))
  );
  $("count").textContent = `(${filtered.length})`;
  $("showing").textContent = `Showing ${filtered.length} of ${books.length} books`;
  const body = $("booksBody");
  if (!filtered.length) { body.innerHTML = '<tr><td colspan="7" class="empty">No books match your filters.</td></tr>'; return; }
  body.innerHTML = filtered.map(b => `<tr>
    <td>${escapeHtml(b.id)}</td><td><strong>${escapeHtml(b.title)}</strong></td><td>${escapeHtml(b.author)}</td>
    <td>${escapeHtml(b.description)}</td><td class="rating-cell"><span class="stars">${"★".repeat(Math.max(0,Math.min(5,b.rating)))}${"☆".repeat(Math.max(0,5-b.rating))}</span> <span style="margin-left:5px">${escapeHtml(b.rating)}</span></td>
    <td>${escapeHtml(b.published_year)}</td><td><div class="actions"><button class="btn primary" data-edit="${escapeHtml(b.id)}">Edit</button><button class="btn danger" data-delete="${escapeHtml(b.id)}">Delete</button></div></td>
  </tr>`).join("");
}
async function loadBooks() {
  $("booksBody").innerHTML = '<tr><td colspan="7" class="empty">Loading books…</td></tr>';
  try {
    const data = await api(ROUTES.list);
    if (!Array.isArray(data)) throw new Error("GET /books did not return a JSON list. Check your API response.");
    books = data.map(normalizeBook);
    fillYearFilter(); renderBooks();
    setStatus("Connected to FastAPI. Your table is loaded from the database.", "ok");
  } catch (error) {
    $("booksBody").innerHTML = '<tr><td colspan="7" class="empty">Could not load books. Start your FastAPI server and check the API/CORS setup.</td></tr>';
    $("showing").textContent = "API connection failed";
    setStatus(error.message + " — " + API_BASE, "error");
  }
}
function openModal(book=null) {
  editingId = book ? book.id : null;
  $("modalTitle").textContent = book ? `Edit Book #${book.id}` : "Add New Book";
  $("saveBtn").textContent = book ? "Save Changes" : "Save Book";
  $("bookForm").reset(); $("formStatus").textContent = "";
  if (book) {
    $("title").value = book.title; $("author").value = book.author; $("description").value = book.description;
    $("rating").value = String(book.rating); $("published_year").value = book.published_year;
  }
  $("modalBackdrop").classList.add("open"); $("title").focus();
}
function closeModal() { $("modalBackdrop").classList.remove("open"); editingId = null; }
$("addBtn").addEventListener("click",()=>openModal());
$("closeModal").addEventListener("click",closeModal); $("cancelBtn").addEventListener("click",closeModal);
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
$("search").addEventListener("input",renderBooks);
$("ratingFilter").addEventListener("change",renderBooks); $("yearFilter").addEventListener("change",renderBooks);
$("clearFilters").addEventListener("click",()=>{$("search").value="";$("ratingFilter").value="";$("yearFilter").value="";renderBooks();});
$("refreshBtn").addEventListener("click",loadBooks);
$("booksBody").addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit]"), del=e.target.closest("[data-delete]");
  if(edit){const book=books.find(b=>String(b.id)===edit.dataset.edit);if(book)openModal(book);}
  if(del){
    const id=del.dataset.delete, book=books.find(b=>String(b.id)===id);
    if(!confirm(`Delete "${book?.title || "this book"}" (ID ${id})?`))return;
    try{await api(ROUTES.remove(id),{method:"DELETE"});setStatus("Book deleted successfully.","ok");await loadBooks();}
    catch(error){setStatus("Could not delete book: "+error.message,"error");}
  }
});
$("bookForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const payload={title:$("title").value.trim(),author:$("author").value.trim(),description:$("description").value.trim(),rating:Number($("rating").value),published_year:Number($("published_year").value)};
  if(!payload.rating){$("formStatus").textContent="Please select a rating.";return;}
  $("saveBtn").disabled=true;$("saveBtn").textContent="Saving…";$("formStatus").textContent="";
  try{
    if(editingId!==null) await api(ROUTES.update(editingId),{method:"PUT",body:JSON.stringify(payload)});
    else await api(ROUTES.create,{method:"POST",body:JSON.stringify(payload)});
    closeModal();setStatus(editingId!==null?"Book updated successfully.":"Book created successfully.","ok");await loadBooks();
  }catch(error){$("formStatus").textContent=error.message;$("formStatus").className="status error";}
  finally{$("saveBtn").disabled=false;$("saveBtn").textContent=editingId!==null?"Save Changes":"Save Book";}
});
loadBooks();
