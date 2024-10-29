const express = require('express');

const router = express.Router();

// Example route GET
router.get('/v1/example', (req, res) => {
    res.send('Hello, this a test API route GET');
});

// Example route POST
router.post('/v1/example', (req, res) => {
    res.send('Hello, this a test API route POST');
});


module.exports = router;