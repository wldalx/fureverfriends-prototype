export default function HoldersSection() {
    const HoldersBanner = '/img/landingPage/Banner.jpg';
    const Figma = '/img/landingPage/Figma.png';

    return (
        <section id="holders" className="scroll-mt-16">
            <div className="flex flex-col items-center space-y-10 bg-gray-200">
                <h2 className="text-center mt-8 text-3xl font-bold">For Holders</h2>
                <div className="grid grid-cols-2">
                    <div className="flex flex-col p-2 pl-4 justify-start">
                        <div className="w-full">
                            <img src={HoldersBanner} alt="Holders" className="w-full h-full object-cover rounded-xl rounded-tr-[500px] rounded-br-[500px] hover:rounded-r-xl duration-300" />
                        </div>
                    </div>
                    <div className="flex flex-col p-2 justify-start">
                        <div className="text-center space-x-4 m-auto">
                            <h2 className="font-bold text-2xl space-x-4">You are looking for a pet sitter?</h2>
                            <h2 className="text-xl">No problem.</h2>
                        </div>
                        <div className="text-xl space-x-4 flex flex-col items-center justify-center m-auto">
                            <p className="text-center leading-8 w-2/3">Our <b>innovative platform</b> connects you with trusted, experienced pet sitters tailored to your specific needs and timeframe. Whether you need someone for a few hours, days, or weeks, FurEverFriends offers a seamless search experience, detailed sitter profiles, and verified reviews to ensure your furry friends receive the best care possible. Enjoy peace of mind knowing your pets are in loving hands with FurEverFriends!</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="text-xl space-x-4 flex flex-col items-center justify-center m-auto">
                        <p className="text-center leading-8 w-2/3"><b>FurEverFriends</b> offers a range of features to ensure an optimal match between pets and sitters. You can easily specify filter options such as location, pet type, and sitting type, allowing them to find sitters who meet your specific needs. The platform also facilitates direct payments, ensuring a secure and straightforward transaction process. Additionally, you can communicate special needs or instructions for their pets directly to the sitters, ensuring personalized and attentive care. Whether you need a sitter for a dog, cat, or any other pet, FurEverFriends simplifies the process, providing peace of mind and convenience for pet holders.</p>
                    </div>
                    <div className="flex flex-col pr-4 justify-start">
                        <div className="w-full">
                            <img src={Figma} alt="Holders" className="w-full h-full object-cover rounded-xl rounded-bl-[500px] rounded-tl-[500px] hover:rounded-l-xl duration-300" />
                        </div>
                    </div>
                </div>
                <h3 className="text-center mt-10 text-3xl font-bold">What our Customers Say</h3>
                <div className="flex flex-row justify-start">
                    <div className="w-full bg-gray-200 grid grid-cols-2 gap-6 pr-4 pl-4">
                        <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center mr-2 w-full">
                            <div className="m-8 flex flex-col text-xl space-y-6 text-center justify-center">
                                <div className="flex flex-row items-center justify-center">
                                    <img src="/img/landingPage/Review1.jpg" alt="User" className="rounded-full h-20 w-20 mr-5 object-cover" />
                                    <h3><b>Lisa Glöckner</b>, 36</h3>
                                </div>
                                <p className="italic">"I recently booked a pet sitter through <b>FurEverFriends</b> and couldn't be happier with the experience. My hamster was well-cared for, and I received regular updates and photos. Highly recommend FurEverFriends for any pet owner!"</p>
                            </div>
                        </div>
                        <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center mr-2 w-full">
                            <div className="m-8 flex flex-col text-xl space-y-6 text-center justify-center">
                                <div className="flex flex-row items-center justify-center">
                                    <img src="/img/landingPage/Review2.jpg" alt="User" className="rounded-full h-20 w-20 mr-5 object-cover" />
                                    <h3><b>Johannes Meyer</b>, 25</h3>
                                </div>
                                <p className="italic">"<b>FurEverFriends</b> was a lifesaver for my recent trip! The process of finding and booking a sitter was easy, and the sitter we chose was fantastic. Our cat received excellent care, and we loved getting daily updates. I will definitely use FurEverFriends again for future pet sitting needs!"</p>
                            </div>
                        </div>
                        <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center mr-2 w-full">
                            <div className="m-8 flex flex-col text-xl space-y-6 text-center justify-center">
                                <div className="flex flex-row items-center justify-center">
                                    <img src="/img/landingPage/Review3.jpg" alt="User" className="rounded-full h-20 w-20 mr-5 object-cover" />
                                    <h3><b>Matthias Brunner</b>, 22</h3>
                                </div>
                                <p className="italic">"I recently used <b>FurEverFriends</b> to find a sitter for my dog and was very satisfied. The platform made it easy to filter sitters by location and the direct payment feature was convenient. It provided a seamless and reliable service, giving me peace of mind while I was away. Highly recommended!"</p>
                            </div>
                        </div>
                        <div className="bg-white hover:bg-gray-100 duration-200 rounded-xl items-center flex justify-center mr-2 w-full">
                            <div className="m-8 flex flex-col text-xl space-y-6 text-center justify-center">
                                <div className="flex flex-row items-center justify-center">
                                    <img src="/img/landingPage/Review4.jpg" alt="User" className="rounded-full h-20 w-20 mr-5 object-cover" />
                                    <h3><b>Jolanda Mair</b>, 24</h3>
                                </div>
                                <p className="italic">"<b>FurEverFriends</b> made finding a sitter for my cat easy and stress-free. The filter options helped me find local, experienced sitters, and the secure payment system was convenient. I appreciated being able to share my cat's specific needs directly with the sitter. I’ll definitely use FurEverFriends again!"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>)
}