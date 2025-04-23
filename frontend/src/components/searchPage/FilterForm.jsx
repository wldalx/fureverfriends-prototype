import React, { useEffect, useState } from 'react'
import { useSearchParams } from "react-router-dom"
import axios from "axios"

import SITTING from '../../enums/SittingType.js'
import PET from '../../enums/PetType.js'
import PARAMS from '../../utils/SearchParams.js'
import REQUESTS from "../../utils/RequestRoutes"
import { diffInDays, getCurrentDate, getDateInXDays, getDateInXYears } from '../../utils/Date.js'
import { searchAddress } from "../../utils/AddressSearcher"
import InfoComponent from '../general/InfoComponent.jsx'


/** FilterForm component for search page
 * @description takes URL parameters (e.g. from form, shared/bookmarked search link)
 *      and filters for location, pet-type, sitting need, date range, …
 */
export default function FilterForm({ setCenter, setQueryResults, setErrorMsg, setBooking }) {
    // used for input validation
    const currentDate = getCurrentDate();
    const dateInAYear = getDateInXYears(1);

    // define all states / searchParams
    // changing this variable also changes URL
    const [searchParams, setSearchParams] = useSearchParams();

    const [location, setLocation] = useState(searchParams.get(PARAMS.LOCATION) || "");
    const [selectedLocation, setSelectedLocation] = useState(searchParams.get(PARAMS.LOCATION) || "");
    const [petType, setPetType] = useState(searchParams.get(PARAMS.PETTYPE) || "");
    const [sittingNeed, setSittingNeed] = useState(searchParams.get(PARAMS.SITTINGNEED) || "");
    const [startDate, setStartDate] = useState(searchParams.get(PARAMS.STARTDATE) || "");
    const [endDate, setEndDate] = useState(searchParams.get(PARAMS.ENDDATE) || "");
    const [verified, setVerified] = useState(searchParams.get(PARAMS.VERIFIED) === "true" || false);
    const [review, setReview] = useState(searchParams.get(PARAMS.REVIEW) || "1");
    const [maxPrice, setMaxPrice] = useState(searchParams.get(PARAMS.MAXPRICE) || "");
    const [ordering, setOrdering] = useState(searchParams.get(PARAMS.ORDERING) || "PRICE");
    const [searchResults, setSearchResults] = useState([]);

    // init search parameters: reflect state at page load,
    // later updated by state vars → sharing/bookmarking of search URL possible
    let parameter = new URLSearchParams();
    parameter.append(PARAMS.LOCATION, selectedLocation);
    parameter.append(PARAMS.PETTYPE, petType);
    parameter.append(PARAMS.SITTINGNEED, sittingNeed);
    parameter.append(PARAMS.STARTDATE, startDate);
    parameter.append(PARAMS.ENDDATE, endDate);
    parameter.append(PARAMS.VERIFIED, verified);
    parameter.append(PARAMS.REVIEW, review);
    parameter.append(PARAMS.MAXPRICE, maxPrice);
    parameter.append(PARAMS.ORDERING, ordering);

    useEffect(() => {
        setSearchParams(parameter)
        setBooking({ petType, startDate, endDate, sittingType: sittingNeed }) // update of global var
        axios.get(REQUESTS.OFFER + "?" + parameter)
            .then(res => setQueryResults(res.data))
            .catch(error => setErrorMsg(error.message))
    }, [selectedLocation, petType, sittingNeed, startDate, endDate, verified, review, maxPrice])

    // ordering is done locally -> only need to change URL
    useEffect(() => {
        setSearchParams(parameter)
    }, [ordering])

    // enforce startdate >= enddate (and at least one night for overnight stay)
    useEffect(() => {
        if (startDate && endDate && diffInDays(startDate, endDate) <= 0) {
            if (sittingNeed === SITTING.OVERNIGHT_STAY)
                setEndDate(getDateInXDays(startDate, 1))
            else
                setEndDate(startDate)
        }
    }, [startDate, endDate, sittingNeed])

    // enforce review ratings between 1 and 5
    useEffect(() => {
        if (review && review < 1) {
            setReview(1)
        } else if (review && review > 5) {
            setReview(5)
        }
    }, [review])

    // Enorce prices greater than 1
    useEffect(() => {
        if (maxPrice && maxPrice < 1) {
            setMaxPrice(1)
        }
    }, [maxPrice])

    // set location & find results when typing in the location field
    async function search(event) {
        const loc = event.target.value
        setLocation(loc)
        const results = await searchAddress(loc)         
        setSearchResults(results)
    }

    // when reloading the page -> set location correctly
    async function setInitialLocation() {
        const results = await searchAddress(location)
        // if exact location (from search field) already contained in search results
        // → already exact match in search bar found → hide search bar
        const result = results.find(result => result.label === location)
        if (result) setCenter(result.coordinates)
    }
    useEffect(() => { setInitialLocation() }, [])

    // select search result when clicking on it -> update location & center of map
    function selectSearchResult(searchResult) {
        setSearchResults([]);
        setLocation(searchResult.label);
        setSelectedLocation(searchResult.label)
        setCenter(searchResult.coordinates)
    }


    return (
        <div className="flex flex-col w-full m-auto space-y-4 mt-2">
            <div className='flex flex-row space-x-4'>
                <div className="grid grid-cols-8 gap-x-0 gap-y-2 items-center justify-center">
                    <label className="text-base mr-3 text-center" htmlFor="location"><span className="text-nowrap">Location:</span>
                        <InfoComponent>
                            When you want to find pet sitters near you, you can use the 'Search by Location' feature.<br />
                            Simply enter your city, zip code, or address into the search bar, and we'll show you a list of pet sitters available in your area.<br />
                            This makes it easy to find someone nearby who can take care of your pets.
                        </InfoComponent>
                    </label>
                    <div className="w-full relative">
                        <input className="w-full rounded-md border-0 p-2 placeholder:text-black text-black ring-1 ring-gray-400 text-base leading-6"
                            type="text" id="location" placeholder="Location" value={location} onChange={event => search(event)} />
                        {(searchResults.length > 0) &&
                            <ul className="absolute top-10 right-0 w-full bg-white ring-1 ring-gray-400 text-[0.95rem]">
                                {searchResults.map((searchResult, index) =>
                                    <li key={index} className="p-1 hover:bg-gray-100" onClick={() => selectSearchResult(searchResult)}>{searchResult.label}</li>
                                )}
                            </ul>
                        }
                    </div>
                    <label className="text-base mr-3 text-center" htmlFor="petType"><span className="text-nowrap">Pet Type:</span>
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
                    <select className="block bg-white w-full rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base leading-6"
                        id="petType" defaultValue={petType} onChange={event => setPetType(event.target.value)}>
                        <option hidden>Pet Type</option>
                        <option value="">Any</option>
                        <option value={PET.DOG}>Dog</option>
                        <option value={PET.CAT}>Cat</option>
                        <option value={PET.BIRD}>Bird</option>
                        <option value={PET.AQUARIUM}>Aquarium</option>
                        <option value={PET.REPTILE}>Reptile</option>
                        <option value={PET.RODENT}>Rodent</option>
                        <option value={PET.OTHER}>Other</option>
                    </select>
                    <label className="text-base mr-3 text-center" htmlFor="sittingNeed"><span className="text-nowrap">Sitting Type:</span>
                        <InfoComponent>
                            Choose the type of service you need for your pet:<br />
                            - <b>Overnight Stay</b>: A sitter stays with your pet at your home overnight, ensuring they are cared for throughout the night.<br />
                            - <b>Drop-in Visit</b>: A sitter visits your home for a short period to feed, play with, and check on your pet.<br />
                            - <b>Housesitting</b>: A sitter stays in your home while you are away, providing continuous care for your pet and house.<br />
                            - <b>Daycare</b>: A sitter takes care of your pet during the day, providing companionship and attention while you are at work or busy.
                        </InfoComponent>
                    </label>
                    <select className="block bg-white w-full rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base leading-6"
                        id="sittingNeed" defaultValue={sittingNeed} onChange={event => setSittingNeed(event.target.value)}>
                        <option hidden>Sitting Type</option>
                        <option value="">Any</option>
                        <option value={SITTING.OVERNIGHT_STAY}>Overnight Stay</option>
                        <option value={SITTING.DROPIN_VISIT}>Drop-in Visit</option>
                        <option value={SITTING.HOUSESITTING}>Housesitting</option>
                        <option value={SITTING.DAYCARE}>Daycare</option>
                    </select>
                    <label className="text-base mr-3 text-center" htmlFor="startDate">
                        <span className="text-nowrap">From:</span>
                        <InfoComponent>
                            To book a pet sitting service, you'll need to set a start and end date. This helps us ensure that we find a sitter who is available for the entire duration you need.<br />
                            - <b>Start Date</b>: The first day you need the pet sitting service to begin.<br />
                            - <b>End Date</b>: The last day you need the service. The sitter will take care of your pet until this date.<br /><br />
                            For each type of service:<br />
                            - <b>Overnight Stay, Housesitting, and Daycare</b>: The sitter will provide continuous care for your pet from the start date to the end date.<br />
                            - <b>Drop-in Visit</b>: The sitter will come to your home for a specified number of visits during the selected time period. You can specify during booking how many visits you need for the selected time period.<br />
                            Enter both dates into the calendar to schedule the perfect care for your pet while you are away.
                        </InfoComponent>
                    </label>
                    <input className="block w-full rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base leading-6"
                        type="date" id="startDate" value={startDate} min={currentDate} max={dateInAYear} onChange={event => setStartDate(event.target.value)} />
                    <label className="text-base mr-3 text-center" htmlFor="ordering">
                        <span className='text-nowrap'>Ordered by:</span>
                        <InfoComponent>
                            To help you find the best pet sitter, you can sort the results by either price or rating:<br />
                            - <b>Price</b>: Sort the sitters from lowest to highest price to find one that fits your budget.<br />
                            - <b>Rating</b>: Sort the sitters from highest to lowest rating to see those with the best reviews first.
                        </InfoComponent>
                    </label>
                    <select className="block bg-white w-full rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base leading-6"
                        id="ordering" defaultValue={ordering} onChange={event => setOrdering(event.target.value)}>
                        <option value="PRICE">Price</option>
                        <option value="RATING">Rating</option>
                    </select>
                    <label className="text-base mr-3 text-center" htmlFor="review">
                        <span className="text-nowrap">Min. Rating:</span>
                        <InfoComponent>
                            Our ratings range from 1 to 5 stars.<br />
                            You can set a minimum rating to filter out sitters with lower ratings. <br />
                            For example, if you set a minimum rating of 4, only sitters with an average rating of 4 stars or higher will be shown.<br />
                            This ensures you find highly-rated sitters.
                        </InfoComponent>
                    </label>
                    <input className="block rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base w-full leading-6"
                        type="number" id="review" min="1" max="5" step="0.1" value={review} onChange={event => setReview(event.target.value)} />
                    <label className="text-base mr-3 text-center" htmlFor="price">
                        <span className="text-nowrap">Prices below:</span>
                        <InfoComponent>
                            You can set the maximum amount you're willing to pay for pet sitting services.<br />
                            Enter your budget, and we'll only show you sitters whose prices fall below your specified maximum price.<br />
                            This helps you find affordable options that meet your needs.
                        </InfoComponent>
                    </label>
                    <input className="block w-full rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base leading-6"
                        type="number" id="price" min="1" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} />
                    <label className="text-base mr-3 text-center" htmlFor="endDate">To:</label>
                    <input className="block w-full rounded-md border-0 p-2 text-black ring-1 ring-gray-400 text-base leading-6"
                        type="date" id="endDate" value={endDate}
                        min={(startDate) ? getDateInXDays(startDate, (SITTING.OVERNIGHT_STAY === sittingNeed) ? 1 : 0) : currentDate}
                        max={dateInAYear} onChange={event => setEndDate(event.target.value)} />
                    <div className="w-full"></div>
                </div>
                <div className='m-auto flex flex-col text-center space-y-2'>
                    <label className="text-base mr-3 w-full" htmlFor="isVerified">
                        <span className="text-nowrap">Only verified users?</span>
                        <InfoComponent setLeft={true}>
                            If you prefer to book sitters who have been verified, you can choose to only show verified users.<br />
                            Verified users have uploaded an ID and passed our verification process, ensuring a higher level of trust and security.<br />
                            Check this option to filter the results accordingly.
                        </InfoComponent>
                    </label>
                    <input className="w-4 h-4 m-auto"
                        type="checkbox" id="isVerified" defaultChecked={verified} onChange={() => setVerified(verified => !verified)} />
                </div>
            </div>
        </div>
    );
};