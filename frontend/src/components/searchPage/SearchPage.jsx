import { useEffect, useState } from "react"
import axios from "axios"

import FilterForm from "./FilterForm"
import ProfileBox from "./ProfileBox"
import Map from "./Map"
import REQUESTS from "../../utils/RequestRoutes"
import ErrorPage from "../general/ErrorPage.jsx"


export default function SearchPage({ setBooking }) {
    // Requested data & error handling
    const [queryResults, setQueryResults] = useState()
    const [errorMsg, setErrorMsg] = useState()

    // MapCenter; updated in FilterForm
    const [center, setCenter] = useState([48.26249, 11.66913]); // [lat,lon] = Friedrich-Bauer-Hörsaal, Garching-Forschungszentrum

    // currently hovered ProfileBox
    const [hoverID, setHoverID] = useState();
    // refs to the all ProfileBoxes; later used for scrolling to them when clicking on marker
    const [refs, setRefs] = useState([]);

    const [reviews, setReviews] = useState([])
    useEffect(() => {
        axios.get(REQUESTS.REVIEW)
            .then(res => setReviews(res.data))
            .catch(error => setErrorMsg(error.message))
    }, [])

    return <>
        <div className="bg-emerald-100 rounded-xl ring-1 ring-gray-400 m-4 mb-0 p-2">
            <h1 className="w-full mx-auto mt-2 ml-4 font-bold text-2xl">Your Filters</h1>
            <FilterForm setCenter={setCenter} setQueryResults={setQueryResults} setErrorMsg={setErrorMsg} setBooking={setBooking} />
        </div>
        <div className="flex flex-row mx-auto h-[71vh] w-full">
            <div className="flex flex-col flex-1 m-8 w-full overflow-y-scroll">
                {(queryResults && queryResults.length > 0 && !errorMsg) ?
                    queryResults.map(queryResult =>
                        <ProfileBox key={queryResult._id} {...queryResult} reviews={reviews} refs={refs} setRefs={setRefs} setHoverID={setHoverID} />
                    )
                    : <ErrorPage errorMsg={(errorMsg) ? errorMsg : "No results found!"} height="h-full" home_button={false} />
                }
            </div>
            <Map queryResults={queryResults} refs={refs} hoverID={hoverID} center={center} setCenter={setCenter} />
        </div>
    </>;
};
