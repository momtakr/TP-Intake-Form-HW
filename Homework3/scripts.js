/* 
  Program: script.js
  Author: Ivan Zheng
  Version: 1.7
  Date: 11/05/2025
  Description: On-the-fly validation + single smart button (Review → Submit) — no review pane, 2-step confirm
*/

/* ====== Header date ====== */
const dateElement = document.getElementById('datetime');
const today = new Date();
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
if (dateElement) dateElement.textContent = today.toLocaleDateString('en-US', dateOptions);

/* ====== DOB max = today ====== */
const dobField = document.getElementById('dob');
if (dobField) {
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dobField.max = `${yyyy}-${mm}-${dd}`;
}

/* ====== DOM refs ====== */
const form      = document.getElementById('patientForm');
const actionBtn = document.getElementById('actionBtn'); // single Review → Submit button

const firstName = document.getElementById('firstname');
const mi        = document.getElementById('mi');
const lastName  = document.getElementById('lastname');
const ssn       = document.getElementById('ssn');        // stays password/obscured
const email     = document.getElementById('email');
const phone     = document.getElementById('phone');
const address1  = document.getElementById('address1');
const address2  = document.getElementById('address2');
const city      = document.getElementById('city');
const stateSel  = document.getElementById('state');
const zip       = document.getElementById('zip');
const userId    = document.getElementById('userid');
const pw        = document.getElementById('password');
const pw2       = document.getElementById('confirm');

/* ====== Helpers: inline error slots (no layout jump) ====== */
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
  const slot = getErrorSlot(input);
  slot.textContent = msg || '';
  slot.style.display = msg ? 'block' : 'none';
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function clearError(input) { setError(input, ''); }
function isEmpty(v) { return v == null || String(v).trim() === ''; }

/* ====== Normalizers & masks ====== */
// SSN: keep obscured, allow only digits, max 9
if (ssn) {
  ssn.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 9);
  });
}

// Phone: format (###) ###-####
if (phone) {
  phone.addEventListener('input', () => {
    let v = phone.value.replace(/\D/g, '').slice(0, 10);
    let out = '';
    if (v.length > 0) out = '(' + v.slice(0, Math.min(3, v.length));
    if (v.length >= 4) out += ') ' + v.slice(3, Math.min(6, v.length));
    if (v.length >= 7) out += '-' + v.slice(6);
    phone.value = out;
  });
}

// Email: force lowercase
if (email) {
  email.addEventListener('input', () => {
    email.value = email.value.toLowerCase();
  });
}

/* ====== Validators (JS version of all rules) ====== */
function vFirstName() {
  const v = firstName.value.trim();
  const ok = /^[A-Za-z'\-]{1,30}$/.test(v);
  if (!ok) setError(firstName, 'Please enter your first name (letters, apostrophes, dashes).');
  else clearError(firstName);
  return ok;
}

function vMI() {
  const v = mi.value.trim();
  const ok = v === '' || /^[A-Za-z]$/.test(v);
  if (!ok) setError(mi, 'Leave blank or enter 1 letter.');
  else clearError(mi);
  return ok;
}

function vLastName() {
  const v = lastName.value.trim();
  const ok = /^[A-Za-z'\-]{1,30}$/.test(v);
  if (!ok) setError(lastName, 'Please enter your last name (letters, apostrophes, dashes).');
  else clearError(lastName);
  return ok;
}

function vDOB() {
  const v = dobField.value;
  if (isEmpty(v)) { setError(dobField, 'Date of birth is required.'); return false; }
  const d = new Date(v + 'T00:00:00');
  if (isNaN(d))    { setError(dobField, 'Enter a valid date (YYYY-MM-DD).'); return false; }
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const oldest = new Date(today0); oldest.setFullYear(today0.getFullYear() - 120);
  if (d > today0)  { setError(dobField, 'DOB cannot be in the future.'); return false; }
  if (d < oldest)  { setError(dobField, 'DOB cannot be more than 120 years ago.'); return false; }
  clearError(dobField); return true;
}

function vSSN() {
  const raw = ssn.value.replace(/\D/g, '');
  const ok = /^\d{9}$/.test(raw);
  if (!ok) setError(ssn, 'Enter exactly 9 digits.');
  else clearError(ssn);
  return ok;
}

function vEmail() {
  const v = email.value.trim().toLowerCase(); email.value = v;
  const ok = /^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
  if (!ok) setError(email, 'Use a valid email like name@domain.tld.');
  else clearError(email);
  return ok;
}

function vPhone() {
  const v = phone.value;
  const ok = /^\(\d{3}\) \d{3}-\d{4}$/.test(v);
  if (!ok) setError(phone, 'Format must be (123) 456-7890.');
  else clearError(phone);
  return ok;
}

function vAddress1() {
  const v = address1.value.trim();
  const ok = /^.{2,30}$/.test(v);
  if (!ok) setError(address1, '2–30 characters.');
  else clearError(address1);
  return ok;
}

function vAddress2() {
  const v = address2.value.trim();
  const ok = v === '' || /^.{2,30}$/.test(v);
  if (!ok) setError(address2, '2–30 characters or leave blank.');
  else clearError(address2);
  return ok;
}

function vCity() {
  const v = city.value.trim();
  const ok = /^[A-Za-z.\-\s]{2,30}$/.test(v);
  if (!ok) setError(city, '2–30 letters/spaces.');
  else clearError(city);
  return ok;
}

function vState() {
  const ok = stateSel.value !== '';
  if (!ok) setError(stateSel, 'Please select a state.');
  else clearError(stateSel);
  return ok;
}

function vZip() {
  const v = zip.value.trim();
  const ok = /^\d{5}(-\d{4})?$/.test(v); // 5 or ZIP+4
  if (!ok) setError(zip, '5 digits or ZIP+4 (12345 or 12345-6789).');
  else clearError(zip);
  return ok;
}

function vUserId() {
  const v = userId.value.trim();
  const ok = /^[A-Za-z][A-Za-z0-9_-]{4,19}$/.test(v); // 5–20, starts with letter
  if (!ok) setError(userId, 'Start with a letter; 5–20 chars; letters/digits/_/-.');
  else clearError(userId);
  return ok;
}

function vPassword() {
  const v = pw.value;
  const uid = userId.value.trim();
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && (!uid || v !== uid);
  if (!ok) setError(pw, '8+ chars with upper, lower, digit; cannot equal User ID.');
  else clearError(pw);
  return ok;
}

function vPasswordMatch() {
  const ok = pw.value === pw2.value && pw2.value.length > 0;
  if (!ok) setError(pw2, 'Passwords must match.');
  else clearError(pw2);
  return ok;
}

function validateAll() {
  const results = [
    vFirstName(), vMI(), vLastName(), vDOB(), vSSN(), vEmail(), vPhone(),
    vAddress1(), vAddress2(), vCity(), vState(), vZip(),
    vUserId(), vPassword(), vPasswordMatch()
  ];
  return results.every(Boolean);
}

function setActionToReview() {
  if (!actionBtn) return;
  actionBtn.textContent = 'Review';
  actionBtn.type = 'button';           
  actionBtn.dataset.mode = 'review';
  actionBtn.title = 'Check your entries';
}
function setActionToSubmit() {
  if (!actionBtn) return;
  actionBtn.textContent = 'Submit';
  actionBtn.type = 'submit';            
  actionBtn.dataset.mode = 'submit';
  actionBtn.title = 'All checks passed — click again to confirm';
}
setActionToReview();

if (actionBtn && form) {
  const allGood = () => (typeof validateAll === 'function' ? validateAll() : form.checkValidity());

  actionBtn.addEventListener('click', (e) => {
    if (actionBtn.dataset.mode === 'submit') {
      return;
    }
    
    e.preventDefault();

    if (allGood()) {
      setActionToSubmit();             
      actionBtn.focus();               
    } else {
      setActionToReview();
      if (form.reportValidity) form.reportValidity(); 
      const firstInvalid = form.querySelector('[aria-invalid="true"], :invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus({ preventScroll: true });
      }
    }
  });

  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && actionBtn.dataset.mode !== 'submit') {
      e.preventDefault();
    }
  });

  form.addEventListener('input', () => {
    if (actionBtn.dataset.mode === 'submit') setActionToReview();
  });
}

[
  firstName, mi, lastName, dobField, ssn, email, phone,
  address1, address2, city, stateSel, zip,
  userId, pw, pw2
].forEach(el => {
  if (!el) return;
  el.addEventListener('input', () => {
    switch (el) {
      case firstName: vFirstName(); break;
      case mi:        vMI(); break;
      case lastName:  vLastName(); break;
      case dobField:  vDOB(); break;
      case ssn:       vSSN(); break;
      case email:     vEmail(); break;
      case phone:     vPhone(); break;
      case address1:  vAddress1(); break;
      case address2:  vAddress2(); break;
      case city:      vCity(); break;
      case stateSel:  vState(); break;
      case zip:       vZip(); break;
      case userId:    vUserId(); vPassword(); break; 
      case pw:        vPassword(); vPasswordMatch(); break;
      case pw2:       vPasswordMatch(); break;
    }
    if (actionBtn?.dataset.mode === 'submit') setActionToReview();
  });

  el.addEventListener('blur', () => {
    el.dispatchEvent(new Event('input'));
  });
});

if (form) {
  form.addEventListener('submit', (e) => {
    const ok = validateAll();
    if (!ok) {
      e.preventDefault();
      setActionToReview();
      const firstInvalid = form.querySelector('[aria-invalid="true"], :invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus({ preventScroll: true });
      }
    }
  });
}
