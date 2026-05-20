const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, '../data/cars.json');

function readCars() {
    return JSON.parse(fs.readFileSync(carsPath, 'utf-8'));
}

function writeCars(data) {
    fs.writeFileSync(carsPath, JSON.stringify(data, null, 2));
}

function generateId(cars) {
    if (cars.length === 0) return 'M001';
    const nums = cars.map(c => parseInt(c.id.replace('M', '')));
    const max = Math.max(...nums);
    return 'M' + String(max + 1).padStart(3, '0');
}

// GET /api/cars
router.get('/', (req, res) => {
    const cars = readCars();
    res.json(cars);
});

// GET /api/cars/:id
router.get('/:id', (req, res) => {
    const cars = readCars();
    const car = cars.find(c => c.id === req.params.id);
    if (!car) return res.status(404).json({ message: 'Mobil tidak ditemukan.' });
    res.json(car);
});

// POST /api/cars
router.post('/', (req, res) => {
    const { nama, plat, kursi, tarif_per_hari, gambar } = req.body;

    if (!nama || !plat || !kursi || !tarif_per_hari) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const cars = readCars();

    // cek plat duplikat
    const existing = cars.find(c => c.plat === plat);
    if (existing) {
        return res.status(400).json({ message: 'Plat nomor sudah terdaftar.' });
    }

    const newCar = {
        id: generateId(cars),
        nama,
        plat,
        kursi: parseInt(kursi),
        tarif_per_hari: parseInt(tarif_per_hari),
        status: 'tersedia',
        gambar: gambar || ''
    };

    cars.push(newCar);
    writeCars(cars);

    res.status(201).json({ message: 'Mobil berhasil ditambahkan.', car: newCar });
});

// PUT /api/cars/:id
router.put('/:id', (req, res) => {
    const { nama, plat, kursi, tarif_per_hari, gambar, status } = req.body;

    const cars = readCars();
    const index = cars.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Mobil tidak ditemukan.' });
    }

    // cek plat duplikat (kecuali mobil itu sendiri)
    const duplicate = cars.find(c => c.plat === plat && c.id !== req.params.id);
    if (duplicate) {
        return res.status(400).json({ message: 'Plat nomor sudah digunakan mobil lain.' });
    }

    cars[index] = {
        ...cars[index],
        nama: nama || cars[index].nama,
        plat: plat || cars[index].plat,
        kursi: kursi ? parseInt(kursi) : cars[index].kursi,
        tarif_per_hari: tarif_per_hari ? parseInt(tarif_per_hari) : cars[index].tarif_per_hari,
        gambar: gambar !== undefined ? gambar : cars[index].gambar,
        status: status || cars[index].status
    };

    writeCars(cars);
    res.json({ message: 'Mobil berhasil diupdate.', car: cars[index] });
});

// DELETE /api/cars/:id
router.delete('/:id', (req, res) => {
    const cars = readCars();
    const index = cars.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Mobil tidak ditemukan.' });
    }

    // cek apakah mobil sedang disewa
    if (cars[index].status === 'disewa') {
        return res.status(400).json({ message: 'Mobil sedang disewa, tidak bisa dihapus.' });
    }

    cars.splice(index, 1);
    writeCars(cars);
    res.json({ message: 'Mobil berhasil dihapus.' });
});

module.exports = router;