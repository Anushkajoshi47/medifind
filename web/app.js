const API = 'http://localhost:5000/api';

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
  { name:'Cardiologist',        icon:'❤️', cls:'sc-cardio' },
  { name:'Neurologist',         icon:'🧠', cls:'sc-neuro' },
  { name:'Orthopedist',         icon:'🦴', cls:'sc-ortho' },
  { name:'Dermatologist',       icon:'🌿', cls:'sc-derm' },
  { name:'Gastroenterologist',  icon:'🍃', cls:'sc-gen' },
  { name:'Pediatrician',        icon:'👶', cls:'sc-cardio' },
  { name:'Pulmonologist',       icon:'🫁', cls:'sc-neuro' },
  { name:'Gynecologist',        icon:'👩‍⚕️', cls:'sc-derm' },
  { name:'Psychiatrist',        icon:'🧘', cls:'sc-ortho' },
  { name:'Ophthalmologist',     icon:'👁️', cls:'sc-derm' },
  { name:'ENT Specialist',      icon:'👂', cls:'sc-gen' },
  { name:'Endocrinologist',     icon:'⚗️', cls:'sc-neuro' },
  { name:'General Physician',   icon:'🩺', cls:'sc-gen' },
  { name:'Dentist',             icon:'🦷', cls:'sc-cardio' },
  { name:'Oncologist',          icon:'🎗️', cls:'sc-ortho' },
  { name:'Urologist',           icon:'🔬', cls:'sc-neuro' },
];

// ---- HELPERS ----
function safeParse(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

// State
let allHospitals = [];
let allDoctors = [];
let filteredDoctors = [];
let filteredHospitals = [];
let emergencyOnly = false;
let activeSpec = 'All';
let currentSort = 'rating';
let prevPage = 'home';

// ---- NAV ----
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
  const cur = [...document.querySelectorAll('.page.active')].map(p=>p.id.replace('page-',''))[0];
  showPage(map[cur] || 'home');
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ---- TOAST ----
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ---- FETCH ----
async function fetchHospitals() {
  const res = await fetch(`${API}/hospitals`);
  const data = await res.json();
  allHospitals = data.data || [];
  filteredHospitals = [...allHospitals];
  return allHospitals;
}

async function fetchDoctors() {
  // Build doctor list from recommendations API with broad symptoms
  const body = { symptoms: ['Headache','Fever','Chest Pain','Back Pain','Anxiety'], latitude:19.076, longitude:72.8777, radius:9999 };
  const res = await fetch(`${API}/doctors/recommend`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const data = await res.json();
  allDoctors = data.data?.doctors || [];
  filteredDoctors = [...allDoctors];
  return allDoctors;
}

async function fetchHospitalById(id) {
  const res = await fetch(`${API}/hospitals/${id}`);
  const data = await res.json();
  return data.data;
}

async function fetchDoctorById(id) {
  const res = await fetch(`${API}/doctors/${id}`);
  const data = await res.json();
  return data.data;
}

// ---- SPEC GRID (home) ----
function renderSpecGrid(doctors) {
  const counts = {};
  doctors.forEach(d => { counts[d.specialization] = (counts[d.specialization]||0)+1; });
  const grid = document.getElementById('specGrid');
  if (!grid) return;
  grid.innerHTML = SPEC_META.map(s => `
    <div class="spec-card ${s.cls}" onclick="filterBySpec('${s.name}')">
      <span class="spec-icon">${s.icon}</span>
      <div class="spec-name">${s.name}</div>
      <div class="spec-count">${counts[s.name]||0} doctor${counts[s.name]===1?'':'s'}</div>
    </div>
  `).join('');
}

function filterBySpec(spec) {
  showPage('doctors');
  activeSpec = spec;
  applyDocFilter();
  // highlight the right chip
  document.querySelectorAll('.spec-filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.spec === spec);
  });
}

// ---- FEATURED HOSPITALS ----
function renderFeaturedHospitals(hospitals) {
  const el = document.getElementById('featuredHospitals');
  if (!el) return;
  el.innerHTML = hospitals.slice(0,3).map(h => hospitalCardHTML(h)).join('');
}

// ---- FEATURED DOCTORS ----
function renderFeaturedDoctors(doctors) {
  const el = document.getElementById('featuredDoctors');
  if (!el) return;
  const sorted = [...doctors].sort((a,b) => b.rating-a.rating).slice(0,4);
  el.innerHTML = sorted.map(d => doctorCardHTML(d)).join('');
}

// ---- HOSPITAL CARD HTML ----
function hospitalCardHTML(h) {
  const facilities = safeParse(h.facilities);
  const doctors = h.doctors||[];
  return `
    <div class="hospital-card" onclick="openHospital('${h.id}')">
      <div class="hospital-card-hero">
        <span class="hospital-card-icon">🏥</span>
        <div class="hospital-card-hero-info">
          <div class="hospital-card-name">${h.name}</div>
          <div class="hospital-card-type">${h.type||'Hospital'}</div>
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
            ${facilities.slice(0,4).map(f=>`<span class="facility-chip">${f}</span>`).join('')}
            ${facilities.length>4 ? `<span class="facility-chip">+${facilities.length-4}</span>`:''}
          </div>` : ''}
        ${doctors.length ? `
          <div class="doctors-preview">
            <div class="doctors-preview-title">👨‍⚕️ MEDICAL TEAM · ${doctors.length} DOCTORS</div>
            <div class="doctor-mini-list">
              ${doctors.slice(0,3).map(d => {
                const sp = SPEC_COLORS[d.specialization]||{bg:'#F1F5F9',icon:'👤'};
                return `<div class="doctor-mini">
                  <div class="doctor-mini-avatar" style="background:${sp.bg}">${sp.icon}</div>
                  <div>
                    <div class="doctor-mini-name">${d.name}</div>
                    <div class="doctor-mini-spec">${d.specialization}</div>
                  </div>
                </div>`;
              }).join('')}
              ${doctors.length>3 ? `<div class="more-docs">+${doctors.length-3} more specialists</div>` : ''}
            </div>
          </div>` : ''}
      </div>
      <div class="hospital-card-footer">
        <span class="view-link">View Full Profile <span>→</span></span>
      </div>
    </div>`;
}

// ---- DOCTOR CARD HTML ----
function doctorCardHTML(d) {
  const sp = SPEC_COLORS[d.specialization]||{bg:'#F1F5F9',text:'#374151',icon:'👤'};
  const hospitals = d.hospitals||[];
  return `
    <div class="doctor-card" onclick="openDoctor('${d.id}')">
      <div class="doctor-card-top">
        <div class="dc-avatar" style="background:${sp.bg}">${sp.icon}</div>
        <div style="flex:1;min-width:0">
          <div class="dc-name">${d.name}</div>
          <span class="dc-spec" style="background:${sp.bg};color:${sp.text}">${d.specialization}</span>
          <div class="dc-edu">${d.education||''}</div>
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
          ${hospitals.slice(0,2).map(h => {
            const dh = h.DoctorHospital||{};
            return `<div class="dc-hospital-chip">
              <span class="dc-hospital-name">${h.name}</span>
              <span>·</span>
              <span class="dc-hospital-days">${(dh.visiting_days||[]).join(', ')}</span>
              <span class="dc-hospital-time">${dh.timing||''}</span>
            </div>`;
          }).join('')}
          ${hospitals.length>2?`<div style="font-size:11px;color:#059669;font-weight:600;padding:0 10px;">+${hospitals.length-2} more hospitals</div>`:''}
        </div>` : ''}
      <div class="doctor-card-footer">
        <span style="font-size:13px;color:#64748B;">₹${d.consultation_fee} / visit · ${d.reviews_count||0} reviews</span>
        <span class="view-link">View →</span>
      </div>
    </div>`;
}

// ---- HOSPITALS PAGE ----
function renderHospitalsPage() {
  const grid = document.getElementById('hospitalsGrid');
  const cnt = document.getElementById('hos-count');
  if (!grid) return;
  if (cnt) cnt.textContent = `${filteredHospitals.length} hospitals found`;
  grid.innerHTML = filteredHospitals.length
    ? filteredHospitals.map(h => hospitalCardHTML(h)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#94A3B8;font-size:16px;">No hospitals match your search.</div>`;
}

function filterHospitals() {
  const q = (document.getElementById('hospitalSearch')?.value||'').toLowerCase();
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

// ---- DOCTORS PAGE ----
function renderSpecFilterRow(doctors) {
  const specs = ['All', ...new Set(doctors.map(d=>d.specialization).filter(Boolean))];
  const row = document.getElementById('specFilterRow');
  if (!row) return;
  row.innerHTML = specs.map(s => `
    <button class="spec-filter-chip ${s===activeSpec?'active':''}" data-spec="${s}" onclick="setSpecFilter('${s}')">${s}</button>
  `).join('');
}

function setSpecFilter(spec) {
  activeSpec = spec;
  document.querySelectorAll('.spec-filter-chip').forEach(c => c.classList.toggle('active', c.dataset.spec===spec));
  applyDocFilter();
}

function applyDocFilter() {
  const q = (document.getElementById('doctorSearch')?.value||'').toLowerCase();
  filteredDoctors = allDoctors.filter(d => {
    const matchSpec = activeSpec==='All' || d.specialization===activeSpec;
    const matchQ = !q || d.name.toLowerCase().includes(q) || (d.specialization||'').toLowerCase().includes(q) || (d.education||'').toLowerCase().includes(q);
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
    if (currentSort==='rating') return b.rating-a.rating;
    if (currentSort==='experience') return b.experience-a.experience;
    if (currentSort==='fee') return a.consultation_fee-b.consultation_fee;
    return 0;
  });
}

function renderDoctorsPage() {
  const grid = document.getElementById('doctorsGrid');
  const cnt = document.getElementById('doc-count');
  if (cnt) cnt.textContent = `${filteredDoctors.length} doctors found`;
  if (!grid) return;
  grid.innerHTML = filteredDoctors.length
    ? filteredDoctors.map(d => doctorCardHTML(d)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#94A3B8;font-size:16px;">No doctors match your search.</div>`;
}

// ---- HOSPITAL DETAIL ----
async function openHospital(id) {
  showPage('hospital-detail');
  const el = document.getElementById('hospitalDetailContent');
  el.innerHTML = `<div style="text-align:center;padding:80px"><div class="skeleton-loader" style="height:200px;border-radius:20px;margin-bottom:20px"></div><div class="skeleton-loader" style="height:300px;border-radius:20px"></div></div>`;
  const h = await fetchHospitalById(id);
  if (!h) { el.innerHTML='<p>Hospital not found.</p>'; return; }
  const facilities = safeParse(h.facilities);
  const doctors = h.doctors||[];
  el.innerHTML = `
    <div class="detail-hero hospital">
      <div class="detail-hero-top">
        <div class="detail-hero-icon">🏥</div>
        <div>
          <div class="detail-hero-title">${h.name}</div>
          <div class="detail-hero-sub">📍 ${h.address}</div>
          <div class="detail-badges">
            ${h.emergency?'<span class="badge badge-emergency">🚨 24/7 Emergency</span>':''}
            <span class="badge badge-blue">${h.type||'Hospital'}</span>
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
        ${facilities.length?`
          <div class="detail-card">
            <h3>🏗️ Facilities & Services</h3>
            <div class="facility-grid">${facilities.map(f=>`<span class="facility-tag">✓ ${f}</span>`).join('')}</div>
          </div>`:''}
        <div class="detail-card">
          <h3>👨‍⚕️ Medical Team <span style="font-size:14px;color:#64748B;font-weight:500">(${doctors.length} specialists)</span></h3>
          <p style="font-size:13px;color:#94A3B8;margin-bottom:16px">Click on any doctor to view their complete profile and schedule.</p>
          <div class="team-list">
            ${doctors.map(doc => {
              const sp = SPEC_COLORS[doc.specialization]||{bg:'#F1F5F9',text:'#374151',icon:'👤'};
              const dh = doc.DoctorHospital||{};
              const days = dh.visiting_days||[];
              return `<div class="team-row" onclick="openDoctor('${doc.id}')">
                <div class="team-avatar" style="background:${sp.bg}">${sp.icon}</div>
                <div style="flex:1">
                  <div class="team-name">${doc.name}</div>
                  <span class="team-spec" style="background:${sp.bg};color:${sp.text}">${doc.specialization}</span>
                  ${days.length?`<div class="schedule-pill">
                    <span class="day-badge">${days.join(' · ')}</span>
                    <span class="time-badge">⏰ ${dh.timing||''}</span>
                  </div>`:''}
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
          <div class="contact-item"><span class="contact-icon">📱</span><span style="opacity:.8">${h.phone||'Not available'}</span></div>
          <div class="contact-item"><span class="contact-icon">🛏</span><span style="opacity:.8">${h.beds} beds available</span></div>
          ${h.emergency?'<div class="contact-item"><span class="contact-icon">🚨</span><span style="opacity:.8">24/7 Emergency Services</span></div>':''}
          <button class="call-btn" onclick="callHospital('${h.phone||''}')">📞 Call Now</button>
        </div>
      </div>
    </div>`;
}

function callHospital(phone) {
  if (phone) { window.location.href = 'tel:'+phone; showToast('📞 Calling '+phone+'...'); }
  else showToast('Phone number not available');
}

// ---- DOCTOR DETAIL ----
async function openDoctor(id) {
  showPage('doctor-detail');
  const el = document.getElementById('doctorDetailContent');
  el.innerHTML = `<div style="text-align:center;padding:80px"><div class="skeleton-loader" style="height:200px;border-radius:20px;margin-bottom:20px"></div><div class="skeleton-loader" style="height:300px;border-radius:20px"></div></div>`;
  const d = await fetchDoctorById(id);
  if (!d) { el.innerHTML='<p>Doctor not found.</p>'; return; }
  const sp = SPEC_COLORS[d.specialization]||{bg:'#EFF6FF',text:'#1E40AF',icon:'👤'};
  const hospitals = d.hospitals||[];
  const langs = d.languages||[];
  const stars = '★'.repeat(Math.floor(d.rating)) + '☆'.repeat(5-Math.floor(d.rating));
  el.innerHTML = `
    <div class="detail-hero doctor" style="background:linear-gradient(135deg,${sp.text}22 0%,#1E3A5F 40%,#1D4ED8 100%)">
      <div class="detail-hero-top">
        <div class="dc-avatar" style="background:${sp.bg};width:84px;height:84px;border-radius:24px;font-size:44px;flex-shrink:0;">${sp.icon}</div>
        <div>
          <div class="detail-hero-title">${d.name}</div>
          <span class="badge" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:10px;display:inline-flex">${d.specialization}</span>
          <div style="color:rgba(255,255,255,.7);font-size:14px">${d.education}</div>
          <div style="color:#FCD34D;font-size:18px;margin-top:8px">${stars} <span style="color:rgba(255,255,255,.6);font-size:13px">${d.rating} · ${d.reviews_count||0} reviews</span></div>
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
          <p class="bio-text">${d.bio||'Experienced specialist dedicated to patient care and clinical excellence.'}</p>
        </div>
        ${langs.length?`
          <div class="detail-card">
            <h3>🌐 Languages</h3>
            <div class="lang-tags">${langs.map(l=>`<span class="lang-tag">${l}</span>`).join('')}</div>
          </div>`:''}
        <div class="detail-card">
          <h3>🏥 Hospital Visits & Schedule</h3>
          <p style="font-size:13px;color:#94A3B8;margin-bottom:16px">Exact visiting days and consultation hours at each hospital.</p>
          ${hospitals.length ? hospitals.map(h => {
            const dh = h.DoctorHospital||{};
            return `<div class="team-row" onclick="openHospital('${h.id}')">
              <div class="team-avatar" style="background:#EFF6FF;font-size:22px">🏥</div>
              <div style="flex:1">
                <div class="team-name">${h.name}</div>
                <div style="font-size:12px;color:#94A3B8;margin-bottom:8px">📍 ${h.address}</div>
                ${dh.visiting_days?.length?`<div class="schedule-pill">
                  <span class="day-badge">${dh.visiting_days.join(' · ')}</span>
                  <span class="time-badge">⏰ ${dh.timing||''}</span>
                </div>`:''}
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
          <div class="contact-item"><span class="contact-icon">📱</span><span style="opacity:.8">${d.phone||'Contact via hospital'}</span></div>
          <div class="contact-item"><span class="contact-icon">🏥</span><span style="opacity:.8">Visits ${hospitals.length} hospital${hospitals.length!==1?'s':''}</span></div>
          <button class="call-btn" onclick="callDoctor('${d.phone||''}')">📞 Call Now</button>
        </div>
      </div>
    </div>`;
}

function callDoctor(phone) {
  if (phone) { window.location.href = 'tel:'+phone; showToast('📞 Calling '+phone+'...'); }
  else showToast('Contact via hospital reception');
}

// ---- HERO SEARCH ----
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
  if (e.key==='Enter' && document.getElementById('heroSearch')===document.activeElement) handleHeroSearch();
});

// ---- INIT ----
async function init() {
  try {
    const [hospitals, doctors] = await Promise.all([fetchHospitals(), fetchDoctors()]);
    // Home page
    renderSpecGrid(doctors);
    renderFeaturedHospitals(hospitals);
    renderFeaturedDoctors(doctors);
    // Hospitals page
    renderHospitalsPage();
    // Doctors page
    renderSpecFilterRow(doctors);
    sortDoctorsData();
    renderDoctorsPage();
    // Update stats
    document.getElementById('stat-doctors').textContent = doctors.length+'+';
    document.getElementById('stat-hospitals').textContent = hospitals.length;
  } catch(err) {
    console.error('API error:', err);
    document.getElementById('featuredHospitals').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#DC2626">⚠️ Could not load data. Is the backend running on port 5000?</div>`;
    document.getElementById('featuredDoctors').innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', init);
