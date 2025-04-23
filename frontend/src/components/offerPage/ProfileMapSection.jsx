import { useEffect, useState } from 'react'
import { FaRegUserCircle } from "react-icons/fa"
import { toast } from 'react-toastify'
import { Link, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import axios from 'axios'
import { Buffer } from 'buffer/' // trailing slash required

import MapMarker from '../../utils/MapMarker'
import { useAuth } from '../../middleware/AuthMiddleware.jsx'
import ICONS from '../../utils/IconRoutes.js'
import REQUESTS from "../../utils/RequestRoutes"
import ROUTES from "../../utils/Routes"
import PARAMS from '../../utils/SearchParams.js'


export default function ProfileMapSection({ shortDescription, description, offerByUser, name, avgRating, amountReviews }) {
    // setCoordniates
    const [coordinates, setCoordinates] = useState()
    useEffect(() => {
        setCoordinates(offerByUser?.coordinates?.toReversed())
    }, [offerByUser])

    // parse integer[] of DB to profile Picture
    const [profilePicture, setProfilePicture] = useState()
    useEffect(() => {
        if (offerByUser?.profilePicture?.data) {
            setProfilePicture(Buffer(offerByUser?.profilePicture?.data).toString());
        }
    }, [offerByUser])

    // set Rating-text according to avgRating and amountReviews
    const [ratingText, setRatingText] = useState()
    useEffect(() => {
        let text = (amountReviews === 1) ? amountReviews + " Rating" : amountReviews + " Ratings";
        text += (amountReviews > 0) ? " - " + avgRating : "";
        setRatingText(text)
    }, [amountReviews, avgRating])

    // Report
    const auth = useAuth()
    const location = useLocation()
    let parameter = new URLSearchParams()
    parameter.append(PARAMS.REDIRECT, location.pathname + location.search)


    const [report, setReport] = useState(false)
    const [subject, setSubject] = useState()
    const [reportDescription, setReportDescription] = useState()
    const [validate, setValidate] = useState(false)

    // report the offering user
    async function handleSubmit(event) {
        event.preventDefault();

        if (subject && subject.length > 10 && reportDescription && reportDescription.length > 10) {
            axios.post(REQUESTS.REPORT, {
                reportingUser: auth.userId,
                reportedUser: offerByUser._id,
                subject: subject,
                description: reportDescription
            }).then(() => {
                setSubject();
                setReportDescription();
                setReport(false);
                setValidate(false);

                toast.success("Report sent successfully.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                });
            }).catch(error => console.error(error))
        } else if (subject && reportDescription)
            toast.error("The subject and report description must be at least 10 characters long.")
        else {
            setValidate(true);
            toast.error("Please enter the missing information!");
        }
    }

    return (
        <div className="flex my-12 min-h-96">
            <div className="flex-1">
                <div className="flex items-center">
                    <h1 className="my-2 text-3xl font-bold">{name}</h1>
                    {offerByUser?.isVerified && <img className="max-h-5 mx-1" src={ICONS.VERIFIED} alt="Verified Symbol" />}
                </div>
                <div className="flex items-center">
                    {/* separation of ratingText + amountReviews is because rendering issues */}
                    <p className="my-1 text-lg font-bold">{ratingText}</p>
                    {(amountReviews > 0) && <img className="max-h-4 mx-1" src={ICONS.STAR} alt="Star Symbol" />}
                </div>
                <div className="flex m-4">
                    {
                        profilePicture ?
                            <div className="min-w-28 h-28 w-28 rounded-full bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url(" + profilePicture + ")" }}></div>
                          : <div className="flex items-center justify-center h-28 w-28 rounded-full">
                                <FaRegUserCircle size={50} />
                            </div>
                    }
                    <div className="flex flex-col justify-center ml-8">
                        <p className="m-1">{offerByUser?.address}</p>
                        <p className="m-1">{shortDescription}</p>
                    </div>
                </div>
                <p className="mx-4">{description}</p>
            </div>
            <div className="flex-1 flex flex-col items-end relative">
                <button onClick={() => setReport(true)} className="mb-4 px-4 py-2 font-medium text-gray-200 bg-red-900 duration-300 hover:bg-red-950 rounded-full">Report User</button>
                {(report) &&
                    <form onSubmit={event => handleSubmit(event)} className="absolute right-0 top-0 w-96 bg-white z-20 p-4 rounded-xl ring-1 ring-gray-400">
                        <p className="text-center text-lg font-semibold">Report User</p>
                        <div className="text-lg py-2">
                            <label htmlFor="subject" className={(validate && !subject) ? "text-red-700 font-bold" : ""}>Subject:</label>
                            <input type="text" id="subject" placeholder="Subject" value={subject} onChange={event => setSubject(event.target.value)}
                                disabled={auth.userId === ""} minLength={10}
                                className={`w-full rounded-md border-0 p-2 text-base ring-1 leading-6 capitalize
                                        ${(validate && !subject) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}></input>
                        </div>
                        <div className="text-lg py-2">
                            <label htmlFor="description" className={(validate && !reportDescription) ? "text-red-700 font-bold" : ""}>Description:</label>
                            <textarea id="description" rows={5} cols={35} placeholder="Description" value={reportDescription} onChange={event => setReportDescription(event.target.value)}
                                disabled={auth.userId === ""} minLength={10} required
                                className={`w-full rounded-md border-0 p-2 text-base ring-1 leading-6 capitalize
                                        ${(validate && !reportDescription) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}></textarea>
                        </div>
                        <div className="flex justify-around">
                            <div onClick={() => setReport(false)} className="mb-4 px-4 py-2 font-medium text-white bg-red-900 rounded-full cursor-pointer z-10">Cancel</div>
                            <button type="submit" disabled={auth.userId === ""} className="mb-4 px-4 py-2 font-medium text-white bg-emerald-900 rounded-full">Report</button>
                        </div>
                        {(auth.userId === "") &&
                            <div className="absolute flex items-center justify-center top-0 right-0 rounded-xl h-full w-full bg-white bg-opacity-70">
                                <p>Please <Link className="underline" to={ROUTES.LOGIN + "?" + parameter}>login</Link> to submit a report!</p>
                            </div>
                        }
                    </form>
                }
                {(coordinates) &&
                    <MapContainer className="h-full w-full rounded-2xl z-0" center={coordinates} zoom={15} >
                        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={coordinates} icon={MapMarker}>
                            <Popup>{name}</Popup>
                        </Marker>
                    </MapContainer>
                }
            </div>
        </div>
    );
};
