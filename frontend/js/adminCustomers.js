const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    window.location.href = '../index.html';
}

const API = 'http://localhost:3000/api/users';
let editId = null;

async function loadCustomers() {
    try {
        const res = await fetch(API);
        const users = await res.json();
        const customers = users.filter(u => u.role === 'customer');
        const tbody = document.getElementById('customersTable');

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:#9CA3AF;">Belum ada data customer.</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map((c, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${c.nama}</td>
                <td>${c.email}</td>
                <td>${c.no_telp}</td>
                <td>
                    <button class="btn-action btn-delete" onclick="deleteCustomer('${c.id}')">
                        <img src="../assets/delete.svg" alt="Delete" width="16" height="16">
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
    }
}

async function submitCustomer() {
    const nama = document.getElementById('f-nama').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const no_telp = document.getElementById('f-no_telp').value.trim();
    const errorMsg = document.getElementById('modalError');

    errorMsg.style.display = 'none';

    if (!nama || !email || !no_telp) {
        errorMsg.textContent = 'Semua field wajib diisi.';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API}/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, no_telp })
        });

        if (!res.ok) {
            const data = await res.json();
            errorMsg.textContent = data.message || 'Gagal menyimpan data.';
            errorMsg.style.display = 'block';
            return;
        }

        closeModal();
        loadCustomers();

    } catch (err) {
        errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        errorMsg.style.display = 'block';
    }
}

async function deleteCustomer(id) {
    if (!confirm('Yakin ingin menghapus customer ini?')) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (res.ok) loadCustomers();
    } catch (err) {
        console.error(err);
    }
}

loadCustomers();