import Offer from "../models/Offer.js"
import PriceClass from "../models/PriceClass.js"
import File from "../models/File.js"
import User from "../models/User.js"
import Availability from "../models/Availability.js"
import Review from "../models/Review.js"
import * as OfferService from "../services/OfferService.js"
import { sanitizeRead as sanitizeUser } from "./UserController.js"
import { isServerError } from "../services/ErrorDetectionService.js"
import { isSameRef } from "../services/ComparisonService.js"
import { getLocationCoordinates } from "../services/GeoLocationService.js"
import { checkAuthorization, getTokenContent } from "../middleware/auth.js"


// GET offers
export async function get(req, res) {
    // convert query params
    if(req.query.startDate) req.query.startDate = new Date(req.query.startDate)
    if(req.query.endDate) req.query.endDate = new Date(req.query.endDate)
    if(req.query.verified) req.query.verified = req.query.verified == 'true'
    if(req.query.maxPrice) req.query.maxPrice = parseFloat(req.query.maxPrice)
    if(req.query.review) req.query.review = parseFloat(req.query.review)
    req.query.blocked = req.query.blocked == 'true' // true = only blocked users, false (default) = only non-blocked users

    let selector = {}
    if (req.query.petType) selector.petTypes = req.query.petType
    if (req.query.location) {
        // filter by users within 15km radius of location
        const coordinates = await getLocationCoordinates(req.query.location, "DE").catch(_ => false)
        if (coordinates?.length) {
            const nearbyUsers = await User.find({
                offer: { $ne: null },
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates
                        },
                        $maxDistance: 15_000 // 15km
                    }
                }
            })
            selector.offerByUser = { $in:nearbyUsers }
        }
    }
    if(req.query.offerByUser) selector.offerByUser = req.query.offerByUser // override

    var offers;
    try {
        offers = await Offer.find(selector).select("_id offerByUser")
        offers = await Promise.all(offers.map(async offer =>
            await Offer.findById(offer._id).populate([
                "priceClasses",
                {
                    path: "offerByUser",
                    select: await sanitizeUser(req, offer.offerByUser), // check sanitize foreach single user
                    populate: 'profilePicture'
                }
            ])
        ))

        // FILTER DATE RANGE
        if (req.query.startDate || req.query.endDate) {
            // helper: check whether offer is between start and end dates
            async function isFreeInDateRange(offer, startDate, endDate) {
                return (await OfferService.getFreeAvailabilities(offer._id.toString()))
                 .some(availability => {
                    if (startDate && endDate)
                        return availability.startDate <= startDate
                            && endDate <= availability.endDate
                    if (startDate) // –[––
                        return startDate <= availability.endDate
                    if (endDate) // ––]–
                        return availability.startDate <= endDate
                    return true
                 })
            }
            const boolArray = await Promise.all(offers.map(offer =>
                isFreeInDateRange(offer, req.query.startDate, req.query.endDate)
            ))
            offers = offers.filter((_,index) => boolArray[index])
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (req.query.verified) offers = offers.filter(offer => offer.offerByUser.isVerified)

    offers = offers.filter(offer => offer.offerByUser.blocked === req.query.blocked)

    if (req.query.sittingNeed && req.query.maxPrice)
        offers = offers.filter(offer => offer.priceClasses.some(priceClass =>
            // both must match in in SAME price class
            priceClass.type == req.query.sittingNeed
            && priceClass.price <= req.query.maxPrice
        ))
    else if (req.query.sittingNeed)
        offers = offers.filter(offer => offer.priceClasses.some(priceClass =>
            priceClass.type == req.query.sittingNeed
        ))
    else if (req.query.maxPrice)
        offers = offers.filter(offer => offer.priceClasses.some(priceClass =>
            priceClass.price <= req.query.maxPrice
        ))

    // FILTER BY MIN AVG REVIEW
    if (req.query.review) {
        var reviews
        try {
            reviews = await Review.find({}).populate({
                path: 'booking',
                populate: 'bookedUser' // only internal use, thus no sanitizeUser
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
            return
        }

        // helper: get avg rating of reviews for offer
        function getReviewAvg(offer, reviews) {
            const reviewsOfOffer = reviews.filter(review => isSameRef(review.booking.bookedUser.offer, offer))
            const sum = reviewsOfOffer.reduce((sum, review) => sum + review.rating, 0)
            return reviewsOfOffer.length ?
                (sum / reviewsOfOffer.length).toFixed(1)
                : 1; // default for filtering
        }

        offers = offers.filter(offer =>
            getReviewAvg(offer, reviews) >= req.query.review
        )
    }

    res.status(200).json(offers)
}

// GET specific offer
export async function getById(req, res) {
    var offer;
    try {
        const user = (await Offer.findById(req.params.id).select("offerByUser"))?.offerByUser
        offer = await Offer.findById(req.params.id).populate([
            'gallery', 'priceClasses', 'availabilities',
            {
                path: 'offerByUser',
                select: await sanitizeUser(req, user),
                populate: 'profilePicture'
            }
        ])
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    if (!offer) {
        res.status(404).json({ error: "Offer not found" })
        return
    }

    res.status(200).json(offer)
}

// POST (create) offer
export async function post(req, res) {
    req.body = await sanitizeWrite(req, req.body, req.params.id)

    var offer;
    try {
        if(req.body.availabilities)
            req.body.availabilities = (await Availability.create(req.body.availabilities))
                .map(availability => availability._id)

        if(req.body.priceClasses)
            req.body.priceClasses = (await PriceClass.create(req.body.priceClasses))
                .map(priceClass => priceClass._id)
        
        if(req.body.gallery)
            req.body.gallery = (await File.create(req.body.gallery))
                .map(file => file._id)

        offer = await Offer.create(req.body)
        await User.findById(req.body.offerByUser).updateOne({ offer: offer._id })
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(offer)
}

// DELETE offer
export async function deleteById(req, res) {
    var offer;
    try {
        offer = await Offer.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

    if (!offer) {
        res.status(404).json({ error: "Offer not found" })
        return
    }

    // moderator or offering user
    if (!await checkAccess(req, offer)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        offer = await cascadingDeleteOffer(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message })
        return
    }

    res.status(200).json(offer)
}

// PUT (update) offer
export async function putById(req, res) {
    var offer;
    try {
        offer = await Offer.findById(req.params.id)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

    if (!offer) {
        res.status(400).json({ error: "Offer not found" })
        return
    }

    // moderator or offering user
    if (!await checkAccess(req, offer)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }
    req.body = await sanitizeWrite(req, req.body, req.params.id)

    try {
        // recreate PriceClasses
        if (req.body.priceClasses) {
            await PriceClass.deleteMany({_id:{$in:offer.priceClasses}})
            req.body.priceClasses = (await PriceClass.create(req.body.priceClasses))
                .map(priceClass => priceClass._id)
        } else
            req.body.priceClasses = offer.priceClasses

        // recreate image Files
        if (req.body.gallery) {
            await File.deleteMany({_id:{$in:offer.gallery}})
            req.body.gallery = (await File.create(req.body.gallery))
                .map(image => image._id)
        } else
            req.body.gallery = offer.gallery

        // recreate Availabilities
        if (req.body.availabilities) {
            await Availability.deleteMany({_id:{$in:offer.availabilities}})
            req.body.availabilities = (await Availability.create(req.body.availabilities))
                .map(availability => availability._id)
        } else
            req.body.availabilities = offer.availabilities

        offer = await Offer.findByIdAndUpdate(
            req.params.id,
            req.body,
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(offer)
}

export async function getFreeAvailabilities(req, res) {
    var freeAvailabilities
    try {
        freeAvailabilities = await OfferService.getFreeAvailabilities(req.params.id, req.query.past === "true")
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(freeAvailabilities)
}

export async function postAvailability(req, res) {
    var availability;
    try {
        availability = await Availability.create(req.body)

        // add to Offer.availabilities[]
        await Offer.findByIdAndUpdate(
            req.body.offer,
            {"$push": {"availabilities":availability._id} },
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(availability)
}

export async function deleteAvailability(req, res) {
    var availability;
    try {
        availability = await Availability.findById(req.params.id_availability).populate("offer")
    }  catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    if (!await checkAccess(req, availability.offer)) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    try {
        availability = await Availability.findByIdAndDelete(req.params.id_availability)
        // remove from Offer.availabilities[]
        await Offer.findByIdAndUpdate(
            availability.offer,
            {"$pull": {"availabilities":availability._id} },
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json(availability)
}

export async function cascadingDeleteOffer(id) {
    const offer = await Offer.findByIdAndDelete(id)

    await User.findById(offer.offerByUser).updateOne({ offer: null })
    await Availability.deleteMany({_id:{$in:offer.availabilities}})
    await PriceClass.deleteMany({_id:{$in:offer.priceClasses}})
    await File.deleteMany({_id:{$in:offer.gallery}})

    return offer
}

// check access rights
async function checkAccess(req, offer) {
    // moderator or offering user
    return await checkAuthorization(req, { role: 'Moderator' })
        || (await checkAuthorization(req, { role: 'User' }) &&
            isSameRef(getTokenContent(req).subject, offer.offerByUser)
        )
}

// sanitize offer
async function sanitizeWrite(req, offer, id) {
    if (await checkAuthorization(req, { role: 'Moderator' })) return offer

    if (offer.offerByUser !== undefined) // detect attempt to overwrite
        offer.offerByUser = getTokenContent(req).subject

    return offer
}