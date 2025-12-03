/* 
  Program: scripts.js HW4
  Author: Ivan Zheng
  Version: 1.7
  Date: 12/2025
*/

/* =========================================================
   BASICS: date in header
========================================================= */
const dateElement = document.getElementById('datetime');
const today = new Date();
if (dateElement) {
  dateElement.textContent = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* =========================================================
   DOM REFERENCES
========================================================= */
const form       = document.getElementById('patientForm');
const actionBtn  = document.getElementById('actionBtn');
const fullReset  = document.getElementById('fullReset');

const firstName  = document.getElementById('firstname');
const mi         = document.getElementById('mi');
const lastName   = document.getElementById('lastname');
const dobField   = document.getElementById('dob');
const ssn        = document.getElementById('ssn');
const email      = document.getElementById('email');
const phone      = document.getElementById('phone');
const address1   = document.getElementById('address1');
const address2   = document.getElementById('address2');
const city       = document.getElementById('city');
const stateSel   = document.getElementById('state');
const zip        = document.getElementById('zip');
const health     = document.getElementById('health');
const historyContainer = document.getElementById('historyContainer');

const userId     = document.getElementById('userid');
const pw         = document.getElementById('password');
const pw2        = document.getElementById('confirm');

const welcomeBanner   = document.getElementById('welcomeBanner');
const notMeContainer  = document.getElementById('notMeContainer');
const cookieNameSpan  = document.getElementById('cookieName');
const notMeBtn        = document.getElementById('notMeBtn');
const rememberMe      = document.getElementById('rememberMe');

/* =========================================================
   DOB max = today
========================================================= */
if (dobField) {
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dobField.max = `${yyyy}-${mm}-${dd}`;
}

/* =========================================================
   COOKIE FUNCTIONS
========================================================= */
function setCookie(name, value, hours) {
  const d = new Date();
  d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
  const cname = name + "=";
  const parts = document.cookie.split(';');
  for (let c of parts) {
    c = c.trim();
    if (c.startsWith(cname)) return c.substring(cname.length);
  }
  return "";
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */
function saveLocal(key, value) {
  localStorage.setItem(key, value);
}

function getLocal(key) {
  return localStorage.getItem(key);
}

function removeAllLocal() {
  localStorage.clear();
}

/* =========================================================
   COOKIE BOOTSTRAP (welcome logic)
========================================================= */
let cookieFirstName = getCookie("fname");

function applyCookieState() {
  if (cookieFirstName) {
    welcomeBanner.textContent = `Welcome back, ${cookieFirstName}`;
    cookieNameSpan.textContent = cookieFirstName;
    notMeContainer.style.display = "block";
  } else {
    welcomeBanner.textContent = "Welcome new user";
    notMeContainer.style.display = "none";
  }
}

applyCookieState();

/* "Not me?" handler */
if (notMeBtn) {
  notMeBtn.addEventListener('click', () => {
    deleteCookie("fname");
    removeAllLocal();
    form.reset();
    cookieFirstName = "";
    applyCookieState();
  });
}

/* =========================================================
   REMEMBER ME LOGIC
========================================================= */
function handleRememberMeOnSubmit() {
  if (!rememberMe || !rememberMe.checked) {
    deleteCookie("fname");
    removeAllLocal();
    return;
  }
  const fn = firstName.value.trim();
  if (fn) setCookie("fname", fn, 48);
}

/* =========================================================
   FETCH API: Load states + history list
========================================================= */
async function loadStates() {
  try {
    const resp = await fetch("states.txt");
    const text = await resp.text();
    const lines = text.split("\n").map(x => x.trim()).filter(Boolean);

    stateSel.innerHTML = `<option value="">-Select State-</option>`;
    lines.forEach(line => {
      const [code, full] = line.split("|");
      if (code && full) {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = full;
        stateSel.appendChild(opt);
      }
    });
  } catch (err) {
    console.error("Error loading states:", err);
  }
}

async function loadHistory() {
  try {
    const resp = await fetch("history.json");
    const arr = await resp.json();
    historyContainer.innerHTML = "";
    arr.forEach(item => {
      const lbl = document.createElement("label");
      lbl.innerHTML = `<input type="checkbox" name="history" value="${item}"> ${item}`;
      historyContainer.appendChild(lbl);
    });
  } catch (err) {
    console.error("Error loading history:", err);
  }
}

loadStates();
loadHistory();

/* =========================================================
   INLINE ERROR SLOTS
========================================================= */
function getErrorSlot(input) {
  let slot =
    input.nextElementSibling &&
    (input.nextElementSibling.classList?.contains('error-msg') ||
     input.nextElementSibling.classList?.contains('err'))
      ? input.nextElementSibling
      : null;

  if (!slot) {
    slot = document.createElement('div');
    slot.className = 'error-msg';
    slot.style.minHeight = '1.2em';
    slot.style.color = '#b00020';
    slot.style.display = 'block';
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
function isEmpty(v) { return v == null || String(v).trim() === ""; }

/* =========================================================
   VALIDATORS (kept same rules)
========================================================= */
function vFirstName() {
  const v = firstName.value.trim();
  const ok = /^[A-Za-z'\-]{1,30}$/.test(v);
  if (!ok) setError(firstName, "Please enter a valid first name.");
  else clearError(firstName);
  return ok;
}
function vMI() {
  const v = mi.value.trim();
  const ok = v === "" || /^[A-Za-z]$/.test(v);
  if (!ok) setError(mi, "One letter or blank.");
  else clearError(mi);
  return ok;
}
function vLastName() {
  const v = lastName.value.trim();
  const ok = /^[A-Za-z'\-]{1,30}$/.test(v);
  if (!ok) setError(lastName, "Please enter a valid last name.");
  else clearError(lastName);
  return ok;
}
function vDOB() {
  const v = dobField.value;
  if (isEmpty(v)) { setError(dobField, "Required."); return false; }
  const d = new Date(v + "T00:00:00");
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const oldest = new Date(today0); oldest.setFullYear(oldest.getFullYear() - 120);
  if (d > today0) { setError(dobField, "DOB cannot be in the future."); return false; }
  if (d < oldest) { setError(dobField, "DOB too old."); return false; }
  clearError(dobField); return true;
}
function vSSN() {
  const raw = ssn.value.replace(/\D/g,"");
  const ok = /^\d{9}$/.test(raw);
  if (!ok) setError(ssn,"Enter 9 digits.");
  else clearError(ssn);
  return ok;
}
function vEmail() {
  const v = email.value.trim().toLowerCase();
  email.value = v;
  const ok = /^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
  if (!ok) setError(email,"Invalid email.");
  else clearError(email);
  return ok;
}
function vPhone() {
  const v = phone.value;
  const ok = /^\(\d{3}\) \d{3}-\d{4}$/.test(v);
  if (!ok) setError(phone,"Format (123) 456-7890");
  else clearError(phone);
  return ok;
}
function vAddress1() {
  const v = address1.value.trim();
  if (v.length < 2 || v.length > 30) { setError(address1,"2–30 chars."); return false; }
  clearError(address1); return true;
}
function vAddress2() {
  const v = address2.value.trim();
  if (v !== "" && (v.length < 2 || v.length > 30)) {
    setError(address2,"2–30 chars or blank.");
    return false;
  }
  clearError(address2); return true;
}
function vCity() {
  const v = city.value.trim();
  const ok = /^[A-Za-z.\-\s]{2,30}$/.test(v);
  if (!ok) setError(city,"2–30 letters/spaces.");
  else clearError(city);
  return ok;
}
function vState() {
  const ok = stateSel.value !== "";
  if (!ok) setError(stateSel,"Select a state.");
  else clearError(stateSel);
  return ok;
}
function vZip() {
  const v = zip.value.trim();
  const ok = /^\d{5}(-\d{4})?$/.test(v);
  if (!ok) setError(zip,"ZIP or ZIP+4.");
  else clearError(zip);
  return ok;
}
function vUserId() {
  const v = userId.value.trim();
  const ok = /^[A-Za-z][A-Za-z0-9_-]{4,19}$/.test(v);
  if (!ok) setError(userId,"Start with letter; 5–20 chars.");
  else clearError(userId);
  return ok;
}
function vPassword() {
  const v = pw.value;
  const ok = v.length >= 8 && /[A-Z]/.test(v)
    && /[a-z]/.test(v) && /\d/.test(v);
  if (!ok) setError(pw,"Password must be 8+, upper, lower, digit.");
  else clearError(pw);
  return ok;
}
function vPasswordMatch() {
  const ok = pw.value === pw2.value && pw2.value !== "";
  if (!ok) setError(pw2,"Passwords must match.");
  else clearError(pw2);
  return ok;
}

/* =========================================================
   VALIDATE ALL
========================================================= */
function validateAll() {
  const arr = [
    vFirstName(), vMI(), vLastName(), vDOB(), vSSN(), vEmail(), vPhone(),
    vAddress1(), vAddress2(), vCity(), vState(), vZip(),
    vUserId(), vPassword(), vPasswordMatch()
  ];
  return arr.every(Boolean);
}

/* =========================================================
   PHONE + SSN FORMATTING
========================================================= */
if (ssn) {
  ssn.addEventListener('input', () => {
    ssn.value = ssn.value.replace(/\D/g,"").slice(0,9);
  });
}
if (phone) {
  phone.addEventListener('input', () => {
    let v = phone.value.replace(/\D/g,"").slice(0,10);
    let out = "";
    if (v.length > 0) out = "(" + v.slice(0,3);
    if (v.length >= 4) out += ") " + v.slice(3,6);
    if (v.length >= 7) out += "-" + v.slice(6);
    phone.value = out;
  });
}
if (email) {
  email.addEventListener('input', () => {
    email.value = email.value.toLowerCase();
  });
}

/* =========================================================
   LOCAL STORAGE: AUTO-SAVE ON INPUT
========================================================= */
const localFields = [
  firstName, mi, lastName, dobField, email, phone,
  address1, address2, city, stateSel, zip,
  userId
];

localFields.forEach(el => {
  el.addEventListener('input', () => {
    if (!rememberMe.checked) return;    // do not save if not remembering
    saveLocal(el.id, el.value);
  });
});

/* Save checkboxes */
historyContainer.addEventListener('change', () => {
  if (!rememberMe.checked) return;
  const vals = [...document.querySelectorAll('input[name="history"]:checked')]
    .map(x => x.value);
  saveLocal("history", JSON.stringify(vals));
});

/* RANGE */
health.addEventListener('input', () => {
  if (rememberMe.checked) saveLocal("health", health.value);
});

/* =========================================================
   RESTORE LOCALSTORAGE IF COOKIE MATCHES
========================================================= */
function repopulateLocal() {
  if (!cookieFirstName) return; // only restore for known user

  localFields.forEach(el => {
    const stored = getLocal(el.id);
    if (stored !== null) el.value = stored;
  });

  /* History */
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

/* After fetch loads history + states, repopulate */
setTimeout(repopulateLocal, 600);

/* =========================================================
   REVIEW → SUBMIT BUTTON LOGIC
========================================================= */
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

/* Disable Enter from auto-submitting at Review stage */
form.addEventListener('keydown', e => {
  if (e.key === "Enter" && actionBtn.dataset.mode !== "submit") {
    e.preventDefault();
  }
});

/* Revert submit → review on any change */
form.addEventListener('input', () => {
  if (actionBtn.dataset.mode === "submit") setActionToReview();
});

/* =========================================================
   FORM SUBMIT
========================================================= */
form.addEventListener('submit', (e) => {
  if (!validateAll()) {
    e.preventDefault();
    setActionToReview();
    return;
  }

  handleRememberMeOnSubmit();
});

/* =========================================================
   RESET BUTTON: ALSO CLEAR COOKIES/LOCAL IF REMEMBER NOT CHECKED
========================================================= */
fullReset.addEventListener('click', () => {
  if (!rememberMe.checked) {
    deleteCookie("fname");
    removeAllLocal();
  }
  cookieFirstName = getCookie("fname");
  applyCookieState();
});
