<<<<<<< HEAD
// PAOKU — Full Fixed Version app.js
//--------------------------------------
// Storage Keys
//--------------------------------------
const KEY_ENTRIES = "paoku_entries";
const KEY_ACCOUNTS = "paoku_accounts";
const KEY_GOALS = "paoku_goals";

//--------------------------------------
// Initial Load
//--------------------------------------
let entries = JSON.parse(localStorage.getItem(KEY_ENTRIES) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");
let goals = JSON.parse(localStorage.getItem(KEY_GOALS) || "[]");

//--------------------------------------
// Default Accounts (โหลดครั้งแรกเท่านั้น)
//--------------------------------------
if (accounts.length === 0) {
  accounts = [
    { name: "เงินสด", balance: 0 },
    { name: "TrueMoney Wallet", balance: 0 },
    { name: "ไทยพาณิชย์", balance: 0 },
    { name: "ออมสิน", balance: 0 },
    { name: "กรุงไทย", balance: 0 },
    { name: "กรุงเทพ", balance: 0 },
    { name: "กรุงศรีอยุธยา", balance: 0 },
    { name: "ไทยเป๋าตัง", balance: 0 },
  ];
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}

//--------------------------------------
// UI Elements
//--------------------------------------
const bal = document.getElementById("bal");
const incomeBox = document.getElementById("income");
const expenseBox = document.getElementById("expense");
const entriesDiv = document.getElementById("entries");
const countEntries = document.getElementById("countEntries");
const accountSelect = document.getElementById("account");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const goalsList = document.getElementById("goalsList");

// Sections
const dashboardSection = document.getElementById("dashboard");
const addSection = document.getElementById("addSection");
const goalsSection = document.getElementById("goalsSection");

//--------------------------------------
// Save Helpers
//--------------------------------------
function saveEntries() {
  localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
}
function saveAccounts() {
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}
function saveGoals() {
  localStorage.setItem(KEY_GOALS, JSON.stringify(goals));
}

//--------------------------------------
// Render Accounts to Select
//--------------------------------------
function renderAccountSelect() {
  accountSelect.innerHTML = accounts
    .map((a, i) => `<option value="${i}">${a.name}</option>`)
    .join("");
}

//--------------------------------------
// Render Account List Section
//--------------------------------------
function renderAccountList() {
  const box = document.getElementById("accountsList");
  box.innerHTML = accounts
    .map(
      (acc) => `
        <div class="account-item">
          <div>${acc.name}</div>
          <div>฿${acc.balance.toFixed(2)}</div>
        </div>
      `
    )
    .join("");
}

//--------------------------------------
// Calculate Dashboard Summary
//--------------------------------------
function updateSummary() {
  let income = 0;
  let expense = 0;

  entries.forEach((e) => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;
  });

  const balance = income - expense;

  bal.innerText = `฿${balance.toFixed(2)}`;
  incomeBox.innerText = `฿${income.toFixed(2)}`;
  expenseBox.innerText = `฿${expense.toFixed(2)}`;
}

//--------------------------------------
// Recalculate All Accounts
//--------------------------------------
function recalcAccounts() {
  accounts.forEach((a) => {
    a.balance = 0;
  });

  entries.forEach((e) => {
    if (!accounts[e.account]) return;
    if (e.type === "income") accounts[e.account].balance += e.amount;
    else accounts[e.account].balance -= e.amount;
  });

  saveAccounts();
  renderAccountList();
}

//--------------------------------------
// Render Entries List
//--------------------------------------
function renderEntries() {
  countEntries.innerText = `${entries.length} รายการ`;

  entriesDiv.innerHTML = entries
    .map(
      (e, i) => `
            <div class="entry">
                <div>
                    <div class="${e.type}">${
        e.type === "income" ? "+" : "-"
      } ฿${e.amount.toFixed(2)}</div>
                    <small>${e.category} • ${e.note || "-"}</small>
                </div>
                <div style="text-align:right">
                    <small>${e.date}</small><br>
                    <small>${accounts[e.account]?.name || "?"}</small>
                </div>
            </div>
        `
    )
    .join("");
}

//--------------------------------------
// Add Entry
//--------------------------------------
const entryForm = document.getElementById("entryForm");
entryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newEntry = {
    type: typeInput.value,
    amount: parseFloat(amountInput.value),
    category: document.getElementById("category").value,
    account: parseInt(accountSelect.value),
    note: document.getElementById("note").value,
    date:
      document.getElementById("date").value ||
      new Date().toISOString().slice(0, 10),
  };

  entries.unshift(newEntry);
  saveEntries();

  recalcAccounts();
  updateSummary();
  renderEntries();

  addSection.classList.add("hidden");
  entryForm.reset();
});

//--------------------------------------
// Goals Management
//--------------------------------------
function renderGoals() {
  if (goals.length === 0) {
    goalsList.innerHTML = "<p>ยังไม่มีเป้าหมาย</p>";
    return;
  }

  goalsList.innerHTML = goals
    .map(
      (g, i) => `
            <div class="entry">
                <div>
                    <div>${g.name}</div>
                    <small>เป้าหมาย: ฿${g.target.toFixed(2)}</small>
                </div>
                <div>
                    <button class="btn danger" onclick="deleteGoal(${i})">ลบ</button>
                </div>
            </div>
        `
    )
    .join("");
}

function addGoal() {
  const name = prompt("ชื่อเป้าหมาย:");
  if (!name) return;
  const targetStr = prompt("จำนวนเงินเป้าหมาย (บาท):");
  const target = parseFloat(targetStr);
  if (isNaN(target)) return alert("จำนวนเงินไม่ถูกต้อง");

  goals.push({ name, target });
  saveGoals();
  renderGoals();
}

function deleteGoal(i) {
  if (!confirm("ลบเป้าหมายนี้?")) return;
  goals.splice(i, 1);
  saveGoals();
  renderGoals();
}

//--------------------------------------
// Reset All
//--------------------------------------
function resetAll() {
  if (!confirm("แน่ใจว่าจะล้างข้อมูลทั้งหมด?")) return;

  entries = [];
  saveEntries();

  accounts.forEach((a) => (a.balance = 0));
  saveAccounts();

  recalcAccounts();
  updateSummary();
  renderEntries();
}

//--------------------------------------
// Navigation (แท็บเดียว)
//--------------------------------------
function navigate(section) {
  dashboardSection.classList.add("hidden");
  addSection.classList.add("hidden");
  goalsSection.classList.add("hidden");

  if (section === "dashboard") dashboardSection.classList.remove("hidden");
  else if (section === "add") addSection.classList.remove("hidden");
  else if (section === "goals") {
    goalsSection.classList.remove("hidden");
    renderGoals();
  }
}

// Cancel Add Form
document.getElementById("cancelAdd").onclick = () => {
  addSection.classList.add("hidden");
};

// Add Goal Button
document.getElementById("newGoal").onclick = addGoal;

//--------------------------------------
// Initial Render
//--------------------------------------
renderAccountSelect();
recalcAccounts();
updateSummary();
renderEntries();
renderAccountList();
renderGoals();
//--------------------------------------
// Render Entries List (แก้ไข/ลบ)
//--------------------------------------
function renderEntries() {
  countEntries.innerText = `${entries.length} รายการ`;

  entriesDiv.innerHTML = entries
    .map(
      (e, i) => `
            <div class="entry">
                <div>
                    <div class="${e.type}">${
        e.type === "income" ? "+" : "-"
      } ฿${e.amount.toFixed(2)}</div>
                    <small>${e.category} • ${e.note || "-"}</small>
                    <div class="entry-actions">
                        <button class="edit" onclick="editEntry(${i})">แก้ไข</button>
                        <button class="delete" onclick="deleteEntry(${i})">ลบ</button>
                    </div>
                </div>
                <div style="text-align:right">
                    <small>${e.date}</small><br>
                    <small>${accounts[e.account]?.name || "?"}</small>
                </div>
            </div>
        `
    )
    .join("");
}

//--------------------------------------
// Delete Entry
//--------------------------------------
function deleteEntry(index) {
  if (!confirm("ลบรายการนี้?")) return;
  entries.splice(index, 1);
  saveEntries();
  recalcAccounts();
  updateSummary();
  renderEntries();
}

//--------------------------------------
// Edit Entry
//--------------------------------------
function editEntry(index) {
  const e = entries[index];
  showSection(addSection);

  typeInput.value = e.type;
  amountInput.value = e.amount;
  document.getElementById("category").value = e.category;
  accountSelect.value = e.account;
  document.getElementById("note").value = e.note;
  document.getElementById("date").value = e.date;

  // ลบรายการเก่าเมื่อบันทึกใหม่
  entryForm.onsubmit = function (ev) {
    ev.preventDefault();
    const updatedEntry = {
      type: typeInput.value,
      amount: parseFloat(amountInput.value),
      category: document.getElementById("category").value,
      account: parseInt(accountSelect.value),
      note: document.getElementById("note").value,
      date:
        document.getElementById("date").value ||
        new Date().toISOString().slice(0, 10),
    };
    entries[index] = updatedEntry;
    saveEntries();
    recalcAccounts();
    updateSummary();
    renderEntries();
    addSection.classList.add("hidden");
    entryForm.reset();

    // รีเซ็ตฟังก์ชัน submit กลับเป็นเพิ่มรายการ
    entryForm.onsubmit = addEntryHandler;
  };
}

//--------------------------------------
// Add Entry Handler
//--------------------------------------
function addEntryHandler(e) {
  e.preventDefault();

  const newEntry = {
    type: typeInput.value,
    amount: parseFloat(amountInput.value),
    category: document.getElementById("category").value,
    account: parseInt(accountSelect.value),
    note: document.getElementById("note").value,
    date:
      document.getElementById("date").value ||
      new Date().toISOString().slice(0, 10),
  };

  entries.unshift(newEntry);
  saveEntries();

  recalcAccounts();
  updateSummary();
  renderEntries();

  addSection.classList.add("hidden");
  entryForm.reset();
}

// เชื่อมฟอร์มกับ handler ใหม่
entryForm.onsubmit = addEntryHandler;

//--------------------------------------
// Import / Export
//--------------------------------------

// Export Data เป็นไฟล์ JSON
function exportData() {
  const payload = {
    entries,
    accounts,
    goals,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    "paoku_export_" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import Data จากไฟล์ JSON
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (Array.isArray(data.entries)) entries = data.entries;
      if (Array.isArray(data.accounts)) accounts = data.accounts;
      if (Array.isArray(data.goals)) goals = data.goals;

      saveEntries();
      saveAccounts();
      saveGoals();

      recalcAccounts();
      updateSummary();
      renderEntries();
      renderAccountSelect();
      renderAccountList();
      renderGoals();

      alert("Import สำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("ไฟล์ไม่ถูกต้องหรืออ่านไม่ได้");
    }
  };
  reader.readAsText(file);
}
=======
// PAOKU — Full Fixed Version app.js
//--------------------------------------
// Storage Keys
//--------------------------------------
const KEY_ENTRIES = "paoku_entries";
const KEY_ACCOUNTS = "paoku_accounts";
const KEY_GOALS = "paoku_goals";

//--------------------------------------
// Initial Load
//--------------------------------------
let entries = JSON.parse(localStorage.getItem(KEY_ENTRIES) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");
let goals = JSON.parse(localStorage.getItem(KEY_GOALS) || "[]");

//--------------------------------------
// Default Accounts (โหลดครั้งแรกเท่านั้น)
//--------------------------------------
if (accounts.length === 0) {
  accounts = [
    { name: "เงินสด", balance: 0 },
    { name: "TrueMoney Wallet", balance: 0 },
    { name: "ไทยพาณิชย์", balance: 0 },
    { name: "ออมสิน", balance: 0 },
    { name: "กรุงไทย", balance: 0 },
    { name: "กรุงเทพ", balance: 0 },
    { name: "กรุงศรีอยุธยา", balance: 0 },
    { name: "ไทยเป๋าตัง", balance: 0 },
  ];
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}

//--------------------------------------
// UI Elements
//--------------------------------------
const bal = document.getElementById("bal");
const incomeBox = document.getElementById("income");
const expenseBox = document.getElementById("expense");
const entriesDiv = document.getElementById("entries");
const countEntries = document.getElementById("countEntries");
const accountSelect = document.getElementById("account");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const goalsList = document.getElementById("goalsList");

// Sections
const dashboardSection = document.getElementById("dashboard");
const addSection = document.getElementById("addSection");
const goalsSection = document.getElementById("goalsSection");

//--------------------------------------
// Save Helpers
//--------------------------------------
function saveEntries() {
  localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
}
function saveAccounts() {
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}
function saveGoals() {
  localStorage.setItem(KEY_GOALS, JSON.stringify(goals));
}

//--------------------------------------
// Render Accounts to Select
//--------------------------------------
function renderAccountSelect() {
  accountSelect.innerHTML = accounts
    .map((a, i) => `<option value="${i}">${a.name}</option>`)
    .join("");
}

//--------------------------------------
// Render Account List Section
//--------------------------------------
function renderAccountList() {
  const box = document.getElementById("accountsList");
  box.innerHTML = accounts
    .map(
      (acc) => `
        <div class="account-item">
          <div>${acc.name}</div>
          <div>฿${acc.balance.toFixed(2)}</div>
        </div>
      `
    )
    .join("");
}

//--------------------------------------
// Calculate Dashboard Summary
//--------------------------------------
function updateSummary() {
  let income = 0;
  let expense = 0;

  entries.forEach((e) => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;
  });

  const balance = income - expense;

  bal.innerText = `฿${balance.toFixed(2)}`;
  incomeBox.innerText = `฿${income.toFixed(2)}`;
  expenseBox.innerText = `฿${expense.toFixed(2)}`;
}

//--------------------------------------
// Recalculate All Accounts
//--------------------------------------
function recalcAccounts() {
  accounts.forEach((a) => {
    a.balance = 0;
  });

  entries.forEach((e) => {
    if (!accounts[e.account]) return;
    if (e.type === "income") accounts[e.account].balance += e.amount;
    else accounts[e.account].balance -= e.amount;
  });

  saveAccounts();
  renderAccountList();
}

//--------------------------------------
// Render Entries List
//--------------------------------------
function renderEntries() {
  countEntries.innerText = `${entries.length} รายการ`;

  entriesDiv.innerHTML = entries
    .map(
      (e, i) => `
            <div class="entry">
                <div>
                    <div class="${e.type}">${
        e.type === "income" ? "+" : "-"
      } ฿${e.amount.toFixed(2)}</div>
                    <small>${e.category} • ${e.note || "-"}</small>
                </div>
                <div style="text-align:right">
                    <small>${e.date}</small><br>
                    <small>${accounts[e.account]?.name || "?"}</small>
                </div>
            </div>
        `
    )
    .join("");
}

//--------------------------------------
// Add Entry
//--------------------------------------
const entryForm = document.getElementById("entryForm");
entryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newEntry = {
    type: typeInput.value,
    amount: parseFloat(amountInput.value),
    category: document.getElementById("category").value,
    account: parseInt(accountSelect.value),
    note: document.getElementById("note").value,
    date:
      document.getElementById("date").value ||
      new Date().toISOString().slice(0, 10),
  };

  entries.unshift(newEntry);
  saveEntries();

  recalcAccounts();
  updateSummary();
  renderEntries();

  addSection.classList.add("hidden");
  entryForm.reset();
});

//--------------------------------------
// Goals Management
//--------------------------------------
function renderGoals() {
  if (goals.length === 0) {
    goalsList.innerHTML = "<p>ยังไม่มีเป้าหมาย</p>";
    return;
  }

  goalsList.innerHTML = goals
    .map(
      (g, i) => `
            <div class="entry">
                <div>
                    <div>${g.name}</div>
                    <small>เป้าหมาย: ฿${g.target.toFixed(2)}</small>
                </div>
                <div>
                    <button class="btn danger" onclick="deleteGoal(${i})">ลบ</button>
                </div>
            </div>
        `
    )
    .join("");
}

function addGoal() {
  const name = prompt("ชื่อเป้าหมาย:");
  if (!name) return;
  const targetStr = prompt("จำนวนเงินเป้าหมาย (บาท):");
  const target = parseFloat(targetStr);
  if (isNaN(target)) return alert("จำนวนเงินไม่ถูกต้อง");

  goals.push({ name, target });
  saveGoals();
  renderGoals();
}

function deleteGoal(i) {
  if (!confirm("ลบเป้าหมายนี้?")) return;
  goals.splice(i, 1);
  saveGoals();
  renderGoals();
}

//--------------------------------------
// Reset All
//--------------------------------------
function resetAll() {
  if (!confirm("แน่ใจว่าจะล้างข้อมูลทั้งหมด?")) return;

  entries = [];
  saveEntries();

  accounts.forEach((a) => (a.balance = 0));
  saveAccounts();

  recalcAccounts();
  updateSummary();
  renderEntries();
}

//--------------------------------------
// Navigation (แท็บเดียว)
//--------------------------------------
function navigate(section) {
  dashboardSection.classList.add("hidden");
  addSection.classList.add("hidden");
  goalsSection.classList.add("hidden");

  if (section === "dashboard") dashboardSection.classList.remove("hidden");
  else if (section === "add") addSection.classList.remove("hidden");
  else if (section === "goals") {
    goalsSection.classList.remove("hidden");
    renderGoals();
  }
}

// Cancel Add Form
document.getElementById("cancelAdd").onclick = () => {
  addSection.classList.add("hidden");
};

// Add Goal Button
document.getElementById("newGoal").onclick = addGoal;

//--------------------------------------
// Initial Render
//--------------------------------------
renderAccountSelect();
recalcAccounts();
updateSummary();
renderEntries();
renderAccountList();
renderGoals();
//--------------------------------------
// Render Entries List (แก้ไข/ลบ)
//--------------------------------------
function renderEntries() {
  countEntries.innerText = `${entries.length} รายการ`;

  entriesDiv.innerHTML = entries
    .map(
      (e, i) => `
            <div class="entry">
                <div>
                    <div class="${e.type}">${
        e.type === "income" ? "+" : "-"
      } ฿${e.amount.toFixed(2)}</div>
                    <small>${e.category} • ${e.note || "-"}</small>
                    <div class="entry-actions">
                        <button class="edit" onclick="editEntry(${i})">แก้ไข</button>
                        <button class="delete" onclick="deleteEntry(${i})">ลบ</button>
                    </div>
                </div>
                <div style="text-align:right">
                    <small>${e.date}</small><br>
                    <small>${accounts[e.account]?.name || "?"}</small>
                </div>
            </div>
        `
    )
    .join("");
}

//--------------------------------------
// Delete Entry
//--------------------------------------
function deleteEntry(index) {
  if (!confirm("ลบรายการนี้?")) return;
  entries.splice(index, 1);
  saveEntries();
  recalcAccounts();
  updateSummary();
  renderEntries();
}

//--------------------------------------
// Edit Entry
//--------------------------------------
function editEntry(index) {
  const e = entries[index];
  showSection(addSection);

  typeInput.value = e.type;
  amountInput.value = e.amount;
  document.getElementById("category").value = e.category;
  accountSelect.value = e.account;
  document.getElementById("note").value = e.note;
  document.getElementById("date").value = e.date;

  // ลบรายการเก่าเมื่อบันทึกใหม่
  entryForm.onsubmit = function (ev) {
    ev.preventDefault();
    const updatedEntry = {
      type: typeInput.value,
      amount: parseFloat(amountInput.value),
      category: document.getElementById("category").value,
      account: parseInt(accountSelect.value),
      note: document.getElementById("note").value,
      date:
        document.getElementById("date").value ||
        new Date().toISOString().slice(0, 10),
    };
    entries[index] = updatedEntry;
    saveEntries();
    recalcAccounts();
    updateSummary();
    renderEntries();
    addSection.classList.add("hidden");
    entryForm.reset();

    // รีเซ็ตฟังก์ชัน submit กลับเป็นเพิ่มรายการ
    entryForm.onsubmit = addEntryHandler;
  };
}

//--------------------------------------
// Add Entry Handler
//--------------------------------------
function addEntryHandler(e) {
  e.preventDefault();

  const newEntry = {
    type: typeInput.value,
    amount: parseFloat(amountInput.value),
    category: document.getElementById("category").value,
    account: parseInt(accountSelect.value),
    note: document.getElementById("note").value,
    date:
      document.getElementById("date").value ||
      new Date().toISOString().slice(0, 10),
  };

  entries.unshift(newEntry);
  saveEntries();

  recalcAccounts();
  updateSummary();
  renderEntries();

  addSection.classList.add("hidden");
  entryForm.reset();
}

// เชื่อมฟอร์มกับ handler ใหม่
entryForm.onsubmit = addEntryHandler;

//--------------------------------------
// Import / Export
//--------------------------------------

// Export Data เป็นไฟล์ JSON
function exportData() {
  const payload = {
    entries,
    accounts,
    goals,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    "paoku_export_" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import Data จากไฟล์ JSON
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (Array.isArray(data.entries)) entries = data.entries;
      if (Array.isArray(data.accounts)) accounts = data.accounts;
      if (Array.isArray(data.goals)) goals = data.goals;

      saveEntries();
      saveAccounts();
      saveGoals();

      recalcAccounts();
      updateSummary();
      renderEntries();
      renderAccountSelect();
      renderAccountList();
      renderGoals();

      alert("Import สำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("ไฟล์ไม่ถูกต้องหรืออ่านไม่ได้");
    }
  };
  reader.readAsText(file);
}
>>>>>>> 886ed9ef88a5331d3c3a3702c03d1ed51cac03df
