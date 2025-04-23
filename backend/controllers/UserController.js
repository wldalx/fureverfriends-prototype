import User from "../models/User.js"
import ModeratorRight from "../models/enums/ModeratorRight.js"
import Report from "../models/Report.js"
import Booking from "../models/Booking.js"
import File from "../models/File.js"
import { isServerError } from "../services/ErrorDetectionService.js"
import { getLocationCoordinates } from "../services/GeoLocationService.js"
import { checkAuthorization, getAccountFromToken } from "../middleware/auth.js"
import { cascadingDeleteOffer } from "./OfferController.js"

// GET users
export async function get(req, res) {
    var users;
    try {
        const userIds = await User.find(req.query).select("_id")
        users = await Promise.all(userIds.map(async userId =>
            await User.findById(userId)
                .select(await sanitizeRead(req, userId)) // check sanitize foreach single user
                .populate("verificationProof")
        ))
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(users)
}

// GET specific user
export async function getById(req, res) {
    var user;
    try {
        user = await User.findById(req.params.id)
            .select(await sanitizeRead(req, req.params.id))
            .populate("profilePicture")
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!user) {
        res.status(404).json({ error: "User not found" })
        return
    }

    res.status(200).json(user)
}

// POST (create) user
export async function post(req, res) {
    var user;

    // unique is not a validator → no beautiful error message
    // @see mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator
    try {
        user = await User.findOne({username: req.body.username})
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }
    if(user) {
        res.status(400).json({error:"Username already in use."});
        return
    }

    // create verificationProof
    if(req.body.verificationProof)
        req.body.verificationProof = (await new File(req.body.verificationProof).save())._id;

    // create profilePicture
    if(req.body.profilePicture)
        req.body.profilePicture = (await new File(req.body.profilePicture).save())._id;

    // update coordinates
    if(req.body.address && req.body.country)
        req.body.coordinates = await getLocationCoordinates(req.body.address, req.body.country)
    // if no address found, clear coords if not user-given
    if(!req.body.coordinates)
        req.body.coordinates = null // @see mongodb.com/docs/manual/core/indexes/index-types/geospatial/2dsphere

    try {
        user = await User.create(await sanitizeWrite(req, req.body, req.params.id))
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(user)
}

// DELETE user
export async function deleteById(req, res) {
    // moderator or user itself
    if (!await checkAuthorization(req,
        { role: 'Moderator', rights: [ModeratorRight.DELETE_USER] },
        { role: 'User', _id: req.params.id }
    )) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    var user;
    try {
        user = await User.findById(req.params.id).populate("bookings")
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!user) {
        res.status(404).json({ error: "User not found" })
        return
    }

    // check if any open bookings/jobs left
    if (user.bookings.some(booking => new Date() <= booking.endDate)) {
        res.status(405 /*Method not allowed*/).json({ error: "There are current or upcoming bookings left" })
        return
    }
    var jobs;
    try {
        jobs = await Booking.aggregate([{ $match:{ bookedUser:user._id }}])
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }
    if (jobs.some(booking => new Date() <= booking.endDate)) {
        res.status(405 /*Method not allowed*/).json({ error: "There are current or upcoming jobs left" })
        return
    }

    var user;
    try {
        await User.findByIdAndDelete(req.params.id)

        // cascade
        if(user.profilePicture) await File.findByIdAndDelete(user.profilePicture)
        if(user.verificationProof) await File.findByIdAndDelete(user.verificationProof)
        await Report.deleteMany({$or:[
            {reportedUser: user._id},
            {reportingUser: user._id}
        ]})
        if(user.offer) await cascadingDeleteOffer(user.offer)
        await Booking.deleteMany({_id:{$in:user.bookings}})
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(user)
}

// PUT (update) user
export async function putById(req, res) {
    // moderator or user itself
    if (!await checkAuthorization(req, { role: 'Moderator' }, { role: 'User', _id: req.params.id })) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    var user;
    try {
        user = await User.findById(req.params.id)
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    if (!user) {
        res.status(404).json({ error: "User not found" })
        return
    }

    // unique is not a validator → no beautiful error message
    // @see mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator
    if(user.username !== req.body.username && await User.exists({username: req.body.username})) {
        res.status(400).json({error:"Username already in use."});
        return
    }

    // update/delete verificationProof
    if(req.body.verificationProof !== undefined /* null | {…} */) {
        if(user.verificationProof) await File.findByIdAndDelete(user.verificationProof);
        if(req.body.verificationProof)
            req.body.verificationProof = (await new File(req.body.verificationProof).save())._id;
    }

    // update/delete profilePicture
    if(req.body.profilePicture !== undefined /* null | {…} */) {
        if(user.profilePicture) await File.findByIdAndDelete(user.profilePicture);
        if(req.body.profilePicture)
            req.body.profilePicture = (await new File(req.body.profilePicture).save())._id;
    }

    // update coordinates
    if(req.body.address && req.body.country)
        req.body.coordinates = await getLocationCoordinates(req.body.address, req.body.country)
    // if no address found, clear coords if not user-given
    if(!req.body.coordinates)
        req.body.coordinates = null // @see mongodb.com/docs/manual/core/indexes/index-types/geospatial/2dsphere
    
    try {
        user = await User.findByIdAndUpdate(
            req.params.id,
            await sanitizeWrite(req, req.body, req.params.id),
            { runValidators: true, new:true /*return updated object*/ }
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(user)
}

// sanitizes fields of unauthorized user requests
export async function sanitizeRead(req, user) {
    if(!(user instanceof User)) user = await User.findById(user)
    if(!user) return ''

    const hide = []

    // show all if requested user == self
    if (!(await checkAuthorization(req, {role:"Moderator"}, {role:"User", _id:user._id}))) {
        hide.push('username', 'password', 'iban', 'verificationProof', 'bookings')

        // only show location if requested user has offer
        if (!user.offer) hide.push('address', 'coordinates')

        // only show contact details to participants in a booking
        const account = await getAccountFromToken(req).catch(_ => null)
        if (!account || (!await Booking.exists({
            bookedUser: account._id,
            bookingUser: user._id
        }) && !await Booking.exists({
            bookedUser: user._id,
            bookingUser: account._id
        })))
            hide.push('phoneNumber', 'email')
    }

    return hide.map(field => '-' + field).join(' ') // projection, like SQL SELECT
}

async function sanitizeWrite(req, user, id) {
    // prevent writing isVerified for Users and Moderators without VERIFY_USER
    if (!await checkAuthorization(req, { role: "Moderator", rights: [ModeratorRight.VERIFY_USER] }))
        if (user.isVerified !== undefined)
            delete user.isVerified

    if (await checkAuthorization(req, { role: 'Moderator' })) return user

    // edit via respective Controllers
    delete user.reports
    delete user.offer
    delete user.bookings

    return user
}