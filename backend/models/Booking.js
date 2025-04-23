import mongoose from "mongoose"
import PetType from './enums/PetType.js'
import SittingType from './enums/SittingType.js'

export default mongoose.model('Booking', new mongoose.Schema({
    petType: {
        type: String,
        enum: Object.values(PetType),
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    price: { // because offers can be changed after booking
        type: Number,
        required: true,
        min: 0
    },
    amount: { // e.g. number of drop-in visits
        type: Number,
        required: true,
        min: 1
    },
    sittingType: {
        type: String,
        enum: Object.values(SittingType),
        required: true
    },
    petNeeds: {
        type: String
    },
    paid: {
        type: Boolean,
        required: true,
        default: false
    },
    paymentIntent: {
        type: String,
        required: true
    },
    bookingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }
}))