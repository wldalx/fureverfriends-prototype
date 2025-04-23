import ROUTES from "../../utils/Routes"
import { FaRegCopyright } from "react-icons/fa6"
import { Link } from "react-router-dom"

export default function Footer() {
    return (
        <div className="relative z-10 flex flex-auto h-16 bg-emerald-500">
            <div className='flex flex-1 items-center justify-start'>
                <FaRegCopyright className='ml-4 mr-2' />
                <span>Copyright 2024. All Rights Reserved.</span>
            </div>

            <div className='flex flex-1 items-center justify-end mr-6 space-x-4'>
                <Link className='text-black hover:text-gray-800 duration-200' to={ROUTES.PRIVACY}>Privacy Policy</Link>
                <Link className='text-black hover:text-gray-800 duration-200' to={ROUTES.IMPRINT}>Impressum</Link>
            </div>
        </div>
    );
}