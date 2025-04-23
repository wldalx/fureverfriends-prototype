import { IoPawOutline } from "react-icons/io5"
import { HashLink } from 'react-router-hash-link'

import SearchForm from "./SearchForm"


export default function Hero() {
    const Banner = '/img/landingPage/Banner2.jpg';

    return (// evtl. h-[100vh]
        <header id='home' className="h-[calc(100vh-4.25rem)] bg-no-repeat bg-cover flex items-center bg-center scroll-mt-20" style={{ backgroundImage: `url(${Banner})` }}>
            <div className="w-full h-full relative bg-black/30 flex flex-col items-center justify-center">
                <div className="h-full w-full flex-col relative sm:grid-cols-[70%_30%] grid">
                    <div className="flex flex-col justify-center items-center">
                        <div className="text-center space-y-6 items-center justify-center mr-6 fade-in">
                            <h1 className="text-6xl text-white">FurEverFriends</h1>
                            <p className="text-2xl text-white">The best platform to search for sitters that take care of your beloved ones.</p>
                            <button className="text-white bg-emerald-900 hover:bg-emerald-950 m-4 rounded-full px-10 py-4 text-xl duration-200">
                                <HashLink to="#sitters">
                                    <span className="flex items-center"><IoPawOutline className="mr-2" />Become a Sitter</span>
                                </HashLink>
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-200 bg-opacity-80 rounded-xl items-center h-max w-9/12 mt-auto mb-auto">
                        <SearchForm />
                    </div>
                </div>
            </div>
        </header>)
}