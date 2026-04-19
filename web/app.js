const API = process.env.BACKEND_API || 'http://localhost:5000/api';
// ─── AUTH STATE ───────────────────────────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('mf_user') || 'null');
let authToken   = localStorage.getItem('mf_token') || '';

function saveAuth(user, token) {
  currentUser = user;
  authToken   = token;
  localStorage.setItem('mf_user',  JSON.stringify(user));
  localStorage.setItem('mf_token', token);
  updateNavAuth();
}

function clearAuth() {
  currentUser = null;
  authToken   = '';
  localStorage.removeItem('mf_user');
  localStorage.removeItem('mf_token');
  updateNavAuth();
}

function updateNavAuth() {
  const loginBtn   = document.getElementById('navLoginBtn');
  const userMenu   = document.getElementById('navUserMenu');
  const userName   = document.getElementById('navUserName');
  if (!loginBtn) return;
  if (currentUser) {
    loginBtn.style.display  = 'none';
    userMenu.style.display  = 'flex';
    userName.textContent    = currentUser.name.split(' ')[0];
  } else {
    loginBtn.style.display  = 'inline-flex';
    userMenu.style.display  = 'none';
  }
}

// ─── SPEC MAPS ────────────────────────────────────────────────────────────────
const SPEC_COLORS = {
  'Cardiologist':       { bg:'#FEE2E2', text:'#991B1B', icon:'❤️' },
  'Neurologist':        { bg:'#EDE9FE', text:'#5B21B6', icon:'🧠' },
  'Orthopedist':        { bg:'#DBEAFE', text:'#1E40AF', icon:'🦴' },
  'Dermatologist':      { bg:'#D1FAE5', text:'#065F46', icon:'🌿' },
  'Gastroenterologist': { bg:'#FEF3C7', text:'#92400E', icon:'🍃' },
  'Pediatrician':       { bg:'#FCE7F3', text:'#9D174D', icon:'👶' },
  'Pulmonologist':      { bg:'#E0F2FE', text:'#075985', icon:'🫁' },
  'Gynecologist':       { bg:'#FDF2F8', text:'#86198F', icon:'👩‍⚕️' },
  'Psychiatrist':       { bg:'#F5F3FF', text:'#4C1D95', icon:'🧘' },
  'Ophthalmologist':    { bg:'#ECFDF5', text:'#064E3B', icon:'👁️' },
  'ENT Specialist':     { bg:'#FFF7ED', text:'#92400E', icon:'👂' },
  'Endocrinologist':    { bg:'#F0F9FF', text:'#0C4A6E', icon:'⚗️' },
  'General Physician':  { bg:'#F8FAFC', text:'#1E293B', icon:'🩺' },
  'Dentist':            { bg:'#FEF9C3', text:'#713F12', icon:'🦷' },
  'Oncologist':         { bg:'#FFF1F2', text:'#9F1239', icon:'🎗️' },
  'Urologist':          { bg:'#EFF6FF', text:'#1E3A5F', icon:'🔬' },
};

const SPEC_META = [
  { name:'Cardiologist',       icon:'❤️',  cls:'sc-cardio' },
  { name:'Neurologist',        icon:'🧠', cls:'sc-neuro'  },
  { name:'Orthopedist',        icon:'🦴', cls:'sc-ortho'  },
  { name:'Dermatologist',      icon:'🌿', cls:'sc-derm'   },
  { name:'Gastroenterologist', icon:'🍃', cls:'sc-gen'    },
  { name:'Pediatrician',       icon:'👶', cls:'sc-cardio' },
  { name:'Pulmonologist',      icon:'🫁', cls:'sc-neuro'  },
  { name:'Gynecologist',       icon:'👩‍⚕️', cls:'sc-derm'   },
  { name:'Psychiatrist',       icon:'🧘', cls:'sc-ortho'  },
  { name:'Ophthalmologist',    icon:'👁️', cls:'sc-derm'   },
  { name:'ENT Specialist',     icon:'👂', cls:'sc-gen'    },
  { name:'Endocrinologist',    icon:'⚗️', cls:'sc-neuro'  },
  { name:'General Physician',  icon:'🩺', cls:'sc-gen'    },
  { name:'Dentist',            icon:'🦷', cls:'sc-cardio' },
  { name:'Oncologist',         icon:'🎗️', cls:'sc-ortho'  },
  { name:'Urologist',          icon:'🔬', cls:'sc-neuro'  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function safeParse(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

/** MongoDB docs use _id; fall back to id for safety */
function docId(obj) { return obj?._id || obj?.id || ''; }

// ─── STATE ────────────────────────────────────────────────────────────────────
let allHospitals      = [];
let allDoctors        = [];
let filteredDoctors   = [];
let filteredHospitals = [];
let emergencyOnly     = false;
let activeSpec        = 'All';
let currentSort       = 'rating';
let prevPage          = 'home';

// ─── NAV ──────────────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
});

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    prevPage = name;
  }
}

function goBack() {
  const map = { 'hospital-detail':'hospitals', 'doctor-detail':'doctors' };
  const cur = [...document.querySelectorAll('.page.active')].map(p => p.id.replace('page-',''))[0];
  showPage(map[cur] || 'home');
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast show toast-${type}`;
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  modal.classList.add('open');
  switchAuthTab(tab);
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
  clearAuthErrors();
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.auth-input').forEach(i => i.classList.remove('input-error'));
}

function setAuthError(formId, msg) {
  const el = document.getElementById(formId + 'Error');
  if (el) el.textContent = msg;
}

async function handleLogin(e) {
  e.preventDefault();
  clearAuthErrors();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');

  if (!email || !password) { setAuthError('login', 'Please fill all fields'); return; }

  btn.disabled    = true;
  btn.textContent = 'Signing in...';
  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    saveAuth(data.data.user, data.data.token);
    closeAuthModal();
    showToast(`👋 Welcome back, ${data.data.user.name.split(' ')[0]}!`, 'success');
  } catch (err) {
    setAuthError('login', err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Sign In';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  clearAuthErrors();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;
  const btn      = document.getElementById('signupBtn');

  if (!name || !email || !password) { setAuthError('signup', 'Please fill all fields'); return; }
  if (password.length < 6)          { setAuthError('signup', 'Password must be at least 6 characters'); return; }
  if (password !== confirm)         { setAuthError('signup', 'Passwords do not match'); return; }

  btn.disabled    = true;
  btn.textContent = 'Creating account...';
  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    saveAuth(data.data.user, data.data.token);
    closeAuthModal();
    showToast(`🎉 Account created! Welcome, ${data.data.user.name.split(' ')[0]}!`, 'success');
  } catch (err) {
    setAuthError('signup', err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Create Account';
  }
}

function handleLogout() {
  clearAuth();
  showToast('👋 Logged out successfully');
  showPage('home');
}

// ─── FETCH ────────────────────────────────────────────────────────────────────
async function fetchHospitals() {
  const res  = await fetch(`${API}/hospitals`);
  const data = await res.json();
  allHospitals      = data.data || [];
  filteredHospitals = [...allHospitals];
  return allHospitals;
}

async function fetchDoctors() {
  const res  = await fetch(`${API}/doctors`);
  const data = await res.json();
  allDoctors      = data.data || [];
  filteredDoctors = [...allDoctors];
  return allDoctors;
}

async function fetchHospitalById(id) {
  const res  = await fetch(`${API}/hospitals/${id}`);
  const data = await res.json();
  return data.data;
}

async function fetchDoctorById(id) {
  const res  = await fetch(`${API}/doctors/${id}`);
  const data = await res.json();
  return data.data;
}

// ─── SPEC GRID ────────────────────────────────────────────────────────────────
function renderSpecGrid(doctors) {
  const counts = {};
  doctors.forEach(d => { counts[d.specialization] = (counts[d.specialization] || 0) + 1; });
  const grid = document.getElementById('specGrid');
  if (!grid) return;
  grid.innerHTML = SPEC_META.map(s => `
    <div class="spec-card ${s.cls}" onclick="filterBySpec('${s.name}')">
      <span class="spec-icon">${s.icon}</span>
      <div class="spec-name">${s.name}</div>
      <div class="spec-count">${counts[s.name] || 0} doctor${counts[s.name] === 1 ? '' : 's'}</div>
    </div>
  `).join('');
}

function filterBySpec(spec) {
  showPage('doctors');
  activeSpec = spec;
  applyDocFilter();
  document.querySelectorAll('.spec-filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.spec === spec);
  });
}

// ─── HOSPITAL CARD HTML ───────────────────────────────────────────────────────
function hospitalCardHTML(h) {
  const id         = docId(h);
  const facilities = safeParse(h.facilities);
  const doctors    = h.doctors || [];
  return `
    <div class="hospital-card" onclick="openHospital('${id}')">
      <div class="hospital-card-hero">
        <span class="hospital-card-icon">🏥</span>
        <div class="hospital-card-hero-info">
          <div class="hospital-card-name">${h.name}</div>
          <div class="hospital-card-type">${h.type || 'Hospital'}</div>
        </div>
        <div class="hc-badges">
          ${h.emergency ? '<span class="badge badge-emergency">🚨 24/7</span>' : ''}
        </div>
      </div>
      <div class="hospital-card-body">
        <div class="hospital-meta">
          <span>⭐ <strong>${h.rating}</strong></span>
          <span>🛏 <strong>${h.beds}</strong> beds</span>
        </div>
        <div class="hospital-addr">📍 ${h.address}</div>
        ${facilities.length ? `
          <div class="facilities-row">
            ${facilities.slice(0,4).map(f => `<span class="facility-chip">${f}</span>`).join('')}
            ${facilities.length > 4 ? `<span class="facility-chip">+${facilities.length - 4}</span>` : ''}
          </div>` : ''}
        ${doctors.length ? `
          <div class="doctors-preview">
            <div class="doctors-preview-title">👨‍⚕️ MEDICAL TEAM · ${doctors.length} DOCTORS</div>
            <div class="doctor-mini-list">
              ${doctors.slice(0,3).map(d => {
                const sp = SPEC_COLORS[d.specialization] || { bg:'#F1F5F9', icon:'👤' };
                return `<div class="doctor-mini">
                  <div class="doctor-mini-avatar" style="background:${sp.bg}">${sp.icon}</div>
                  <div>
                    <div class="doctor-mini-name">${d.name}</div>
                    <div class="doctor-mini-spec">${d.specialization}</div>
                  </div>
                </div>`;
              }).join('')}
              ${doctors.length > 3 ? `<div class="more-docs">+${doctors.length - 3} more specialists</div>` : ''}
            </div>
          </div>` : ''}
      </div>
      <div class="hospital-card-footer">
        <span class="view-link">View Full Profile <span>→</span></span>
      </div>
    </div>`;
}

// ─── DOCTOR CARD HTML ─────────────────────────────────────────────────────────
function doctorCardHTML(d) {
  const id         = docId(d);
  const sp         = SPEC_COLORS[d.specialization] || { bg:'#F1F5F9', text:'#374151', icon:'👤' };
  const hospitals  = d.hospitals || [];  // array of { hospital: {...}, visiting_days, timing }

  return `
    <div class="doctor-card" onclick="openDoctor('${id}')">
      <div class="doctor-card-top">
        <div class="dc-avatar" style="background:${sp.bg}">${sp.icon}</div>
        <div style="flex:1;min-width:0">
          <div class="dc-name">${d.name}</div>
          <span class="dc-spec" style="background:${sp.bg};color:${sp.text}">${d.specialization}</span>
          <div class="dc-edu">${d.education || ''}</div>
        </div>
      </div>
      <div class="doctor-card-stats">
        <div class="dc-stat"><span class="dc-stat-val">⭐${d.rating}</span><span class="dc-stat-label">Rating</span></div>
        <div class="dc-stat"><span class="dc-stat-val">${d.experience}yr</span><span class="dc-stat-label">Exp.</span></div>
        <div class="dc-stat"><span class="dc-stat-val">₹${d.consultation_fee}</span><span class="dc-stat-label">Fee</span></div>
        <div class="dc-stat"><span class="dc-stat-val">${hospitals.length}</span><span class="dc-stat-label">Hospitals</span></div>
      </div>
      ${hospitals.length ? `
        <div class="doctor-card-hospitals">
          <div class="dc-hospitals-title">🏥 VISITS THESE HOSPITALS</div>
          ${hospitals.slice(0,2).map(slot => {
            const hObj  = slot.hospital || slot;          // populated object
            const hName = hObj?.name || 'Hospital';
            const days  = slot.visiting_days || [];
            const time  = slot.timing || '';
            return `<div class="dc-hospital-chip">
              <span class="dc-hospital-name">${hName}</span>
              <span>·</span>
              <span class="dc-hospital-days">${days.join(', ')}</span>
              <span class="dc-hospital-time">${time}</span>
            </div>`;
          }).join('')}
          ${hospitals.length > 2 ? `<div style="font-size:11px;color:#059669;font-weight:600;padding:0 10px;">+${hospitals.length - 2} more hospitals</div>` : ''}
        </div>` : ''}
      <div class="doctor-card-footer">
        <span style="font-size:13px;color:#64748B;">₹${d.consultation_fee} / visit · ${d.reviews_count || 0} reviews</span>
        <span class="view-link">View →</span>
      </div>
    </div>`;
}

// ─── HOME FEATURED ────────────────────────────────────────────────────────────
function renderFeaturedHospitals(hospitals) {
  const el = document.getElementById('featuredHospitals');
  if (!el) return;
  el.innerHTML = hospitals.slice(0,3).map(h => hospitalCardHTML(h)).join('');
}

function renderFeaturedDoctors(doctors) {
  const el = document.getElementById('featuredDoctors');
  if (!el) return;
  const sorted = [...doctors].sort((a,b) => b.rating - a.rating).slice(0,4);
  el.innerHTML = sorted.map(d => doctorCardHTML(d)).join('');
}

// ─── HOSPITALS PAGE ───────────────────────────────────────────────────────────
function renderHospitalsPage() {
  const grid = document.getElementById('hospitalsGrid');
  const cnt  = document.getElementById('hos-count');
  if (!grid) return;
  if (cnt) cnt.textContent = `${filteredHospitals.length} hospitals found`;
  grid.innerHTML = filteredHospitals.length
    ? filteredHospitals.map(h => hospitalCardHTML(h)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#94A3B8;font-size:16px;">No hospitals match your search.</div>`;
}

function filterHospitals() {
  const q = (document.getElementById('hospitalSearch')?.value || '').toLowerCase();
  filteredHospitals = allHospitals.filter(h => {
    const match = !q || h.name.toLowerCase().includes(q) || (h.address||'').toLowerCase().includes(q) || (h.type||'').toLowerCase().includes(q);
    const emerg = !emergencyOnly || h.emergency;
    return match && emerg;
  });
  renderHospitalsPage();
}

function toggleEmergencyFilter() {
  emergencyOnly = !emergencyOnly;
  document.getElementById('emergencyFilter')?.classList.toggle('active', emergencyOnly);
  filterHospitals();
}

// ─── DOCTORS PAGE ─────────────────────────────────────────────────────────────
function renderSpecFilterRow(doctors) {
  const specs = ['All', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];
  const row   = document.getElementById('specFilterRow');
  if (!row) return;
  row.innerHTML = specs.map(s => `
    <button class="spec-filter-chip ${s === activeSpec ? 'active' : ''}" data-spec="${s}" onclick="setSpecFilter('${s}')">${s}</button>
  `).join('');
}

function setSpecFilter(spec) {
  activeSpec = spec;
  document.querySelectorAll('.spec-filter-chip').forEach(c => c.classList.toggle('active', c.dataset.spec === spec));
  applyDocFilter();
}

function applyDocFilter() {
  const q = (document.getElementById('doctorSearch')?.value || '').toLowerCase();
  filteredDoctors = allDoctors.filter(d => {
    const matchSpec = activeSpec === 'All' || d.specialization === activeSpec;
    const matchQ    = !q || d.name.toLowerCase().includes(q) || (d.specialization||'').toLowerCase().includes(q) || (d.education||'').toLowerCase().includes(q);
    return matchSpec && matchQ;
  });
  sortDoctorsData();
  renderDoctorsPage();
}

function filterDoctors() { applyDocFilter(); }

function sortDoctors(key, btn) {
  currentSort = key;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  sortDoctorsData();
  renderDoctorsPage();
}

function sortDoctorsData() {
  filteredDoctors.sort((a,b) => {
    if (currentSort === 'rating')     return b.rating - a.rating;
    if (currentSort === 'experience') return b.experience - a.experience;
    if (currentSort === 'fee')        return a.consultation_fee - b.consultation_fee;
    return 0;
  });
}

function renderDoctorsPage() {
  const grid = document.getElementById('doctorsGrid');
  const cnt  = document.getElementById('doc-count');
  if (cnt) cnt.textContent = `${filteredDoctors.length} doctors found`;
  if (!grid) return;
  grid.innerHTML = filteredDoctors.length
    ? filteredDoctors.map(d => doctorCardHTML(d)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#94A3B8;font-size:16px;">No doctors match your search.</div>`;
}

// ─── HOSPITAL DETAIL ──────────────────────────────────────────────────────────
async function openHospital(id) {
  showPage('hospital-detail');
  const el = document.getElementById('hospitalDetailContent');
  el.innerHTML = `<div style="text-align:center;padding:80px"><div class="skeleton-loader" style="height:200px;border-radius:20px;margin-bottom:20px"></div><div class="skeleton-loader" style="height:300px;border-radius:20px"></div></div>`;
  const h = await fetchHospitalById(id);
  if (!h) { el.innerHTML = '<p>Hospital not found.</p>'; return; }
  const facilities = safeParse(h.facilities);
  const doctors    = h.doctors || [];
  el.innerHTML = `
    <div class="detail-hero hospital">
      <div class="detail-hero-top">
        <div class="detail-hero-icon">🏥</div>
        <div>
          <div class="detail-hero-title">${h.name}</div>
          <div class="detail-hero-sub">📍 ${h.address}</div>
          <div class="detail-badges">
            ${h.emergency ? '<span class="badge badge-emergency">🚨 24/7 Emergency</span>' : ''}
            <span class="badge badge-blue">${h.type || 'Hospital'}</span>
          </div>
        </div>
      </div>
      <div class="detail-stat-bar">
        <div class="detail-stat"><span class="detail-stat-val">⭐ ${h.rating}</span><span class="detail-stat-label">Rating</span></div>
        <div class="detail-stat"><span class="detail-stat-val">${h.beds}+</span><span class="detail-stat-label">Beds</span></div>
        <div class="detail-stat"><span class="detail-stat-val">${doctors.length}</span><span class="detail-stat-label">Doctors</span></div>
        <div class="detail-stat"><span class="detail-stat-val">${facilities.length}</span><span class="detail-stat-label">Facilities</span></div>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        ${facilities.length ? `
          <div class="detail-card">
            <h3>🏗️ Facilities &amp; Services</h3>
            <div class="facility-grid">${facilities.map(f => `<span class="facility-tag">✓ ${f}</span>`).join('')}</div>
          </div>` : ''}
        <div class="detail-card">
          <h3>👨‍⚕️ Medical Team <span style="font-size:14px;color:#64748B;font-weight:500">(${doctors.length} specialists)</span></h3>
          <p style="font-size:13px;color:#94A3B8;margin-bottom:16px">Click on any doctor to view their complete profile and schedule.</p>
          <div class="team-list">
            ${doctors.map(doc => {
              const sp  = SPEC_COLORS[doc.specialization] || { bg:'#F1F5F9', text:'#374151', icon:'👤' };
              const did = docId(doc);
              return `<div class="team-row" onclick="openDoctor('${did}')">
                <div class="team-avatar" style="background:${sp.bg}">${sp.icon}</div>
                <div style="flex:1">
                  <div class="team-name">${doc.name}</div>
                  <span class="team-spec" style="background:${sp.bg};color:${sp.text}">${doc.specialization}</span>
                </div>
                <span style="font-size:20px;color:#CBD5E1">›</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="sticky-sidebar">
        <div class="contact-card">
          <h3>📞 Contact Hospital</h3>
          <div class="contact-item"><span class="contact-icon">📍</span><span style="opacity:.8">${h.address}</span></div>
          <div class="contact-item"><span class="contact-icon">📱</span><span style="opacity:.8">${h.phone || 'Not available'}</span></div>
          <div class="contact-item"><span class="contact-icon">🛏</span><span style="opacity:.8">${h.beds} beds available</span></div>
          ${h.emergency ? '<div class="contact-item"><span class="contact-icon">🚨</span><span style="opacity:.8">24/7 Emergency Services</span></div>' : ''}
          <button class="call-btn" onclick="callHospital('${h.phone || ''}')">📞 Call Now</button>
        </div>
      </div>
    </div>`;
}

function callHospital(phone) {
  if (phone) { window.location.href = 'tel:' + phone; showToast('📞 Calling ' + phone + '...'); }
  else showToast('Phone number not available');
}

// ─── DOCTOR DETAIL ────────────────────────────────────────────────────────────
async function openDoctor(id) {
  showPage('doctor-detail');
  const el = document.getElementById('doctorDetailContent');
  el.innerHTML = `<div style="text-align:center;padding:80px"><div class="skeleton-loader" style="height:200px;border-radius:20px;margin-bottom:20px"></div><div class="skeleton-loader" style="height:300px;border-radius:20px"></div></div>`;
  const d = await fetchDoctorById(id);
  if (!d) { el.innerHTML = '<p>Doctor not found.</p>'; return; }
  const sp        = SPEC_COLORS[d.specialization] || { bg:'#EFF6FF', text:'#1E40AF', icon:'👤' };
  const hospitals = d.hospitals || [];  // [{hospital:{…}, visiting_days, timing}]
  const langs     = d.languages || [];
  const stars     = '★'.repeat(Math.floor(d.rating)) + '☆'.repeat(5 - Math.floor(d.rating));
  el.innerHTML = `
    <div class="detail-hero doctor" style="background:linear-gradient(135deg,${sp.text}22 0%,#1E3A5F 40%,#1D4ED8 100%)">
      <div class="detail-hero-top">
        <div class="dc-avatar" style="background:${sp.bg};width:84px;height:84px;border-radius:24px;font-size:44px;flex-shrink:0;">${sp.icon}</div>
        <div>
          <div class="detail-hero-title">${d.name}</div>
          <span class="badge" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:10px;display:inline-flex">${d.specialization}</span>
          <div style="color:rgba(255,255,255,.7);font-size:14px">${d.education}</div>
          <div style="color:#FCD34D;font-size:18px;margin-top:8px">${stars} <span style="color:rgba(255,255,255,.6);font-size:13px">${d.rating} · ${d.reviews_count || 0} reviews</span></div>
        </div>
      </div>
      <div class="detail-stat-bar">
        <div class="detail-stat"><span class="detail-stat-val">${d.experience}+</span><span class="detail-stat-label">Years Exp.</span></div>
        <div class="detail-stat"><span class="detail-stat-val">₹${d.consultation_fee}</span><span class="detail-stat-label">Consult Fee</span></div>
        <div class="detail-stat"><span class="detail-stat-val">${hospitals.length}</span><span class="detail-stat-label">Hospitals</span></div>
        <div class="detail-stat"><span class="detail-stat-val">⭐${d.rating}</span><span class="detail-stat-label">Rating</span></div>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        <div class="detail-card">
          <h3>ℹ️ About</h3>
          <p class="bio-text">${d.bio || 'Experienced specialist dedicated to patient care and clinical excellence.'}</p>
        </div>
        ${langs.length ? `
          <div class="detail-card">
            <h3>🌐 Languages</h3>
            <div class="lang-tags">${langs.map(l => `<span class="lang-tag">${l}</span>`).join('')}</div>
          </div>` : ''}
        <div class="detail-card">
          <h3>🏥 Hospital Visits &amp; Schedule</h3>
          <p style="font-size:13px;color:#94A3B8;margin-bottom:16px">Exact visiting days and consultation hours at each hospital.</p>
          ${hospitals.length ? hospitals.map(slot => {
            const hObj  = slot.hospital || {};
            const hId   = docId(hObj);
            const hName = hObj.name    || 'Hospital';
            const hAddr = hObj.address || '';
            const days  = slot.visiting_days || [];
            const time  = slot.timing || '';
            return `<div class="team-row" onclick="openHospital('${hId}')">
              <div class="team-avatar" style="background:#EFF6FF;font-size:22px">🏥</div>
              <div style="flex:1">
                <div class="team-name">${hName}</div>
                <div style="font-size:12px;color:#94A3B8;margin-bottom:8px">📍 ${hAddr}</div>
                ${days.length ? `<div class="schedule-pill">
                  <span class="day-badge">${days.join(' · ')}</span>
                  <span class="time-badge">⏰ ${time}</span>
                </div>` : ''}
              </div>
              <span style="font-size:20px;color:#CBD5E1">›</span>
            </div>`;
          }).join('') : '<p style="color:#94A3B8">No hospital schedule available.</p>'}
        </div>
      </div>
      <div class="sticky-sidebar">
        <div class="contact-card">
          <h3>📞 Contact Doctor</h3>
          <div class="contact-item"><span class="contact-icon">🎓</span><span style="opacity:.8;font-size:13px">${d.education}</span></div>
          <div class="contact-item"><span class="contact-icon">💰</span><span style="opacity:.8">₹${d.consultation_fee} per consultation</span></div>
          <div class="contact-item"><span class="contact-icon">📱</span><span style="opacity:.8">${d.phone || 'Contact via hospital'}</span></div>
          <div class="contact-item"><span class="contact-icon">🏥</span><span style="opacity:.8">Visits ${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''}</span></div>
          <button class="call-btn" onclick="callDoctor('${d.phone || ''}')">📞 Call Now</button>
        </div>
      </div>
    </div>`;
}

function callDoctor(phone) {
  if (phone) { window.location.href = 'tel:' + phone; showToast('📞 Calling ' + phone + '...'); }
  else showToast('Contact via hospital reception');
}

// ─── HERO SEARCH ──────────────────────────────────────────────────────────────
function handleHeroSearch() {
  const q = document.getElementById('heroSearch').value.trim();
  if (q) {
    document.getElementById('doctorSearch').value = q;
    showPage('doctors');
    applyDocFilter();
  } else {
    showPage('doctors');
  }
}

window.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('heroSearch') === document.activeElement) handleHeroSearch();
});

// ─── HAVERSINE DISTANCE (client-side, km) ─────────────────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat2 == null || lon2 == null) return Infinity;
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── AREA → COORDINATES MAP ───────────────────────────────────────────────────
const AREA_MAP = [
  // ── Mumbai ──────────────────────────────────────────────────────────────
  { name: 'Bandra',        city: 'Mumbai',    lat: 19.0596, lng: 72.8295, emoji: '🌊' },
  { name: 'Chembur',       city: 'Mumbai',    lat: 19.0622, lng: 72.9005, emoji: '🏙️' },
  { name: 'Andheri',       city: 'Mumbai',    lat: 19.1136, lng: 72.8697, emoji: '✈️' },
  { name: 'Juhu',          city: 'Mumbai',    lat: 19.0988, lng: 72.8265, emoji: '🏖️' },
  { name: 'Dadar',         city: 'Mumbai',    lat: 19.0186, lng: 72.8434, emoji: '🚆' },
  { name: 'Mahim',         city: 'Mumbai',    lat: 19.0388, lng: 72.8407, emoji: '⛪' },
  { name: 'Parel',         city: 'Mumbai',    lat: 18.9985, lng: 72.8374, emoji: '🏭' },
  { name: 'Vile Parle',    city: 'Mumbai',    lat: 19.0990, lng: 72.8478, emoji: '🏘️' },
  { name: 'Malad',         city: 'Mumbai',    lat: 19.1871, lng: 72.8484, emoji: '🌆' },
  { name: 'Borivali',      city: 'Mumbai',    lat: 19.2288, lng: 72.8566, emoji: '🌳' },
  { name: 'Powai',         city: 'Mumbai',    lat: 19.1197, lng: 72.9052, emoji: '🏞️' },
  { name: 'Colaba',        city: 'Mumbai',    lat: 18.9067, lng: 72.9144, emoji: '🌃' },
  { name: 'Worli',         city: 'Mumbai',    lat: 18.9964, lng: 72.8178, emoji: '🌉' },
  { name: 'Ghatkopar',     city: 'Mumbai',    lat: 19.0869, lng: 72.9110, emoji: '🔗' },
  { name: 'Mulund',        city: 'Mumbai',    lat: 19.1766, lng: 72.9590, emoji: '🍃' },
  { name: 'Thane',         city: 'Mumbai',    lat: 19.2183, lng: 72.9780, emoji: '🌁' },
  // ── Delhi/NCR ───────────────────────────────────────────────────────────
  { name: 'Connaught Place', city: 'Delhi',   lat: 28.6315, lng: 77.2167, emoji: '🏛️' },
  { name: 'Saket',         city: 'Delhi',     lat: 28.5274, lng: 77.2167, emoji: '🛍️' },
  { name: 'Lajpat Nagar',  city: 'Delhi',     lat: 28.5680, lng: 77.2435, emoji: '🏪' },
  { name: 'Noida Sector 62',city: 'Noida',   lat: 28.6272, lng: 77.3712, emoji: '🏢' },
  { name: 'Gurugram',      city: 'Haryana',   lat: 28.4595, lng: 77.0266, emoji: '🌐' },
  { name: 'Dwarka',        city: 'Delhi',     lat: 28.5921, lng: 77.0460, emoji: '🏙️' },
  // ── Bangalore ───────────────────────────────────────────────────────────
  { name: 'Koramangala',   city: 'Bangalore', lat: 12.9352, lng: 77.6245, emoji: '☕' },
  { name: 'Indiranagar',   city: 'Bangalore', lat: 12.9784, lng: 77.6408, emoji: '🍻' },
  { name: 'Whitefield',    city: 'Bangalore', lat: 12.9698, lng: 77.7499, emoji: '💻' },
  { name: 'HSR Layout',    city: 'Bangalore', lat: 12.9116, lng: 77.6389, emoji: '🏡' },
  { name: 'HAL Airport Rd',city: 'Bangalore', lat: 12.9592, lng: 77.6489, emoji: '🛫' },
  // ── Chennai ─────────────────────────────────────────────────────────────
  { name: 'Greams Lane',   city: 'Chennai',   lat: 13.0628, lng: 80.2414, emoji: '🏥' },
  { name: 'Anna Nagar',    city: 'Chennai',   lat: 13.0850, lng: 80.2101, emoji: '🌴' },
  { name: 'Vellore',       city: 'Tamil Nadu',lat: 12.9316, lng: 79.1334, emoji: '🎓' },
  // ── Hyderabad ───────────────────────────────────────────────────────────
  { name: 'Banjara Hills', city: 'Hyderabad', lat: 17.4156, lng: 78.4484, emoji: '⛰️' },
  { name: 'Hitech City',   city: 'Hyderabad', lat: 17.4454, lng: 78.3763, emoji: '🖥️' },
];

// Popular areas to show as quick chips on the home page
const FEATURED_AREAS = [
  'Bandra','Chembur','Andheri','Juhu','Dadar',
  'Saket','Gurugram','Koramangala','Greams Lane','Vellore',
];

// ─── AREA SEARCH STATE ────────────────────────────────────────────────────────
let activeAreaFilter = null;  // { name, lat, lng, radius }

function areaLookup(query) {
  const q = query.toLowerCase().trim();
  return AREA_MAP.filter(a =>
    a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)
  );
}

// ─── AREA AUTOCOMPLETE ────────────────────────────────────────────────────────
function onAreaInput(e) {
  const val = e.target.value;
  const suggestions = document.getElementById('areaSuggestions');
  if (!val || val.length < 2) { suggestions.style.display = 'none'; return; }

  const matches = areaLookup(val).slice(0, 7);
  if (!matches.length) { suggestions.style.display = 'none'; return; }

  suggestions.innerHTML = matches.map(a => `
    <div class="area-suggestion-item" onmousedown="selectAreaSuggestion('${a.name}')">
      <span class="ас-emoji">${a.emoji}</span>
      <div>
        <div class="as-name">${a.name}</div>
        <div class="as-city">${a.city}</div>
      </div>
    </div>`).join('');
  suggestions.style.display = 'block';
}

function onAreaKeydown(e) {
  if (e.key === 'Enter') {
    const val = e.target.value.trim();
    if (val) triggerAreaSearch(val);
    document.getElementById('areaSuggestions').style.display = 'none';
  }
  if (e.key === 'Escape') {
    document.getElementById('areaSuggestions').style.display = 'none';
  }
}

function selectAreaSuggestion(name) {
  document.getElementById('areaSearchInput').value = name;
  document.getElementById('areaSuggestions').style.display = 'none';
  triggerAreaSearch(name);
}

function triggerAreaSearch(query) {
  const matches = areaLookup(query);
  if (!matches.length) {
    showToast('📍 Area not found. Try: Bandra, Andheri, Saket…', 'error');
    return;
  }
  searchByArea(matches[0]);
}

function searchAreaFromInput() {
  const inp = document.getElementById('areaSearchInput');
  const val = inp ? inp.value.trim() : '';
  if (val) triggerAreaSearch(val);
  else showToast('📍 Please type an area name first', 'error');
}

// ─── SEARCH BY AREA ───────────────────────────────────────────────────────────
function searchByArea(area, radius = 25) {
  activeAreaFilter = { ...area, radius };

  // Update the input label
  const inp = document.getElementById('areaSearchInput');
  if (inp) inp.value = area.name;

  // Update active chip UI
  document.querySelectorAll('.area-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.area === area.name);
  });

  // Filter allDoctors by haversine distance from area centre
  filteredDoctors = allDoctors.filter(d => {
    const dist = haversineDistance(area.lat, area.lng, d.latitude, d.longitude);
    return dist <= radius;
  });

  // Sort by distance
  filteredDoctors.sort((a, b) => {
    const da = haversineDistance(area.lat, area.lng, a.latitude, a.longitude);
    const db = haversineDistance(area.lat, area.lng, b.latitude, b.longitude);
    return da - db;
  });

  // Reset spec filter
  activeSpec = 'All';
  document.querySelectorAll('.spec-filter-chip').forEach(c => c.classList.toggle('active', c.dataset.spec === 'All'));

  // Navigate to doctors page with area banner
  showPage('doctors');
  renderAreaBanner(area, radius, filteredDoctors.length);
  renderSpecFilterRow(filteredDoctors);
  renderDoctorsPage();

  showToast(`📍 Showing doctors near ${area.name}`, 'success');
}

function clearAreaFilter() {
  activeAreaFilter = null;
  if (document.getElementById('areaSearchInput')) {
    document.getElementById('areaSearchInput').value = '';
  }
  document.querySelectorAll('.area-chip').forEach(c => c.classList.remove('active'));
  filteredDoctors = [...allDoctors];
  document.getElementById('areaBanner')?.remove();
  renderSpecFilterRow(allDoctors);
  sortDoctorsData();
  renderDoctorsPage();
}

function renderAreaBanner(area, radius, count) {
  // Remove old banner if exists
  document.getElementById('areaBanner')?.remove();
  const container = document.getElementById('doctorAreaBannerHost');
  if (!container) return;
  const banner = document.createElement('div');
  banner.id = 'areaBanner';
  banner.className = 'area-banner';
  banner.innerHTML = `
    <span class="area-banner-emoji">${area.emoji}</span>
    <div class="area-banner-info">
      <span class="area-banner-title">Doctors near <strong>${area.name}</strong></span>
      <span class="area-banner-sub">${area.city} · within ${radius} km · ${count} doctor${count !== 1 ? 's' : ''} found</span>
    </div>
    <button class="area-banner-clear" onclick="clearAreaFilter()">✕ Clear</button>
  `;
  container.prepend(banner);
}

// ─── RENDER AREA SECTION (Home page) ────────────────────────────────────────
function renderAreaSection() {
  const grid = document.getElementById('areaChipGrid');
  if (!grid) return;
  const featured = AREA_MAP.filter(a => FEATURED_AREAS.includes(a.name));
  grid.innerHTML = featured.map((a, i) => `
    <button class="area-chip" data-area="${a.name}" data-idx="${AREA_MAP.indexOf(a)}"
      onclick="searchByAreaIndex(this.dataset.idx)">
      <span class="area-chip-emoji">${a.emoji}</span>
      <span class="area-chip-name">${a.name}</span>
      <span class="area-chip-city">${a.city}</span>
    </button>
  `).join('');
}

// Safe accessor for chip onclick — avoids passing JSON through HTML attributes
function searchByAreaIndex(idx) {
  const area = AREA_MAP[parseInt(idx, 10)];
  if (area) searchByArea(area);
}


// ─── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  updateNavAuth();
  // Close modal on backdrop click
  document.getElementById('authModal')?.addEventListener('click', e => {
    if (e.target.id === 'authModal') closeAuthModal();
  });
  // Close area suggestions on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.area-search-wrap')) {
      document.getElementById('areaSuggestions')?.style && (document.getElementById('areaSuggestions').style.display = 'none');
    }
  });
  try {
    const [hospitals, doctors] = await Promise.all([fetchHospitals(), fetchDoctors()]);
    renderSpecGrid(doctors);
    renderFeaturedHospitals(hospitals);
    renderFeaturedDoctors(doctors);
    renderAreaSection();
    renderHospitalsPage();
    renderSpecFilterRow(doctors);
    sortDoctorsData();
    renderDoctorsPage();
    document.getElementById('stat-doctors').textContent   = doctors.length + '+';
    document.getElementById('stat-hospitals').textContent = hospitals.length;
  } catch(err) {
    console.error('API error:', err);
    document.getElementById('featuredHospitals').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#DC2626">⚠️ Could not load data. Is the backend running on port 5000?</div>`;
    document.getElementById('featuredDoctors').innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', init);
