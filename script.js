// ===== SILVER OAK TRANSPORT - SCRIPT.JS =====

// Fare chart (from → to), reasonable prices in ₹
const fareChart = {
  "Naroda":             { "Gota": 20, "Maninagar": 30, "Gandhinagar": 45, "Silver Oak College": 50 },
  "Gota":               { "Naroda": 20, "Maninagar": 25, "Gandhinagar": 35, "Silver Oak College": 40 },
  "Maninagar":          { "Naroda": 30, "Gota": 25, "Gandhinagar": 30, "Silver Oak College": 35 },
  "Gandhinagar":        { "Naroda": 45, "Gota": 35, "Maninagar": 30, "Silver Oak College": 20 },
  "Silver Oak College": { "Naroda": 50, "Gota": 40, "Maninagar": 35, "Gandhinagar": 20 }
};

// Bus = 40 seats (10 rows x 4), Van = 12 seats (3 rows x 4)
const vehicleConfig = {
  Bus: { seats: 40, rows: 10, cols: 4, icon: "🚌" },
  Van: { seats: 12, rows: 3,  cols: 4, icon: "🚐" }
};

let selectedSeats = [];
let currentVehicle = "Bus";
let bookedSeats = {};  // key: "vehicleType_date_slot" → array of seat numbers

// ── On page load ──
function loadBookingPage() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) { window.location.href = 'login.html'; return; }

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;
  document.getElementById('bookingDate').value = today;

  renderSeats();
}

// ── Vehicle change ──
function changeVehicle(type) {
  currentVehicle = type;
  selectedSeats = [];
  document.querySelectorAll('.veh-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('vehBtn_' + type).classList.add('active');
  renderSeats();
  updateFare();
}

// ── Fare update ──
function updateFare() {
  const from = document.getElementById('fromStop').value;
  const to   = document.getElementById('toStop').value;
  const fareEl = document.getElementById('fareInfo');

  if (!from || !to || from === to) {
    fareEl.innerText = '--';
    return;
  }

  const baseFare = (fareChart[from] && fareChart[from][to]) ? fareChart[from][to] : 30;
  const multiplier = currentVehicle === 'Van' ? 1.5 : 1;
  const totalFare = Math.round(baseFare * multiplier);
  fareEl.innerText = totalFare + (currentVehicle === 'Van' ? ' (Van rate)' : '');
}

// ── Render seat map ──
function renderSeats() {
  const container = document.getElementById('seats');
  container.innerHTML = '';

  const cfg = vehicleConfig[currentVehicle];
  const date  = document.getElementById('bookingDate') ? document.getElementById('bookingDate').value : '';
  const slot  = document.getElementById('slotSelect')  ? document.getElementById('slotSelect').value  : '';
  const key   = currentVehicle + '_' + date + '_' + slot;
  const taken = bookedSeats[key] || [];

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;justify-content:center;margin-bottom:12px;font-size:0.82rem;flex-wrap:wrap;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:16px;height:16px;background:#e8f5e9;border:2px solid #a5d6a7;border-radius:4px;vertical-align:middle;"></span> Available</span>
    <span><span style="display:inline-block;width:16px;height:16px;background:linear-gradient(135deg,#8B1A1A,#c0392b);border-radius:4px;vertical-align:middle;"></span> Selected</span>
    <span><span style="display:inline-block;width:16px;height:16px;background:#fce4e4;border:2px solid #ef9a9a;border-radius:4px;vertical-align:middle;"></span> Booked</span>
  `;
  container.appendChild(legend);

  // Driver seat
  const driverRow = document.createElement('div');
  driverRow.style.cssText = 'text-align:center;margin-bottom:8px;font-size:0.85rem;color:#888;';
  driverRow.innerHTML = '🚗 <strong>Driver</strong>';
  container.appendChild(driverRow);

  // Seat grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + cfg.cols + ', 44px);gap:8px;justify-content:center;';

  for (let i = 1; i <= cfg.seats; i++) {
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.innerText = i;
    seat.dataset.num = i;

    if (taken.includes(i)) {
      seat.classList.add('booked');
      seat.title = 'Already booked';
    } else if (selectedSeats.includes(i)) {
      seat.classList.add('selected');
    } else {
      seat.classList.add('available');
      seat.onclick = () => toggleSeat(i, seat);
    }

    // Aisle gap after col 2
    if (i % cfg.cols === 2) {
      seat.style.marginRight = '14px';
    }

    grid.appendChild(seat);

    // Row gap
    if (i % cfg.cols === 0 && i < cfg.seats) {
      const gap = document.createElement('div');
      gap.style.cssText = 'grid-column:1/-1;height:4px;';
      grid.appendChild(gap);
    }
  }

  container.appendChild(grid);

  // Selected info
  const info = document.createElement('div');
  info.id = 'selectedInfo';
  info.style.cssText = 'text-align:center;margin-top:14px;font-size:0.9rem;color:#8B1A1A;font-weight:600;';
  info.innerText = selectedSeats.length > 0 ? '✅ Selected: Seat ' + selectedSeats.join(', ') : 'Koi seat select nahi ki';
  container.appendChild(info);
}

// ── Toggle seat ──
function toggleSeat(num, el) {
  if (selectedSeats.includes(num)) {
    selectedSeats = selectedSeats.filter(s => s !== num);
    el.classList.remove('selected');
    el.classList.add('available');
  } else {
    if (selectedSeats.length >= 4) {
      alert('⚠️ Maximum 4 seats ek saath select kar sakte ho!');
      return;
    }
    selectedSeats.push(num);
    el.classList.remove('available');
    el.classList.add('selected');
  }
  const info = document.getElementById('selectedInfo');
  if (info) info.innerText = selectedSeats.length > 0 ? '✅ Selected: Seat ' + selectedSeats.join(', ') : 'Koi seat select nahi ki';
}

// ── Confirm booking ──
function confirmBooking() {
  const date  = document.getElementById('bookingDate').value;
  const slot  = document.getElementById('slotSelect').value;
  const from  = document.getElementById('fromStop').value;
  const to    = document.getElementById('toStop').value;

  if (!date || !from || !to) { alert('⚠️ Date, From aur To select karo!'); return; }
  if (from === to)            { alert('⚠️ From aur To alag hone chahiye!'); return; }
  if (selectedSeats.length === 0) { alert('⚠️ Kam se kam ek seat select karo!'); return; }

  const key = currentVehicle + '_' + date + '_' + slot;
  if (!bookedSeats[key]) bookedSeats[key] = [];
  bookedSeats[key].push(...selectedSeats);

  const fareEl = document.getElementById('fareInfo').innerText;

  // Save to history
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  history.push({
    date, slot, from, to,
    vehicle: currentVehicle,
    seats: selectedSeats.join(', '),
    fare: '₹' + fareEl,
    bookedAt: new Date().toLocaleString()
  });
  localStorage.setItem('bookingHistory', JSON.stringify(history));

  alert(`✅ Booking Confirmed!\n\n🗓 Date: ${date}\n⏰ Slot: ${slot}\n${vehicleConfig[currentVehicle].icon} Vehicle: ${currentVehicle}\n📍 ${from} → ${to}\n🪑 Seat(s): ${selectedSeats.join(', ')}\n💰 Fare: ₹${fareEl}`);

  selectedSeats = [];
  renderSeats();
}

// ── Go to payment ──
function goToPayment() {
  const date  = document.getElementById('bookingDate').value;
  const slot  = document.getElementById('slotSelect').value;
  const from  = document.getElementById('fromStop').value;
  const to    = document.getElementById('toStop').value;
  const fare  = document.getElementById('fareInfo').innerText;

  if (!date || !from || !to) { alert('⚠️ Pehle Date, From aur To select karo!'); return; }
  if (from === to)            { alert('⚠️ From aur To alag hone chahiye!'); return; }
  if (selectedSeats.length === 0) { alert('⚠️ Pehle seat select karo!'); return; }

  localStorage.setItem('pendingBooking', JSON.stringify({
    date, slot, from, to,
    vehicle: currentVehicle,
    seats: selectedSeats.join(', '),
    fare: '₹' + fare
  }));
  window.location.href = 'payment.html';
}

// ── Open Map ──
function openMap() {
  const from = document.getElementById('fromStop') ? document.getElementById('fromStop').value : '';
  const to   = document.getElementById('toStop')   ? document.getElementById('toStop').value   : '';
  const query = from && to ? from + ' to ' + to + ' Ahmedabad' : 'Silver Oak University Ahmedabad';
  window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query), '_blank');
}

// ── SOS ──
function sos() {
  if (confirm('🆘 SOS Alert bhejni hai?\n\nYeh aapki location aur emergency contact ko alert karega.')) {
    alert('🆘 SOS Alert bhej diya gaya!\nHelp raaste mein hai. Safe raho!');
  }
}

// ── Logout ──
function logout() {
  if (confirm('Logout karna chahte ho?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

// ── View History ──
function viewHistory() {
  window.location.href = 'history.html';
}

// ── Re-render on date/slot change ──
document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById('bookingDate');
  const slotEl = document.getElementById('slotSelect');
  if (dateEl) dateEl.addEventListener('change', () => { selectedSeats = []; renderSeats(); });
  if (slotEl) slotEl.addEventListener('change', () => { selectedSeats = []; renderSeats(); });
});
