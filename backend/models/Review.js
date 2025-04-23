import mongoose from "mongoose"

export default mongoose.model('Review', new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true        
    },
    date: {
        type: Date,
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    }
}))