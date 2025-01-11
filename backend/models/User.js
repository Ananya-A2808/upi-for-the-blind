const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: String,
    otpExpiry: Date,
    upiId: {
        type: String,
        unique: true,
        sparse: true,
        default: function() {
            return this.email.split('@')[0] + '@upi';
        }
    },
    balance: {
        type: Number,
        default: 1000 // Starting balance
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 