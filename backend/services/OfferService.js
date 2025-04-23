import Offer from "../models/Offer.js"
import Booking from "../models/Booking.js"
import Availability from "../models/Availability.js"

export async function getFreeAvailabilities(offerId, past = false) {
    var availabilities = await Availability.find({ offer: offerId })
    const bookings = await Booking.find({
        bookedUser: (await Offer.findById(offerId)).offerByUser
    })

    // free availabilities are only from today onwards
    if(!past)
        availabilities = availabilities.filter(availability => new Date() <= availability.endDate).map(availability =>
            new Date() <= availability.startDate ? availability
            : new Availability({
                startDate: new Date(),
                endDate: availability.endDate
            })
        )

    for (const booking of bookings) {
    
        const remainingSlots = [];

        for (let availability of availabilities) {
            // +Date converts Date to milliseconds for comparison
            // – = booking, [  ] = availability

            // –[–––]– slot contains availability
            if (booking.startDate <= availability.startDate && availability.endDate <= booking.endDate) {}
            // [ – ] slot between availability
            else if (availability.startDate < booking.endDate && booking.startDate < availability.endDate)
                remainingSlots.push(
                    new Availability({
                        startDate: availability.startDate,
                        endDate: new Date(+booking.startDate - 24*3600*1000) // -1 day
                    }),
                    new Availability({
                        startDate: new Date(+booking.endDate + 24*3600*1000), // +1 day
                        endDate: availability.endDate
                    })
                )
            // –[–– ] booking overlaps only at beginning
            else if(booking.startDate <= availability.startDate && availability.startDate < booking.endDate && booking.endDate < availability.endDate)
                remainingSlots.push(new Availability({
                    startDate: new Date(+booking.endDate + 24*3600*1000), // +1 day
                    endDate: availability.endDate
                }))
            // [ ––]– booking overlaps only at end
            else if(availability.startDate < booking.startDate && booking.startDate < availability.endDate && availability.endDate <= booking.endDate)
                remainingSlots.push(new Availability({
                    startDate: availability.startDate,
                    endDate: new Date(+booking.startDate - 24*3600*1000) // -1 day
                }))
            // no overlap
            else
                remainingSlots.push(availability) // no change
        }

        availabilities = remainingSlots;
    }

    return availabilities;
}