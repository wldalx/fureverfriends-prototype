import SITTING from "../enums/SittingType.js"

export function priceText(amount, price, sittingType, bookings) {
    let priceText
    let fee = ""
    if (bookings.length) {
        priceText = (price * amount * 1.05).toFixed(2) + "€"
        fee = " + 5% fee"
    } else {
        priceText = (price * amount).toFixed(2) + "€"
    }

    let plural = (amount > 1) ? "s" : ""

    if (sittingType === SITTING.DROPIN_VISIT) {
        priceText += ` (${amount} visit${plural} à ${price}€${fee})`
    } else if (sittingType === SITTING.OVERNIGHT_STAY) {
        priceText += ` (${amount} night${plural} à ${price}€${fee})`
    } else if (sittingType === SITTING.HOUSESITTING || sittingType === SITTING.DAYCARE) {
        priceText += ` (${amount} day${plural} à ${price}€${fee})`
    }

    return priceText
}
