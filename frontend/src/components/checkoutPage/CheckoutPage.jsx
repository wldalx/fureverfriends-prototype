import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { FaRegEdit } from "react-icons/fa"
import { Link } from "react-router-dom"
import axios from "axios"

import ROUTES from "../../utils/Routes"
import REQUESTS from "../../utils/RequestRoutes"
import { priceText } from "../../utils/PriceCalculation"
import { useAuth } from "../../middleware/AuthMiddleware"
import CheckoutForm from "./CheckoutForm"
import ErrorPage from "../general/ErrorPage"

import "./payment.css"


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

export default function CheckoutPage({ booking }) {
    // stripe configurations
    const [clientSecret, setClientSecret] = useState("");

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
        }
    };


    const auth = useAuth()

    const [errorMsg, setErrorMsg] = useState(null)
    const [name, setName] = useState("")
    const [offerId, setOfferID] = useState()

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        axios.post(REQUESTS.PAYMENT, booking, { headers: { "Content-Type": "application/json" } })
            .then(res => setClientSecret(res.data.clientSecret))
            .catch(error => setErrorMsg(error.message))

        axios.get(REQUESTS.USER + "/" + booking.bookedUser)
            .then(res => {
                setName(res.data.firstName + " " + res.data.lastName)
                setOfferID(res.data.offer)
            })
            .catch(error => setErrorMsg(error.message))
    }, [])

    return (
        (errorMsg || !booking.bookedUser) ? <ErrorPage errorMsg={(errorMsg) ? errorMsg : "Cannot not proccess booking! Please try again!"} /> :
            <div className="m-auto w-7/12 min-h-[calc(100vh-7.5rem)]">
                <h1 className="my-12 text-center font-bold text-3xl">Book {name} as your Pet Sitter!</h1>
                <div className="w-full mb-8">
                    <div className="flex flex-row justify-between">
                        <p className="font-bold text-sm">Specify your Booking Details</p>
                        <p className="font-bold text-sm">Summary and Checkout</p>
                    </div>
                    <div className="border-4 border-green-500 rounded"></div>
                </div>
                <div className="flex flex-row justify-between my-10">
                    <div className="mr-12 w-full text-base">
                        <p className="mb-6 font-bold text-2xl">Summary:</p>
                        <div className="flex flex-row justify-between my-2">
                            <p>Selected Pet Type:</p>
                            <p className="capitalize">{booking.petType.toLowerCase()}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                            <p className="capitalize">Sitting Type:</p>
                            <p className="capitalize">{booking.sittingType.toLowerCase().replace("_", " ")}</p>
                        </div>
                        <div className="flex flex-row justify-between my-2">
                            <p>From:</p>
                            <p>{booking.startDate}</p>
                        </div>
                        <div className="flex flex-row justify-between my-2">
                            <p>To:</p>
                            <p>{booking.endDate}</p>
                        </div>
                        <div className="flex flex-row justify-between my-2">
                            <p>Price:</p>
                            <p>{priceText(booking.amount, booking.price, booking.sittingType, auth.bookings)}</p>
                        </div>
                        <div className="flex flex-row justify-between my-2">
                            <p>Pet's Special Needs:</p>
                            <p className="text-end">{booking.petNeeds}</p>
                        </div>
                        <Link to={ROUTES.BOOKING + "/" + offerId} className="block w-max mx-auto my-12 px-6 py-3 text-lg text-white bg-green-900 ring-1 ring-gray-500 rounded-full hover:bg-emerald-950 duration-200">
                            <span className="flex items-center"><FaRegEdit className="mr-2" />Edit</span>
                        </Link>
                    </div>
                    <div className="ml-12 w-full">
                        <p className="mb-6 font-bold text-2xl">Checkout:</p>
                        {clientSecret && (
                            <Elements options={options} stripe={stripePromise}>
                                <CheckoutForm />
                            </Elements>
                        )}
                    </div>
                </div>
            </div>
    );
}