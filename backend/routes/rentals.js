const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const rentalsPath = path.join(__dirname, '../data/rentals.json');
const carsPath = path.join(__dirname, '../data/cars.json');

function readRentals() {
    return JSON.parse(fs.readFileSync(rentalsPath, 'utf-8'));
}

function writeRentals(data) {
    fs.writeFileSync(rentalsPath, JSON.stringify(data, null, 2));
}

function readCars() {
    return JSON.parse(fs.readFileSync(carsPath, 'utf-8'));
}

function writeCars(data) {
    fs.writeFileSync(carsPath, JSON.stringify(data, null, 2));
}

function generateId(rentals) {
    if (rentals.length === 0) return 'TRX001';
    const nums = rentals.map(r => parseInt(r.id.replace('TRX', '')));
    const max = Math.max(...nums);
    return 'TRX' + String(max + 1).padStart(3, '0');
}

// GET /api/rentals
router.get('/', (req, res) => {
    const rentals = readRentals();
    res.json(rentals);
});

// GET /api/rentals/:id
router.get('/:id', (req, res) => {
    const rentals = readRentals();
    const rental = rentals.find(r => r.id === req.params.id);
    if (!rental) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    res.json(rental);
});

// POST /api/rentals — customer booking
router.post('/', (req, res) => {
    const { customer_id, mobil_id, tanggal_mulai, tanggal_selesai, metode_pembayaran } = req.body;

    if (!customer_id || !mobil_id || !tanggal_mulai || !tanggal_selesai || !metode_pembayaran) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const cars = readCars();
    const carIndex = cars.findIndex(c => c.id === mobil_id);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Mobil tidak ditemukan.' });
    }

    if (cars[carIndex].status === 'disewa') {
        return res.status(400).json({ message: 'Mobil sedang disewa.' });
    }

    const start = new Date(tanggal_mulai);
    const end = new Date(tanggal_selesai);
    const jumlah_hari = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (jumlah_hari <= 0) {
        return res.status(400).json({ message: 'Tanggal selesai harus setelah tanggal mulai.' });
    }

    const total_biaya = jumlah_hari * cars[carIndex].tarif_per_hari;

    const rentals = readRentals();

    const newRental = {
        id: generateId(rentals),
        customer_id,
        mobil_id,
        tanggal_mulai,
        tanggal_selesai,
        jumlah_hari,
        total_biaya,
        status: 'aktif',
        metode_pembayaran,
        tanggal_bayar: new Date().toISOString().split('T')[0]
    };

    cars[carIndex].status = 'disewa';
    writeCars(cars);

    rentals.push(newRental);
    writeRentals(rentals);

    res.status(201).json({ message: 'Booking berhasil.', rental: newRental });
});

// PUT /api/rentals/:id/selesai — admin selesaikan transaksi
router.put('/:id/selesai', (req, res) => {
    const rentals = readRentals();
    const index = rentals.findIndex(r => r.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    }

    if (rentals[index].status === 'selesai') {
        return res.status(400).json({ message: 'Transaksi sudah selesai.' });
    }

    rentals[index].status = 'selesai';
    writeRentals(rentals);

    const cars = readCars();
    const carIndex = cars.findIndex(c => c.id === rentals[index].mobil_id);
    if (carIndex !== -1) {
        cars[carIndex].status = 'tersedia';
        writeCars(cars);
    }

    res.json({ message: 'Transaksi berhasil diselesaikan.', rental: rentals[index] });
});

// DELETE /api/rentals/:id
router.delete('/:id', (req, res) => {
    const rentals = readRentals();
    const index = rentals.findIndex(r => r.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    }

    if (rentals[index].status === 'aktif') {
        const cars = readCars();
        const carIndex = cars.findIndex(c => c.id === rentals[index].mobil_id);
        if (carIndex !== -1) {
            cars[carIndex].status = 'tersedia';
            writeCars(cars);
        }
    }

    rentals.splice(index, 1);
    writeRentals(rentals);
    res.json({ message: 'Transaksi berhasil dihapus.' });
});

module.exports = router;