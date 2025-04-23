import { PiHandshakeFill } from "react-icons/pi"
import { PiCatBold } from "react-icons/pi"
import { FaBowlFood } from "react-icons/fa6"
import { MdOutlineCreditScore } from "react-icons/md"

export default function Services() {
    return (
        <section id="services">

            <div className="flex flex-col items-center space-y-10 bg-gray-200">
                <h2 className="text-center mt-8 text-3xl font-bold">Our Services</h2>
                <div className="w-full grid grid-cols-2 gap-6 pl-4 pr-4 bg-gray-200">

                    <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center">
                        <div className="m-6 flex flex-col text-xl space-y-5 text-center justify-center">
                            <PiHandshakeFill size={80} className="m-auto" />
                            <h2>Find a <b>sitter!</b></h2>
                            <p>Easily find and book trusted, reliable pet sitters tailored to your specific needs and schedule with <b>FurEverFriends</b>, ensuring your furry friends receive the best care possible while you're away.</p>
                        </div>
                    </div>

                    <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center">
                        <div className="m-6 flex flex-col text-xl space-y-5 text-center justify-center">
                            <PiCatBold size={80} className="m-auto" />
                            <h2>Become a <b>sitter!</b></h2>
                            <p><b>FurEverFriends</b> offers you the possibility to turn your love for animals into a flexible and rewarding pet sitting job!</p>
                        </div>
                    </div>

                    <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center">
                        <div className="m-6 flex flex-col text-xl space-y-5 text-center justify-center">
                            <FaBowlFood size={80} className="m-auto" />
                            <h2>Specify your <b>personal needs</b></h2>
                            <p>Your pet has specific needs and requirements? No problem. You can inform your pet sitter about the personal habits and needs of your pet directly upon the booking.</p>
                        </div>
                    </div>

                    <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center">
                        <div className="p-8 flex flex-col text-xl space-y-5 text-center justify-center">
                            <MdOutlineCreditScore size={80} className="m-auto" />
                            <h2><b>Pay</b> directly online</h2>
                            <p>You can pay your pet sitter directly on the platform, fast and easy. For each booking, FurEverFriends charges a fee depending on the total price, while your first booking is <b>for free!</b></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}