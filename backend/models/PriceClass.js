import mongoose from "mongoose"
import SittingType from "./enums/SittingType.js"

export default mongoose.model('PriceClass', new mongoose.Schema({
    price: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: Object.values(SittingType),
        required: true
    }
}))