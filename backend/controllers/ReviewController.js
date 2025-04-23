import mongoose from "mongoose"

import Review from "../models/Review.js"
import Booking from "../models/Booking.js"
import { sanitizeRead as sanitizeUser } from "./UserController.js"
import { isServerError } from "../services/ErrorDetectionService.js"
import { isSameRef } from "../services/ComparisonService.js"
import { checkAuthorization, getTokenContent } from "../middleware/auth.js"


// GET reviews
export async function get(req, res) {
    var reviews;
    try {
        reviews = await Review.find(req.query).select("_id booking").populate({
            path: "booking",
            select: "bookedUser bookingUser"
        })
        reviews = await Promise.all(reviews.map(async review =>
            // check sanitize foreach single user
            await Review.findById(review._id).populate({
                path: "booking",
                populate: [
                    {
                        path: 'bookedUser',
                        select: await sanitizeUser(req, review.booking.bookedUser)
                    },
                    {
                        path: 'bookingUser',
                        select: await sanitizeUser(req, review.booking.bookingUser)
                    }
                ]
            })
        ))
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(reviews)
}

// GET specific review
export async function getById(req, res) {
    var review;
    try {
        review = await Review.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!review) {
        res.status(404).json({ error: "Review not found" })
        return
    }

    res.status(200).json(review)
}

// POST reviews
export async function post(req, res) {
    var review;

    // moderator or reviewing user, who has booked
    if (!await checkAccess(req, req.body)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        review = await Review.create(await sanitizeWrite(req, req.body, req.params.id))

        // Update Booking.review
        await Booking.findByIdAndUpdate(
            review.booking,
            { review: review._id },
            { runValidators: true, new:true /*return updated object*/ }
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(review)
}

// DELETE review
export async function deleteById(req, res) {
    var review;
    try {
        review = await Review.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!review) {
        res.status(404).json({ error: "Review not found" })
        return
    }

    // moderator or reviewing user, who has booked
    if (!await checkAccess(req, review)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        review = await Review.findByIdAndDelete(req.params.id)

        // Update Booking.review
        await Booking.findByIdAndUpdate(
            review.booking,
            {review:null},
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(review)
}

// PUT (update) review
export async function putById(req, res) {
    var review;
    try {
        review = await Review.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!review) {
        res.status(404).json({ error: "Review not found" })
        return
    }

    // moderator or reviewing user, who has booked
    if (!await checkAccess(req, review)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        review = await Review.findByIdAndUpdate(
            req.params.id,
            await sanitizeWrite(req, req.body, req.params.id),
            { runValidators: true, new:true /*return updated object*/ }
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(review)
}

// check access rights
async function checkAccess(req, review) {
    // moderator or reviewing user, who has booked
    return await checkAuthorization(req, { role: 'Moderator' })
        || (await checkAuthorization(req, { role: 'User' }) &&
            isSameRef(
                getTokenContent(req).subject,
                (await Booking.findById(review.booking))?.bookingUser
            )
        )
}

// sanitize review
async function sanitizeWrite(req, review, id) {
    if (await checkAuthorization(req, { role: 'Moderator' })) return review

    const bookingsOfUser = await Booking.aggregate([{ $match: {
        bookingUser: new mongoose.Types.ObjectId(await getTokenContent(req).subject)
    }}])
    if (review.booking && !bookingsOfUser.some(booking => isSameRef(booking, review.booking))) // detect attempt to overwrite
        delete review.booking

    return review
}