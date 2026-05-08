const API = '/applicants';

// --- Tab navigation ---
function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    event.target.classList.add('active');

    if (name === 'all')          loadAll();
    if (name === 'offers')       loadOffers();
    if (name === 'acceptances')  loadAcceptances();
}

function showMsg(id, text, isError) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'message ' + (isError ? 'error' : 'success');
    setTimeout(() => { el.textContent = ''; el.className = 'message'; }, 4000);
}

// --- Helpers ---
function fmtOffered(val) {
    if (val === null || val === undefined || val === '') return '—';
    return val == 1 ? 'Yes' : 'No';
}

function fmtAcceptance(val) {
    if (!val) return '—';
    return val.charAt(0).toUpperCase() + val.slice(1);
}

// --- All Applicants ---
async function loadAll() {
    const res = await fetch(API);
    const data = await res.json();
    const tbody = document.getElementById('body-all');
    tbody.innerHTML = '';
    data.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.rcppi_id}</td>
            <td>${a.first_name}</td>
            <td>${a.surname}</td>
            <td>${a.dob}</td>
            <td>${a.bst_scheme}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td>${fmtOffered(a.place_offered)}</td>
            <td>${fmtAcceptance(a.acceptance)}</td>
            <td>
                <button class="btn-edit" onclick="openModal(${a.rcppi_id})">Edit</button>
                <button class="btn-delete" onclick="deleteApplicant(${a.rcppi_id})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// --- Add New ---
async function submitAdd(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        first_name:      form.first_name.value.trim(),
        surname:         form.surname.value.trim(),
        dob:             form.dob.value,
        bst_scheme:      form.bst_scheme.value,
        interview_score: form.interview_score.value || null,
        place_offered:   form.place_offered.value === '' ? null : parseInt(form.place_offered.value),
        acceptance:      form.acceptance.value || null
    };

    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.status === 201) {
        const result = await res.json();
        showMsg('msg-add', `Applicant added — RCPPI ID: ${result.rcppi_id}`, false);
        form.reset();
    } else {
        const err = await res.json();
        showMsg('msg-add', err.description || 'Error adding applicant.', true);
    }
}

// --- Delete ---
async function deleteApplicant(id) {
    if (!confirm(`Delete applicant RCPPI ID ${id}? This cannot be undone.`)) return;
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showMsg('msg-all', `Applicant ${id} deleted.`, false);
        loadAll();
    } else {
        showMsg('msg-all', 'Could not delete applicant.', true);
    }
}

// --- Edit Modal ---
async function openModal(id) {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) return;
    const a = await res.json();

    document.getElementById('edit-id').value          = a.rcppi_id;
    document.getElementById('edit-first_name').value  = a.first_name;
    document.getElementById('edit-surname').value     = a.surname;
    document.getElementById('edit-dob').value         = a.dob;
    document.getElementById('edit-bst_scheme').value  = a.bst_scheme;
    document.getElementById('edit-interview_score').value = a.interview_score ?? '';
    document.getElementById('edit-place_offered').value   = a.place_offered ?? '';
    document.getElementById('edit-acceptance').value      = a.acceptance ?? '';

    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('msg-edit').textContent = '';
}

async function submitEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const data = {
        first_name:      document.getElementById('edit-first_name').value.trim(),
        surname:         document.getElementById('edit-surname').value.trim(),
        dob:             document.getElementById('edit-dob').value,
        bst_scheme:      document.getElementById('edit-bst_scheme').value,
        interview_score: document.getElementById('edit-interview_score').value || null,
        place_offered:   document.getElementById('edit-place_offered').value === ''
                            ? null
                            : parseInt(document.getElementById('edit-place_offered').value),
        acceptance:      document.getElementById('edit-acceptance').value || null
    };

    const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        closeModal();
        showMsg('msg-all', `Applicant ${id} updated.`, false);
        loadAll();
    } else {
        showMsg('msg-edit', 'Could not update applicant.', true);
    }
}

// --- Offers ---
async function loadOffers() {
    const res = await fetch(`${API}/offers`);
    const data = await res.json();
    const tbody = document.getElementById('body-offers');
    tbody.innerHTML = '';
    data.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.rcppi_id}</td>
            <td>${a.first_name}</td>
            <td>${a.surname}</td>
            <td>${a.bst_scheme}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td>${fmtAcceptance(a.acceptance)}</td>`;
        tbody.appendChild(tr);
    });
    if (!data.length) {
        showMsg('msg-offers', 'No offers recorded yet.', false);
    }
}

// --- Acceptances by Scheme ---
async function loadAcceptances() {
    const res = await fetch(`${API}/acceptances`);
    const data = await res.json();
    const container = document.getElementById('acceptance-groups');
    container.innerHTML = '';

    const schemes = [...new Set(data.map(a => a.bst_scheme))];
    if (!schemes.length) {
        showMsg('msg-acceptances', 'No acceptance data yet.', false);
        return;
    }

    schemes.forEach(scheme => {
        const group = data.filter(a => a.bst_scheme === scheme);
        const div = document.createElement('div');
        div.className = 'scheme-group';
        div.innerHTML = `<h4>${scheme}</h4>` + buildAcceptanceTable(group);
        container.appendChild(div);
    });
}

function buildAcceptanceTable(applicants) {
    const rows = applicants.map(a => `
        <tr class="${a.acceptance === 'accepted' ? 'row-accepted' : 'row-refused'}">
            <td>${a.rcppi_id}</td>
            <td>${a.first_name} ${a.surname}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td>${fmtAcceptance(a.acceptance)}</td>
        </tr>`).join('');
    return `<table>
        <thead><tr><th>ID</th><th>Name</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// Load on startup
loadAll();
