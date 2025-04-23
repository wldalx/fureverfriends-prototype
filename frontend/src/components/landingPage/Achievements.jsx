import { FaCheck } from "react-icons/fa"
import { LiaCertificateSolid } from "react-icons/lia"
import { PiPawPrint } from "react-icons/pi"
import { PiPersonLight } from "react-icons/pi"


export default function Achievements() {
    return (
        <section id="achievements" className="scroll-mt-16">

            <div className="flex flex-col items-center justify-center bg-gray-200 space-y-8">
                <h2 className="text-center mt-10 text-3xl font-bold">FurEverFriends' Achievements</h2>
                <div className="w-full grid grid-cols-4 bg-gray-200 p-2 pr-4 pl-4 space-x-2 text-xl gap-4 justify-center text-center">

                    <div className="flex flex-col items-center justify-center space-y-4 bg-white hover:scale-110 duration-300 rounded-xl p-8 shadow-lg">
                        <PiPersonLight size={100} />
                        <span>567 <b>registered pet sitters</b></span>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4 bg-white hover:scale-110 duration-300 rounded-xl p-8 shadow-lg">
                        <FaCheck size={100} />
                        <span>1254 <b>completed</b> pet sitting <b>jobs</b></span>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4 bg-white hover:scale-110 duration-300 rounded-xl p-8 shadow-lg">
                        <LiaCertificateSolid size={100} />
                        <span>102 written <b>positive reviews</b></span>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4 bg-white hover:scale-110 duration-300 rounded-xl p-8 shadow-lg">
                        <PiPawPrint size={100} />
                        <span>Suitable for <b>any kind</b> of pet</span>
                    </div>

                </div>
                <div className="grid grid-cols-4 p-8 pb-0 gap-4 bg-gray-200">

                <img src="/img/landingPage/Diashow1.jpg" alt="" className="rounded-bl-[500px] rounded-tl-[500px] hover:rounded-l-xl duration-300" />
                <img src="/img/landingPage/Diashow2.jpg" alt="" className="" />
                <img src="/img/landingPage/Diashow3.jpg" alt="" />
                <img src="/img/landingPage/Diashow4.jpg" alt="" className="rounded-br-[500px] rounded-tr-[500px] hover:rounded-r-xl duration-300" />
            </div>
            </div>
        </section>
    );
}