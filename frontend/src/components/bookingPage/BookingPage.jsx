import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { toast } from 'react-toastify'

import REQUESTS from "../../utils/RequestRoutes.js"
import ROUTES from "../../utils/Routes"
import SITTING from "../../enums/SittingType.js"
import ErrorPage from '../general/ErrorPage.jsx'
import { useAuth } from '../../middleware/AuthMiddleware.jsx'
import { priceText } from '../../utils/PriceCalculation.js'
import { diffInDays, getDateInXDays, getMinimum, getMaximum, datesBeforeAndAfter, getInDateFrame, convertDateArray } from '../../utils/Date.js'
import InfoComponent from '../general/InfoComponent.jsx'


export default function BookingPage({ booking, setBooking }) {
    const { id } = useParams();

    const auth = useAuth()

    // sitter information
    const [name, setName] = useState("")
    const [offeredPetTypes, setOfferedPetTypes] = useState([booking.petType || ""])
    const [offeredPriceClasses, setOfferedPriceClasses] = useState((booking.sittingType) && [{ type: booking.sittingType }]) // if sittingType: [{…}] *else* false
    const [offeredAvailabilities, setOfferedAvailabilities] = useState()

    const [errorMsg, setErrorMsg] = useState(null)
    const [validate, setValidate] = useState(false)
    const [minEndDate, setMinEndDate] = useState()
    const [maxEndDate, setMaxEndDate] = useState()
    const [minStartDate, setMinStartDate] = useState()
    const [maxStartDate, setMaxStartDate] = useState()
    const [startDateError, setStartDateError] = useState()

    // booking attributes
    const [petType, setPetType] = useState(booking.petType || "")
    const [startDate, setStartDate] = useState(booking.startDate || "")
    const [endDate, setEndDate] = useState(booking.endDate || "")
    const [price, setPrice] = useState(booking.price || "")
    const [amount, setAmount] = useState(booking.amount || "")
    const [sittingType, setSittingType] = useState(booking.sittingType || "")
    const [petNeeds, setPetNeeds] = useState(booking.petNeeds || "")
    const [bookedUser, setBookedUser] = useState(booking.bookedUser || "")

    const [privacy, setPrivacy] = useState(false)

    // load data from backend
    useEffect(() => {
        axios.get(REQUESTS.OFFER + "/" + id)
            .then(res => res.data)
            .then(data => {
                setBookedUser(data.offerByUser._id)
                setName(data.offerByUser.firstName + " " + data.offerByUser.lastName)
                setOfferedPetTypes(data.petTypes)
                setOfferedPriceClasses(data.priceClasses)
            })
            .catch(error => setErrorMsg(error.message))
        axios.get(REQUESTS.OFFER + "/" + id + "/availabilities")
            .then(res => setOfferedAvailabilities(convertDateArray(res.data)))
            .catch(error => setErrorMsg(error.message))
    }, [id])


    // input validation for the dates
    useEffect(() => {
        if (offeredAvailabilities) {
            setMinStartDate(getMinimum(offeredAvailabilities))
            setMaxStartDate(getMaximum(offeredAvailabilities))

            // for overnight stays at least 2 days
            let x = 0;
            if (sittingType === SITTING.OVERNIGHT_STAY) {
                x = 1;
            }

            if (startDate /* = booking.startDate */) {
                const startDateFrame = getInDateFrame(offeredAvailabilities, startDate, x) // get date frame which includes startDate 
                if (!startDateFrame) { // suggest nearby frames
                    const alternatives = datesBeforeAndAfter(offeredAvailabilities, startDate, x)
                    let before = "";
                    let after = "";
                    if (alternatives[0]) {
                        before = "[" + alternatives[0][0] + " to " + getDateInXDays(alternatives[0][1], -x) + "]"
                    }
                    if (alternatives[1]) {
                        if (before !== "") {
                            after = " and "
                        }
                        after += "[" + alternatives[1][0] + " to " + getDateInXDays(alternatives[1][1], -x) + "]"
                    }
                    setStartDateError("Please select an available start date such as " + before + after)
                } else {
                    setStartDateError()
                    setMinEndDate(getDateInXDays(startDate, x))
                    setMaxEndDate(startDateFrame[1])
                    const adjStartDateFrame = [getDateInXDays(startDateFrame[0], x), startDateFrame[1]]
                    if (!getInDateFrame([adjStartDateFrame], endDate)) {
                        setEndDate("")
                    }
                }
            }
        }
    }, [offeredAvailabilities, startDate, sittingType])

    // calculate amount (for pricing) according to selected dates
    useEffect(() => {
        if (startDate && endDate) {
            const days = diffInDays(startDate, endDate)
            if (sittingType === SITTING.OVERNIGHT_STAY) {
                setAmount(days);
            } else if (sittingType === SITTING.HOUSESITTING || sittingType === SITTING.DAYCARE) {
                setAmount(days + 1);
            }
        }
    }, [sittingType, startDate, endDate])

    // find price according to sitting type
    useEffect(() => {
        if (sittingType && offeredPriceClasses) {
            const price = offeredPriceClasses.find(offeredPrice => offeredPrice.type === sittingType)
            setPrice(price.price)
        }
    }, [sittingType, offeredPriceClasses])

    // force integer amounts >=1
    useEffect(() => {
        if (amount) {
            if (amount < 1) {
                setAmount(1)
            } else if (amount % 1 !== 0) {
                setAmount(Math.round(amount))
            }
        }
    }, [amount])

    // when successful form -> redirect to checkout page
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        if (petType && startDate && endDate && price && amount && sittingType && petNeeds && bookedUser && privacy) {
            setBooking({ petType, startDate, endDate, price, amount, sittingType, petNeeds, bookedUser })
            navigate(ROUTES.CHECKOUT)
        } else {
            setValidate(true);
            toast.error("Please enter the missing information!");
        }
    }

    return (
        (errorMsg) ? <ErrorPage errorMsg={errorMsg} /> :
            <div className="flex flex-row items-center justify-center">
                <div className="w-7/12">
                    <h1 className="my-12 text-center font-bold text-3xl">Book {name} as your Pet Sitter!</h1>
                    <div className="w-full mb-8">
                        <div className="flex flex-row justify-between">
                            <p className="font-bold text-sm">Specify your Booking Details</p>
                            <p className="font-bold text-sm">Summary and Checkout</p>
                        </div>
                        <div className="relative">
                            <div className="border-4 rounded"></div>
                            <div className="absolute top-0 w-6/12 border-4 border-green-500 rounded"></div>
                        </div>
                    </div>
                    <p className="mt-10 mb-2 font-bold text-2xl">Specify your Booking Details:</p>
                    <form className="text-lg" onSubmit={event => handleSubmit(event)}>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col my-2">
                                <label htmlFor="petType" className={`my-2 ${(validate && !petType) && "text-red-700 font-bold"} `}>Pet Type:
                                    <InfoComponent>
                                        Our application allows you to specify the type of pet you need care for. You can choose from the following options:<br />
                                        - <b>Dog</b>: Select this if you need care for a dog.<br />
                                        - <b>Cat</b>: Select this if you need care for a cat.<br />
                                        - <b>Bird</b>: Select this if you need care for a bird.<br />
                                        - <b>Aquarium</b>: Select this if you need care for fish or other aquatic pets.<br />
                                        - <b>Reptile</b>: Select this if you need care for reptiles such as snakes or lizards.<br />
                                        - <b>Rodent</b>: Select this if you need care for small mammals like hamsters or guinea pigs.<br />
                                        - <b>Other</b>: Select this if your pet doesn't fit into the above categories. You can provide more details later.
                                    </InfoComponent>
                                </label>
                                <select id="petType" defaultValue={petType} onChange={event => setPetType(event.target.value)}
                                    className={`w-44 rounded-md border-0 p-2 text-base ring-1 leading-6 capitalize
                                    ${(validate && !petType) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}>
                                    <option hidden>Pet Type</option>
                                    {
                                        offeredPetTypes.map(offeredPetType => <option key={offeredPetType} value={offeredPetType} className="capitalize">{offeredPetType.toLowerCase()}</option>)
                                    }
                                </select>
                            </div>
                            <div className="flex flex-col my-2">
                                <label htmlFor="sittingType" className={`my-2 ${(validate && !sittingType) && "text-red-700 font-bold"} `}>Sitting Type:
                                    <InfoComponent>
                                        Choose the type of service you need for your pet:<br />
                                        - <b>Overnight Stay</b>: A sitter stays with your pet at your home overnight, ensuring they are cared for throughout the night.<br />
                                        - <b>Drop-in Visit</b>: A sitter visits your home for a short period to feed, play with, and check on your pet.<br />
                                        - <b>Housesitting</b>: A sitter stays in your home while you are away, providing continuous care for your pet and house.<br />
                                        - <b>Daycare</b>: A sitter takes care of your pet during the day, providing companionship and attention while you are at work or busy.
                                    </InfoComponent>
                                </label>
                                <select id="sittingType" defaultValue={sittingType} onChange={event => setSittingType(event.target.value)}
                                    className={`w-44 rounded-md border-0 p-2 text-base ring-1 leading-6 capitalize
                                    ${(validate && !sittingType) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}>
                                    <option hidden>Sitting Type</option>
                                    {
                                        offeredPriceClasses && offeredPriceClasses.map(offerPriceClass => <option key={offerPriceClass.type} value={offerPriceClass.type} className="capitalize">{offerPriceClass.type.toLowerCase().replace("_", " ")}</option>)
                                    }
                                </select>
                            </div>
                            <div className="flex flex-col my-2 w-44">
                                {(sittingType === SITTING.DROPIN_VISIT) &&
                                    <>
                                        <label htmlFor="amount" className={`my-2 ${(validate && !amount) && "text-red-700 font-bold"} `}>Visits amount:
                                            <InfoComponent setLeft={true}>The sitter will come to your home for a specified number of visits during the selected time period. You can specify how many visits you need for the selected time period.</InfoComponent>
                                        </label>
                                        <input type="number" id="amount" value={amount} min="1" stepsize="1" onChange={event => setAmount(event.target.value)}
                                            className={`w-44 rounded-md border-0 p-2 ring-1 text-base leading-6
                                            ${(validate && !amount) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`} />
                                    </>
                                }
                            </div>
                        </div>
                        {(startDateError) && <p className="w-60 mt-2 mb-[-1rem] text-red-700 text-sm">{startDateError}</p>}
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col my-2">
                                <label htmlFor="startDate" className={`my-2 ${(validate && !startDate) && "text-red-700 font-bold"} `}>From:
                                    <InfoComponent>To book a pet sitting service, you'll need to set a start and end date. This helps us ensure that you book a sitter who is available for the entire duration you need.<br />
                                        - <b>Start Date</b>: The first day you need the pet sitting service to begin.<br />
                                        - <b>End Date</b>: The last day you need the service. The sitter will take care of your pet until this date.
                                    </InfoComponent>
                                </label>
                                <input type="date" id="startDate" value={startDate} min={minStartDate} max={maxStartDate} onChange={event => setStartDate(event.target.value)}
                                    className={`w-44 rounded-md border-0 p-2 ring-1 text-base leading-6
                                    ${(validate && !startDate) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`} />
                            </div>
                            <div className="flex flex-col my-2">
                                <label htmlFor="endDate" className={`my-2 ${(validate && !endDate) && "text-red-700 font-bold"} `}>To:</label>
                                <input type="date" id="endDate" disabled={!startDate || startDateError} value={endDate} min={minEndDate} max={maxEndDate} onChange={event => setEndDate(event.target.value)}
                                    className={`w-44 rounded-md border-0 p-2 ring-1 text-base leading-6
                                    ${(validate && !endDate) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`} />
                            </div>
                            <div className="flex flex-col my-2 justify-between w-44">
                                <p className="my-2">Price:
                                    <InfoComponent setLeft={true}>When booking a pet sitter through our platform, here's how the pricing works:<br />
                                        - <b>First Booking</b>: Your first booking is free of any service fees. You only pay the sitter's listed price for the service.<br />
                                        - <b>Subsequent Bookings</b>: For every booking after the first one, a 5% service fee is added to the sitter's price.<br />
                                        This helps us maintain and improve our platform to provide you with the best service possible.<br /><br />
                                        For example, if a sitter's price is $100 for an overnight stay:<br />
                                        - For your first booking, you pay $100.<br />
                                        - For subsequent bookings, you pay $100 + 5% service fee ($5) = $105.
                                    </InfoComponent>
                                </p>
                                <p className="text-base leading-6">{(amount && price) ? priceText(amount, price, sittingType, auth.bookings) : "0"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col my-2">
                            <label htmlFor="petNeeds" className={`my-2 ${(validate && !petNeeds) && "text-red-700 font-bold"} `}>Pet's Special Needs:
                                <InfoComponent>
                                    We understand that every pet is unique and may have specific requirements.<br />
                                    Use the text field to provide details about your pet's individual needs.<br />
                                    This can include information such as:<br />
                                    - Dietary restrictions or special feeding instructions<br />
                                    - Medication requirements<br />
                                    - Behavioral traits or special care routines<br />
                                    - Preferred activities or exercise routines<br />
                                    - Any other important information the sitter should know<br /><br />
                                    Providing these details helps the sitter understand how to best care for your pet, ensuring a comfortable and personalized experience.
                                </InfoComponent>
                            </label>
                            <textarea id="petNeeds" rows={5} value={petNeeds} placeholder="Specifiy your pets special needs" onChange={event => setPetNeeds(event.target.value)}
                                className={`w-full rounded-md border-0 p-2 ring-1 text-base leading-6 ${(validate && !petNeeds) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`} />
                        </div>
                        <div className="flex flex-row my-4 items-center">
                            <input type="checkbox" id="privacy" defaultChecked={privacy} onChange={() => setPrivacy(privacy => !privacy)}
                                className={`w-4 h-4 ${(validate && !privacy) && "ring-1 ring-red-700"}`} />
                            <label htmlFor="privacy" className={`m-2 ${(validate && !privacy) && "text-red-700 font-bold"} `}>I have read and agree to FurEverFriend's <Link className="underline" to={ROUTES.PRIVACY}>Privacy Policy</Link> and to the terms and conditions as set out by the user agreement.</label>
                        </div>
                        <button type="submit" className="block mx-auto mt-8 mb-14 px-8 py-4 text-xl text-white bg-green-900 ring-1 ring-gray-500 rounded-full hover:bg-emerald-950 duration-200">Checkout</button>
                    </form>
                </div>
            </div>
    );
}