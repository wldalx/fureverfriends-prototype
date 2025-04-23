import { HashLink } from 'react-router-hash-link'

import ICONS from '../../utils/IconRoutes.js'
import ROUTES from '../../utils/Routes'


export default function ErrorPage({ errorMsg, height = "h-[calc(100vh-8.5rem)]", home_button = true }) {

    return (
        <div className={`flex flex-col ${height}`}>
            <div className="m-auto">
                <img className="m-auto w-60" src={ICONS.LOGO} alt="Error message" />
                <p className="m-6 text-center text-xl font-bold">{errorMsg}</p>
                {(home_button) &&
                    <HashLink className="block w-max mx-auto my-12 px-6 py-3 text-lg text-white bg-green-900 ring-1 ring-gray-500 rounded-full hover:bg-emerald-950 duration-200"
                        to={ROUTES.LANDING + "#home"}>Go back to the home page!</HashLink>
                }
            </div>
        </div>
    );
}
