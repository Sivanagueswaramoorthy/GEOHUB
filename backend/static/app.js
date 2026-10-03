const API_BASE = '/api';

// Current active session state
let currentUser = {
  id: 'usr_super_admin_01',
  name: 'Dr. Faculty Advisor',
  email: 'advisor@college.edu',
  role: 'super_admin',
  team: 'Management',
  is_volunteer: true,
};

let qrCodeInstance = null;
let qrTimerInterval = null;
let currentEventList = [];

// Initialize app on load
window.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  loadEvents();
  loadTeams();
  loadTasks();
});

// Switch Tab
function switchTab(tabId) {
  document.querySelectorAll('.content-tab').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.style.display = 'block';

  const navItem = document.getElementById(`nav-${tabId}`);
  if (navItem) navItem.classList.add('active');

  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'events') loadEvents();
  if (tabId === 'teams') loadTeams();
  if (tabId === 'tasks') loadTasks();
  if (tabId === 'qr') populateQrEventSelectors();
}

// Modal management
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Load Dashboard Stats
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return;
    const stats = await res.json();

    document.getElementById('stat-members').innerText = stats.total_members;
    document.getElementById('stat-events').innerText = stats.total_events;
    document.getElementById('stat-checkins').innerText = stats.total_check_ins;
    document.getElementById('stat-volunteers').innerText = stats.total_volunteers;

    // Render department bars
    const barsContainer = document.getElementById('department-bars');
    barsContainer.innerHTML = '';
    for (const [team, count] of Object.entries(stats.team_member_counts || {})) {
      const percentage = stats.total_members > 0 ? (count / stats.total_members) * 100 : 0;
      barsContainer.innerHTML += `
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px; font-size: 13px;">
            <span>${team}</span>
            <span style="color: var(--text-muted);">${count} members (${percentage.toFixed(0)}%)</span>
          </div>
          <div style="background: rgba(255,255,255,0.06); height: 8px; border-radius: 4px; overflow:hidden;">
            <div style="background: var(--primary); height: 100%; width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    }
  } catch (e) {
    console.error('Failed to load dashboard:', e);
  }
}

// Load Events
async function loadEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    currentEventList = await res.json();

    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';

    if (currentEventList.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">No events scheduled. Create one above!</div>';
      return;
    }

    currentEventList.forEach(event => {
      const dateFormatted = new Date(event.date_time).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      grid.innerHTML += `
        <div class="card">
          <div class="card-header">
            <span class="badge badge-${event.status}">${event.status}</span>
            <span style="font-size: 12px; color: var(--secondary); font-weight: 600;">${event.type}</span>
          </div>
          <h3 style="margin-bottom: 8px;">${event.title}</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 12px;">${event.description || 'Club event'}</p>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
            <div>📍 ${event.venue}</div>
            <div style="margin-top: 4px;">🕒 ${dateFormatted}</div>
            <div style="margin-top: 4px;">🎟️ ${event.attendance_count} Checked-In</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline" style="flex: 1;" onclick="registerForEvent('${event.id}')">
              Register
            </button>
            <button class="btn btn-primary" style="flex: 1;" onclick="showEventQr('${event.id}')">
              Show QR
            </button>
          </div>
        </div>
      `;
    });
  } catch (e) {
    console.error('Failed to load events:', e);
  }
}

// Load Teams
async function loadTeams() {
  try {
    const res = await fetch(`${API_BASE}/teams`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const teams = await res.json();

    const grid = document.getElementById('teams-grid');
    grid.innerHTML = '';

    teams.forEach(team => {
      grid.innerHTML += `
        <div class="card">
          <h3 style="margin-bottom: 6px;">${team.name}</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">${team.description}</p>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            <div>👥 Members: <strong>${team.member_user_ids.length}</strong></div>
            <div style="margin-top: 4px;">⭐ Admins: <strong>${team.admin_user_ids.length}</strong></div>
          </div>
          <button class="btn btn-outline" style="width: 100%;" onclick="openModal('join-team-modal')">
            Apply to ${team.name}
          </button>
        </div>
      `;
    });
  } catch (e) {
    console.error('Failed to load teams:', e);
  }
}

// Load Tasks
async function loadTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks?scope=all`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const tasks = await res.json();

    const grid = document.getElementById('tasks-grid');
    grid.innerHTML = '';

    if (tasks.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">No tasks assigned. Create one above!</div>';
      return;
    }

    tasks.forEach(task => {
      const deadline = new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      grid.innerHTML += `
        <div class="card">
          <div class="card-header">
            <span class="badge badge-${task.status}">${task.status}</span>
            <span style="font-size: 12px; color: var(--secondary); font-weight: 600;">${task.team_id}</span>
          </div>
          <h3 style="margin-bottom: 6px;">${task.title}</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 14px;">${task.description || 'Deliverable'}</p>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
            📅 Due: <strong>${deadline}</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline" style="flex: 1; font-size: 12px;" onclick="updateTaskStatus('${task.id}', 'in_progress')">
              In Progress
            </button>
            <button class="btn btn-success" style="flex: 1; font-size: 12px;" onclick="updateTaskStatus('${task.id}', 'done')">
              Mark Done
            </button>
          </div>
        </div>
      `;
    });
  } catch (e) {
    console.error('Failed to load tasks:', e);
  }
}

// Smart QR Attendance
function populateQrEventSelectors() {
  const s1 = document.getElementById('qr-event-selector');
  const s2 = document.getElementById('scanner-event-selector');

  s1.innerHTML = '<option value="">Select Event...</option>';
  s2.innerHTML = '<option value="">Select Event...</option>';

  currentEventList.forEach(e => {
    s1.innerHTML += `<option value="${e.id}">${e.title}</option>`;
    s2.innerHTML += `<option value="${e.id}">${e.title}</option>`;
  });
}

function showEventQr(eventId) {
  switchTab('qr');
  document.getElementById('qr-event-selector').value = eventId;
  generateQrToken();
}

async function generateQrToken() {
  const eventId = document.getElementById('qr-event-selector').value;
  if (!eventId) {
    alert('Please select an event first!');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/qr/generate`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || 'Could not generate QR');
      return;
    }

    // Render QR Code using QRCode.js
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    qrCodeInstance = new QRCode(qrDiv, {
      text: data.token,
      width: 200,
      height: 200,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
    });

    // Populate token into simulator scanner for fast one-click testing!
    document.getElementById('scanner-event-selector').value = eventId;
    document.getElementById('scanner-token-input').value = data.token;

    // Start countdown
    let secondsLeft = 60;
    const timerText = document.getElementById('qr-timer-text');
    clearInterval(qrTimerInterval);
    qrTimerInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(qrTimerInterval);
        timerText.innerText = 'Token Expired - Click Generate Fresh QR';
        timerText.style.background = '#fee2e2';
        timerText.style.color = '#ef4444';
      } else {
        timerText.innerText = `Expires in ${secondsLeft}s (Token: ${data.token})`;
      }
    }, 1000);

  } catch (e) {
    alert('Error generating QR token: ' + e);
  }
}

async function verifyScannedToken() {
  const eventId = document.getElementById('scanner-event-selector').value;
  const token = document.getElementById('scanner-token-input').value;
  const feedback = document.getElementById('scan-feedback');

  if (!eventId || !token) {
    feedback.innerHTML = '<span style="color: var(--danger)">Please select an event and provide a token code.</span>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/qr/verify`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, token: token.trim() })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      feedback.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success); padding: 12px; border-radius: 10px; color: #34d399;">
          <strong>✅ Verified Attendance!</strong><br>
          Student: <strong>${data.attendee_name}</strong> has been checked-in.
        </div>
      `;
      loadDashboard();
      loadEvents();
    } else {
      feedback.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); padding: 12px; border-radius: 10px; color: #f87171;">
          <strong>❌ Scan Failed:</strong> ${data.detail || 'Invalid or expired token'}
        </div>
      `;
    }
  } catch (e) {
    feedback.innerHTML = `<span style="color: var(--danger)">Error: ${e}</span>`;
  }
}

// Event Actions
async function registerForEvent(eventId) {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      alert('Registered successfully! You can now show your dynamic QR code.');
    } else {
      const data = await res.json();
      alert(data.detail || 'Registration failed');
    }
  } catch (e) {
    alert('Error: ' + e);
  }
}

async function submitCreateEvent() {
  const title = document.getElementById('event-title').value.trim();
  const type = document.getElementById('event-type').value;
  const venue = document.getElementById('event-venue').value.trim();
  const desc = document.getElementById('event-desc').value.trim();

  if (!title || !venue) {
    alert('Please enter title and venue');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, type, venue, description: desc,
        date_time: new Date(Date.now() + 86400000 * 3).toISOString(),
      })
    });
    if (res.ok) {
      closeModal('create-event-modal');
      loadEvents();
      loadDashboard();
    } else {
      alert('Failed to create event');
    }
  } catch (e) {
    alert('Error: ' + e);
  }
}

async function submitCreateTask() {
  const title = document.getElementById('task-title').value.trim();
  const team = document.getElementById('task-team').value;
  const desc = document.getElementById('task-desc').value.trim();

  if (!title) {
    alert('Please enter task title');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, team_id: team, description: desc,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
      })
    });
    if (res.ok) {
      closeModal('create-task-modal');
      loadTasks();
      loadDashboard();
    }
  } catch (e) {
    alert('Error: ' + e);
  }
}

async function updateTaskStatus(taskId, status) {
  try {
    await fetch(`${API_BASE}/tasks/${taskId}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    loadTasks();
    loadDashboard();
  } catch (e) {
    alert('Failed to update status');
  }
}

// Role Simulator
function switchRole(newRole) {
  currentUser.role = newRole;
  currentUser.is_volunteer = (newRole === 'volunteer' || newRole === 'admin' || newRole === 'super_admin');
  document.getElementById('display-user-role').innerText = newRole.replace('_', ' ').toUpperCase();
}

function switchTeam(newTeam) {
  currentUser.team = newTeam;
}

function getAuthHeaders() {
  // Demo token header
  return { 'Authorization': 'Bearer demo-token' };
}
