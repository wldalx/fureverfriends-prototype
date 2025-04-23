import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { IoSearchCircleOutline } from "react-icons/io5"
import { IoPawOutline } from "react-icons/io5"

import ROUTES from '../../utils/Routes.js'
import SITTING from '../../enums/SittingType.js'
import PET from '../../enums/PetType.js'
import PARAMS from '../../utils/SearchParams.js'
import { searchAddress } from "../../utils/AddressSearcher"
import { diffInDays, getCurrentDate, getDateInXDays, getDateInXYears } from '../../utils/Date.js'
import InfoComponent from '../general/InfoComponent.jsx'


// SearchForm component for the landing page: specify location, pet-type, sitting need and date -> redirection to search page with the specified parameters
export default function SearchForm() {
    const currentDate = getCurrentDate();
    const dateInAYear = getDateInXYears(1);

    const [location, setLocation] = useState("");
    const [petType, setPetType] = useState("");
    const [sittingNeed, setSittingNeed] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // enforce enddate <= startdate (and at least one night for overnight stay)
    useEffect(() => {
        if (startDate && endDate && diffInDays(startDate, endDate) <= 0) {
            if (sittingNeed === SITTING.OVERNIGHT_STAY) {
                setEndDate(getDateInXDays(startDate, 1))
            } else {
                setEndDate(startDate)
            }
        }
    }, [startDate, endDate, sittingNeed])


    // location search results
    const [searchResults, setSearchResults] = useState([]);

    // set location & find results when typing in the location field
    async function search(event) {
        const loc = event.target.value
        setLocation(loc)
        const results = await searchAddress(loc)
        setSearchResults(results)
    }

    // select search result when clicking on it & update location
    function selectSearchResult(searchResult) {
        setSearchResults([]);
        setLocation(searchResult.label);
    }

    // update searchparameter and pass them on when clicking button
    const navigate = useNavigate();

    let parameter = new URLSearchParams();
    parameter.append(PARAMS.LOCATION, location);
    parameter.append(PARAMS.PETTYPE, petType);
    parameter.append(PARAMS.SITTINGNEED, sittingNeed);
    parameter.append(PARAMS.STARTDATE, startDate);
    parameter.append(PARAMS.ENDDATE, endDate);

    function handleSubmit(event) {
        event.preventDefault();
        navigate(ROUTES.SEARCH + "?" + parameter);
    }

    return (
        <form className='flex flex-col text-lg items-center m-2 p-4' onSubmit={event => handleSubmit(event)}>
            <h2 className='mt-4 mb-0 font-bold text-2xl flex items-center justify-center'>Search for a Sitter <IoPawOutline className='ml-2' /></h2>
            <div className='flex flex-col items-center w-full'>
                <div className='flex flex-col p-6 pb-0 w-full'>
                    <label htmlFor="location" className='font-bold mb-1'>Location
                        <InfoComponent setLeft={true}>
                            When you want to find pet sitters near you, you can use the 'Search by Location' feature.<br />
                            Simply enter your city, zip code, or address into the search bar, and we'll show you a list of pet sitters available in your area.<br />
                            This makes it easy to find someone nearby who can take care of your pets.
                        </InfoComponent>
                    </label>
                    <div className="block w-full relative">
                        <input className={`block w-full mt-1 rounded-md text-sm border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-black text-black ring-gray-400`}
                            type="text" id="location" value={location} placeholder="Location" onChange={event => search(event)}></input>
                        {(searchResults.length > 0) &&
                            <ul className="absolute top-10 right-0 w-full bg-white ring-1 ring-gray-400 z-20">
                                {searchResults.map((searchResult, index) =>
                                    <li key={index} className="text-sm p-1 hover:bg-gray-100" onClick={() => selectSearchResult(searchResult)}>{searchResult.label}</li>
                                )}
                            </ul>
                        }
                    </div>
                </div>
                <div className='flex flex-col p-6 pb-0 w-full'>
                    <label htmlFor="petType" className='font-bold mb-1'>Pet Type
                        <InfoComponent setLeft={true}>
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
                    <select className={`block w-full mt-1 rounded-md text-sm border-0 py-2 pl-4 pr-2 ring-1 text-black bg-white ring-gray-400`}
                        id="petType" defaultValue={petType} onChange={event => setPetType(event.target.value)}>
                        <option value="">Any</option>
                        <option value={PET.DOG}>Dog</option>
                        <option value={PET.CAT}>Cat</option>
                        <option value={PET.BIRD}>Bird</option>
                        <option value={PET.AQUARIUM}>Aquarium</option>
                        <option value={PET.REPTILE}>Reptile</option>
                        <option value={PET.RODENT}>Rodent</option>
                        <option value={PET.OTHER}>Other</option>
                    </select>
                </div>
                <div className='flex flex-col p-6 pb-0 w-full'>
                    <label htmlFor="sittingNeed" className='font-bold mb-1'>Sitting Type
                        <InfoComponent setLeft={true}>
                            Choose the type of service you need for your pet:<br />
                            - <b>Overnight Stay</b>: A sitter stays with your pet at your home overnight, ensuring they are cared for throughout the night.<br />
                            - <b>Drop-in Visit</b>: A sitter visits your home for a short period to feed, play with, and check on your pet.<br />
                            - <b>Housesitting</b>: A sitter stays in your home while you are away, providing continuous care for your pet and house.<br />
                            - <b>Daycare</b>: A sitter takes care of your pet during the day, providing companionship and attention while you are at work or busy.
                        </InfoComponent>
                    </label>
                    <select className={`block w-full mt-1 rounded-md text-sm border-0 py-2 pl-4 pr-2 ring-1 text-black bg-white ring-gray-400`}
                        id="sittingNeed" defaultValue={sittingNeed} onChange={event => setSittingNeed(event.target.value)}>
                        <option value="">Any</option>
                        <option value={SITTING.OVERNIGHT_STAY}>Overnight Stay</option>
                        <option value={SITTING.DROPIN_VISIT}>Drop-in Visit</option>
                        <option value={SITTING.HOUSESITTING}>Housesitting</option>
                        <option value={SITTING.DAYCARE}>Daycare</option>
                    </select>
                </div>
                <div className='flex flex-col p-6 pb-0 w-full'>
                    <label htmlFor="sittingNeed" className='font-bold mb-1'>Schedule
                        <InfoComponent setLeft={true}>
                            To book a pet sitting service, you'll need to set a start and end date. This helps us ensure that we find a sitter who is available for the entire duration you need.<br />
                            - <b>Start Date</b>: The first day you need the pet sitting service to begin.<br />
                            - <b>End Date</b>: The last day you need the service. The sitter will take care of your pet until this date.<br /><br />
                            For each type of service:<br />
                            - <b>Overnight Stay, Housesitting, and Daycare</b>: The sitter will provide continuous care for your pet from the start date to the end date.<br />
                            - <b>Drop-in Visit</b>: The sitter will come to your home for a specified number of visits during the selected time period. You can specify during booking how many visits you need for the selected time period.<br />
                            Enter both dates into the calendar to schedule the perfect care for your pet while you are away.
                        </InfoComponent>
                    </label>
                    <div className='flex flex-col'>
                        <input className={`block w-full mt-1 rounded-md text-sm border-0 py-2 pl-4 pr-2 ring-1 text-black ring-gray-400`}
                            type="date" id="startDate" value={startDate} min={currentDate} max={dateInAYear} onChange={event => setStartDate(event.target.value)} />
                        <input className={`block w-full mt-1 rounded-md text-sm border-0 py-2 pl-4 pr-2 ring-1 text-black ring-gray-400`}
                            type="date" id="endDate" value={endDate}
                            min={(startDate) ? getDateInXDays(startDate, (SITTING.OVERNIGHT_STAY === sittingNeed) ? 1 : 0) : currentDate}
                            max={dateInAYear} onChange={event => setEndDate(event.target.value)} />
                    </div>
                </div>
            </div>
            <button className='w-max m-2 mt-6 text-white bg-emerald-900 py-2 px-4 rounded-full hover:bg-emerald-950 duration-200' type="submit">
                <span className="flex items-center"><IoSearchCircleOutline className="mr-2" size={25} />Search</span>
            </button>
        </form>
    );
};
