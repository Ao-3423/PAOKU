// PAOKU — Full Fixed Version app.js
//--------------------------------------
// Storage Keys
//--------------------------------------
const KEY_ENTRIES = "paoku_entries";
const KEY_ACCOUNTS = "paoku_accounts";
const KEY_GOALS = "paoku_goals";

//--------------------------------------
// Initial Load (โหลดใหม่ทุกครั้ง)
//--------------------------------------
let entries = JSON.parse(localStorage.getItem(KEY_ENTRIES) || "[]");
let goals = JSON.parse(localStorage.getItem(KEY_GOALS) || "[]");

//--------------------------------------
// Accounts (โหลดใหม่ทุกครั้ง)
//--------------------------------------
let accounts = [
  { name: "เงินสด", balance: 0, icon: "imgs/cash.png" },
  { name: "TrueMoney Wallet", balance: 0, icon: "imgs/bank-tmw.png" },
  { name: "ไทยพาณิชย์", balance: 0, icon: "imgs/bank-scb.png" },
  { name: "ออมสิน", balance: 0, icon: "imgs/bank-gsb.png" },
  { name: "กรุงไทย", balance: 0, icon: "imgs/bank-ktb.png" },
  { name: "กรุงเทพ", balance: 0, icon: "imgs/bank-bbl.png" },
  { name: "กรุงศรีอยุธยา", balance: 0, icon: "imgs/bank-bay.png" },
  { name: "ไทยเป๋าตัง", balance: 0, icon: "imgs/bank-paotang.png" },
];

let accountsContainer = document.getElementById("accountsList");

accounts.forEach((acc) => {
  let div = document.createElement("div");
  div.className = "account-item";

  let img = document.createElement("img");
  img.src = acc.icon;
  img.alt = acc.name;
  img.width = 32; // ขนาดรูป
  img.height = 32;

  let text = document.createElement("span");
  text.textContent = `${acc.name}: ฿${acc.balance.toLocaleString()}`;

  div.appendChild(img);
  div.appendChild(text);
  accountsContainer.appendChild(div);
});

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
// Utility: showSection
//--------------------------------------
function showSection(section) {
  dashboardSection.classList.add("hidden");
  addSection.classList.add("hidden");
  goalsSection.classList.add("hidden");

  if (section === dashboardSection) dashboardSection.classList.remove("hidden");
  else if (section === addSection) addSection.classList.remove("hidden");
  else if (section === goalsSection) {
    goalsSection.classList.remove("hidden");
    renderGoals();
  }
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
    const amt = Number(e.amount) || 0;
    if (e.type === "income") income += amt;
    else expense += amt;
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
    const amt = Number(e.amount) || 0;
    if (!accounts[e.account]) return;
    if (e.type === "income") accounts[e.account].balance += amt;
    else accounts[e.account].balance -= amt;
  });

  saveAccounts();
  renderAccountList();
}

//--------------------------------------
// Render Entries List
//--------------------------------------
function renderEntries() {
  countEntries.innerText = `${entries.length} รายการ`;

  entriesDiv.innerHTML =
    entries.length === 0
      ? "<p class='muted'>ยังไม่มีรายการ</p>"
      : entries
          .map(
            (e, i) => `
            <div class="entry">
                <div>
                    <div class="${e.type}">${
              e.type === "income" ? "+" : "-"
            } ฿${Number(e.amount || 0).toFixed(2)}</div>
                    <small>${e.category || "-"} • ${e.note || "-"}</small>
                    <div class="entry-actions">
                        <button class="edit" onclick="editEntry(${i})">แก้ไข</button>
                        <button class="delete" onclick="deleteEntry(${i})">ลบ</button>
                    </div>
                </div>
                <div style="text-align:right">
                    <small>${e.date || ""}</small><br>
                    <small>${accounts[e.account]?.name || "?"}</small>
                </div>
            </div>
        `
          )
          .join("");
}

//--------------------------------------
// Form & Edit state
//--------------------------------------
const entryForm = document.getElementById("entryForm");
let editingIndex = null; // null = creating new, number = editing existing

//--------------------------------------
// Add / Edit Entry Handler (เดียวจบ)
//--------------------------------------
function onSubmitEntry(e) {
  e.preventDefault();

  // parse + validate amount
  const rawAmount = amountInput.value;
  const amount = parseFloat(rawAmount);
  if (isNaN(amount)) {
    alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
    return;
  }

  const payload = {
    type: typeInput.value,
    amount: amount,
    category: document.getElementById("category").value || "-",
    account: parseInt(accountSelect.value) || 0,
    note: document.getElementById("note").value || "",
    date:
      document.getElementById("date").value ||
      new Date().toISOString().slice(0, 10),
  };

  if (editingIndex === null) {
    // new entry
    entries.unshift(payload);
  } else {
    // update existing
    entries[editingIndex] = payload;
  }

  saveEntries();
  recalcAccounts();
  updateSummary();
  renderEntries();

  addSection.classList.add("hidden");
  entryForm.reset();
  editingIndex = null;
}

// เชื่อมฟอร์มกับ handler เดียว
entryForm.removeEventListener &&
  entryForm.removeEventListener("submit", onSubmitEntry);
entryForm.addEventListener("submit", onSubmitEntry);

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
  if (!e) return alert("ไม่พบรายการ");

  // แสดง section
  showSection(addSection);

  // เติมค่าในฟอร์ม
  typeInput.value = e.type;
  amountInput.value = Number(e.amount).toFixed(2);
  document.getElementById("category").value = e.category || "";
  accountSelect.value = e.account ?? 0;
  document.getElementById("note").value = e.note || "";
  document.getElementById("date").value = e.date || "";

  // ตั้งสถานะ editing
  editingIndex = index;
}

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
                    <small>เป้าหมาย: ฿${Number(g.target || 0).toFixed(
                      2
                    )}</small>
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
// Navigation (แท็บเดียว) - ใช้ showSection
//--------------------------------------
function navigate(section) {
  if (section === "dashboard") showSection(dashboardSection);
  else if (section === "add") showSection(addSection);
  else if (section === "goals") showSection(goalsSection);
}

// Cancel Add Form
document.getElementById("cancelAdd").onclick = () => {
  addSection.classList.add("hidden");
  editingIndex = null;
  entryForm.reset();
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
