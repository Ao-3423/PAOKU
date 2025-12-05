// PAOKU — Full Fixed Version app.js
function formatNumber(num) {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Storage Keys
const KEY_ENTRIES = "paoku_entries";
const KEY_ACCOUNTS = "paoku_accounts";
const KEY_GOALS = "paoku_goals";

// Initial Load
let entries = JSON.parse(localStorage.getItem(KEY_ENTRIES) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");
let goals = JSON.parse(localStorage.getItem(KEY_GOALS) || "[]");

// Default Accounts (โหลดครั้งแรกเท่านั้น)
if (accounts.length === 0) {
  accounts = [
    // กระเป๋าเงินสด / E-Wallet
    { name: "เงินสด", balance: 0 },
    { name: "เป๋าตัง", balance: 0 },
    { name: "TrueMoney Wallet", balance: 0 },
    // ธนาคาร
    { name: "กรุงเทพ", balance: 0 },
    { name: "กรุงไทย", balance: 0 },
    { name: "กรุงศรีอยุธยา", balance: 0 },
    { name: "ไทยพาณิชย์", balance: 0 },
    { name: "ออมสิน", balance: 0 },
  ];

  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}

// UI Elements
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

// Save Helpers
function saveEntries() {
  localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
}
function saveAccounts() {
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}
function saveGoals() {
  localStorage.setItem(KEY_GOALS, JSON.stringify(goals));
}

// Render Accounts to Select
function renderAccountSelect() {
  accountSelect.innerHTML = accounts
    .map((a, i) => `<option value="${i}">${a.name}</option>`)
    .join("");
}

// Render Account List Section
function renderAccountList() {
  const box = document.getElementById("accountsList");
  box.innerHTML = accounts
    .map(
      (acc) => `
        <div class="account-item">
          <div>${acc.name}</div>
         <div>฿${formatNumber(acc.balance)}</div>
        </div>
      `
    )
    .join("");
}

// Calculate Dashboard Summary
function updateSummary() {
  let income = 0;
  let expense = 0;

  entries.forEach((e) => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;
  });

  const balance = income - expense;
  bal.innerText = `฿${formatNumber(balance)}`;
  incomeBox.innerText = `฿${formatNumber(income)}`;
  expenseBox.innerText = `฿${formatNumber(expense)}`;
}

// Recalculate All Accounts
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

// Goals Management (with deposit + edit)
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
            <small>เป้าหมาย: ฿${formatNumber(g.target)}</small>
            <small>สะสมแล้ว: ฿${formatNumber(g.current)}</small>
          </div>

          <div>
            <button class="btn btn-green" onclick="addMoneyToGoal(${i})">เติมเงิน</button>
            <button class="btn btn-yellow" onclick="editGoal(${i})">แก้ไข</button>
            <button class="btn btn-red" onclick="deleteGoal(${i})">ลบ</button>
          </div>
        </div>
      `
    )
    .join("");
}
//--------------------------------------
// ระบบ Popup (Confirm + Input)
//--------------------------------------

// Popup Confirm (ตกลง/ยกเลิก)
function showConfirm(message, callback) {
  const box = document.getElementById("popupConfirm");
  const msg = document.getElementById("popupConfirmMessage");
  const btnOK = document.getElementById("popupConfirmOK");
  const btnCancel = document.getElementById("popupConfirmCancel");

  msg.innerText = message;
  box.classList.remove("hidden");

  btnOK.onclick = () => {
    box.classList.add("hidden");
    callback(true);
  };

  btnCancel.onclick = () => {
    box.classList.add("hidden");
    callback(false);
  };
}

// Popup Input (มีช่องให้กรอก)
function showInput(message, callback) {
  const box = document.getElementById("popupInputBox");
  const msg = document.getElementById("popupInputMessage");
  const input = document.getElementById("popupInput");
  const btnOK = document.getElementById("popupInputOK");
  const btnCancel = document.getElementById("popupInputCancel");

  msg.innerText = message;
  input.value = "";
  box.classList.remove("hidden");

  btnOK.onclick = () => {
    const value = input.value.trim();
    box.classList.add("hidden");
    callback(value);
  };

  btnCancel.onclick = () => {
    box.classList.add("hidden");
    callback(false);
  };
}

//--------------------------------------
// ฟังก์ชัน Goals
//--------------------------------------

function addGoal() {
  showInput("ชื่อเป้าหมาย:", (name) => {
    if (!name) return;

    showInput("จำนวนเงินเป้าหมาย (บาท):", (targetStr) => {
      const target = parseFloat(targetStr);
      if (isNaN(target)) return alert("จำนวนเงินไม่ถูกต้อง");

      goals.push({ name, target, current: 0 });
      saveGoals();
      renderGoals();
    });
  });
}

function deleteGoal(i) {
  showConfirm("ต้องการลบเป้าหมายนี้?", (ok) => {
    if (!ok) return;

    goals.splice(i, 1);
    saveGoals();
    renderGoals();
  });
}

function addMoneyToGoal(i) {
  const goal = goals[i];

  showInput(`เติมเงินให้ "${goal.name}" จำนวน (บาท):`, (amountStr) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("จำนวนเงินไม่ถูกต้อง");

    goal.current += amount;

    if (goal.current >= goal.target) {
      alert(`🎉 เป้าหมาย "${goal.name}" บรรลุแล้ว!`);
    }

    saveGoals();
    renderGoals();
  });
}

function editGoal(i) {
  const goal = goals[i];

  showInput("แก้ไขชื่อเป้าหมาย:", (newName) => {
    if (!newName) return;

    showInput("แก้ไขจำนวนเงินเป้าหมาย (บาท):", (newTargetStr) => {
      const newTarget = parseFloat(newTargetStr);
      if (isNaN(newTarget)) return alert("จำนวนเงินไม่ถูกต้อง");

      showInput("แก้ไขยอดสะสมปัจจุบัน (บาท):", (newCurrentStr) => {
        const newCurrent = parseFloat(newCurrentStr);
        if (isNaN(newCurrent) || newCurrent < 0)
          return alert("จำนวนเงินไม่ถูกต้อง");

        goal.name = newName;
        goal.target = newTarget;
        goal.current = newCurrent;

        if (goal.current >= goal.target) {
          alert(`🎉 เป้าหมาย "${goal.name}" บรรลุแล้ว!`);
        }

        saveGoals();
        renderGoals();
      });
    });
  });
}

// Reset All
function resetAll() {
  showConfirm("แน่ใจว่าจะล้างข้อมูลทั้งหมด?", () => {
    entries = [];
    saveEntries();

    accounts.forEach((a) => (a.balance = 0));
    saveAccounts();

    recalcAccounts();
    updateSummary();
    renderEntries();
  });
}

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

function showSection(section) {
  dashboardSection.classList.add("hidden");
  addSection.classList.add("hidden");
  goalsSection.classList.add("hidden");

  section.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (section === addSection) {
    setTimeout(() => amountInput.focus(), 120);
  }
}

// Cancel Add Form
document.getElementById("cancelAdd").onclick = () => {
  addSection.classList.add("hidden");
};

// Add Goal Button
document.getElementById("newGoal").onclick = addGoal;

// Initial Render
renderAccountSelect();
recalcAccounts();
updateSummary();
renderEntries();
renderAccountList();
renderGoals();

// Render Entries List (แก้ไข/ลบ)
function renderEntries() {
  countEntries.innerText = `${entries.length} รายการ`;

  entriesDiv.innerHTML = entries
    .map(
      (e, i) => `
            <div class="entry">
                <div>
 <div class="${e.type}">
  ${e.type === "income" ? "+" : "-"} ฿${formatNumber(e.amount)}
</div>

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

// Delete Entry
function deleteEntry(index) {
  showConfirm("ลบรายการนี้?", () => {
    entries.splice(index, 1);
    saveEntries();

    recalcAccounts();
    updateSummary();
    renderEntries();
  });
}

// Edit Entry
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
      amount: parseFloat(amountInput.value) || 0,
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

// Add Entry Handler
function addEntryHandler(e) {
  e.preventDefault();

  const newEntry = {
    type: typeInput.value,
    amount: parseFloat(amountInput.value) || 0,
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

// Import / Export
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
function showConfirm(message, onOK) {
  const popup = document.getElementById("popupConfirm");
  const msg = document.getElementById("popupConfirmMessage");
  const btnOK = document.getElementById("popupConfirmOK");
  const btnCancel = document.getElementById("popupConfirmCancel");

  msg.innerText = message;
  popup.classList.remove("hidden");

  btnOK.onclick = () => {
    popup.classList.add("hidden");
    if (typeof onOK === "function") onOK();
  };

  btnCancel.onclick = () => {
    popup.classList.add("hidden");
  };
}
function showInputPopup(message, callback) {
  const popup = document.getElementById("popupInputBox");
  const msg = document.getElementById("popupInputMessage");
  const input = document.getElementById("popupInput");
  const btnOK = document.getElementById("popupInputOK");
  const btnCancel = document.getElementById("popupInputCancel");

  msg.innerText = message;
  input.value = "";
  popup.classList.remove("hidden");

  btnOK.onclick = () => {
    popup.classList.add("hidden");
    callback(input.value);
  };

  btnCancel.onclick = () => {
    popup.classList.add("hidden");
    callback(null);
  };
}
