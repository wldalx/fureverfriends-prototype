import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import axios from 'axios'

import REQUESTS from "../../utils/RequestRoutes"
import ICONS from '../../utils/IconRoutes.js'
import { convertDateArray, getDateInXYears, getInDateFrame } from '../../utils/Date.js'
import InfoComponent from '../general/InfoComponent.jsx'


export default function ServiceSection({ id, petTypes, priceClasses, setErrorMsg }) {
    const [availabilities, setAvailabilities] = useState([])
    // get availabilities
    useEffect(() => {
        axios.get(REQUESTS.OFFER + "/" + id + "/availabilities")
            .then(res => setAvailabilities(convertDateArray(res.data)))
            .catch(error => setErrorMsg(error.message))
    }, [])

    return (
        <div className="flex my-16">
            <div className="flex-1">
                <div className="flex items-center my-4">
                    <img className="max-h-6 mx-1" src={ICONS.CALENDAR} alt="Calendar Symbol" />
                    <h1 className="ml-1 text-xl font-bold">Availabilities:
                        <InfoComponent>
                            When viewing a sitter's profile, you'll see a calendar showing their availability.<br />
                            The times when sitters are available are marked in green.<br />
                            This helps you quickly identify when the sitter is free to take care of your pet.<br />
                            Simply look for the green-marked dates to find a suitable time.
                        </InfoComponent>
                    </h1>
                </div>
                <Calendar className="m-2 text-center text-base" minDate={new Date()} maxDate={new Date(getDateInXYears(1))}
                    prev2Label={null} next2Label={null} minDetail="month" view="month"
                    tileClassName={date => getInDateFrame(availabilities, date.date) ? "calendar-highlight" : ""}
                    tileDisabled={() => true} />
            </div>
            <div className="flex-1 px-8">
                <div className="flex items-center my-4">
                    <img className="max-h-6 mx-1" src={ICONS.LIST} alt="List Symbol" />
                    <h1 className="ml-1 text-xl font-bold">Offered Pet Types:
                        <InfoComponent>
                            Each sitter profile displays icons representing the types of pets they are willing to care for.<br />
                            These icons are accompanied by respective text labels, such as "dog," "cat," "bird," "aquarium," "reptile," "rodent," or "other."<br />
                            This helps you quickly see if a sitter can handle your specific pet type.<br />
                            Check these icons and text labels to ensure the sitter is matching with your pet type.
                        </InfoComponent>
                    </h1>
                </div>
                <div className="flex flex-wrap">
                    {(petTypes) && petTypes.map(petType =>
                        <div key={petType} className="flex items-center my-2.5 w-3/6">
                            <img className="max-h-7 mx-1.5" src={"/petType/" + petType + ".png"} alt="Pet Symbols" />
                            <p className="capitalize">{petType.toLowerCase()}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 ">
                <div className="flex items-center my-4">
                    <img className="max-h-6 mx-1" src={ICONS.PRICE} alt="Price Symbol" />
                    <h1 className="ml-1 text-xl font-bold">Offered Sitting Types and Prices:
                        <InfoComponent setLeft={true}>
                            Sitters offer different types of services, and each service has its own price.<br />
                            Here, you see a list of the sitting types they offer, such as:<br />
                            - <b>Overnight Stay</b>: The price is per night.<br />
                            - <b>Drop-in Visit</b>: The price is per visit.<br />
                            - <b>Housesitting</b>: The price is per day.<br />
                            - <b>Daycare</b>: The price is per day.<br /><br />
                            Next to each service type, the price is displayed. This allows you to see the cost of each service at a glance, helping you choose the one that best fits your needs and budget.
                        </InfoComponent>
                    </h1>
                </div>
                <div className="m-2">
                    {(priceClasses) && priceClasses.map(priceClass =>
                        <div key={priceClass.type} className="flex flex-row justify-between m-2">
                            <p className="capitalize">{priceClass.type.replace("_", " ").toLowerCase()}</p>
                            <p>{priceClass.price} €</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
