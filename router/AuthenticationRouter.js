const express = require('express');
const router = express.Router();

const AuthenticationController = require('../controllers/AuthenticationController');

router.post('/register', AuthenticationController.register);
router.post('/login', AuthenticationController.login);
router.get('/me', AuthenticationController.InfoUser); 

module.exports = router;
