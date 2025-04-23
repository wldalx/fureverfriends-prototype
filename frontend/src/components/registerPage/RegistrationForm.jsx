import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import countryList from 'react-select-country-list'
import { toast } from "react-toastify"

import ROUTES from "../../utils/Routes"
import PARAMS from '../../utils/SearchParams.js'
import { useAuth } from "../../middleware/AuthMiddleware"
import { searchAddress } from "../../utils/AddressSearcher.js"


export default function RegistrationForm() {
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get(PARAMS.REDIRECT)
    let parameter = new URLSearchParams()
    parameter.append(PARAMS.REDIRECT, redirect)

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [country, setCountry] = useState("DE");

    // useMemo caches between re-renders
    const countryOptions = useMemo(() => countryList().getData(), []);

    const [searchResults, setSearchResults] = useState([]);

    // set location + find results when typing in the location field
    async function search(event) {
        const loc = event.target.value
        setAddress(loc)
        const results = await searchAddress(loc, country)
        setSearchResults(results)
    }

    // select search result when clicking on it + update location
    function selectSearchResult(searchResult) {
        setSearchResults([]);
        setAddress(searchResult.label);
    }

    // whether validation fails
    const [validate, setValidate] = useState(false);

    const auth = useAuth();

    function handleSubmit(event) {
        event.preventDefault();

        if (email && username && password && firstName && lastName && address && phoneNumber && country) {
            auth.register(email, username, password, firstName, lastName, address, phoneNumber, country, redirect);
        } else {
            setValidate(true);
            toast.error("Please enter the missing information!");
        }
    }

    return (
        <div className="h-auto bg-gray-200 bg-opacity-80 rounded-3xl flex flex-col items-center justify-center p-4">
            <h2 className="mt-8 mb-2 text-3xl font-bold">Hey there! &#128521;</h2>
            <p>Please enter the following information to register for FurEverFriends.</p>

            <form className="m-4 mr-8 space-y-10 items-center justify-center flex flex-col" onSubmit={event => handleSubmit(event)}>
                <div className="grid grid-cols-2 gap-2 space-x-5 space-y-5 items-center justify-center w-max">
                    <div className="ml-5 mt-5 flex flex-col">
                        <label htmlFor="location" className={`font-bold ${(validate && !email) && "text-red-700"}`}>Email</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !email) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="email"
                            minLength={3}
                            id="email"
                            placeholder="Email"
                            onChange={event => setEmail(event.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="username" className={`font-bold ${(validate && !username) && "text-red-700"}`}>Username</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !username) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="text"
                            minLength={8}
                            id="username"
                            placeholder="Username"
                            onChange={event => setUsername(event.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="password" className={`font-bold ${(validate && !password) && "text-red-700"}`}>Password</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !password) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="password"
                            id="password"
                            minLength={8}
                            placeholder="Password"
                            onChange={event => setPassword(event.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="firstName" className={`font-bold ${(validate && !firstName) && "text-red-700"}`}>First Name</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !firstName) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="text"
                            minLength={3}
                            id="firstName"
                            placeholder="First Name"
                            onChange={event => setFirstName(event.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="lastName" className={`font-bold ${(validate && !lastName) && "text-red-700"}`}>Last Name</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !lastName) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="text"
                            minLength={3}
                            id="lastName"
                            placeholder="Last Name"
                            onChange={event => setLastName(event.target.value)} />
                    </div>
                    <div className="block relative">
                        <label htmlFor="address" className={`font-bold ${(validate && !address) && "text-red-700"}`}>Address</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !address) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="text"
                            minLength={3}
                            id="address"
                            placeholder="Address"
                            value={address}
                            onChange={event => search(event)} />
                        {(searchResults.length > 0) &&
                            <ul className="absolute top-18 right-0 w-full bg-white ring-1 ring-gray-400">
                                {searchResults.map((searchResult, index) =>
                                    <li key={index} className="text-sm p-1 hover:bg-gray-100" onClick={() => selectSearchResult(searchResult)}>{searchResult.label}</li>
                                )}
                            </ul>
                        }
                    </div>
                    <div>
                        <label htmlFor="country" className={`font-bold ${(validate && !country) && "text-red-700"}`}>Country</label>
                        <select className={`block bg-white w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 ${(validate && !country) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"} placeholder:text-gray-400`}
                            minLength={3}
                            id="country"
                            value={country}
                            placeholder="Country"
                            onChange={event => setCountry(event.target.value)}
                        >
                            <option hidden>Country</option>
                            {countryOptions.map(country => {
                                return (<option key={country.value} value={country.value}>{country.label}</option>)
                            })}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className={`font-bold ${(validate && !email) && "text-red-700"}`}>Phone Number</label>
                        <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !phoneNumber) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                            type="tel"
                            minLength={3}
                            id="phoneNumber"
                            placeholder="Phone Number"
                            onChange={event => setPhoneNumber(event.target.value)} />
                    </div>
                </div>
                <button
                    type="submit"
                    className='text-black ml-4 bg-emerald-500 hover:bg-emerald-600 rounded-full px-4 py-2 text-xl duration-200'>
                    Submit
                </button>
            </form>
            <div className="relative flex items-center mt-4">
                <div className="flex-grow border-t border-black">
                    <div className="m-4 flex flex-col items-center justify-center">
                        <span>You already have an account?</span>
                        <Link className='text-gray-400 bg-gray-500 hover:bg-gray-600 rounded-full px-4 py-2 text-xl duration-200 mt-4' to={ROUTES.LOGIN + "?" + parameter}>Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}