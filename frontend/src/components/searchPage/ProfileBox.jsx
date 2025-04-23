import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Buffer } from 'buffer/' // trailing slash required
import { FaRegUserCircle } from "react-icons/fa"

import ROUTES from '../../utils/Routes.js'
import ICONS from '../../utils/IconRoutes.js'
import PARAMS from '../../utils/SearchParams.js'
import { reviewParser } from '../../utils/RatingParser.js'


export default function ProfileBox({ _id, shortDescription, offerByUser, priceClasses, reviews, refs, setRefs, setHoverID }) {
    const [searchParams] = useSearchParams()

    const [profilePicture, setProfilePicture] = useState();
    useEffect(() => {
        if (offerByUser?.profilePicture?.data) {
            setProfilePicture(Buffer(offerByUser?.profilePicture?.data).toString());
        }
    }, [offerByUser])

    // set price according to sittingType; otherwise min offered price
    const foundPrice = priceClasses.find(priceClass =>
        priceClass.type == searchParams.get(PARAMS.SITTINGNEED)
    )?.price
    const price = foundPrice ? foundPrice : priceClasses.reduce(
        (min, priceClass) => Math.min(min, priceClass.price),
        Number.MAX_VALUE
    )

    // find amount of reviews and avg rating
    const [amountReviews, setAmountReviews] = useState(0)
    const [avgRating, setAvgRating] = useState()
    const [rating, setRating] = useState()
    useEffect(() => {
        const [review, avg] = reviewParser(reviews, _id)
        setAmountReviews(review.length)
        setAvgRating(avg)
    }, [reviews, _id])
    useEffect(() => {
        let text = (amountReviews === 1) ? amountReviews + " Rating" : amountReviews + " Ratings";
        text += (amountReviews > 0) ? " - " + avgRating : "";
        setRating(text)
    }, [amountReviews, avgRating])

    // ref to highlight ProfileBox when clicking on marker
    const ref = useRef(null);
    useEffect(() => {
        const refList = refs;
        refList.push({ _id, ref });
        setRefs(refList)
    }, [])

    return (
        <Link ref={ref} to={ROUTES.OFFER + "/" + _id} onMouseEnter={() => setHoverID(_id)} onMouseLeave={() => setHoverID()}
            style={{ order: (searchParams.get(PARAMS.ORDERING) == "PRICE") ? price : (50 - 10 * avgRating) }}
            className="block w-11/12 mx-auto my-4 p-4 shadow-xl rounded-2xl hover:bg-gray-100">
            <div className="flex justify-between">
                <div className="flex items-center">
                    <h1>{offerByUser?.firstName + " " + offerByUser?.lastName}</h1>
                    {offerByUser?.isVerified && <img className="max-h-5 mx-1" src={ICONS.VERIFIED} alt="Verified Symbol" />}
                </div>
                <p>{price} €</p>
            </div>
            <div className="flex items-center my-1">
                <p>{rating}</p>
                {amountReviews > 0 && <img className="max-h-5 mx-1" src={ICONS.STAR} alt="Star Symbol" />}
            </div>
            <div className="flex mt-2">
                {
                    profilePicture ?
                        <div className="h-16 w-16 rounded-full bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url(" + profilePicture + ")" }}></div>
                        :
                        <div className="flex items-center justify-center h-16 w-16 rounded-full">
                            <FaRegUserCircle size={40} />
                        </div>
                }
                <div className="w-10/12 flex flex-col justify-center mx-4">
                    <p className="mb-2">{offerByUser?.address}</p>
                    <p>{shortDescription}</p>
                </div>
            </div>
        </Link>
    );
};
