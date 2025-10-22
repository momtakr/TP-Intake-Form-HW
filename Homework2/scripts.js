/* 
  Program: script.js
  Author: Ivan Zheng
  Version: 3.0
  Date: 10/22/2025
  Description: Handles validation and Review button logic for Patient Registration Form
*/

const dateElement = document.getElementById('datetime');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
if (dateElement) dateElement.textContent = today.toLocaleDateString('en-US', options);

// Limit DOB max date to today
const dobField = document.getElementById('dob');
if (dobField) {
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dobField.max = `${yyyy}-${mm}-${dd}`;
}

const ssn = document.getElementById('ssn');
if (ssn) {
  ssn.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 9);
  });
}

const phone = document.getElementById('phone');
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

const form = document.getElementById('patientForm');
const pw = document.getElementById('password');
const pw2 = document.getElementById('confirm');
const pwError = document.getElementById('pwError');

function passwordsMatch() {
  const match = pw.value !== '' && pw.value === pw2.value;
  pwError.style.display = match ? 'none' : 'block';
  return match;
}

if (pw && pw2) {
  pw.addEventListener('input', passwordsMatch);
  pw2.addEventListener('input', passwordsMatch);
}

if (form) {
  form.addEventListener('submit', (e) => {
    if (!passwordsMatch()) {
      e.preventDefault();
      pw2.focus();
    }
  });
}

(function () {
  const reviewBtn = document.getElementById('reviewBtn');
  const reviewBody = document.getElementById('reviewBody');

  function get(id) {
    const el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  function review() {
    const rows = [];
    const fname = get('firstname'), mi = get('mi'), lname = get('lastname');
    rows.push(['First, MI, Last Name', `${fname} ${mi} ${lname}`, !!fname && !!lname, 'ERROR: Missing name info']);

    const dob = get('dob');
    let dobOK = true, dobMsg = '';
    if (dob) {
      const d = new Date(dob), today = new Date(); today.setHours(0,0,0,0);
      const min = new Date(today.getFullYear()-120, today.getMonth(), today.getDate());
      dobOK = (d<=today && d>=min);
      if (!dobOK) dobMsg = (d>today) ? 'ERROR: Cannot be in the future' : 'ERROR: Too old';
    } else { dobOK = false; dobMsg = 'ERROR: Missing DOB'; }
    rows.push(['Date of Birth', dob || '(none)', dobOK, dobMsg]);

    const ssn = get('ssn');
    const ssnOK = /^\d{9}$/.test(ssn);
    rows.push(['SSN', ssnOK ? '*********' : ssn, ssnOK, ssnOK ? 'PASS' : 'ERROR: Must be 9 digits']);

    const email = get('email');
    const emailOK = /.+@.+\..+/.test(email);
    rows.push(['Email', email, emailOK, emailOK ? 'PASS' : 'ERROR: Invalid email']);

    const phone = get('phone');
    const phoneOK = /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);
    rows.push(['Phone', phone, phoneOK, phoneOK ? 'PASS' : 'ERROR: Invalid phone format']);

    const a1=get('address1'), a2=get('address2'), city=get('city'),
          state=(document.getElementById('state')||{}).value, zip=get('zip');
    const addrOK=a1&&city&&state&&/^\d{5}/.test(zip);
    rows.push(['Address', `${a1}<br>${a2}<br>${city}, ${state} ${zip}`, addrOK, addrOK?'PASS':'ERROR: Missing or invalid address']);

    const uid = get('userid').toLowerCase();
    const uidOK = /^[a-z][a-z0-9_-]{4,29}$/i.test(uid);
    rows.push(['User ID', uid, uidOK, uidOK?'PASS':'ERROR: Invalid User ID']);

    const p1=get('password'), p2=get('confirm');
    const pwOK=p1.length>=8 && /[A-Z]/.test(p1) && /[a-z]/.test(p1) && /\d/.test(p1) &&
               /[!@#%^&*()\-\_=+\\\/><\.,`~]/.test(p1) && p1===p2 && !/"/.test(p1);
    rows.push(['Password', '********', pwOK, pwOK?'PASS':'ERROR: Invalid or mismatched password']);

    // Build table
    let html='';
    rows.forEach(([label,value,ok,msg])=>{
      html+=`<tr>
        <td style="font-weight:600">${label}</td>
        <td>${value}</td>
        <td class="${ok?'pass':'error'}">${ok?'PASS':msg}</td>
      </tr>`;
    });
    reviewBody.innerHTML = html;
    document.getElementById('reviewPane').scrollIntoView({behavior:'smooth'});
  }

  if (reviewBtn) reviewBtn.addEventListener('click', e => { e.preventDefault(); review(); });
})();

