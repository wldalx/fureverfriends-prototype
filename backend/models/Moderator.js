import mongoose from "mongoose"
import Account from "./Account.js"
import ModeratorRights from "./enums/ModeratorRight.js"

export default Account.discriminator('Moderator', new mongoose.Schema({
    rights: [{
        type: String,
        enum: Object.values(ModeratorRights)
    }]
}))