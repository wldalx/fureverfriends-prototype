import LoginForm from "./LoginForm"

export default function LoginPage() {
    const Banner = '/img/loginPage/Chameleon.jpg'
    const DogAndCat = '/img/loginPage/DogAndCat1.jpg';

    return (
        <div className="h-[calc(100vh-4.25rem)] bg-cover flex items-center bg-center" style={{ backgroundImage: `url(${Banner})` }}>
            <div className="w-full h-full bg-black/40 backdrop-blur-md items-center justify-center flex">
                <div className="grid grid-cols-2 w-1/2">
                    <LoginForm />
                    <img src={DogAndCat} alt="" className="rounded-r-3xl h-full"/>
                </div>
            </div>
        </div>
    );
};
