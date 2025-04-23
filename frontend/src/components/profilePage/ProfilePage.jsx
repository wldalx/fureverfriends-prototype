import { useEffect, useState } from "react"
import axios from "axios"
import { Buffer } from 'buffer/' // trailing slash required

import { CgProfile } from "react-icons/cg"
import { CiBookmark, CiClock2, CiCamera } from "react-icons/ci"
import { HiOutlinePencil } from "react-icons/hi"
import { FaRegUserCircle } from "react-icons/fa"
import { MdOutlineLocalOffer, MdReportGmailerrorred, MdOutlineVerifiedUser } from "react-icons/md"

import ProfileTab from "./ProfileTab"
import BookingsTab from "./BookingsTab"
import ScheduleTab from "./ScheduleTab"
import OfferTab from "./OfferTab"
import JobsTab from "./JobsTab"
import ReportsTab from "./ReportsTab"
import VerificationTab from "./VerificationTab"

import { useAuth } from "../../middleware/AuthMiddleware"
import RequestRoutes from "../../utils/RequestRoutes"


export default function ProfilePage() {

    const auth = useAuth();

    const [currentTab, setCurrentTab] = useState(auth.role === "User" ? "Profile" : "Reports")

    const tabs = {
        "Profile": <ProfileTab />,
        "Bookings": <BookingsTab />,
        "Schedule": <ScheduleTab />,
        "Offer": <OfferTab />,
        "Jobs": <JobsTab />,
        "Reports": <ReportsTab />,
        "Verification": <VerificationTab />
    }

    const [profilePicture, setProfilePicture] = useState("");
    useEffect(() => {
        if (auth.role === "User" && auth.profilePicture) {
            setProfilePicture(Buffer(auth.profilePicture.data).toString());
        }
    }, [auth.profilePicture, auth.role])

    async function uploadImg(event) {
        const imageFile = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(imageFile)
        reader.onload = () => {
            axios.put(RequestRoutes.USER + "/" + auth.userId, {
                profilePicture: {
                    type: imageFile.type,
                    data: reader.result
                }
            }).then(() => {
                auth.refreshUserInformation();
            })
        }
    }

    return (
        <>
            <div className="fixed top-20 bottom-0 left-0 z-10 w-1/5 overflow-x-hidden overflow-y-scroll flex flex-col items-center space-y-4">
                <div className="bg-white text-xl font-bold text-center items-center flex flex-col w-full rounded-xl">
                    <div className="h-20 w-20 rounded-full ring-1 ring-gray-500 m-4 flex relative items-center justify-center bg-gray-300">
                        {
                            (profilePicture) ?
                                <img src={profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                : <FaRegUserCircle size={30} />
                        }
                        <label hidden={auth.role == "Moderator"}
                            htmlFor="profilePicture"
                            className="w-full absolute h-full hover:bg-gray-300 rounded-full duration-200 flex justify-center items-center z-10 group cursor-pointer">
                            <CiCamera size={25} className="invisible group-hover:visible opacity-50 duration-100" />
                        </label>
                        <input
                            hidden
                            disabled={auth.role == "Moderator"}
                            type="file"
                            accept="images/*"
                            max={1}
                            id="profilePicture"
                            name="profilePicture"
                            onChange={event => uploadImg(event)} />
                    </div>
                    <span className="m-4">{auth.firstName ? auth.firstName : auth.username} {auth.lastName ? auth.lastName : ""}</span>
                </div>
                <ul className="space-y-4 text-lg w-full p-4 pt-0">
                    {auth.role === "User" &&
                        <>
                            <li>
                                <button onClick={() => setCurrentTab("Profile")} className="bg-emerald-100 hover:bg-emerald-200 w-full px-4 py-4 rounded-2xl duration-200">
                                    <span className="flex items-center justify-center"><CgProfile size={20} className="mr-2" />Profile</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setCurrentTab("Bookings")} className="bg-emerald-100 hover:bg-emerald-200 w-full px-4 py-4 rounded-2xl duration-200">
                                    <span className="flex items-center justify-center"><CiBookmark size={20} className="mr-2" />Bookings</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setCurrentTab("Offer")} className="bg-emerald-100 hover:bg-emerald-200 w-full px-4 py-4 rounded-2xl duration-200">
                                    <span className="flex items-center justify-center"><MdOutlineLocalOffer size={20} className="mr-2" />Offer</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setCurrentTab("Schedule")} className="bg-emerald-100 hover:bg-emerald-200 w-full px-4 py-4 rounded-2xl duration-200">
                                    <span className="flex items-center justify-center"><CiClock2 size={20} className="mr-2" />Schedule</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setCurrentTab("Jobs")} className="bg-emerald-100 hover:bg-emerald-200 w-full px-4 py-4 rounded-2xl duration-200">
                                    <span className="flex items-center justify-center"><HiOutlinePencil size={20} className="mr-2" />Jobs</span>
                                </button>
                            </li>
                        </>
                    }
                    <>
                        <li>
                            <button disabled={(auth.role == "Moderator" && !auth.moderatorRights.includes("DELETE_USER")) ? true : false} onClick={() => setCurrentTab("Reports")} className="bg-red-200 disabled:bg-gray-200 hover:bg-red-300 w-full px-4 py-4 rounded-2xl duration-200">
                                <span className="flex items-center justify-center"><MdReportGmailerrorred size={20} className="mr-2" />Reports</span>
                            </button>
                        </li>
                    </>
                    {auth.role == "Moderator" && auth.moderatorRights.includes("VERIFY_USER") &&
                        <li>
                            <button onClick={() => setCurrentTab("Verification")} className="bg-emerald-100 hover:bg-emerald-200 w-full px-4 py-4 rounded-2xl duration-200">
                                <span className="flex items-center justify-center"><MdOutlineVerifiedUser size={20} className="mr-2" />User Verification</span>
                            </button>
                        </li>
                    }
                </ul>
            </div>

            <div className="bg-gray-200 ml-[20%] h-full min-h-[100vh]">
                {tabs[currentTab]}
            </div>
        </>
    )
}