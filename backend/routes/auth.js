const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path ke file JSON
const usersPath = path.join(__dirname, '../data/users.json');

// Helper: baca JSON
function readUsers() {
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

// Helper: tulis JSON
function writeUsers(data) {
    fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password, isAdmin } = req.body;

    const users = readUsers();
    const user = users.find(u => u.email === email);

    // cek email & password
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // cek kalau centang admin tapi bukan admin
    if (isAdmin && user.role !== 'admin') {
        return res.status(403).json({ message: 'Anda tidak memiliki akses admin.' });
    }

    // cek kalau admin tapi tidak centang admin
    if (!isAdmin && user.role === 'admin') {
        return res.status(403).json({ message: 'Silakan centang "Login sebagai Admin".' });
    }

    // login berhasil
    res.json({
        message: 'Login berhasil.',
        token: 'token-' + user.id, 
        user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
        }
    });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { email, nama, no_telp, password } = req.body;

    const users = readUsers();

    // cek email sudah terdaftar
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

     // buat ID baru
    const newId = 'C' + String(users.length).padStart(3, '0');

    const newUser = {
        id: newId,
        nama,
        email,
        no_telp,
        password,
        role: 'customer'
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'Register berhasil.' });
});

module.exports = router;