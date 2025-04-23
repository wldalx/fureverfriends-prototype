import Booking from "../models/Booking.js"
import User from "../models/User.js"
import { sanitizeRead as sanitizeUser } from "./UserController.js"
import { isServerError } from "../services/ErrorDetectionService.js"
import { checkAuthorization, getTokenContent } from "../middleware/auth.js"
import { isSameRef } from "../services/ComparisonService.js"


// GET bookings
export async function get(req, res) {

    // AUTHORIZATION
    var selector = req.query; // default: if moderator
    // if user: only own bookings
    let accountId = getTokenContent(req).subject;
    if (await checkAuthorization(req, { role: 'User' }))
        selector = {$and:[
            req.query,
            {$or:[
                { bookingUser: accountId },
                { bookedUser: accountId }
            ]}
        ]}

    var bookings;
    try {
        bookings = await Booking.find(selector).select("_id bookingUser")
        bookings = await Promise.all(bookings.map(async booking =>
            await Booking.findById(booking._id)
                .populate(
                    "bookingUser",
                    await sanitizeUser(req, booking.bookingUser) // check sanitize foreach single user
                )
        ))
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(bookings)
}

// GET specific booking
export async function getById(req, res) {
    var booking;
    try {
        const user = (await Booking.findById(req.params.id).select("bookedUser"))?.bookedUser
        booking = await Booking.findById(req.params.id)
            .populate("bookedUser", await sanitizeUser(req, user))
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!booking) {
        res.status(404).json({ error: "Booking not found" })
        return
    }

    // moderator or booking/booked user
    if (!await checkAccess(req, booking)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    res.status(200).json(booking)
}

// POST (create) booking
export async function post(req, res) {
    var booking;
    try {
        booking = await Booking.create(await sanitizeWrite(req, req.body, req.params.id))

        // add to User.bookings[]
        await User.findByIdAndUpdate(
            booking.bookingUser,
            {"$push": {"bookings":booking._id} },
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(booking)
}

// DELETE specific booking
export async function deleteById(req, res) {
    var booking
    try {
        booking = await Booking.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!booking) {
        res.status(404).json({ error: "Booking not found" })
        return
    }

    // moderator or booking user (not booked user)
    if (!await checkAuthorization(req, { role: 'Moderator' })
        && !(await checkAuthorization(req, { role: 'User' })
            && isSameRef(getTokenContent(req).subject, booking.bookingUser)
            && !booking.paid)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        await Booking.findByIdAndDelete(booking)

        // remove from User.bookings[]
        await User.findByIdAndUpdate(
            booking.bookingUser,
            {"$pull": {"bookings":booking._id} },
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(booking)
}

// PUT (update) booking
export async function putById(req, res) {
    var booking;
    try {
        booking = await Booking.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message });
        return
    }

    if (!booking) {
        res.status(404).json({ error: "Booking not found" })
        return
    }

    // moderator or booking/booked user
    if (!await checkAccess(req, booking)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        booking = await Booking.findByIdAndUpdate(
            req.params.id,
            await sanitizeWrite(req, req.body, req.params.id),
            { runValidators: true, new:true /*return updated object*/ }
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(booking)
}

// check access rights
async function checkAccess(req, booking) {
    // moderator or booking/booked user
    return await checkAuthorization(req, { role: 'Moderator' })
        || (await checkAuthorization(req, { role: 'User' })
            && (
                isSameRef(getTokenContent(req).subject, booking.bookingUser)
                || isSameRef(getTokenContent(req).subject, booking.bookedUser)
            )
        )
}

// sanitize booking
async function sanitizeWrite(req, booking, id) {
    if (await checkAuthorization(req, { role: 'Moderator' })) return booking

    const bookingInDB = await Booking.findById(id)
    if (bookingInDB?.paid) // only allow below properties
        return {
            petNeeds: booking.petNeeds,
            review: booking.review
        }

    delete booking.paid
    if (booking.bookingUser) // detect attempt to overwrite
        booking.bookingUser = getTokenContent(req).subject

    return booking
}