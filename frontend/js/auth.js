async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const isAdmin = document.getElementById('isAdmin').checked;
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.style.display = 'none';

    if (!email || !password) {
        errorMsg.textContent = 'Email dan Password wajib diisi.';
        errorMsg.style.display = 'block';
        return;
    }

    try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, isAdmin })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.message || 'Login gagal.';
            errorMsg.style.display = 'block';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'customer/dashboard.html';
        }

    } catch (err) {
        errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        errorMsg.style.display = 'block';
    }
}

async function handleRegister() {
    const email = document.getElementById('email').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const no_telp = document.getElementById('no_telp').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    if (!email || !nama || !no_telp || !password) {
        errorMsg.textContent = 'Semua field wajib diisi.';
        errorMsg.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Password minimal 6 karakter.';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, nama, no_telp, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.message || 'Register gagal.';
            errorMsg.style.display = 'block';
            return;
        }

        successMsg.textContent = 'Register berhasil! Mengarahkan ke halaman login...';
        successMsg.style.display = 'block';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (err) {
        errorMsg.textContent = 'Tidak dapat terhubung ke server.';
        errorMsg.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (typeof handleLogin === 'function' && document.getElementById('isAdmin')) handleLogin();
        else if (typeof handleRegister === 'function') handleRegister();
    }
});