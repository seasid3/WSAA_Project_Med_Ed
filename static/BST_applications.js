const API = '/applicants';
let currentYear = 2026;

const SCHEME_LIMITS = {
    'Obstetrics and Gynaecology': 7,
    'Histopathology':             4,
    'General Internal Medicine':  15,
    'Paediatrics':                8
};

// ── Year selector ─────────────────────────────────────────────
async function initYearSelector() {
    const res = await fetch('/years');
    let years = await res.json();
    if (!years.includes(2026)) years = [2026, ...years];
    const sel = document.getElementById('year-select');
    sel.innerHTML = years.map(y =>
        `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
    ).join('');
}

function changeYear(year) {
    currentYear = year;
    // Reload whichever tab is active
    const active = document.querySelector('.tab-content.active');
    if (active.id === 'tab-interviews')   loadInterviews();
    if (active.id === 'tab-offers')       loadOfferResults();
    if (active.id === 'tab-acceptances')  loadAcceptances();
    if (active.id === 'tab-applications') {
        const section = document.getElementById('all-applicants-section');
        if (!section.classList.contains('hidden')) loadAllApplicants();
    }
}

function startNewYear() {
    const input = prompt('Enter the new application year (e.g. 2027):');
    if (!input) return;
    const year = parseInt(input);
    if (isNaN(year) || year < 2020 || year > 2100) {
        alert('Please enter a valid year between 2020 and 2100.');
        return;
    }
    const sel = document.getElementById('year-select');
    if ([...sel.options].some(o => parseInt(o.value) === year)) {
        sel.value = year;
        changeYear(year);
        return;
    }
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    sel.appendChild(opt);
    sel.value = year;
    changeYear(year);
}

// ── DOB restriction: must be 21+ ─────────────────────────────
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
    if (name === 'trainees')     loadTrainees();
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
        bst_scheme: form.bst_scheme.value,
        year:       currentYear
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
    const res = await fetch(`${API}?year=${currentYear}`);
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
    const res = await fetch(`${API}?year=${currentYear}`);
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
            <td><button class="btn-edit"
                data-id="${a.rcppi_id}"
                data-name="${(a.first_name + ' ' + a.surname).replace(/"/g, '&quot;')}"
                data-status="${a.interview_status || ''}"
                data-score="${a.interview_score ?? ''}"
                onclick="openInterviewModal(this)">Set Result</button></td>`;
        tbody.appendChild(tr);
    });
}

function openInterviewModal(btn) {
    const id          = btn.dataset.id;
    const name        = btn.dataset.name;
    const currentStatus = btn.dataset.status;
    const currentScore  = btn.dataset.score || null;
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
    if (!confirm('This will assign offers to the top-ranked applicants per specialty (Obs & Gynae: 7, Histopathology: 4, General Internal Medicine: 15, Paediatrics: 8) based on interview score. Any existing offers will be recalculated. Continue?')) return;
    const res = await fetch(`${API}/assign-offers?year=${currentYear}`, { method: 'POST' });
    const data = await res.json();
    showMsg('msg-offers', `Done — ${data.offers_assigned} offer(s) assigned.`, false);
    loadOfferResults();
}

async function loadOfferResults() {
    const res = await fetch(`${API}?year=${currentYear}`);
    const all = await res.json();
    const container = document.getElementById('offers-results');
    container.innerHTML = '';

    const scored = all.filter(a => a.interview_status === 'completed' && a.interview_score !== null);
    if (!scored.length) return;

    const schemes = ['Obstetrics and Gynaecology', 'Histopathology', 'General Internal Medicine', 'Paediatrics'];
    schemes.forEach(scheme => {
        const group = scored
            .filter(a => a.bst_scheme === scheme)
            .sort((a, b) => b.interview_score - a.interview_score);
        if (!group.length) return;
        const limit = SCHEME_LIMITS[scheme];
        const offered = group.filter(a => a.place_offered === 1).length;
        const div = document.createElement('div');
        div.className = 'card scheme-group';
        div.innerHTML = `<h4>${scheme} <span class="scheme-meta">${group.length} scored — ${offered} of ${limit} places offered</span></h4>`
            + buildRankedTable(group, limit);
        container.appendChild(div);
    });
}

function buildRankedTable(applicants, limit) {
    let offerCount = 0;
    const rows = applicants.map((a, i) => {
        let offerBadge;
        if (a.place_offered === 1) {
            offerCount++;
            offerBadge = `<span class="badge badge-green">Offer ${offerCount} of ${limit}</span>`;
        } else {
            offerBadge = '<span class="badge badge-grey">No Offer</span>';
        }
        return `
        <tr class="${a.place_offered === 1 ? 'row-offered' : 'row-no-offer'}">
            <td><strong>${i + 1}</strong></td>
            <td>${a.rcppi_id}</td>
            <td>${a.first_name} ${a.surname}</td>
            <td>${a.interview_score}</td>
            <td>${offerBadge}</td>
        </tr>`;
    }).join('');
    return `<table>
        <thead><tr><th>Rank</th><th>RCPPI ID</th><th>Name</th><th>Interview Score</th><th>Offer Status</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// ── Tab 4: Acceptances ────────────────────────────────────────
async function loadAcceptances() {
    const res = await fetch(`${API}/acceptances?year=${currentYear}`);
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

async function downloadTraineeList() {
    const res = await fetch(`${API}/acceptances?year=${currentYear}`);
    const data = await res.json();
    const accepted = data.filter(a => a.acceptance === 'accepted');

    // Cap each specialty at its scheme limit
    const trainees = [];
    const schemes = ['Obstetrics and Gynaecology', 'Histopathology', 'General Internal Medicine', 'Paediatrics'];
    schemes.forEach(scheme => {
        const limit = SCHEME_LIMITS[scheme];
        accepted.filter(a => a.bst_scheme === scheme).slice(0, limit).forEach(a => trainees.push(a));
    });

    if (!trainees.length) {
        showMsg('msg-trainees', 'No accepted trainees to download yet.', true);
        return;
    }

    function csvCell(val) {
        const s = String(val ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"` : s;
    }

    const headers = ['RCPPI ID', 'First Name', 'Surname', 'Date of Birth', 'BST Scheme', 'Interview Score'];
    const rows = trainees.map(a => [
        a.rcppi_id, a.first_name, a.surname, a.dob, a.bst_scheme, a.interview_score ?? ''
    ].map(csvCell));

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BST_Final_Trainee_List.csv';
    link.click();
    URL.revokeObjectURL(url);
}

async function setAcceptance(id, acceptance) {
    const res = await fetch(`${API}/${id}/acceptance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptance })
    });
    if (res.ok) {
        const result = await res.json();
        let msg = `RCPPI ${id} marked as ${acceptance === 'refused' ? 'not accepted' : 'accepted'}.`;
        if (result.cascaded_to) {
            msg += ` Offer automatically assigned to ${result.cascaded_to.first_name} ${result.cascaded_to.surname} (RCPPI ${result.cascaded_to.rcppi_id}).`;
        }
        showMsg('msg-acceptances', msg, false);
        loadAcceptances();
    } else {
        showMsg('msg-acceptances', 'Error updating acceptance.', true);
    }
}

// ── Tab 5: Trainees ───────────────────────────────────────────
async function loadTrainees() {
    const res = await fetch(`${API}/acceptances?year=${currentYear}`);
    const data = await res.json();
    const accepted = data.filter(a => a.acceptance === 'accepted');
    const container = document.getElementById('trainees-results');
    container.innerHTML = '';
    if (!accepted.length) {
        container.innerHTML = '<div class="card"><p class="hint">No trainees have accepted their place yet.</p></div>';
        return;
    }
    const schemes = ['Obstetrics and Gynaecology', 'Histopathology', 'General Internal Medicine', 'Paediatrics'];
    schemes.forEach(scheme => {
        const limit = SCHEME_LIMITS[scheme];
        const group = accepted.filter(a => a.bst_scheme === scheme).slice(0, limit);
        if (!group.length) return;
        const div = document.createElement('div');
        div.className = 'card scheme-group';
        div.innerHTML = `<h4>${scheme} <span class="scheme-meta">${group.length} of ${limit} trainee(s)</span></h4>` + buildTraineeTable(group, limit);
        container.appendChild(div);
    });
}

function buildTraineeTable(applicants, limit) {
    const rows = applicants.map((a, i) => `
        <tr>
            <td>Trainee ${i + 1} of ${limit}</td>
            <td>${a.rcppi_id}</td>
            <td>${a.first_name} ${a.surname}</td>
            <td>${a.dob}</td>
            <td>${a.interview_score}</td>
        </tr>`).join('');
    return `<table>
        <thead><tr><th>Position</th><th>RCPPI ID</th><th>Name</th><th>DOB</th><th>Interview Score</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// ── Startup ───────────────────────────────────────────────────
initYearSelector();
