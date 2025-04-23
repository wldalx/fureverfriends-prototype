import axios from 'axios'
import Modal from 'react-modal'
import { useState, useEffect } from "react"
import Calendar from 'react-calendar'
import { toast } from "react-toastify"

import { IoIosAdd } from "react-icons/io"
import { FaRegSave, FaRegEdit } from "react-icons/fa"
import { MdOutlineDeleteForever } from "react-icons/md"
import { CiClock2 } from "react-icons/ci"

import RequestRoutes from '../../utils/RequestRoutes'
import { convertDate, getAllDaysBetweenDates } from '../../utils/Date'
import { useAuth } from '../../middleware/AuthMiddleware'
import InfoComponent from '../general/InfoComponent'


export default function ScheduleTab() {

    const auth = useAuth()
    const [modalOpen, setModalOpen] = useState(false) // for editing availability
    const [freeAvailabilities, setFreeAvailabilities] = useState([]) // all days
    const [selectedTimeframe, setSelectedTimeframe] = useState([]) // [start, end]
    const [availabilities, setAvailabilities] = useState([]) // all days
    const [bookedDays, setBookedDays] = useState([])

    // for deletion in modal
    const [startDateDelete, setStartDateDelete] = useState("")
    const [endDateDelete, setEndDateDelete] = useState("")
    const [availabilityIdDelete, setAvailabilityIdDelete] = useState("")

    const [isFetching, setIsFetching] = useState(true)


    function updateAvailabilities() {
        if (auth.offer) {
            // fetch availabilities
            axios.get(RequestRoutes.OFFER + "/" + auth.offer).then(res => {
                if (res.data.availabilities)
                    setAvailabilities(res.data.availabilities)
            })

            // fetch free availabilities
            axios.get(RequestRoutes.OFFER + "/" + auth.offer + "/availabilities/?past=true").then(res => {
                let days = [];
                res.data.forEach(timeframe => {
                    days.push(...getAllDaysBetweenDates(
                        new Date(timeframe.startDate),
                        new Date(timeframe.endDate)
                    ))
                })
                setFreeAvailabilities(days)
            }).catch(() => {
                toast.error("An error occured while fetching the offer availabilities. Please try again later.")
            })

            // fetch bookings
            axios.get(RequestRoutes.BOOKING + "?bookedUser=" + auth.userId).then(res => {
                let days = [];
                res.data.forEach(job => {
                    days.push(...getAllDaysBetweenDates(
                        new Date(job.startDate),
                        new Date(job.endDate)
                    ))
                })
                setBookedDays(days);
            }).catch(() => {
                toast.error("An error occured while fetching the jobs. Please try again later.")
            })

        } else { // clear all
            setAvailabilities([])
            setFreeAvailabilities([])
        }

        setIsFetching(false)
    }
    useEffect(updateAvailabilities, [auth.offer, auth.userId])


    function handleAvailabilityDelete(event) {
        event.preventDefault()

        axios.delete(RequestRoutes.OFFER + "/" + auth.offer + "/availabilities/" + availabilityIdDelete).then(() => {
            // close + reset modal
            setModalOpen(false)
            setAvailabilityIdDelete("")
            setEndDateDelete("")
            setStartDateDelete("")

            updateAvailabilities()
            toast.success("Availability deleted successfully.", {
                theme: "colored",
                style: { backgroundColor: "rgb(110 231 183)" }
            })
        }).catch(() => {
            toast.error("An error occured while deleting the availability. Please try again later.")
        })

    }

    // Component: availabilities calendar + functionality
    function ScheduleForOffer() {
        if (!auth.offer)
            return <div className="flex flex-col items-center space-y-4 p-16">
                <CiClock2 size={50} />
                <span>This is the schedule for pet sitters.</span>
                <span>Please create an offer in order to use the schedule and set availabilities.</span>
            </div>

        // add new availability being selected in calender
        function handleAvailabilitySubmit(event) {
            event.preventDefault();

            let startDate = "";
            let endDate = "";

            if (selectedTimeframe.length === 2) {
                if (selectedTimeframe[0] <= selectedTimeframe[1]) {
                    startDate = selectedTimeframe[0];
                    endDate = selectedTimeframe[1];
                }
                if (selectedTimeframe[1] < selectedTimeframe[0]) {
                    startDate = selectedTimeframe[1];
                    endDate = selectedTimeframe[0];
                }
            }

            axios.post(RequestRoutes.OFFER + "/" + auth.offer + "/availabilities", {
                startDate: convertDate(startDate),
                endDate: convertDate(endDate),
                offer: auth.offer
            }).then(() => {
                setSelectedTimeframe([])
                updateAvailabilities()
                toast.success("Availability saved successfully.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                })
            }).catch(() => {
                toast.error("An error occured while posting the availability. Please try again later.")
            })
        }

        return <div className='flex flex-row items-center justify-center'>
            <div className="flex flex-col m-4 items-center justify-center space-y-8">
                {!isFetching && <Calendar
                    tileDisabled={() => selectedTimeframe.length === 2}
                    className="items-center flex flex-col space-y-4 text-center"
                    onClickDay={date => {
                        if (freeAvailabilities.includes(convertDate(date))) {
                            const timeFrameToDelete = availabilities.filter(timeframe =>
                                convertDate(date) >= convertDate(timeframe.startDate)
                                && convertDate(date) <= convertDate(timeframe.endDate)
                            )[0];
                            setStartDateDelete(convertDate(timeFrameToDelete.startDate))
                            setEndDateDelete(convertDate(timeFrameToDelete.endDate))
                            setAvailabilityIdDelete(timeFrameToDelete._id)
                            setModalOpen(true)
                        } else {
                            if (!bookedDays.includes(convertDate(date))) {
                                const temp = [...selectedTimeframe]; // copy
                                temp.push(convertDate(date))
                                setSelectedTimeframe(temp)
                            }
                        }
                    }}
                    prev2Label={null}
                    next2Label={null}
                    minDetail='month'
                    view='month'
                    tileClassName={({ date }) => {
                        if (freeAvailabilities.find(x => x === convertDate(date)))
                            return 'calendar-highlight'
                        if (selectedTimeframe.length && (
                            selectedTimeframe[0] === convertDate(date)
                            || getAllDaysBetweenDates(
                                new Date(selectedTimeframe.sort()[0]),
                                new Date(selectedTimeframe.sort()[1])
                            ).find(x => x === convertDate(date))
                        ))
                            return 'period-highlight'
                        if (bookedDays.find(x => x === convertDate(date)))
                            return 'booking-highlight'
                    }} />}
                <div className="flex flex-row w-full items-center justify-center space-x-2">
                    <button disabled={selectedTimeframe.length !== 2} className="text-gray-300 disabled:bg-gray-400 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                        onClick={event => handleAvailabilitySubmit(event)}>
                        <span className="flex items-center"><IoIosAdd className="mr-2" />Add Availability</span>
                    </button>
                    <button disabled={selectedTimeframe.length === 0} className="text-gray-300 disabled:bg-gray-400 bg-red-900 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                        onClick={() => { setSelectedTimeframe([]) }}>
                        <span className="flex items-center"><MdOutlineDeleteForever className="mr-2" />Cancel</span>
                    </button>
                </div>
            </div>
            <div className='bg-white rounded-xl p-8 space-y-4'>
                <ul className='block space-y-2'>
                    <li className='flex flex-row items-center justify-start'><div className='w-4 h-4 rounded-full bg-green-600 mr-2'></div>Availability</li>
                    <li className='flex flex-row items-center justify-start'><div className='w-4 h-4 rounded-full bg-orange-500 mr-2'></div>Booking</li>
                    <li className='flex flex-row items-center justify-start'><div className='w-4 h-4 rounded-full bg-red-600 mr-2'></div>Selected Day</li>
                </ul>
            </div>
        </div>
    }

    return <>
        <div className='flex flex-col h-full w-full'>
            <div className="bg-white rounded-xl m-4 flex flex-col">
                <h2 className="text-xl font-bold ml-4 mt-4">
                    Your Schedule
                    <InfoComponent>
                        This calendar assists pet sitters in scheduling their jobs.<br />
                        You can add and delete availability for your services and review your appointments.<br />
                        To set an availability timeframe, select the start and end dates and click "Add Availability."<br />
                        To set availability for a single day, select the same date twice.<br />
                        To delete a timeframe, click any day within the availability period to open the deletion modal.
                    </InfoComponent>
                </h2>
                {ScheduleForOffer() /* <ScheduleForOffer /> forces re-render */}
            </div>
        </div>

        {/* edit availability */}
        <Modal ariaHideApp={false} isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} className="w-max flex items-center justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
            <div className="flex flex-col items-center justify-center space-y-8 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
                <h2 className="text-lg font-bold mt-8">Delete Availability?</h2>
                <form className="flex flex-col space-y-4 m-8" onSubmit={event => handleAvailabilityDelete(event)}>
                    <div className='flex flex-col'>
                        <input type="date" disabled
                            className='block w-full rounded-md border-0 py-2 pl-4 pr-2 text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            value={startDateDelete}
                            placeholder="From"
                            id="startDate" />
                        <input type="date" disabled
                            className='block w-full mt-2 rounded-md border-0 py-2 pl-4 pr-2 text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            value={endDateDelete}
                            placeholder="To"
                            id="endDate" />
                    </div>
                    <div className="space-x-2 pb-4">
                        <button type="submit" className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 ml-auto mr-auto">
                            <span className="flex items-center"><FaRegSave className="mr-2" />Delete</span>
                        </button>
                        <button className="text-gray-300 bg-red-900 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200"
                            onClick={() => {
                                // close + reset modal
                                setModalOpen(false)
                                setStartDateDelete("")
                                setEndDateDelete("")
                            }}>
                            <span className="flex items-center"><FaRegEdit className="mr-2" />Cancel</span>
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    </>
}