import mongoose from "mongoose"

export default mongoose.model('Availability', new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    }
}))