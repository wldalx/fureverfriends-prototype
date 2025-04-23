
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

import { LuBookMarked } from "react-icons/lu"

import RequestRoutes from "../../utils/RequestRoutes"
import { useAuth } from "../../middleware/AuthMiddleware"
import { convertDate, getCurrentDate } from "../../utils/Date"
import InfoComponent from "../general/InfoComponent"


export default function JobsTab() {
    const auth = useAuth();

    const [jobs, setJobs] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        let temp = [];
        axios.get(RequestRoutes.BOOKING + "?bookedUser=" + auth.userId).then(res => {
            // only future jobs
            temp = res.data.filter(job => convertDate(job.startDate) >= getCurrentDate())
            setJobs(temp);
        }).catch(() => {
            toast.error("An error occured while fetching the jobs. Please try again later.");
        })
        setIsFetching(false);
    }, [auth.userId])

    function JobsList() {

        if (jobs.length == 0)
            return (
                <div className="flex flex-col items-center justify-center space-x-2 text-lg mb-8">
                    <LuBookMarked size={50} className="mb-4" />
                    <span>No pet sitting jobs yet.</span>
                </div>
            )

        return jobs.map(booking =>
            <div key={booking._id} className="bg-gray-50 shadow-lg hover:bg-gray-100 duration-200 m-4 space-y-2 flex flex-col rounded-xl">
                <span className="text-xl mt-4 ml-4 font-bold">{booking.bookingUser.firstName} {booking.bookingUser.lastName}</span>
                <div className="grid grid-cols-1">
                    <div className="grid grid-cols-3">
                        <div className="flex flex-col justify-center m-4 w-full">
                            <span>Start: {convertDate(booking.startDate)}</span>
                            <span>End: {convertDate(booking.endDate)}</span>
                        </div>
                        <div className="flex flex-col justify-start m-4 w-full">
                            <span className="capitalize">Pet Type: {booking.petType.replace("_", " ").toLowerCase()}</span>
                            <span className="capitalize">Sitting Type: {booking.sittingType.replace("_", " ").toLowerCase()}</span>
                        </div>
                        <div className="flex flex-col justify-start m-4 w-full">
                            <span>Amount: {booking.amount}</span>
                            <span>Price: {booking.price}</span>
                        </div>
                        <div className="flex flex-col justify-start m-4 w-full">
                            <span className="font-bold">Contact Details:</span>
                            <span className="mt-2">Email: {booking.bookingUser.email}</span>
                            <span>Phone Number: {booking.bookingUser.phoneNumber}</span>
                        </div>
                    </div>
                    <div className="flex flex-col m-4 space-y-2">
                        <span className="font-bold">Pet Needs:</span>
                        <span className="">{booking.petNeeds}</span>
                    </div>
                </div>
            </div>
        )
    }

    return <div className="flex flex-col h-full">
        <div className="bg-white rounded-xl m-4 mb-2 flex flex-col">
            <h2 className="text-xl font-bold ml-4 mt-4">
                Your Jobs
                <InfoComponent>
                    On this page, you can review your upcoming pet sitting jobs.<br />
                    Each booking provides you with essential information, including the start and end dates, pet details, sitting type, price, contact information, and specific pet needs as specified by the pet owner.
                </InfoComponent>
            </h2>
            {!isFetching && <JobsList />}
        </div>
    </div>
}