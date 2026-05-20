const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'customer') {
    window.location.href = '../index.html';
}

const API_RENTALS = 'http://localhost:3000/api/rentals';
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

async function loadTransactions() {
    try {
        const [resRentals, resCars] = await Promise.all([
            fetch(API_RENTALS),
            fetch(API_CARS)
        ]);

        const allRentals = await resRentals.json();
        const cars = await resCars.json();

        console.log('user.id:', user.id);
        console.log('allRentals:', allRentals);

        const myRentals = allRentals.filter(r => r.customer_id === user.id);
        console.log('myRentals:', myRentals);

        const tbody = document.getElementById('transactionsTable');

        if (myRentals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:#9CA3AF;">Belum ada transaksi.</td></tr>';
            return;
        }

        tbody.innerHTML = myRentals.map((trx, i) => {
            const car = cars.find(c => c.id === trx.mobil_id);
            const periode = `${formatTanggal(trx.tanggal_mulai)} - ${formatTanggal(trx.tanggal_selesai)}`;

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${car ? car.nama : '-'}</td>
                    <td>${car ? car.plat : '-'}</td>
                    <td>${periode}</td>
                    <td>${formatRupiah(trx.total_biaya)}</td>
                    <td>${badgeStatus(trx.status)}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
    }
}

loadTransactions();
