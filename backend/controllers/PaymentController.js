import stripeFactory from 'stripe'
import { config } from 'dotenv'

import Offer from '../models/Offer.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import { checkAuthorization, getTokenContent } from '../middleware/auth.js'
import { isServerError } from '../services/ErrorDetectionService.js'

config({ path: ".env" })
const stripe = stripeFactory(process.env.STRIPE_API_KEY);


export async function paymentIntent(req, res) {
    if (!(await checkAuthorization(req, { role: 'User' }))) {
        res.status(403).json({ error: "Not authorized" })
        return
    }

    if(!("bookedUser" in req.body)) {
        res.status(400).json({ error:"Missing parameters: bookedUser" })
        return
    }

    try {
        const bookingUser = getTokenContent(req).subject
        const total = await verifiedPrice(bookingUser, req.body.bookedUser, {
            sittingType: req.body.sittingType,
            price: req.body.price,
            amount: req.body.amount
        })
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total * 100, // Stripe uses minimum currency unit i.e. 4.20 € → 420 cents
            currency: "eur"
        })

        const booking = await Booking.create({
            ...req.body,
            paid: false,
            paymentIntent: paymentIntent.id,
            bookingUser
        })

        await User.findByIdAndUpdate(
            booking.bookingUser,
            { "$push": { "bookings": booking._id } },
            { runValidators: true }
        )

        res.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }
}

/** helper: verify price 
 * @description check correctness i.e. calc price by amount and fees
 */
async function verifiedPrice(bookingUser, bookedUser, info) {
    if(["sittingType", "price", "amount"].some(key => !(key in info)))
        throw new Error("Missing information: sittingType, price, amount")
    const offer = await Offer.findOne({ offerByUser: bookedUser }).populate('priceClasses')
    // check if requested PriceClass exists in offer
    const priceClass = offer.priceClasses.find(priceClass =>
        priceClass.type == info.sittingType
        && priceClass.price == info.price
    )
    if (priceClass) {
        const user = await User.findById(bookingUser)
        return (
            priceClass.price
            * info.amount
            * (user.bookings.length > 0 ? 1.05 : 1) // 5% transaction fee after first booking
        ).toFixed(2)
    } else
        throw new Error("Invalid price or sitting type")
}