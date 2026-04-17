const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz2bYGcsLqug2Qap74vZwhLdBDN3LNNvHqh5G6hK7aELeDoqV1CEHiWgDs4WNZIZLjn/exec";
const ADMIN_NUMBER = "6285117010280";
let batchCount = 0;

// Update tampilan profil di card atas
function updateProfileDisplay() {
    const nama = document.getElementById('p_nama').value;
    const role = document.getElementById('p_outlet').value;
    document.getElementById('display-name').innerText = nama || "Nama Staff";
    document.getElementById('display-role').innerText = role || "Outlet Belum Dipilih";
}

// Jam & Tanggal Otomatis
setInterval(() => {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toLocaleTimeString('id-ID') + " WIB";
    document.getElementById('p_time').value = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('p_tgl').value = now.toISOString().split('T')[0];
}, 1000);

// Tab Navigation
function openTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    if(evt) evt.currentTarget.classList.add("active");
}

// Format Rupiah
function formatRupiahInput(input) {
    let val = input.value.replace(/[^0-9]/g, "");
    input.value = val ? "Rp " + parseInt(val).toLocaleString('id-ID') : "";
}

function cleanNumber(val) { 
    return parseInt(val.toString().replace(/[^0-9]/g, "")) || 0; 
}

// Kirim Data ke Google Sheets
async function sendToGoogleSheet(payload) {
    const formData = new URLSearchParams();
    for (const key in payload) { formData.append(key, payload[key]); }
    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        return true;
    } catch (e) { return false; }
}

// Handler Absensi
document.getElementById("absenForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Ambil data dari form
    const nama = document.getElementById("p_nama").value;
    const jabatan = document.getElementById("p_outlet").value;
    const jam = document.getElementById("p_time").value;
    const modal = document.getElementById("p_rupiah").value;
    const tanggal = document.getElementById("p_tgl").value;

    const payload = {
        sheet: "Absensi",
        nama: nama,
        jabatan: jabatan,
        jam: jam,
        modal: modal,
        tanggal: tanggal
    };

    // 1. Jalankan pengiriman ke Google Sheet di background
    sendToGoogleSheet(payload);

    // 2. Langsung siapkan pesan WhatsApp
    const waPesan = `*CHECK-IN STAFF*\n👤 Nama: ${nama}\n🏠 Outlet: ${jabatan}\n🕒 Jam: ${jam}\n💰 Modal: ${modal}`;
    
    // 3. Gunakan cara yang lebih kompatibel untuk membuka WhatsApp
    const waUrl = `https://api.whatsapp.com/send?phone=${ADMIN_NUMBER}&text=${encodeURIComponent(waPesan)}`;
    window.open(waUrl, "_blank");

    // Tampilkan notifikasi
    document.getElementById('notif-absen').style.display = 'block';
    setTimeout(() => openTab(null, 'tab-penjualan'), 1500);
});

// Sales Logic
const LIST_MENU = [
    {label:'Cokelat Crunchy', harga:11000}, {label:'Cokelat Keju', harga:13000},
    {label:'Original', harga:7000}, {label:'Coklat Oreo', harga:13000},
    {label:'Tiramisu', harga:10000}, {label:'Coklat', harga:10000},
    {label:'Taro', harga:10000}, {label:'Durian', harga:10000},
    {label:'Green Tea', harga:10000}, {label:'Strawberry', harga:10000},
    {label:'Keju Susu', harga:11000}, {label:'Coklat Kacang', harga:12000},
    {label:'Coklat Almond', harga:14000}, {label:'Milo Susu', harga:11000}
];

const LIST_TOPPING = [
    {label:'- Tanpa Topping -', harga:0}, {label:'Meses', harga:2000},
    {label:'Keju', harga:3000}, {label:'Oreo', harga:3000},
    {label:'Kacang', harga:2000}, {label:'Susu', harga:1000},
    {label:'Almond', harga:4000}
];

function addNewBatch() {
    batchCount++;
    const wrapper = document.getElementById('batch-wrapper');
    const div = document.createElement('div');
    div.className = 'batch-container card';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <strong style="color:var(--p-brown)">🥣 ADONAN #${batchCount}</strong>
            <button onclick="this.closest('.batch-container').remove(); calculateTotal()" style="color:red; border:none; background:none; cursor:pointer;">✕</button>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
            <input type="time" class="b_jam_adon" value="${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}" style="flex:1">
            <input type="number" class="b_gram" placeholder="Gramasi" style="flex:1">
        </div>
        <div id="porsi-list-${batchCount}"></div>
        <button class="btn-add" onclick="addPorsiToBatch(${batchCount})">+ Tambah Porsi</button>`;
    wrapper.appendChild(div);
    for(let i=0; i<3; i++) addPorsiToBatch(batchCount);
}

function addPorsiToBatch(bId) {
    const container = document.getElementById(`porsi-list-${bId}`);
    const row = document.createElement('div');
    row.className = 'porsi-row';
    row.innerHTML = `
        <div style="display:grid; gap:8px;">
            <div style="display:flex; gap:5px;">
                <input type="text" class="b_pembeli" placeholder="Nama Pembeli" style="flex:1">
                <input type="time" class="b_waktu_porsi" value="${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}">
            </div>
            <div style="display:flex; gap:5px;">
                <select class="b_menu" onchange="updatePrice(this)" style="flex:1">
                    <option value="" data-price="0">- Pilih Menu -</option>
                    ${LIST_MENU.map(m => `<option value="${m.label}" data-price="${m.harga}">${m.label}</option>`).join('')}
                </select>
                <select class="b_topping" onchange="updatePrice(this)" style="flex:1">
                    ${LIST_TOPPING.map(t => `<option value="${t.label}" data-price="${t.harga}">${t.label}</option>`).join('')}
                </select>
            </div>
            <div style="display:flex; gap:5px;">
                <select class="b_kematangan" style="flex:1; background:#FFF3E0;">
                    <option value="Lumer">🔥 Lumer</option>
                    <option value="3/4 Matang">🕒 3/4 Matang</option>
                    <option value="Matang">✅ Matang</option>
                </select>
                <select class="b_pay" onchange="calculateTotal()" style="flex:1">
                    <option>Tunai</option><option>QRIS</option>
                </select>
            </div>
            <div style="display:flex; align-items:center; gap:10px; padding-top:8px; border-top:1px dashed #ddd;">
                <input type="text" class="b_money" value="Rp 0" readonly style="flex:1; background:#FFF9C4; font-weight:bold; text-align:center;">
                <label style="flex:1.2; display:flex; align-items:center; justify-content:center; gap:8px; background:#f0f0f0; padding:10px; border-radius:10px; cursor:pointer;">
                    <input type="checkbox" class="lock-check" onchange="toggleLock(this)"> 
                    <span style="font-size:0.7rem; font-weight:bold;">Selesai</span>
                </label>
            </div>
        </div>`;
    container.appendChild(row);
}

function updatePrice(el) {
    const row = el.closest('.porsi-row');
    const mPrice = parseInt(row.querySelector('.b_menu').selectedOptions[0].dataset.price) || 0;
    const tPrice = parseInt(row.querySelector('.b_topping').selectedOptions[0].dataset.price) || 0;
    row.querySelector('.b_money').value = "Rp " + (mPrice + tPrice).toLocaleString('id-ID');
    calculateTotal();
}

function toggleLock(checkbox) {
    const row = checkbox.closest('.porsi-row');
    const inputs = row.querySelectorAll('input:not(.lock-check), select');
    if (checkbox.checked) {
        if (row.querySelector('.b_menu').value === "") { alert("Pilih menu!"); checkbox.checked = false; return; }
        row.classList.add('locked');
        inputs.forEach(el => el.disabled = true);
    } else {
        row.classList.remove('locked');
        inputs.forEach(el => el.disabled = false);
    }
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.lock-check:checked').forEach(chk => {
        const row = chk.closest('.porsi-row');
        total += cleanNumber(row.querySelector('.b_money').value);
    });
    const keluar = cleanNumber(document.getElementById('p_keluar').value);
    document.getElementById('total-display').value = "Rp " + (total - keluar).toLocaleString('id-ID');
}

async function generateSales() {
    const namaStaff = document.getElementById('p_nama').value;
    const outlet = document.getElementById('p_outlet').value;
    const tanggal = document.getElementById('p_tgl').value;
    const totalNet = document.getElementById('total-display').value;

    if (!namaStaff || !outlet) {
        alert("Silakan isi nama dan outlet di tab Check-In!");
        return;
    }

    let teksWA = `*LAPORAN PENJUALAN*\n👤 Staff: ${namaStaff}\n🏠 Outlet: ${outlet}\n📅 Tgl: ${tanggal}\n━━━━━━━━━━━━\n`;
    const batches = document.querySelectorAll('.batch-container');
    let dataList = [];

    // Kumpulkan semua data terlebih dahulu
    for (let i = 0; i < batches.length; i++) {
        const batchRow = batches[i];
        const porsiRows = batchRow.querySelectorAll('.porsi-row');

        for (let j = 0; j < porsiRows.length; j++) {
            const row = porsiRows[j];
            if (row.querySelector('.lock-check').checked) {
                const item = {
                    sheet: "Penjualan_Detail",
                    tanggal: tanggal,
                    nama_staff: namaStaff,
                    outlet: outlet,
                    no_adonan: i + 1,
                    jam_adon: batchRow.querySelector('.b_jam_adon').value,
                    no_porsi: j + 1,
                    jam_porsi: row.querySelector('.b_waktu_porsi').value,
                    pembeli: row.querySelector('.b_pembeli').value || "-",
                    menu: row.querySelector('.b_menu').value,
                    topping: row.querySelector('.b_topping').value,
                    kematangan: row.querySelector('.b_kematangan').value,
                    metode_bayar: row.querySelector('.b_pay').value,
                    harga: row.querySelector('.b_money').value
                };
                dataList.push(item);
                teksWA += `• ${item.menu} (${item.topping}) - ${item.harga}\n`;
            }
        }
    }

    if (dataList.length === 0) {
        alert("Belum ada data porsi yang diselesaikan (centang Selesai)!");
        return;
    }

    teksWA += `\n━━━━━━━━━━━━\n💰 *TOTAL SETORAN: ${totalNet}*`;

    // Kirim data ke Google Sheet tanpa menunggu satu-satu (Parallel)
    dataList.forEach(data => sendToGoogleSheet(data));

    // Langsung buka WhatsApp agar tidak diblokir browser
    const waUrl = `https://api.whatsapp.com/send?phone=${ADMIN_NUMBER}&text=${encodeURIComponent(teksWA)}`;
    window.open(waUrl, "_blank");
}

// Kalkulator Logic
let calcExpression = "";
function toggleCalc() { 
    const box = document.getElementById('calc-box'); 
    box.style.display = box.style.display === 'none' ? 'block' : 'none'; 
}
function calcInput(v) { calcExpression += v; updateCalcDisplay(); }
function calcClear() { calcExpression = ""; updateCalcDisplay(); }
function calcDel() { calcExpression = calcExpression.slice(0, -1); updateCalcDisplay(); }
function calcEqual() {
    try {
        let result = eval(calcExpression);
        calcExpression = result.toString();
        updateCalcDisplay();
    } catch { calcExpression = "Error"; updateCalcDisplay(); calcExpression = ""; }
}
function updateCalcDisplay() { document.getElementById('calc-display').innerText = calcExpression || "0"; }
