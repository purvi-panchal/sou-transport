// ---------- Login ----------
function login() {
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let userType = document.getElementById('userType').value;
    let idFile = document.getElementById('idUpload').files[0];

    if (!email || !password) {
        alert("Enter both email and password");
        return;
    }
    if (!idFile) {
        alert("Please upload university ID for verification!");
        return;
    }

    const user = { email, password, userType };
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert("Login successful!");
    window.location.href = "booking.html";
}

// ---------- Booking ----------
let seatsDiv = document.getElementById('seats');
let fareInfo = document.getElementById('fareInfo');
let bookingDateInput = document.getElementById('bookingDate');
let slotSelect = document.getElementById('slotSelect');

let currentBooking = {
    transport: 'car',
    seats: [],
    fare: 0,
    slot: "Morning",
    route: "Naroda → Gota → Maninagar → Gandhinagar",
    from: '',
    to: ''
};

const STOPS = ['Naroda', 'Gota', 'Maninagar', 'Gandhinagar'];
const FARE_MAP = { 1: 40, 2: 50, 3: 70 };

function updateFare() {
    const from = document.getElementById('fromStop') ? document.getElementById('fromStop').value : '';
    const to = document.getElementById('toStop') ? document.getElementById('toStop').value : '';
    currentBooking.from = from;
    currentBooking.to = to;

    if (from && to && from !== to) {
        const fromIdx = STOPS.indexOf(from);
        const toIdx = STOPS.indexOf(to);
        const diff = Math.abs(toIdx - fromIdx);
        const fare = FARE_MAP[diff] || 60;
        currentBooking.fare = fare;
        if (fareInfo) fareInfo.innerText = fare;
    } else {
        if (fareInfo) fareInfo.innerText = '--';
        currentBooking.fare = 0;
    }
}

function loadBookingPage() {
    generateSeats(4);
    const today = new Date().toISOString().split('T')[0];
    if (bookingDateInput) bookingDateInput.min = today;
    if (slotSelect) {
        slotSelect.addEventListener('change', () => {
            currentBooking.slot = slotSelect.value;
        });
    }
}

function generateSeats(count) {
    if (!seatsDiv) return;
    seatsDiv.innerHTML = '';
    currentBooking.seats = [];
    for (let i = 1; i <= count; i++) {
        let btn = document.createElement('button');
        btn.classList.add('seat');
        btn.innerText = 'S' + i;
        btn.onclick = () => toggleSeat(btn, i);
        seatsDiv.appendChild(btn);
    }
}

function toggleSeat(btn, num) {
    if (btn.classList.contains('booked')) return;
    if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        currentBooking.seats = currentBooking.seats.filter(s => s !== num);
    } else {
        btn.classList.add('selected');
        currentBooking.seats.push(num);
    }
}

function goToPayment() {
    if (currentBooking.seats.length === 0) {
        alert("Please select at least one seat!");
        return;
    }
    if (!currentBooking.from || !currentBooking.to) {
        alert("Please select From and To stops!");
        return;
    }
    if (currentBooking.from === currentBooking.to) {
        alert("From and To cannot be the same stop!");
        return;
    }
    const date = bookingDateInput ? bookingDateInput.value : '';
    if (!date) { alert("Please select a date!"); return; }

    currentBooking.date = date;
    currentBooking.slot = slotSelect ? slotSelect.value : 'Morning';
    currentBooking.transport = 'car';

    localStorage.setItem('pendingPayment', JSON.stringify(currentBooking));
    window.location.href = 'payment.html';
}

function confirmBooking() {
    if (currentBooking.seats.length === 0) {
        alert("Please select at least one seat!");
        return;
    }
    if (!currentBooking.from || !currentBooking.to) {
        alert("Please select From and To stops!");
        return;
    }
    if (currentBooking.from === currentBooking.to) {
        alert("From and To cannot be the same!");
        return;
    }
    const date = bookingDateInput ? bookingDateInput.value : '';
    if (!date) { alert("Please select a date!"); return; }

    currentBooking.date = date;
    currentBooking.slot = slotSelect ? slotSelect.value : 'Morning';

    const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    history.push({ ...currentBooking, paymentStatus: 'Pending' });
    localStorage.setItem('bookingHistory', JSON.stringify(history));

    alert(`Booking confirmed!\nSeats: ${currentBooking.seats.join(', ')}\nFare: ₹${currentBooking.fare}\nFrom: ${currentBooking.from} → To: ${currentBooking.to}`);

    document.querySelectorAll('.seat.selected').forEach(btn => {
        btn.classList.remove('selected');
        btn.classList.add('booked');
    });
    currentBooking.seats = [];
}

function openMap() {
    window.open("https://www.google.com/maps/dir/Naroda,+Ahmedabad/Gota,+Ahmedabad/Maninagar,+Ahmedabad/Gandhinagar", "_blank");
}

function sos() {
    alert("SOS Alert sent! Emergency contact notified.\nUniversity Security: 079-66046304");
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = "login.html";
}

function viewHistory() {
    window.location.href = "history.html";
}

// ---------- History Page ----------
function loadHistory() {
    const table = document.getElementById('historyTable');
    if (!table) return;
    const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    history.forEach(b => {
        let row = table.insertRow();
        row.insertCell().innerText = b.transport || '--';
        row.insertCell().innerText = (b.seats || []).join(', ');
        row.insertCell().innerText = '₹' + (b.fare || '--');
        row.insertCell().innerText = b.slot || '--';
        row.insertCell().innerText = b.date || '--';
        row.insertCell().innerText = b.from || '--';
        row.insertCell().innerText = b.to || '--';
        row.insertCell().innerText = b.paymentStatus || 'Pending';
    });
}

window.onload = function() {
    if (document.getElementById('historyTable')) loadHistory();
};
