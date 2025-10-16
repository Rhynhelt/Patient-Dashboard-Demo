
/**
 * Clean implementation: fetch Jessica Taylor, populate UI, and render BP chart with fallback.
 */
async function fetchJessicaTaylor() {
  try {
    const username = 'coalition';
    const password = 'skills-test';
    const authHeader = 'Basic ' + btoa(username + ':' + password);

    const resp = await fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!resp.ok) {
      showAPIError('Failed to load patient data. HTTP ' + resp.status);
      console.warn('API responded with error', resp.status, resp.statusText);
      return;
    }

    const data = await resp.json();
    const patient = Array.isArray(data) ? data.find(p => p.name === 'Jessica Taylor') : null;
    if (!patient) {
      showAPIError('Jessica Taylor not found in response.');
      // create minimal fake patient so chart renders
      const fallback = {
        name: 'Jessica Taylor',
        diagnosis_history: [
          { year: 2021, blood_pressure: { systolic: { value: 120 }, diastolic: { value: 80 } } },
          { year: 2022, blood_pressure: { systolic: { value: 130 }, diastolic: { value: 85 } } },
          { year: 2023, blood_pressure: { systolic: { value: 140 }, diastolic: { value: 88 } } },
          { year: 2024, blood_pressure: { systolic: { value: 135 }, diastolic: { value: 82 } } }
        ],
        diagnostic_list: [],
        lab_results: []
      };
      populateProfile(fallback);
      populateDiagnostics(fallback.diagnostic_list);
      populateLabs(fallback.lab_results);
      invokeChart(fallback.diagnosis_history);
      return;
    }

    populateProfile(patient);
    populateDiagnostics(patient.diagnostic_list || []);
    populateLabs(patient.lab_results || []);
    if (patient.diagnosis_history) {
      invokeChart(patient.diagnosis_history);
    } else {
      // fallback history
      const fallbackHistory = [
        { year: 2021, blood_pressure: { systolic: { value: 120 }, diastolic: { value: 80 } } },
        { year: 2022, blood_pressure: { systolic: { value: 130 }, diastolic: { value: 85 } } },
        { year: 2023, blood_pressure: { systolic: { value: 140 }, diastolic: { value: 88 } } },
        { year: 2024, blood_pressure: { systolic: { value: 135 }, diastolic: { value: 82 } } }
      ];
      invokeChart(fallbackHistory);
    }
  } catch (e) {
    console.error('Fetch failed', e);
    showAPIError('Network error when loading data.');
    // fallback chart
    const fallbackHistory = [
      { year: 2021, blood_pressure: { systolic: { value: 120 }, diastolic: { value: 80 } } },
      { year: 2022, blood_pressure: { systolic: { value: 130 }, diastolic: { value: 85 } } },
      { year: 2023, blood_pressure: { systolic: { value: 140 }, diastolic: { value: 88 } } },
      { year: 2024, blood_pressure: { systolic: { value: 135 }, diastolic: { value: 82 } } }
    ];
    populateProfile({ name: 'Jessica Taylor' });
    invokeChart(fallbackHistory);
  }
}

function invokeChart(history) {
  if (typeof window.renderBPChart === 'function') {
    window.renderBPChart(history);
  } else {
    setTimeout(() => {
      if (typeof window.renderBPChart === 'function') {
        window.renderBPChart(history);
      }
    }, 100);
  }
}

function showAPIError(msg) {
  const container = document.querySelector('.main-grid') || document.querySelector('.main-content') || document.body;
  if (!container) return;
  const err = document.createElement('div');
  err.className = 'error';
  err.textContent = msg;
  container.prepend(err);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setSrc(id, src) {
  const img = document.getElementById(id);
  if (img) img.src = src;
}

function populateProfile(p) {
  setText('patient-name', p.name || 'Jessica Taylor');

  if (p.date_of_birth) {
    const formatted = new Date(p.date_of_birth).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    setText('patient-dob', formatted);
  }

  if (p.gender) setText('patient-gender-display', p.gender);
  if (p.phone_number || p.phone) setText('patient-phone-display', p.phone_number || p.phone);
  if (p.emergency_contact) setText('patient-emergency-phone', p.emergency_contact);
  if (p.insurance_type || p.insurance) setText('patient-insurance-display', p.insurance_type || p.insurance);
  if (p.profile_picture) {
    setSrc('profile-pic-sidebar', p.profile_picture);
    setSrc('profile-pic-main', p.profile_picture);
  }
}

function populateDiagnostics(list) {
  const c = document.getElementById('diagnostics-container');
  if (!c) return;
  c.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    const none = document.createElement('tr');
    none.innerHTML = '<td colspan="3">No diagnostics available.</td>';
    c.appendChild(none);
    return;
  }
  list.forEach(d => {
    const tr = document.createElement('tr');
    const name = d.name || d.title || 'Untitled';
    const desc = d.description || '';
    const status = d.status || 'Unknown';
    tr.innerHTML = `
      <td>${name}</td>
      <td>${desc}</td>
      <td>${status}</td>
    `;
    c.appendChild(tr);
  });
}

function populateLabs(labs) {
  const container = document.querySelector('.labs-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(labs) || labs.length === 0) {
    const none = document.createElement('div');
    none.className = 'lab-row';
    none.textContent = 'No lab results available.';
    container.appendChild(none);
    return;
  }
  labs.forEach(l => {
    const row = document.createElement('div');
    row.className = 'lab-row';
    const name = document.createElement('div');
    name.className = 'lab-name body-emphasized-14pt';
    if (typeof l === 'string') {
      name.textContent = l;
    } else if (l.test_name) {
      name.textContent = l.test_name;
    } else {
      name.textContent = 'Lab';
    }
    const download = document.createElement('div');
    download.className = 'download';
    download.textContent = '⤓';
    row.appendChild(name);
    row.appendChild(download);
    container.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchJessicaTaylor();
});
