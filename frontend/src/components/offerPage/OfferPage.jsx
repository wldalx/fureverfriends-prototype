import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

import REQUESTS from "../../utils/RequestRoutes"
import ROUTES from "../../utils/Routes"
import ErrorPage from '../general/ErrorPage.jsx'
import ServiceSection from './ServiceSection.jsx'
import ProfileMapSection from './ProfileMapSection.jsx'
import GalleryRatingSection from './GalleryRatingSection.jsx'
import { reviewParser } from '../../utils/RatingParser.js'


export default function OfferPage() {
    const { id } = useParams();

    const bg_img = "/img/offer_page_banner.jpg"

    const [errorMsg, setErrorMsg] = useState(null)

    const [offer, setOffer] = useState()
    const [name, setName] = useState("")
    const [reviews, setReviews] = useState()
    const [avgRating, setAvgRating] = useState()

    useEffect(() => {
        // get offer
        axios.get(REQUESTS.OFFER + "/" + id)
            .then(res => res.data)
            .then(data => {
                setOffer(data)
                setName(data.offerByUser.firstName + " " + data.offerByUser.lastName)
            })
            .catch(error => setErrorMsg(error.message))

        // get ratings
        axios.get(REQUESTS.REVIEW)
            .then(res => {
                const [reviews, avg] = reviewParser(res.data, id)
                setReviews(reviews)
                setAvgRating(avg)
            })
            .catch(error => setErrorMsg(error.message))
    }, [])

    return (
        errorMsg ? <ErrorPage errorMsg={errorMsg} /> :
            <>
                <div className="m-auto w-10/12">
                    <ProfileMapSection {...offer} name={name} avgRating={avgRating} amountReviews={reviews?.length} />
                    <ServiceSection id={id} petTypes={offer?.petTypes} priceClasses={offer?.priceClasses} setErrorMsg={setErrorMsg} />
                    <GalleryRatingSection reviews={reviews} gallery={offer?.gallery} />
                </div>
                <div className="relative flex items-center w-full h-96 bg-white z-20" style={{ backgroundImage: `url(${bg_img})`, backgroundPosition: "10% 70%" }}>
                    <Link to={ROUTES.BOOKING + "/" + id} className="block w-fit m-auto px-8 py-4 rounded-full text-xl font-semibold text-white bg-emerald-900 hover:bg-emerald-950 duration-200">
                        Book {name} as your Pet Sitter!
                    </Link>
                </div>
                <div className="fixed m-auto w-screen p-4 bottom-0 left-0 bg-white bg-opacity-50 z-10">
                    <Link to={ROUTES.BOOKING + "/" + id} className="block w-fit m-auto px-6 py-3 rounded-full text-lg font-semibold text-white bg-emerald-900 hover:bg-emerald-950 duration-200">
                        Book {name} as your Pet Sitter!
                    </Link>
                </div>
            </>
    );
};
