import { GiTortoise } from "react-icons/gi"
import { FaDog } from "react-icons/fa6"
import { FaCat } from "react-icons/fa6"

export default function About() {
    return (
        <section id="about" className="scroll-mt-16">

            <div className="flex flex-col items-center space-y-10 bg-gray-200">
                <h2 className="text-center mt-10 text-3xl font-bold">About Us</h2>
                <div className="w-full grid grid-cols-4 bg-gray-200 gap-6 p-4">

                    <div className="flex flex-col justify-start bg-white hover:bg-gray-100 duration-200 rounded-xl p-6">
                        <img src='/img/landingPage/Max.jpg' alt="Max" className="w-30 rounded-xl m-8 mb-6" />
                        <div className="flex flex-row items-center">
                            <span className="ml-4 font-bold">Maximilian Josef Frank</span>
                            <FaDog size={20} className="ml-2" />
                        </div>
                        <span className="ml-4 font-light">Co-Founder</span>
                    </div>
                    <div className="flex flex-col justify-start bg-white hover:bg-gray-100 duration-200 rounded-xl p-6">
                        <img src='/img/landingPage/Jonas.jpg' alt="Jonas" className="w-30 rounded-xl m-8 mb-6" />
                        <div className="flex flex-row items-center">
                            <span className="ml-4 font-bold">Jonas Geiger</span>
                            <FaCat size={20} className="ml-2" />
                        </div>
                        <span className="ml-4 font-light mb-2">Co-Founder</span>
                    </div>
                    <div className="flex flex-col justify-start bg-white hover:bg-gray-100 duration-200 rounded-xl p-6">
                        <img src='/img/landingPage/Lorenz.jpg' alt="Lorenz" className="w-30 rounded-xl m-8 mb-6" />
                        <div className="flex flex-row items-center">
                            <span className="ml-4 font-bold">Lorenz Mangold</span>
                            <GiTortoise size={20} className="ml-2" />
                        </div>
                        <span className="ml-4 font-light mb-2">Co-Founder</span>
                    </div>
                    <div className="flex flex-col justify-start bg-white hover:bg-gray-100 duration-200 rounded-xl p-6">
                        <img src='/img/landingPage/Alex.jpg' alt="Alex" className="w-30 rounded-xl m-8 mb-6" />
                        <div className="flex flex-row items-center">
                            <span className="ml-4 font-bold">Alexander Waldner</span>
                            <FaDog size={20} className="ml-2" />
                        </div>
                        <span className="ml-4 font-light mb-2">Co-Founder</span>
                    </div>
                </div>

                <div className="flex flex-row space-x-10 justify-start duration-200 rounded-xl m-auto p-8 pt-4">
                    <img src="/img/landingPage/tum-logo.png" alt="TUM Logo" className="h-24 w-auto p-2 m-auto" />
                    <div className="border-l-black border-l-2"></div>
                    <img src="/icons/logo.png" alt="FurEverFriends Logo" className="h-24 w-auto p-2 m-auto" />
                </div>
            </div>
        </section>
    );
}