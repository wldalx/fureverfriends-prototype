import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import { CiLogout } from "react-icons/ci"
import { FaRegUserCircle } from "react-icons/fa"
import { Buffer } from 'buffer/' // trailing slash required

import ICONS from '../../utils/IconRoutes'
import ROUTES from '../../utils/Routes'
import { useAuth } from '../../middleware/AuthMiddleware'


export default function NavigationBar() {
    // on the landing page these links are additionally shown
    const location = useLocation()
    const navbarLinks = [
        { name: 'Home', key: '#home' },
        { name: 'For Holders', key: '#holders' },
        { name: 'For Sitters', key: '#sitters' },
        { name: 'About', key: '#about' }
    ]

    const [profilePicture, setProfilePicture] = useState();

    const auth = useAuth();

    useEffect(() => {
        if (auth.role === "User" && auth.profilePicture) {
            setProfilePicture(Buffer(auth.profilePicture.data).toString());
        } else {
            setProfilePicture();
        }
    }, [auth.profilePicture]);

    function handleLogout(event) {
        event.preventDefault();
        auth.logout();
    }

    function ShowLoginButtonOrProfile() {
        if (auth.userId === "") {
            return (
                <Link className='text-white bg-emerald-900 hover:bg-emerald-950 mx-4 rounded-full px-4 py-2 text-xl duration-200' to={ROUTES.PROFILE}>LOGIN</Link>
            )
        } else {
            return (
                <>
                    <button className='text-white bg-emerald-900 hover:bg-emerald-950 mx-4 rounded-full px-4 py-2 text-xl duration-200'
                        onClick={event => handleLogout(event)}><CiLogout /></button>
                    <Link to={ROUTES.PROFILE}>
                        <div className='h-12 w-12 hover:scale-110 duration-300 rounded-full bg-gray-300 ring-1 ring-gray-500 mx-4 mr-10 flex items-center justify-center'>
                            {
                                (profilePicture) ?
                                    <img src={profilePicture} alt="" className="w-full h-full rounded-full object-cover" /> :
                                    <FaRegUserCircle size={20} color='black' />
                            }
                        </div>
                    </Link>
                </>
            )
        }
    }

    return (
        <nav className="bg-emerald-500 z-20 sticky top-0 text-white">
            <div className="flex flex-auto">
                <div className="flex flex-1 items-center justify-start">
                    <HashLink className="flex" to={ROUTES.BASE + "#home"}>
                        <img src={ICONS.LOGO_WHITE} alt="FurEverFriends Logo" className="h-14 w-auto m-2 ml-8 hover:scale-110 duration-300" />
                        <h1 className="m-4 text-3xl">FurEverFriends</h1>
                    </HashLink>
                </div>
                <div className="flex flex-1 items-center justify-end">
                    {(location.pathname === ROUTES.LANDING) && navbarLinks.map(link => {
                        return <HashLink key={link.key} smooth to={link.key} className='hover:bg-emerald-600 mx-4 rounded-full px-4 py-2 text-xl duration-200 text-nowrap'>{link.name}</HashLink>
                    })}
                    {(location.pathname !== ROUTES.LOGIN && location.pathname !== ROUTES.REGISTER) && <ShowLoginButtonOrProfile />}
                </div>
            </div>
        </nav>
    )
}
