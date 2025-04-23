import mongoose from "mongoose"

export default mongoose.model('Report', new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    open: { // open = report has not been handled by moderator yet
        type: Boolean,
        required: true,
        default: true
    },
    subject: {
        type: String,
        trim: true,
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}))