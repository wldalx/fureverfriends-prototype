import mongoose from "mongoose"

export default mongoose.model('File', new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    }
}))