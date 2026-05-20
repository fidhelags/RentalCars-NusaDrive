const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    window.location.href = '../index.html';
}

const API_RENTALS = 'http://localhost:3000/api/rentals';
const API_USERS = 'http://localhost:3000/api/users';
const API_CARS = 'http://localhost:3000/api/cars';

function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function formatTanggal(tanggal) {
    const d = new Date(tanggal);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function badgeStatus(status) {
    const map = { 'aktif': 'badge-aktif', 'selesai': 'badge-selesai' };
    const cls = map[status] || 'badge-aktif';
    return `<span class="badge ${cls}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

async function loadRentals() {
    try {
        const filter = document.getElementById('filterStatus').value;

        const [resRentals, resUsers, resCars] = await Promise.all([
            fetch(API_RENTALS),
            fetch(API_USERS),
            fetch(API_CARS)
        ]);

        let rentals = await resRentals.json();
        const users = await resUsers.json();
        const cars = await resCars.json();

        if (filter) {
            rentals = rentals.filter(r => r.status === filter);
        }

        const tbody = document.getElementById('rentalsTable');

        if (rentals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="color:#9CA3AF;">Belum ada transaksi.</td></tr>';
            return;
        }

        tbody.innerHTML = rentals.map((trx, i) => {
            const u = users.find(u => u.id === trx.customer_id);
            const car = cars.find(c => c.id === trx.mobil_id);
            const periode = `${formatTanggal(trx.tanggal_mulai)} - ${formatTanggal(trx.tanggal_selesai)}`;

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${u ? u.nama : '-'}</td>
                    <td>${car ? car.nama + ' (' + car.plat + ')' : '-'}</td>
                    <td>${periode}</td>
                    <td>${formatRupiah(trx.total_biaya)}</td>
                    <td>${badgeStatus(trx.status)}</td>
                    <td>
                        ${trx.status === 'aktif'
                    ? `<button class="btn-action btn-edit" onclick="selesaikan('${trx.id}')">✅</button>`
                    : ''}
                        <button class="btn-action btn-delete" onclick="deleteRental('${trx.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
    }
}

async function selesaikan(id) {
    if (!confirm('Tandai transaksi ini sebagai selesai?')) return;

    try {
        const res = await fetch(`${API_RENTALS}/${id}/selesai`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) loadRentals();
        else {
            const data = await res.json();
            alert(data.message || 'Gagal mengupdate status.');
        }

    } catch (err) {
        console.error(err);
    }
}

async function deleteRental(id) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
        const res = await fetch(`${API_RENTALS}/${id}`, { method: 'DELETE' });
        if (res.ok) loadRentals();
    } catch (err) {
        console.error(err);
    }
}

loadRentals();