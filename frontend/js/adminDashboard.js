const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    window.location.href = '../index.html';
}

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function badgeStatus(status) {
    const map = { 'aktif': 'badge-aktif', 'selesai': 'badge-selesai' };
    const cls = map[status] || 'badge-aktif';
    return `<span class="badge ${cls}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

async function loadAdminDashboard() {
    try {
        const [resCars, resUsers, resRent] = await Promise.all([
        fetch('http://localhost:3000/api/cars'),
        fetch('http://localhost:3000/api/users'),
        fetch('http://localhost:3000/api/rentals')
        ]);

        const cars = await resCars.json();
        const users = await resUsers.json();
        const rentals = await resRent.json();

        document.getElementById('totalMobil').textContent = cars.length;
        document.getElementById('totalDisewa').textContent = cars.filter(c => c.status === 'disewa').length;
        document.getElementById('totalTersedia').textContent = cars.filter(c => c.status === 'tersedia').length;
        document.getElementById('totalCustomer').textContent = users.filter(u => u.role === 'customer').length;

        const recent = rentals.slice(-5).reverse();
        const tbody = document.getElementById('transaksiTable');

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9CA3AF;">Belum ada transaksi.</td></tr>';
            return;
        }

        tbody.innerHTML = recent.map((trx, i) => {
        const u = users.find(c => c.id === trx.customer_id);
        const car = cars.find(c => c.id === trx.mobil_id);
        return `
            <tr>
            <td>${i + 1}</td>
            <td>${u ? u.nama : '-'}</td>
            <td>${car ? car.nama + ' (' + car.plat + ')' : '-'}</td>
            <td>${formatRupiah(trx.total_biaya)}</td>
            <td>${badgeStatus(trx.status)}</td>
            </tr>
        `;
        }).join('');

    } catch (err) {
        console.error(err);
    }
}

loadAdminDashboard();