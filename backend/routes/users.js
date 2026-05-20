const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function readUsers() {
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function writeUsers(data) {
    fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

// GET /api/users
router.get('/', (req, res) => {
    const users = readUsers();
    res.json(users);
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
    res.json(user);
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
    const { nama, email, no_telp } = req.body;

    const users = readUsers();
    const index = users.findIndex(u => u.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const duplicate = users.find(u => u.email === email && u.id !== req.params.id);
    if (duplicate) {
        return res.status(400).json({ message: 'Email sudah digunakan user lain.' });
    }

    users[index] = {
        ...users[index],
        nama: nama || users[index].nama,
        email: email || users[index].email,
        no_telp: no_telp || users[index].no_telp
    };

    writeUsers(users);
    res.json({ message: 'Customer berhasil diupdate.', user: users[index] });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
    const users = readUsers();
    const index = users.findIndex(u => u.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    if (users[index].role === 'admin') {
        return res.status(400).json({ message: 'Akun admin tidak bisa dihapus.' });
    }

    users.splice(index, 1);
    writeUsers(users);
    res.json({ message: 'Customer berhasil dihapus.' });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
    const { nama, email, no_telp, password } = req.body;

    const users = readUsers();
    const index = users.findIndex(u => u.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    if (email) {
        const duplicate = users.find(u => u.email === email && u.id !== req.params.id);
        if (duplicate) {
            return res.status(400).json({ message: 'Email sudah digunakan user lain.' });
        }
    }

    users[index] = {
        ...users[index],
        nama: nama || users[index].nama,
        email: email || users[index].email,
        no_telp: no_telp || users[index].no_telp,
        password: password || users[index].password
    };

    writeUsers(users);
    res.json({ message: 'Profil berhasil diupdate.', user: users[index] });
});

module.exports = router;