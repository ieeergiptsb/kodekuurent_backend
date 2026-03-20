const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    college: {
        type: String,
        required: true,
    },
    teamName: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    rollNumber: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    members: [{
        name: String,
        email: String,
        phone: String,
        rollNumber: String,
        branch: String,
        year: String,
        course: String
    }],
    registrationDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Registration', registrationSchema);
