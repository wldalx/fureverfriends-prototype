import bcryptjs from "bcryptjs"
import mongoose from "mongoose"
import "mongoose-type-email"

export default mongoose.model('Account', new mongoose.Schema({
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        set: pw => bcryptjs.hashSync(pw)
    },
    blocked: {
        type: Boolean,
        default: false
    }
}, {discriminatorKey: 'role'}))