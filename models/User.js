const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Your email address is required"],
        unique: true,
    },
    fullName: {
        type: String,
        required: [true, "Your full name is required"],
    },
    rollNumber: {
        type: String,
        required: [true, "Your roll number is required"],
    },
    phone: {
        type: String,
        required: [true, "Your phone number is required"],
    },
    password: {
        type: String,
        required: [true, "Your password is required"],
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", userSchema);
