import mongoose from "mongoose"
import Account from "./Account.js"

export default Account.discriminator('User', new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        // whole address except country single form field
        // → address is country-agnostic
        type: String,
        trim: true,
        required: true
    },
    country: {
        type: String,
        trim: true,
        required: true
    },
    coordinates: [{
        type: Number,
        index: '2dsphere'
    }],
    phoneNumber: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    iban: {
        type: String,
        trim: true
    },
    verificationProof: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    reports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    }],
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }]
}))