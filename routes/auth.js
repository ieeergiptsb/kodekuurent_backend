const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createSecretToken = (id) => {
    // using a default secret if not provided in env
    return jwt.sign({ id }, process.env.TOKEN_KEY || 'kodekurrent_secret_key', {
        expiresIn: 3 * 24 * 60 * 60,
    });
};

router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, phone, rollNumber } = req.body;
        if (!email || !password || !fullName || !phone || !rollNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
        }

        const allowedDomains = ['@gmail.com', '@rgipt.ac.in', '@hotmail.com'];
        const isValidEmail = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
        if (!isValidEmail) {
            return res.status(400).json({ message: "Invalid email domain. Only @gmail.com, @rgipt.ac.in, and @hotmail.com are allowed." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ email, password, fullName, phone, rollNumber, username: fullName }); // Default username to fullName fallback
        const token = createSecretToken(user._id);

        res.status(201).json({
            message: "User signed up successfully",
            success: true,
            token,
            user: { id: user._id, username: user.fullName || user.username, email: user.email, phone: user.phone }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        const token = createSecretToken(user._id);
        res.status(200).json({
            message: "User logged in successfully",
            success: true,
            token,
            user: { id: user._id, username: user.fullName || user.username, email: user.email, phone: user.phone }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
