const API = '/applicants';

// Restrict DOB field: applicants must be at least 21 years old
(function setDobMax() {
    const max = new Date();
    max.setFullYear(max.getFullYear() - 21);
    document.querySelector('input[name="dob"]').max = max.toISOString().split('T')[0];
})();

// ── Tab navigation ────────────────────────────────────────────
function showTab(name, btn) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    btn.classList.add('active');
    if (name === 'interviews')   loadInterviews();
    if (name === 'offers')       loadOfferResults();
    if (name === 'acceptances')  loadAcceptances();
}

// ── Helpers ───────────────────────────────────────────────────
function showMsg(id, text, isError) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'message ' + (isError ? 'error' : 'success');
    setTimeout(() => { el.textContent = ''; el.className = 'message'; }, 5000);
}

function statusBadge(status) {
    const map = {
        completed:    ['Completed',        'badge-green'],
        no_interview: ['No Interview',     'badge-orange'],
        withdrawn:    ['Withdrawn',        'badge-red'],
    };
    if (!status) return '<span class="badge badge-grey">Pending</span>';
    const [text, cls] = map[status] || ['Unknown', 'badge-grey'];
    return `<span class="badge ${cls}">${text}</span>`;
}

function offeredBadge(val) {
    if (val === 1)  return '<span class="badge badge-green">Yes</span>';
    if (val === 0)  return '<span class="badge badge-red">No</span>';
    return '<span class="badge badge-grey">—</span>';
}

function acceptanceBadge(val) {
    if (val === 'accepted') return '<span class="badge badge-green">Accepted</span>';
    if (val === 'refused')  return '<span class="badge badge-red">Not Accepted</span>';
    return '<span class="badge badge-grey">—</span>';
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// ── Tab 1: Applications ───────────────────────────────────────
async function submitAdd(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        first_name: form.first_name.value.trim(),
        surname:    form.surname.value.trim(),
        dob:        form.dob.value,
        bst_scheme: form.bst_scheme.value
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
        // Refresh table if it's visible
        if (!document.getElementById('all-applicants-section').classList.contains('hidden')) {
            loadAllApplicants();
        }
    } else {
        const err = await res.json().catch(() => ({}));
        showMsg('msg-add', err.description || 'Error adding applicant.', true);
    }
}

function toggleAllApplicants(btn) {
    const section = document.getElementById('all-applicants-section');
    const hidden = section.classList.toggle('hidden');
    btn.textContent = hidden ? 'View All Applicants ▼' : 'Hide Applicants ▲';
    if (!hidden) loadAllApplicants();
}

async function loadAllApplicants() {
    const res = await fetch(API);
    const data = await res.json();
    const tbody = document.getElementById('body-all');
    tbody.innerHTML = '';
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty">No applicants yet.</td></tr>';
        return;
    }
    let rank = 1;
    data.forEach(a => {
        const tr = document.createElement('tr');
        if (a.interview_status === 'withdrawn') tr.classList.add('row-withdrawn');
        const rankDisplay = a.interview_score !== null ? rank++ : '—';
        tr.innerHTML = `
            <td>${rankDisplay}</td>
            <td>${a.rcppi_id}</td>
            <td>${a.first_name}</td>
            <td>${a.surname}</td>
            <td>${a.dob}</td>
            <td>${a.bst_scheme}</td>
            <td>${statusBadge(a.interview_status)}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td>${offeredBadge(a.place_offered)}</td>
            <td>${acceptanceBadge(a.acceptance)}</td>
            <td><button class="btn-delete" onclick="deleteApplicant(${a.rcppi_id})">Delete</button></td>`;
        tbody.appendChild(tr);
    });
}

async function deleteApplicant(id) {
    if (!confirm(`Delete applicant RCPPI ID ${id}? This cannot be undone.`)) return;
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showMsg('msg-all', `Applicant ${id} deleted.`, false);
        loadAllApplicants();
    } else {
        showMsg('msg-all', 'Could not delete applicant.', true);
    }
}

// ── Tab 2: Interviews ─────────────────────────────────────────
async function loadInterviews() {
    const res = await fetch(API);
    const data = await res.json();
    const tbody = document.getElementById('body-interviews');
    tbody.innerHTML = '';
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No applicants found.</td></tr>';
        return;
    }
    data.forEach(a => {
        const tr = document.createElement('tr');
        if (a.interview_status === 'withdrawn') tr.classList.add('row-withdrawn');
        tr.innerHTML = `
            <td>${a.rcppi_id}</td>
            <td>${a.first_name} ${a.surname}</td>
            <td>${a.bst_scheme}</td>
            <td>${statusBadge(a.interview_status)}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td><button class="btn-edit" onclick="openInterviewModal(${a.rcppi_id}, '${a.first_name} ${a.surname}', '${a.interview_status || ''}', ${a.interview_score ?? 'null'})">Set Result</button></td>`;
        tbody.appendChild(tr);
    });
}

function openInterviewModal(id, name, currentStatus, currentScore) {
    document.getElementById('interview-id').value = id;
    document.getElementById('interview-modal-title').textContent =
        `Interview Result — ${name} (RCPPI ${id})`;
    document.getElementById('msg-interview-modal').textContent = '';

    // Reset radios
    document.querySelectorAll('#form-interview input[type=radio]').forEach(r => r.checked = false);
    document.getElementById('interview-score').value = '';
    document.getElementById('score-input-wrap').classList.add('hidden');

    // Pre-select current status
    if (currentStatus) {
        const radio = document.querySelector(`#form-interview input[value="${currentStatus}"]`);
        if (radio) {
            radio.checked = true;
            if (currentStatus === 'completed') {
                document.getElementById('score-input-wrap').classList.remove('hidden');
                document.getElementById('interview-score').value = currentScore ?? '';
            }
        }
    }
    document.getElementById('interview-modal').classList.remove('hidden');
}

function toggleScoreInput(radio) {
    const wrap = document.getElementById('score-input-wrap');
    wrap.classList.toggle('hidden', radio.value !== 'completed');
    if (radio.value !== 'completed') {
        document.getElementById('interview-score').value = '';
    }
}

async function submitInterview(e) {
    e.preventDefault();
    const id = document.getElementById('interview-id').value;
    const status = document.querySelector('#form-interview input[name="interview_status"]:checked')?.value;
    if (!status) {
        showMsg('msg-interview-modal', 'Please select an outcome.', true);
        return;
    }
    const score = status === 'completed' ? parseFloat(document.getElementById('interview-score').value) : null;
    if (status === 'completed' && (isNaN(score) || score < 0 || score > 100)) {
        showMsg('msg-interview-modal', 'Please enter a valid score between 0 and 100.', true);
        return;
    }
    const body = { interview_status: status };
    if (status === 'completed') body.interview_score = score;

    const res = await fetch(`${API}/${id}/interview`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        closeModal('interview-modal');
        showMsg('msg-interviews', `Result saved for RCPPI ${id}.`, false);
        loadInterviews();
    } else {
        showMsg('msg-interview-modal', 'Error saving result.', true);
    }
}

// ── Tab 3: Offers ─────────────────────────────────────────────
async function assignOffers() {
    if (!confirm('This will assign offers to the top 10 applicants per specialty based on interview score. Any existing offers will be recalculated. Continue?')) return;
    const res = await fetch(`${API}/assign-offers`, { method: 'POST' });
    const data = await res.json();
    showMsg('msg-offers', `Done — ${data.offers_assigned} offer(s) assigned.`, false);
    loadOfferResults();
}

async function loadOfferResults() {
    const res = await fetch(`${API}/offers`);
    const data = await res.json();
    const container = document.getElementById('offers-results');
    container.innerHTML = '';
    if (!data.length) return;

    const schemes = [...new Set(data.map(a => a.bst_scheme))];
    schemes.forEach(scheme => {
        const group = data.filter(a => a.bst_scheme === scheme);
        const div = document.createElement('div');
        div.className = 'card scheme-group';
        div.innerHTML = `<h4>${scheme} — ${group.length} offer(s)</h4>` + buildRankedTable(group);
        container.appendChild(div);
    });
}

function buildRankedTable(applicants) {
    const rows = applicants.map((a, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${a.rcppi_id}</td>
            <td>${a.first_name} ${a.surname}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td>${acceptanceBadge(a.acceptance)}</td>
        </tr>`).join('');
    return `<table>
        <thead><tr><th>Rank</th><th>RCPPI ID</th><th>Name</th><th>Score</th><th>Acceptance</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// ── Tab 4: Acceptances ────────────────────────────────────────
async function loadAcceptances() {
    const res = await fetch(`${API}/acceptances`);
    const data = await res.json();
    const container = document.getElementById('acceptances-results');
    container.innerHTML = '';
    if (!data.length) {
        container.innerHTML = '<div class="card"><p class="hint">No offers have been assigned yet. Go to the Offers tab first.</p></div>';
        return;
    }

    const schemes = [...new Set(data.map(a => a.bst_scheme))];
    schemes.forEach(scheme => {
        const group = data.filter(a => a.bst_scheme === scheme);
        const div = document.createElement('div');
        div.className = 'card scheme-group';
        div.innerHTML = `<h4>${scheme}</h4>` + buildAcceptanceTable(group);
        container.appendChild(div);
    });
}

function buildAcceptanceTable(applicants) {
    const rows = applicants.map(a => `
        <tr class="${a.acceptance === 'accepted' ? 'row-accepted' : a.acceptance === 'refused' ? 'row-refused' : ''}">
            <td>${a.rcppi_id}</td>
            <td>${a.first_name} ${a.surname}</td>
            <td>${a.interview_score ?? '—'}</td>
            <td>${acceptanceBadge(a.acceptance)}</td>
            <td>
                <button class="btn-accept ${a.acceptance === 'accepted' ? 'active' : ''}"
                    onclick="setAcceptance(${a.rcppi_id}, 'accepted')">Accepted</button>
                <button class="btn-refuse ${a.acceptance === 'refused' ? 'active' : ''}"
                    onclick="setAcceptance(${a.rcppi_id}, 'refused')">Not Accepted</button>
            </td>
        </tr>`).join('');
    return `<table>
        <thead><tr><th>RCPPI ID</th><th>Name</th><th>Score</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

async function setAcceptance(id, acceptance) {
    const res = await fetch(`${API}/${id}/acceptance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptance })
    });
    if (res.ok) {
        showMsg('msg-acceptances', `RCPPI ${id} marked as ${acceptance}.`, false);
        loadAcceptances();
    } else {
        showMsg('msg-acceptances', 'Error updating acceptance.', true);
    }
}
