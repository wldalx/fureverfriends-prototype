import { Link } from "react-router-dom"
import ROUTES from "../../utils/Routes"

export default function SittersSection() {
    const HoldersBanner2 = '/img/landingPage/Banner3.jpg';
    const HoldersBanner3 = '/img/landingPage/Banner4.jpg';

    return (
        <section id="sitters" className="scroll-mt-16">
            <div className="flex flex-col items-center space-y-10 bg-gray-200">
                <h2 className="text-center mt-10 text-3xl font-bold">For Sitters</h2>
                <div className="grid grid-cols-2">
                    <div className="flex flex-col items-center m-2 justify-center">
                        <div className="text-center space-x-4">
                            <h2 className="font-bold text-2xl space-x-4">Apply as pet sitter!</h2>
                        </div>
                        <div className="text-xl space-y-6 m-4 space-x-4 flex flex-col items-center justify-center">
                            <p className="text-center leading-8 w-2/3">Turn your passion for pets into a rewarding job with <b>FurEverFriends</b>! Register on our platform to offer your pet sitting services to owners seeking reliable care. Set your own hours, rates, and preferences for types of pets. Whether you’re available for a few hours or longer, FurEverFriends offers the flexibility to fit pet sitting into your lifestyle. Create your profile, earn trusted reviews, and <b>join a community</b> dedicated to top-notch pet care. Start your pet sitting adventure with FurEverFriends today!</p>
                            <Link className='w-max m-2 text-white bg-emerald-900 py-4 px-6 rounded-full hover:bg-emerald-950 duration-200' to={ROUTES.REGISTER}>Register Now!</Link>
                        </div>
                    </div>
                    <div className="flex flex-col p-2 pr-4 justify-start">
                        <div className="w-full">
                            <img src={HoldersBanner2} alt="Holders" className="w-full h-full object-cover rounded-xl rounded-tl-[500px] rounded-bl-[500px] hover:rounded-l-xl duration-300" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="flex flex-col p-2 pl-4 justify-start">
                        <div className="w-full">
                            <img src={HoldersBanner3} alt="Holders" className="w-full h-full object-cover rounded-xl rounded-tr-[500px] rounded-br-[500px] hover:rounded-r-xl duration-300" />
                        </div>
                    </div>
                    <div className="text-xl space-x-4 flex flex-col items-center justify-center m-auto">
                        <p className="text-center leading-8 w-2/3">Join <b>FurEverFriends</b> to find pet sitting jobs tailored to your preferences! As a sitter, you can easily schedule appointments and create customized offers based on pet types and sitting services. Whether you specialize in cats, birds, or other pets, you can exclude dogs or any animals you're intolerant to, ensuring a perfect fit for your skills and comfort. <b>Sign up today</b> and start connecting with pet owners in need of your expertise!</p>
                    </div>
                </div>
            </div>
        </section>)
}