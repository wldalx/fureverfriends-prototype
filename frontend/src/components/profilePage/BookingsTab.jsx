import { useEffect, useState } from "react"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Modal from 'react-modal'
import axios from "axios"
import { toast } from "react-toastify"

import { LuBookMarked } from "react-icons/lu"
import { FaRegEdit, FaRegSave } from "react-icons/fa"
import { GoCodeReview } from "react-icons/go"
import { MdReportGmailerrorred, MdOutlineDeleteForever } from "react-icons/md"
import { CiStar } from "react-icons/ci"

import RequestRoutes from "../../utils/RequestRoutes"
import { useAuth } from "../../middleware/AuthMiddleware"
import { convertDate, getCurrentDate } from "../../utils/Date"
import InfoComponent from "../general/InfoComponent"


export default function BookingsTab() {
    const auth = useAuth();

    /**************************************\
    |*  UPCOMING + PREVIOUS BOOKINGS TAB  *|
    \**************************************/
    const [selectedTab, setSelectedTab] = useState("Upcoming");
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [previousBookings, setPreviousBookings] = useState([]);
    function updateBookings() {
        Promise.all(auth.bookings.map(bookingId =>
            axios.get(RequestRoutes.BOOKING + "/" + bookingId).then(res => res.data)
        )).then(bookings => {
            const now = new Date();
            setPreviousBookings(bookings.filter(booking =>
                new Date(booking.endDate) < now
            ))
            setUpcomingBookings(bookings.filter(booking =>
                now <= new Date(booking.endDate)
            ))
        })
    }
    useEffect(updateBookings, [])

    // Component
    function BookingItem({booking, showContactDetails, children}) {
        return <div className="bg-gray-50 shadow-lg hover:bg-gray-100 duration-200 m-4 space-y-2 flex flex-col rounded-xl">
            <span className="text-xl mt-4 ml-4 font-bold">{booking.bookedUser.firstName} {booking.bookedUser.lastName}</span>
            <div className="grid grid-cols-[70%_30%]">
                <div className="grid grid-cols-3">
                    <div className="flex flex-col justify-center m-4 w-full">
                        <span>Start: {convertDate(booking.startDate)}</span>
                        <span>End: {convertDate(booking.endDate)}</span>
                    </div>
                    <div className="flex flex-col justify-start m-4 w-full">
                        <span className="capitalize">Pet Type: {booking.petType.replace("_"," ").toLowerCase()}</span>
                        <span className="capitalize">Sitting Type: {booking.sittingType.replace("_"," ").toLowerCase()}</span>
                    </div>
                    <div className="flex flex-col justify-start m-4 w-full">
                        <span>Amount: {booking.amount}</span>
                        <span>Price: {booking.price} €</span>
                    </div>
                    { !showContactDetails ? "" :
                        <div className="flex flex-col justify-start m-4 w-full">
                            <span className="font-bold">Contact Details:</span>
                            <span className="mt-2">Email: {booking.bookedUser.email}</span>
                            <span>Phone Number: {booking.bookedUser.phoneNumber}</span>
                        </div>
                    }
                </div>
                <div className="flex flex-row w-full items-center justify-center">
                    {children}
                </div>
            </div>
        </div>
    }

    // Component
    function BookingListPrevious() {
        if (previousBookings.length === 0)
            return <div className="flex flex-col items-center justify-center space-x-2 text-lg mb-8">
                <LuBookMarked size={50} className="mb-4" />
                <span>No bookings yet.</span>
            </div>

        return previousBookings.map(booking =>
            <BookingItem key={booking._id} booking={booking}>
                <button className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                    onClick={async () => {
                        if (booking.review)
                            await axios.get(RequestRoutes.REVIEW + "/" + booking.review).then(res => {
                                setReviewDescription(res.data.description)
                                setReviewRating(res.data.rating)
                                setIsReviewUpdate(true)
                                setReviewId(res.data._id)
                            })
                        setReviewBookingId(booking._id)
                        setReviewModalOpen(true)
                    }}>
                    <span className="flex items-center"><GoCodeReview className="mr-2" />{booking.review ? "Edit Review" : "Review"}</span>
                </button>
                <button className="text-gray-300 bg-red-900 ring-1 ring-gray-500 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                    onClick={() => {
                        setUserToReport(booking.bookedUser._id)
                        setReportModalOpen(true)
                    }}>
                    <span className="flex items-center"><MdReportGmailerrorred size={20} className="mr-2" />Report</span>
                </button>
            </BookingItem>
        )
    }

    // Component
    function BookingListUpcoming() {
        if (upcomingBookings.length === 0)
            return <div className="flex flex-col items-center justify-center space-x-2 text-lg mb-8">
                <LuBookMarked size={50} className="mb-4" />
                <span>No bookings yet.</span>
            </div>

        return upcomingBookings.map(booking =>
            <BookingItem key={booking._id} booking={booking} showContactDetails={true}>
                <button className="text-gray-300 bg-emerald-900 ring-1 ring-gray-500 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                    onClick={() => {
                        setCurrentBooking(booking._id)
                        setCurrentBookingDescription(booking.petNeeds)
                        setPetNeedsModalOpen(true)
                    }}>
                    <span className="flex items-center"><FaRegEdit className="mr-2" />Edit Pet Needs</span>
                </button>
            </BookingItem>
        )
    }


    /************\
    |*  MODALS  *|
    \************/
    const [validate, setValidate] = useState(false); // whether form validation failed, used by multiple modals

    // Component: pet needs modal
    const [petNeedsModalOpen, setPetNeedsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState("");
    const [currentBookingDescription, setCurrentBookingDescription] = useState("");
    function PetNeedModal() {
        function handlePetNeedsSubmit(event) {
            event.preventDefault()
    
            if (currentBookingDescription.length < 10) {
                toast.error("The description needs to be at least 10 characters long.")
                return
            }
    
            axios.put(RequestRoutes.BOOKING + "/" + currentBooking, {
                petNeeds: currentBookingDescription
            }).then(() => {
                setPetNeedsModalOpen(false)
                setCurrentBooking("")
                setCurrentBookingDescription("")
                toast.success("Pet needs updated successfully.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                })
            }).catch(() => {
                toast.error("An error occured while updating the pet needs. Please try again later.")
            })
        }

        return (
            <Modal ariaHideApp={false} isOpen={petNeedsModalOpen} onRequestClose={() => setPetNeedsModalOpen(false)} className="w-max flex items-center justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
                <div className="flex flex-col items-center justify-center space-y-8 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
                    <h2 className="text-lg font-bold mt-8">Edit Pet Needs</h2>
                    <form className="flex flex-col space-y-4 m-8" onSubmit={event => handlePetNeedsSubmit(event)}>
                        <div className='flex flex-col space-y-4'>
                            <div className="flex flex-col">
                                <label htmlFor="petNeeds">Description:</label>
                                <textarea defaultValue={currentBookingDescription} className='block w-full rounded-md border-0 py-2 pl-4 pr-4 text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                                    id="petNeeds"
                                    value={currentBookingDescription}
                                    rows={5} cols={35}
                                    onChange={event => setCurrentBookingDescription(event.target.value)} />
                            </div>
                        </div>
                        <div className="space-x-2 pb-4">
                            <button type="submit" className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 ml-auto mr-auto">
                                <span className="flex items-center"><FaRegSave className="mr-2" />Save</span>
                            </button>
                            <button className="text-gray-300 bg-red-900 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                                onClick={() => {
                                    setCurrentBooking("")
                                    setCurrentBookingDescription("")
                                    setPetNeedsModalOpen(false)
                                }}>
                                <span className="flex items-center"><FaRegEdit className="mr-2" />Cancel</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        );
    }


    // Component: report modal
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [userToReport, setUserToReport] = useState("");
    const [reportSubject, setReportSubject] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    function ReportModal() {
        function handleReportSubmit(event) {
            event.preventDefault()

            if (!reportSubject || !reportDescription) {
                toast.error("Please enter the missing information!")
                setValidate(true)
                return
            }

            if (reportSubject.length <= 10 || reportDescription.length <= 10) {
                toast.error("The fields do not fulfil the requirements. The length should be at least 10 characters.")
                return
            }

            axios.post(RequestRoutes.REPORT, {
                reportingUser: auth.userId,
                reportedUser: userToReport,
                subject: reportSubject,
                description: reportDescription
            }).then(() => {
                setUserToReport("")
                setReportDescription("")
                setReportSubject("")
                setReportModalOpen(false)
                toast.success("Report sent successfully.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                })
            })
        }

        return (
            <Modal ariaHideApp={false} isOpen={reportModalOpen} onRequestClose={() => setReportModalOpen(false)} className="w-max flex items-center justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
                <div className="flex flex-col items-center justify-center space-y-8 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
                    <h2 className="text-lg font-bold mt-8">Write Report</h2>
                    <form className="flex flex-col space-y-4 m-8" onSubmit={event => handleReportSubmit(event)}>
                        <div className='flex flex-col space-y-4'>
                            <div className="flex flex-col">
                                <label htmlFor="subject" className={ validate && !reportSubject ? "text-red-700 font-bold" : ""}>Subject:</label>
                                <input type="text"
                                    className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !reportSubject) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                    minLength={10}
                                    id="subject"
                                    onChange={event => setReportSubject(event.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="description" className={ validate && !reportDescription ? "text-red-700 font-bold" : ""}>Description:</label>
                                <textarea className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !reportDescription) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                    id="description"
                                    minLength={10} required
                                    rows={5} cols={35}
                                    onChange={event => setReportDescription(event.target.value)} />
                            </div>
                        </div>
                        <div className="space-x-2 pb-4">
                            <button type="submit" className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 ml-auto mr-auto">
                                <span className="flex items-center"><FaRegSave className="mr-2" />Save</span>
                            </button>
                            <button className="text-gray-300 bg-red-900 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                                onClick={() => {
                                    setUserToReport("")
                                    setReportDescription("")
                                    setReportSubject("")
                                    setReportModalOpen(false)
                                    setValidate(false)
                                }}>
                                <span className="flex items-center"><FaRegEdit className="mr-2" />Cancel</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        )
    }


    // Component: review modal
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [isReviewUpdate, setIsReviewUpdate] = useState(false);
    const [reviewId, setReviewId] = useState("");
    const [reviewBookingId, setReviewBookingId] = useState("");
    const reviewDate = getCurrentDate();
    const [reviewRating, setReviewRating] = useState(1);
    const [reviewDescription, setReviewDescription] = useState("");
    function ReviewModal() {

        function handleReviewSubmit(event) {
            event.preventDefault()

            if (!reviewDescription) {
                setValidate(true)
                return
            }

            if (reviewDescription.length < 10) {
                toast.error("The description should have at least 10 characters.")
                return
            }

            if (isReviewUpdate) {
                axios.put(RequestRoutes.REVIEW + "/" + reviewId, {
                    rating: reviewRating,
                    description: reviewDescription,
                    date: reviewDate,
                    booking: reviewBookingId
                }).then(() => {
                    setReviewRating(0)
                    setReviewBookingId("")
                    setReviewDescription("")
                    setIsReviewUpdate(false)
                    setReviewModalOpen(false)
                    setValidate(false)
                    setReviewId("")

                    toast.success("Review updated successfully.", {
                        theme: "colored",
                        style: { backgroundColor: "rgb(110 231 183)" }
                    })
                }).catch(() => {
                    toast.error("An error occured while updating the review. Please try again later.");
                })
            } else {
                axios.post(RequestRoutes.REVIEW, {
                    rating: reviewRating,
                    description: reviewDescription,
                    date: reviewDate,
                    booking: reviewBookingId
                }).then(() => {
                    setReviewRating(0)
                    setReviewBookingId("")
                    setReviewDescription("")
                    setReviewModalOpen(false)
                    setValidate(false)
                    setReviewId("")
                    updateBookings() // show new review buttons

                    toast.success("Review saved successfully.", {
                        theme: "colored",
                        style: { backgroundColor: "rgb(110 231 183)" }
                    })
                }).catch(() => {
                    toast.error("An error occured while saving the review. Please try again later.");
                })
            }
        }

        function handleReviewDelete(event) {
            event.preventDefault()
            axios.delete(RequestRoutes.REVIEW + "/" + reviewId).then(() => {
                setReviewRating(0)
                setReviewBookingId("")
                setReviewDescription("")
                setReviewModalOpen(false)
                setValidate(false)
                setReviewId("")
                updateBookings() // show new review buttons
            }).catch(() => {
                toast.error("An error occured while deleting the review. Please try again later.");
            })
        }


        return (
            <Modal ariaHideApp={false} isOpen={reviewModalOpen} onRequestClose={() => setReviewModalOpen(false)} className="w-max flex items-center justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
                <div className="flex flex-col items-center justify-center space-y-8 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
                    <h2 className="text-lg font-bold mt-8">Write Review</h2>
                    <form className="flex flex-col space-y-4 m-8" onSubmit={event => handleReviewSubmit(event)}>
                        <div className='flex flex-col space-y-4'>
                            <div className="flex flex-col">
                                <label htmlFor="date">Date:</label>
                                <input type="date"
                                    id="date"
                                    disabled
                                    className='block w-full rounded-md border-0 py-2 pl-4 pr-4 text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                                    value={reviewDate}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label>Rating:</label>
                                <div className="flex flex-row">
                                    { [1,2,3,4,5].map(starNr => <span key={starNr}>
                                        <input type="checkbox" hidden
                                            defaultChecked={reviewRating >= starNr}
                                            id={"star" + starNr}
                                            name="rate"
                                            value={starNr}
                                            onClick={() => setReviewRating(starNr)} />
                                        <label htmlFor={"star" + starNr} title="text" className="cursor-pointer"><CiStar color={reviewRating >= starNr ? "orange" : "black"} size={25} /></label>
                                    </span> ) }
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="description" className={ validate && !reviewDescription ? "text-red-700 font-bold" : ""}>Description:</label>
                                <textarea id="description"
                                    minLength={10} required
                                    className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !reviewDescription) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                    rows={5} cols={35}
                                    value={reviewDescription}
                                    onChange={event => setReviewDescription(event.target.value)} />
                            </div>
                        </div>
                        <div className="space-x-2 pb-4">
                            <button type="submit" className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 ml-auto mr-auto">
                                <span className="flex items-center"><FaRegSave className="mr-2" />Save</span>
                            </button>
                            {reviewId && <button className="text-gray-300 bg-red-900 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                                onClick={event => handleReviewDelete(event)}>
                                    <span className="flex items-center"><MdOutlineDeleteForever className="mr-2" />Delete</span>
                                </button>}
                            <button className="text-gray-300 bg-red-900 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                                onClick={() => {
                                    setReviewModalOpen(false)
                                    setReviewDescription("")
                                    setReviewRating(0)
                                    setReviewBookingId("")
                                    setIsReviewUpdate(false)
                                    setReviewId("")
                                    setValidate(false)
                                }}>
                                <span className="flex items-center"><FaRegEdit className="mr-2" />Cancel</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        )
    }


    /**********\
    |*  MAIN  *|
    \**********/
    return (
        <div className="h-full flex flex-col">
            <div className="bg-white rounded-xl m-4 flex flex-col">
                <h2 className="text-xl font-bold ml-4 mt-4">
                    Your Bookings
                    <InfoComponent>
                        On this page, you can review your bookings. Each listing provides information such as start and end dates, pet and sitting type, price, and contact details.<br/>
                        For upcoming bookings, you can still edit the specified pet needs.<br/>
                        For previous bookings, you can review or report the sitter.
                    </InfoComponent>
                </h2>
                <Tabs className="m-4">
                    <TabList className="flex flex-row space-x-2 mb-4">
                        <Tab onClick={() => setSelectedTab("Upcoming")} className={`ring-1 ring-gray-200 p-2 rounded-t-xl ${selectedTab === "Upcoming" ? "bg-emerald-200 font-bold hover:bg-emerald-300" : "bg-gray-300 hover:bg-gray-400"} duration-200`}>
                            Upcoming Bookings
                        </Tab>
                        <Tab onClick={() => setSelectedTab("Previous")} className={`ring-1 ring-gray-200 p-2 rounded-t-xl ${selectedTab === "Previous" ? "bg-emerald-200 font-bold hover:bg-emerald-300" : "bg-gray-300 hover:bg-gray-400"} duration-200`}>
                            Previous Bookings
                        </Tab>
                    </TabList>
                    <TabPanel>
                        {/* <Component /> form triggers unwanted re-renders → {Component()} */}
                        <BookingListUpcoming />
                        {PetNeedModal()}
                    </TabPanel>
                    <TabPanel>
                        {/* <Component /> form triggers unwanted re-renders → {Component()} */}
                        <BookingListPrevious />
                        {ReportModal()}
                        {ReviewModal()}
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    )
}