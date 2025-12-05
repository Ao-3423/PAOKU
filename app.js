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

// ตรวจสอบโครงสร้าง accounts ว่าตรงตามระบบใหม่หรือไม่
if (
  !Array.isArray(accounts) ||
  !accounts[0] ||
  !accounts[0].hasOwnProperty("name") ||
  !accounts[0].hasOwnProperty("balance")
) {
  accounts = [
    { name: "เงินสด", balance: 0 },
    { name: "เป๋าตัง", balance: 0 },
    { name: "TrueMoney Wallet", balance: 0 },
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
            <button class="btn-mini btn-green" onclick="addMoneyToGoal(${i})">เติม</button>
            <button class="btn-mini btn-yellow" onclick="editGoal(${i})">แก้ไข</button>
            <button class="btn-mini btn-red" onclick="deleteGoal(${i})">ลบ</button>
          </div>
        </div>
      `
    )
    .join("");
}

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

// Popup Input (หลายช่องกรอก)
function showInput(fields, callback) {
  const box = document.getElementById("popupInputBox");
  const container = document.getElementById("popupInputFields");
  const btnOK = document.getElementById("popupInputOK");
  const btnCancel = document.getElementById("popupInputCancel");

  // เคลียร์ของเดิม
  container.innerHTML = "";

  // สร้าง input ตาม fields
  fields.forEach((f) => {
    const div = document.createElement("div");
    div.className = "input-group";
    div.innerHTML = `
      <label>${f.label}</label>
      <input type="text" id="input_${f.id}" placeholder="${
      f.placeholder || ""
    }">
    `;
    container.appendChild(div);
  });

  box.classList.remove("hidden");

  btnOK.onclick = () => {
    const result = {};

    // ดึงค่าทั้งหมดออกมา
    fields.forEach((f) => {
      result[f.id] = document.getElementById("input_" + f.id).value.trim();
    });

    box.classList.add("hidden");
    callback(result);
  };

  btnCancel.onclick = () => {
    box.classList.add("hidden");
    callback(false);
  };
}

function addGoal() {
  showInput(
    [
      { label: "ชื่อเป้าหมาย", id: "name" },
      { label: "จำนวนเงินเป้าหมาย (บาท)", id: "target" },
    ],
    (data) => {
      if (!data) return;

      const name = data.name.trim();
      const target = parseFloat(data.target);

      if (!name) return alert("กรุณากรอกชื่อเป้าหมาย");
      if (isNaN(target) || target <= 0) return alert("จำนวนเงินไม่ถูกต้อง");

      goals.push({ name, target, current: 0 });
      saveGoals();
      renderGoals();
    }
  );
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

  showInput(
    [{ label: `เติมเงินให้ "${goal.name}" จำนวน (บาท):`, id: "amount" }],
    (data) => {
      if (!data) return;

      const amount = parseFloat(data.amount);

      if (isNaN(amount) || amount <= 0) {
        alert("จำนวนเงินไม่ถูกต้อง");
        return;
      }

      goal.current += amount;

      if (goal.current >= goal.target) {
        alert(`🎉 เป้าหมาย "${goal.name}" บรรลุแล้ว!`);
      }

      saveGoals();
      renderGoals();
    }
  );
}

function editGoal(i) {
  const goal = goals[i];

  showMultiInput(
    "แก้ไขข้อมูลเป้าหมาย",
    [
      { label: "ชื่อเป้าหมาย", key: "name", value: goal.name },
      { label: "จำนวนเงินเป้าหมาย (บาท)", key: "target", value: goal.target },
      { label: "ยอดสะสมปัจจุบัน (บาท)", key: "current", value: goal.current },
    ],
    (values) => {
      const newName = values.name.trim();
      const newTarget = parseFloat(values.target);
      const newCurrent = parseFloat(values.current);

      if (!newName) return alert("กรุณาใส่ชื่อเป้าหมาย");
      if (isNaN(newTarget) || newTarget <= 0)
        return alert("จำนวนเงินเป้าหมายไม่ถูกต้อง");
      if (isNaN(newCurrent) || newCurrent < 0)
        return alert("ยอดปัจจุบันไม่ถูกต้อง");

      goal.name = newName;
      goal.target = newTarget;
      goal.current = newCurrent;

      if (goal.current >= goal.target) {
        alert(`🎉 เป้าหมาย "${goal.name}" บรรลุแล้ว!`);
      }

      saveGoals();
      renderGoals();
    }
  );
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
    renderAccountList(); // ⭐ สำคัญ: เพื่อให้ UI อัปเดตทันที
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

function renderEntries() {

  countEntries.innerText = `${entries.length} รายการ`;

  // เรียงใหม่สุดก่อน
  const sorted = [...entries].reverse();

  // แสดงเฉพาะ 5 รายการบนสุดก่อน (แต่ scroll ดูทั้งหมดได้)
  const showList = sorted.slice(0, 5);

  entriesDiv.innerHTML = showList
    .map(
      (e, i) => `
        <div class="entry">
          <div>
            <div class="${e.type}">
              ${e.type === "income" ? "+" : "-"} ฿${formatNumber(e.amount)}
            </div>

            <small>${e.category} • ${e.note || "-"}</small>

            <div class="entry-actions">
              <button class="edit" onclick="editEntry(${entries.length - 1 - i})">แก้ไข</button>
              <button class="delete" onclick="deleteEntry(${entries.length - 1 - i})">ลบ</button>
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

function showMultiInput(title, fields, callback) {
  const box = document.getElementById("popupInputBox");
  const container = document.getElementById("popupInputFields");
  const btnOK = document.getElementById("popupInputOK");
  const btnCancel = document.getElementById("popupInputCancel");

  container.innerHTML = `<h3>${title}</h3>`;

  fields.forEach(f => {
    const div = document.createElement("div");
    div.className = "input-group";
    div.innerHTML = `
      <label>${f.label}</label>
      <input type="text" id="multi_${f.key}" value="${f.value}">
    `;
    container.appendChild(div);
  });

  box.classList.remove("hidden");

  btnOK.onclick = () => {
    const result = {};
    fields.forEach(f => {
      result[f.key] = document.getElementById("multi_" + f.key).value.trim();
    });
    box.classList.add("hidden");
    callback(result);
  };

  btnCancel.onclick = () => {
    box.classList.add("hidden");
    callback(false);
  };
}


