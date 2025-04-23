// calc avg rating of offer `offerID`
export function reviewParser(allReviews, offerID) {
    const reviews = allReviews.filter(review => review.booking.bookedUser.offer === offerID)
    const sum = reviews.reduce((accumulator, review) => accumulator + review.rating, 0)
    let avg = 0;
    if (reviews.length)
        avg = (sum / reviews.length).toFixed(1)

    return [reviews, avg]
}