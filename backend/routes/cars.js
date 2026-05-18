const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, '../data/cars.json');

function readCars() {
    return JSON.parse(fs.readFileSync(carsPath, 'utf-8'));
}

// GET /api/cars
router.get('/', (req, res) => {
    const cars = readCars();
    res.json(cars);
});

module.exports = router;