import { Link, useSearchParams } from "react-router-dom"
import PARAMS from '../../utils/SearchParams.js'
import ROUTES from "../../utils/Routes.js"
import ICONS from "../../utils/IconRoutes.js"

export default function CompletePage() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get(PARAMS.STATUS);

    let paymentStatus = "Something went wrong!"
    let icon = ICONS.WRONG
    if (status === "succeeded") {
        paymentStatus = "Payment was successful!"
        icon = ICONS.RIGHT // checkmark
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-8.5rem)]">
            <div className="m-auto">
                <div className="flex flex-row items-center">
                    <img className="w-20" src={icon} alt="Payment status" />
                    <h1 className="p-4 text-center font-bold text-3xl">{paymentStatus}</h1>
                </div>
                <Link className="block w-max mx-auto my-12 px-6 py-3 text-lg text-white bg-green-900 ring-1 ring-gray-500 rounded-full hover:bg-emerald-950 duration-200"
                    to={ROUTES.PROFILE}>Go to your profile!</Link>
            </div>
        </div>
    );
};