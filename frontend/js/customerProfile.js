const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'customer') {
    window.location.href = '../index.html';
}

const API = 'http://localhost:3000/api/users';

async function loadProfil() {
    try {
        const res = await fetch(`${API}/${user.id}`);
        const data = await res.json();

        document.getElementById('nama').value = data.nama;
        document.getElementById('email').value = data.email;
        document.getElementById('no_telp').value = data.no_telp;

    } catch (err) {
        console.error(err);
    }
}

async function handleUpdateProfil() {
    const nama = document.getElementById('nama').value.trim();
    const no_telp = document.getElementById('no_telp').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    if (!nama || !no_telp) {
        errorMsg.textContent = 'Nama dan No. Telp wajib diisi.';
        errorMsg.style.display = 'block';
        return;
    }

    if (password && password.length < 6) {
        errorMsg.textContent = 'Password minimal 6 karakter.';
        errorMsg.style.display = 'block';
        return;
    }

    const email = document.getElementById('email').value.trim();

    const body = { nama, no_telp };
    if (password) body.password = password;

    try {
        const res = await fetch(`${API}/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.message || 'Gagal menyimpan perubahan.';
            errorMsg.style.display = 'block';
            return;
        }

        const updatedUser = { ...user, nama, no_telp };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        successMsg.textContent = 'Profil berhasil diperbarui!';
        successMsg.style.display = 'block';

    } catch (err) {
        errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        errorMsg.style.display = 'block';
    }
}

async function handleDeleteAkun() {
    if (!confirm('Yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan.')) return;

    try {
        const res = await fetch(`${API}/${user.id}`, { method: 'DELETE' });

        if (res.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        } else {
            const data = await res.json();
            document.getElementById('errorMsg').textContent = data.message || 'Gagal menghapus akun.';
            document.getElementById('errorMsg').style.display = 'block';
        }

    } catch (err) {
        document.getElementById('errorMsg').textContent = 'Tidak dapat terhubung ke server.';
        document.getElementById('errorMsg').style.display = 'block';
    }
}

loadProfil();