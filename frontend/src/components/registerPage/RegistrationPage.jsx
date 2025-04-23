import RegistrationForm from "./RegistrationForm"

export default function RegistrationPage() {
    const Banner = '/img/loginPage/Chameleon.jpg'

    return (
        <div className="min-h-[100vh-4.25rem] bg-no-repeat bg-cover flex items-center bg-center" style={{ backgroundImage: `url(${Banner})` }}>
            <div className="w-full h-full p-8 relative bg-black/40 flex backdrop-blur-md flex-col items-center justify-center">
                <RegistrationForm />
            </div>
        </div>
    );
};
