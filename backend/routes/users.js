const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function readUsers() {
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

// GET /api/users
router.get('/', (req, res) => {
    const users = readUsers();
    res.json(users);
});

module.exports = router;