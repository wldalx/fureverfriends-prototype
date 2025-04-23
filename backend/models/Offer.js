import mongoose from "mongoose"
import PetType from "./enums/PetType.js"

export default mongoose.model('Offer', new mongoose.Schema({
    availabilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Availability'
    }],
    petTypes: {
        type: [{
            type: String,
            enum: Object.values(PetType)
        }],
        validate: [list => list.length > 0, 'At least one pet type is required']
    },
    priceClasses: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PriceClass'
        }],
        validate: [list => list.length > 0, 'At least one price class is required']
    },
    gallery: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    offerByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}))