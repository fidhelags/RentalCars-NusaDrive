const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'customer') {
    window.location.href = '../index.html';
}

const API_CARS = 'http://localhost:3000/api/cars';
const API_RENTALS = 'http://localhost:3000/api/rentals';

const params = new URLSearchParams(window.location.search);
const carId = params.get('id');

if (!carId) window.location.href = 'dashboard.html';

let car = null;
let tarifPerHari = 0;

function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

async function loadCar() {
    try {
        const res = await fetch(`${API_CARS}/${carId}`);
        car = await res.json();
        tarifPerHari = car.tarif_per_hari;

        const imgEl = document.getElementById('carImg');
        if (car.gambar) {
            imgEl.innerHTML = `
                <img 
                    src="../assets/cars/${car.gambar}" 
                    alt="${car.nama}" 
                    style="width:100%; height:180px; object-fit:cover;"
                    onerror="this.outerHTML='<div style=&quot;width:100%;height:180px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:13px;&quot;>Foto tidak tersedia</div>'"
                />
            `;
        } else {
            imgEl.textContent = 'Foto tidak tersedia';
        }

        document.getElementById('carNama').textContent = car.nama;
        document.getElementById('carDetail').textContent = `${car.plat} | ${car.kursi} Kursi`;
        document.getElementById('carTarif').textContent = formatRupiah(car.tarif_per_hari) + '/hari';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tanggal_mulai').min = today;
        document.getElementById('tanggal_selesai').min = today;

    } catch (err) {
        console.error(err);
    }
}

function formatTanggal(tanggal) {
    return new Date(tanggal).toLocaleDateString('id-ID');
}

async function hitungTotal() {
    const mulai = document.getElementById('tanggal_mulai').value;
    const selesai = document.getElementById('tanggal_selesai').value;
    const errorMsg = document.getElementById('errorMsg');
    const totalBox = document.getElementById('totalBox');
    const btnBayar = document.getElementById('btnBayar');

    errorMsg.style.display = 'none';
    totalBox.style.display = 'none';
    btnBayar.disabled = false;
    btnBayar.textContent = 'Bayar Sekarang';

    if (!mulai || !selesai) return;

    const start = new Date(mulai);
    const end = new Date(selesai);
    const jumlah_hari = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (jumlah_hari <= 0) {
        errorMsg.textContent = 'Tanggal selesai harus setelah tanggal mulai.';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(API_RENTALS);
        const rentals = await res.json();

        const bentrokList = rentals.filter(r =>
            r.mobil_id === carId &&
            r.status === 'aktif' &&
            !(selesai <= r.tanggal_mulai || mulai >= r.tanggal_selesai)
        );

        if (bentrokList.length > 0) {
            const periode = bentrokList
                .map(r =>
                    `${formatTanggal(r.tanggal_mulai)} - ${formatTanggal(r.tanggal_selesai)}`
                )
                .join(', ');

            errorMsg.textContent = `Mobil sedang disewa pada periode ${periode}.`;
            errorMsg.style.display = 'block';

            btnBayar.disabled = true;
            btnBayar.textContent = 'Tidak Tersedia';

            return;
        }

        const total = jumlah_hari * tarifPerHari;
        document.getElementById('hariInfo').textContent = `${jumlah_hari} hari x ${formatRupiah(tarifPerHari)}`;
        document.getElementById('totalBiaya').textContent = `Total: ${formatRupiah(total)}`;
        totalBox.style.display = 'block';

    } catch (err) {
        console.error(err);
    }
}

async function handleBayar() {
    const mulai = document.getElementById('tanggal_mulai').value;
    const selesai = document.getElementById('tanggal_selesai').value;
    const metode = document.getElementById('metode_pembayaran').value;
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    if (!mulai || !selesai) {
        errorMsg.textContent = 'Tanggal mulai dan selesai wajib diisi.';
        errorMsg.style.display = 'block';
        return;
    }

    if (!metode) {
        errorMsg.textContent = 'Pilih metode pembayaran.';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(API_RENTALS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: user.id,
                mobil_id: carId,
                tanggal_mulai: mulai,
                tanggal_selesai: selesai,
                metode_pembayaran: metode
            })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.message || 'Booking gagal.';
            errorMsg.style.display = 'block';
            return;
        }

        successMsg.textContent = 'Booking berhasil! Mengarahkan ke halaman transaksi...';
        successMsg.style.display = 'block';

        document.getElementById('btnBayar').disabled = true;

        setTimeout(() => {
            window.location.href = 'transactions.html';
        }, 1500);

    } catch (err) {
        errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        errorMsg.style.display = 'block';
    }
}

loadCar();

document
    .getElementById('tanggal_mulai')
    .addEventListener('change', hitungTotal);

document
    .getElementById('tanggal_selesai')
    .addEventListener('change', hitungTotal);
