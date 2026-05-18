const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const rentalsPath = path.join(__dirname, '../data/rentals.json');

function readRentals() {
    return JSON.parse(fs.readFileSync(rentalsPath, 'utf-8'));
}

// GET /api/rentals
router.get('/', (req, res) => {
    const rentals = readRentals();
    res.json(rentals);
});

module.exports = router;