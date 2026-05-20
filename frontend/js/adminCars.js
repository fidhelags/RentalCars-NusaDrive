const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    window.location.href = '../index.html';
}

const API = 'http://localhost:3000/api/cars';
const API_RENTALS = 'http://localhost:3000/api/rentals';
let editId = null;

function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function badgeStatus(disewa) {
    return disewa
        ? '<span class="badge badge-disewa">Disewa</span>'
        : '<span class="badge badge-tersedia">Tersedia</span>';
}

async function loadCars() {
    try {
        const [carsRes, rentalsRes] = await Promise.all([
            fetch(API),
            fetch(API_RENTALS)
        ]);

        const cars = await carsRes.json();
        const rentals = await rentalsRes.json();

        const tbody = document.getElementById('carsTable');

        if (cars.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="color:#9CA3AF;">
                        Belum ada data mobil.
                    </td>
                </tr>
            `;
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        tbody.innerHTML = cars.map((car, i) => {

            const sedangDisewa = rentals.some(r =>
                r.mobil_id === car.id &&
                r.status === 'aktif' &&
                today >= r.tanggal_mulai &&
                today <= r.tanggal_selesai
            );

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${car.nama}</td>
                    <td>${car.plat}</td>
                    <td>${formatRupiah(car.tarif_per_hari)}</td>
                    <td>${badgeStatus(sedangDisewa)}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="openEdit('${car.id}')">
                            <img src="../assets/write.svg" alt="Edit" width="16" height="16">
                        </button>

                        <button class="btn-action btn-delete" onclick="deleteCar('${car.id}')">
                            <img src="../assets/delete.svg" alt="Delete" width="16" height="16">
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
    }
}

function openModal() {
    editId = null;
    document.getElementById('modalTitle').textContent = 'Tambah Mobil';
    document.getElementById('f-nama').value = '';
    document.getElementById('f-plat').value = '';
    document.getElementById('f-kursi').value = '';
    document.getElementById('f-tarif').value = '';
    document.getElementById('f-gambar').value = '';
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('modal').style.display = 'flex';
}

async function openEdit(id) {
    const res = await fetch(API);
    const cars = await res.json();
    const car = cars.find(c => c.id === id);
    if (!car) return;

    editId = id;
    document.getElementById('modalTitle').textContent = 'Edit Mobil';
    document.getElementById('f-nama').value = car.nama;
    document.getElementById('f-plat').value = car.plat;
    document.getElementById('f-kursi').value = car.kursi;
    document.getElementById('f-tarif').value = car.tarif_per_hari;
    document.getElementById('f-gambar').value = car.gambar || '';
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    editId = null;
}

async function submitMobil() {
    const nama = document.getElementById('f-nama').value.trim();
    const plat = document.getElementById('f-plat').value.trim();
    const kursi = document.getElementById('f-kursi').value.trim();
    const tarif = document.getElementById('f-tarif').value.replace(/\./g, '').trim();
    const gambar = document.getElementById('f-gambar').value.trim();
    const errorMsg = document.getElementById('modalError');

    errorMsg.style.display = 'none';

    if (!nama || !plat || !kursi || !tarif) {
        errorMsg.textContent = 'Semua field wajib diisi.';
        errorMsg.style.display = 'block';
        return;
    }

    const body = {
        nama, plat,
        kursi: parseInt(kursi),
        tarif_per_hari: parseInt(tarif),
        gambar: gambar || '',
    };

    try {
        const url = editId ? `${API}/${editId}` : API;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const data = await res.json();
            errorMsg.textContent = data.message || 'Gagal menyimpan data.';
            errorMsg.style.display = 'block';
            return;
        }

        closeModal();
        loadCars();

    } catch (err) {
        errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        errorMsg.style.display = 'block';
    }
}

async function deleteCar(id) {
    if (!confirm('Yakin ingin menghapus mobil ini?')) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (res.ok) loadCars();
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('f-tarif').addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    this.value = Number(val).toLocaleString('id-ID');
});

loadCars();