const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const User = require('../models/User');
const { userVerification } = require('../middleware/authMiddleware');

// POST /api/register
router.post('/register', userVerification, async (req, res) => {
    try {
        const { name, email, phone, rollNumber, college, teamName, branch, year, course, members } = req.body;

        // Basic validation
        if (!name || !email || !phone || !rollNumber || !college || !teamName || !branch || !year || !course) {
            return res.status(400).json({ message: 'All main fields are required.' });
        }

        if (!members || members.length < 1) {
            return res.status(400).json({ message: 'A team must have at least 2 members in total (1 lead + at least 1 teammate).' });
        }
        if (members.length > 3) {
            return res.status(400).json({ message: 'A team can have a maximum of 4 members in total (1 lead + 3 teammates).' });
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Team Lead phone number must be exactly 10 digits.' });
        }

        if (members && members.length > 0) {
            for (let i = 0; i < members.length; i++) {
                if (members[i].phone && !phoneRegex.test(members[i].phone)) {
                    return res.status(400).json({ message: `Teammate ${i + 2}'s phone number must be exactly 10 digits.` });
                }
            }
        }

        // Gather all emails to verify that every team member has an account
        const allEmails = [email.trim()];
        const formNames = { [email.trim()]: name };

        if (members && members.length > 0) {
            members.forEach(member => {
                if (member.email) {
                    const cleanEmail = member.email.trim();
                    allEmails.push(cleanEmail);
                    formNames[cleanEmail] = member.name;
                }
            });
        }

        // Check if ANY of these emails is already registered in another team
        const existingRegistrations = await Registration.find({
            $or: [
                { email: { $in: allEmails } },
                { 'members.email': { $in: allEmails } }
            ]
        });

        if (existingRegistrations.length > 0) {
            return res.status(400).json({ message: 'One or more members are already registered in another team! Each user can only participate in one single team.' });
        }

        // Query the User collection for these emails
        const registeredUsers = await User.find({ email: { $in: allEmails } });

        if (registeredUsers.length !== allEmails.length) {
            const registeredEmails = registeredUsers.map(u => u.email);
            const missingEmails = allEmails.filter(e => !registeredEmails.includes(e));

            return res.status(400).json({
                message: `Registration failed. The following team members have not created an account on KodeKurrent yet: ${missingEmails.join(', ')}. Every user must Sign Up first before they can be registered in a team.`
            });
        }

        // Enforce that the provided name matches the registered username exactly (case-insensitive)
        for (const user of registeredUsers) {
            const registeredUsername = (user.fullName || user.username || "").trim().toLowerCase();
            const providedName = formNames[user.email]?.trim().toLowerCase() || "";
            if (registeredUsername !== providedName) {
                return res.status(400).json({
                    message: `Name mismatch for ${user.email}. The name provided ("${formNames[user.email]}") does not match their registered KodeKurrent account name ("${user.fullName || user.username}").`
                });
            }
        }

        // Create new registration
        const newRegistration = new Registration({
            name,
            email,
            phone,
            rollNumber,
            college,
            teamName,
            branch,
            year,
            course,
            members
        });

        await newRegistration.save();

        res.status(201).json({ message: 'Registration successful!', registration: newRegistration });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// GET /api/registration/status
router.get('/registration/status', userVerification, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const email = user.email.trim();
        const registration = await Registration.findOne({
            $or: [
                { email: email },
                { 'members.email': email }
            ]
        });

        res.status(200).json({ isRegistered: !!registration });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
