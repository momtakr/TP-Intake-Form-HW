/* 
  Program: scripts.js HW4
  Author: Ivan Zheng
  Version: 1.7
  Date: 12/02/2025
*/

const dateElement = document.getElementById('datetime');
const today = new Date();
if (dateElement) {
  dateElement.textContent = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

const form = document.getElementById('patientForm');
const actionBtn = document.getElementById('actionBtn');
const fullReset = document.getElementById('fullReset');

const firstName = document.getElementById('firstname');
const mi = document.getElementById('mi');
const lastName = document.getElementById('lastname');
const dobField = document.getElementById('dob');
const ssn = document.getElementById('ssn');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const address1 = document.getElementById('address1');
const address2 = document.getElementById('address2');
const city = document.getElementById('city');
const stateSel = document.getElementById('state');
const zip = document.getElementById('zip');
const health = document.getElementById('health');
const historyContainer = document.getElementById('historyContainer');

const userId = document.getElementById('userid');
const pw = document.getElementById('password');
const pw2 = document.getElementById('confirm');

const modal = document.getElementById("welcomeModal");
const backdrop = document.getElementById("modalBackdrop");
const modalMsg = document.getElementById("modalMessage");
const modalOK = document.getElementById("modalOK");
const modalNotMeArea = document.getElementById("modalNotMe");
const modalNotMeBtn = document.getElementById("modalNotMeBtn");

const rememberMe = document.getElementById("rememberMe");

if (dobField) {
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dobField.max = `${yyyy}-${mm}-${dd}`;
}

function setCookie(name, value, hours) {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const parts = document.cookie.split(';');
  for (let c of parts) {
    c = c.trim();
    if (c.startsWith(nameEQ)) return c.substring(nameEQ.length);
  }
  return "";
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

function saveLocal(key, value) { localStorage.setItem(key, value); }
function getLocal(key) { return localStorage.getItem(key); }
function removeAllLocal() { localStorage.clear(); }

function showModal(msg, showNotMe = false) {
  modalMsg.textContent = msg;
  modalNotMeArea.style.display = showNotMe ? "block" : "none";
  modal.style.display = "block";
  backdrop.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  backdrop.style.display = "none";
}

modalOK.addEventListener("click", closeModal);

let cookieFirstName = getCookie("fname");

function runWelcomeModal() {
  if (cookieFirstName) showModal(`Welcome back, ${cookieFirstName}`, true);
  else showModal("Welcome new user", false);
}

runWelcomeModal();

modalNotMeBtn.addEventListener("click", () => {
  deleteCookie("fname");
  removeAllLocal();
  form.reset();
  cookieFirstName = "";
  closeModal();
  showModal("Starting as new user");
});

async function loadStates() {
  try {
    const resp = await fetch("states.txt");
    const text = await resp.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    stateSel.innerHTML = `<option value="">-Select State-</option>`;
    for (let line of lines) {
      const [code, name] = line.split("|");
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = name;
      stateSel.appendChild(opt);
    }
  } catch {}
}

async function loadHistory() {
  try {
    const resp = await fetch("history.json");
    const arr = await resp.json();
    historyContainer.innerHTML = "";
    for (let item of arr) {
      const lbl = document.createElement("label");
      lbl.innerHTML = `<input type="checkbox" name="history" value="${item}"> ${item}`;
      historyContainer.appendChild(lbl);
    }
  } catch {}
}

loadStates();
loadHistory();

function getErrorSlot(input) {
  let slot =
    input.nextElementSibling &&
    (input.nextElementSibling.classList?.contains('error-msg')
    || input.nextElementSibling.classList?.contains('err'))
      ? input.nextElementSibling
      : null;

  if (!slot) {
    slot = document.createElement('div');
    slot.className = 'error-msg';
    slot.style.minHeight = '1.2em';
    slot.style.color = '#b00020';
    input.insertAdjacentElement('afterend', slot);
  }
  return slot;
}

function setError(input, msg) {
  const s = getErrorSlot(input);
  s.textContent = msg || "";
  s.style.display = msg ? "block" : "none";
  input.setAttribute("aria-invalid", msg ? "true" : "false");
}

function clearError(input) { setError(input, ""); }
function isEmpty(v) { return v == null || v.trim() === ""; }

function vFirstName() { const ok = /^[A-Za-z'\-]{1,30}$/.test(firstName.value.trim()); ok ? clearError(firstName) : setError(firstName, "Invalid"); return ok; }
function vMI() { const v = mi.value.trim(); const ok = v === "" || /^[A-Za-z]$/.test(v); ok ? clearError(mi) : setError(mi, "Invalid"); return ok; }
function vLastName() { const ok = /^[A-Za-z'\-]{1,30}$/.test(lastName.value.trim()); ok ? clearError(lastName) : setError(lastName, "Invalid"); return ok; }
function vDOB() {
  const v = dobField.value;
  if (isEmpty(v)) { setError(dobField, "Required"); return false; }
  const d = new Date(v + "T00:00:00");
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const oldest = new Date(today0); oldest.setFullYear(oldest.getFullYear() - 120);
  if (d > today0 || d < oldest) { setError(dobField, "Invalid"); return false; }
  clearError(dobField); return true;
}
function vSSN() { const ok = /^\d{9}$/.test(ssn.value.replace(/\D/g,"")); ok ? clearError(ssn) : setError(ssn,"Invalid"); return ok; }
function vEmail() { const v = email.value.trim().toLowerCase(); email.value = v; const ok = /^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v); ok ? clearError(email) : setError(email,"Invalid"); return ok; }
function vPhone() { const ok = /^\(\d{3}\) \d{3}-\d{4}$/.test(phone.value); ok ? clearError(phone) : setError(phone,"Invalid"); return ok; }
function vAddress1() { const v = address1.value.trim(); const ok = v.length>=2 && v.length<=30; ok ? clearError(address1) : setError(address1,"Invalid"); return ok; }
function vAddress2() { const v = address2.value.trim(); const ok = v==="" || (v.length>=2 && v.length<=30); ok ? clearError(address2) : setError(address2,"Invalid"); return ok; }
function vCity() { const ok = /^[A-Za-z.\-\s]{2,30}$/.test(city.value.trim()); ok?clearError(city):setError(city,"Invalid"); return ok; }
function vState() { const ok = stateSel.value !== ""; ok?clearError(stateSel):setError(stateSel,"Required"); return ok; }
function vZip() { const ok = /^\d{5}(-\d{4})?$/.test(zip.value.trim()); ok?clearError(zip):setError(zip,"Invalid"); return ok; }
function vUserId() { const ok = /^[A-Za-z][A-Za-z0-9_-]{4,19}$/.test(userId.value.trim()); ok?clearError(userId):setError(userId,"Invalid"); return ok; }
function vPassword() {
  const v = pw.value;
  const ok = v.length>=8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v);
  ok?clearError(pw):setError(pw,"Invalid");
  return ok;
}
function vPasswordMatch() { const ok = pw.value === pw2.value && pw2.value !== ""; ok?clearError(pw2):setError(pw2,"Mismatch"); return ok; }

function validateAll() {
  return [
    vFirstName(), vMI(), vLastName(), vDOB(), vSSN(), vEmail(), vPhone(),
    vAddress1(), vAddress2(), vCity(), vState(), vZip(),
    vUserId(), vPassword(), vPasswordMatch()
  ].every(Boolean);
}

if (ssn) {
  ssn.addEventListener('input', () => {
    ssn.value = ssn.value.replace(/\D/g,"").slice(0,9);
  });
}

if (phone) {
  phone.addEventListener('input', () => {
    let v = phone.value.replace(/\D/g,"").slice(0,10);
    let out = "";
    if (v.length>0) out = "(" + v.slice(0,3);
    if (v.length>=4) out += ") " + v.slice(3,6);
    if (v.length>=7) out += "-" + v.slice(6);
    phone.value = out;
  });
}

if (email) {
  email.addEventListener('input', () => {
    email.value = email.value.toLowerCase();
  });
}

const localFields = [
  firstName, mi, lastName, dobField, email, phone,
  address1, address2, city, stateSel, zip,
  userId
];

localFields.forEach(el => {
  el.addEventListener('input', () => {
    if (!rememberMe.checked) return;
    saveLocal(el.id, el.value);
  });
});

historyContainer.addEventListener('change', () => {
  if (!rememberMe.checked) return;
  const vals = [...document.querySelectorAll('input[name="history"]:checked')].map(x => x.value);
  saveLocal("history", JSON.stringify(vals));
});

health.addEventListener('input', () => {
  if (rememberMe.checked) saveLocal("health", health.value);
});

function repopulateLocal() {
  if (!cookieFirstName) return;

  localFields.forEach(el => {
    const stored = getLocal(el.id);
    if (stored !== null) el.value = stored;
  });

  const hist = getLocal("history");
  if (hist) {
    const arr = JSON.parse(hist);
    document.querySelectorAll('input[name="history"]').forEach(cb => {
      cb.checked = arr.includes(cb.value);
    });
  }

  const h = getLocal("health");
  if (h) {
    health.value = h;
    document.getElementById("healthValue").textContent = h;
  }
}

setTimeout(repopulateLocal, 600);

function setActionToReview() {
  actionBtn.textContent = "Review";
  actionBtn.type = "button";
  actionBtn.dataset.mode = "review";
}

function setActionToSubmit() {
  actionBtn.textContent = "Submit";
  actionBtn.type = "submit";
  actionBtn.dataset.mode = "submit";
}

setActionToReview();

actionBtn.addEventListener('click', (e) => {
  if (actionBtn.dataset.mode === "submit") return;

  e.preventDefault();
  if (validateAll()) {
    setActionToSubmit();
    actionBtn.focus();
  } else {
    setActionToReview();
    if (form.reportValidity) form.reportValidity();
    const firstInvalid = form.querySelector('[aria-invalid="true"], :invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus({ preventScroll: true });
    }
  }
});

form.addEventListener('keydown', e => {
  if (e.key === "Enter" && actionBtn.dataset.mode !== "submit") {
    e.preventDefault();
  }
});

form.addEventListener('input', () => {
  if (actionBtn.dataset.mode === "submit") setActionToReview();
});

form.addEventListener('submit', (e) => {
  if (!validateAll()) {
    e.preventDefault();
    setActionToReview();
    return;
  }

  if (rememberMe.checked) {
    const fn = firstName.value.trim();
    if (fn) setCookie("fname", fn, 48);
  } else {
    deleteCookie("fname");
    removeAllLocal();
  }
});

fullReset.addEventListener('click', () => {
  if (!rememberMe.checked) {
    deleteCookie("fname");
    removeAllLocal();
  }
  cookieFirstName = getCookie("fname");
});
