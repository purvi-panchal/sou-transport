// ---------- Login ----------
function login() {
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let userType = document.getElementById('userType').value;
    let idFile = document.getElementById('idUpload').files[0];

    if(!email || !password){
        alert("Enter both email and password");
        return;
    }
    if(!idFile){
        alert("Please upload university ID for verification!");
        return;
    }

    const user = { email, password, userType };
    localStorage.setItem('currentUser', JSON.stringify(user));

    alert("Login successful!");
    window.location.href = "booking.html";
}

// ---------- Booking ----------
let transportSelect = document.getElementById('transportSelect');
let carpoolOptions = document.getElementById('carpoolOptions');
let seatsDiv = document.getElementById('seats');
let fareInfo = document.getElementById('fareInfo');
let bookingDateInput = document.getElementById('bookingDate');
let slotSelect = document.getElementById('slotSelect');

let currentBooking = {
    transport: 'car',
    seats: [],
    fare: 20,
    slot: "Morning",
    route: "Naroda → Gota → Maninagar → Gandhinagar",
    date: new Date().toISOString().split('T')[0],
    carpoolType: ""
};

function loadBookingPage(){
    if(bookingDateInput) bookingDateInput.value = currentBooking.date;
    if(slotSelect) slotSelect.value = currentBooking.slot;

    if(transportSelect){
        transportSelect.addEventListener('change', ()=>{
            carpoolOptions.style.display = transportSelect.value==='carpool'?'block':'none';
            updateSeatsAndFare();
        });
    }

    if(slotSelect){
        slotSelect.addEventListener('change', ()=>{
            currentBooking.slot = slotSelect.value;
            updateSeatsAndFare();
        });
    }

    if(bookingDateInput){
        bookingDateInput.addEventListener('change', ()=>{
            currentBooking.date = bookingDateInput.value;
            updateSeatsAndFare();
        });
    }

    updateSeatsAndFare();
}

function updateSeatsAndFare(){
    currentBooking.transport = transportSelect.value;
    if(currentBooking.transport==='carpool'){
        currentBooking.carpoolType = document.getElementById('carpoolType').value;
        document.getElementById('carpoolType').addEventListener('change', ()=>{
            currentBooking.carpoolType = document.getElementById('carpoolType').value;
        });
    }

    let totalSeats, fare;
    switch(currentBooking.transport){
        case 'car': totalSeats=4; fare=20; break;
        case 'rickshaw': totalSeats=3; fare=10; break;
        case 'bike': totalSeats=1; fare=5; break;
        case 'carpool': totalSeats=4; fare=15; break;
    }
    currentBooking.fare=fare;
    fareInfo.innerText=fare;
    renderSeats(totalSeats,currentBooking.transport);
}

function renderSeats(totalSeats, transport){
    if(!seatsDiv) return;
    seatsDiv.innerHTML='';
    let bookedSeats = JSON.parse(localStorage.getItem('bookedSeats'))||[];
    for(let i=1;i<=totalSeats;i++){
        let seat = document.createElement('div');
        seat.classList.add('seat');
        seat.innerText=i;
        if(bookedSeats.includes(`${transport}-${i}-${currentBooking.date}-${currentBooking.slot}`)) seat.classList.add('booked');
        if(transport==='carpool') seat.classList.add('pending');
        seat.addEventListener('click', ()=>selectSeat(seat,i));
        seatsDiv.appendChild(seat);
    }
}

function selectSeat(seatDiv, seatNumber){
    if(seatDiv.classList.contains('booked')) return;
    if(currentBooking.transport==='carpool'){
        if(seatDiv.classList.contains('selected')){
            seatDiv.classList.remove('selected');
            currentBooking.seats=currentBooking.seats.filter(s=>s!==seatNumber);
        }else{
            seatDiv.classList.add('selected');
            currentBooking.seats.push(seatNumber);
        }
        return;
    }
    if(seatDiv.classList.contains('selected')){
        seatDiv.classList.remove('selected');
        currentBooking.seats=currentBooking.seats.filter(s=>s!==seatNumber);
    }else{
        seatDiv.classList.add('selected');
        currentBooking.seats.push(seatNumber);
    }
}

function payNow(){
    if(currentBooking.seats.length===0 && currentBooking.transport!=='carpool'){ alert("Select seat"); return;}
    alert(`Payment ₹${currentBooking.fare} successful!`);
    confirmBooking();
}

function confirmBooking(){
    let bookedSeats = JSON.parse(localStorage.getItem('bookedSeats'))||[];
    currentBooking.seats.forEach(seat=>bookedSeats.push(`${currentBooking.transport}-${seat}-${currentBooking.date}-${currentBooking.slot}`));
    localStorage.setItem('bookedSeats',JSON.stringify(bookedSeats));
    let history = JSON.parse(localStorage.getItem('history'))||[];
    history.push(currentBooking);
    localStorage.setItem('history',JSON.stringify(history));
    alert("Booking confirmed!");
    currentBooking.seats=[];
    updateSeatsAndFare();
}

function openMap(){ window.open("https://www.google.com/maps?q=Silver+Oak+University+Gota","_blank"); }
function sos(){ alert("SOS sent! Help is on the way!"); }
function logout(){ localStorage.removeItem('currentUser'); window.location.href="index.html"; }
function viewHistory(){ window.location.href="history.html"; }

// ---------- History ----------
window.addEventListener('load',()=>{
    let table = document.getElementById('historyTable');
    if(table){
        let history = JSON.parse(localStorage.getItem('history'))||[];
        history.forEach(b=>{
            let row = table.insertRow();
            row.insertCell(0).innerText=b.transport;
            row.insertCell(1).innerText=b.seats.join(",");
            row.insertCell(2).innerText=b.fare;
            row.insertCell(3).innerText=b.slot;
            row.insertCell(4).innerText=b.date;
            row.insertCell(5).innerText=b.carpoolType||'-';
        });
    }
});