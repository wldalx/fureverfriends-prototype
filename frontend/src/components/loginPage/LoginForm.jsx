import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"

import ROUTES from "../../utils/Routes"
import PARAMS from '../../utils/SearchParams.js'
import { useAuth } from "../../middleware/AuthMiddleware"


export default function LoginForm() {
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get(PARAMS.REDIRECT)
    let parameter = new URLSearchParams();
    parameter.append(PARAMS.REDIRECT, redirect)

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const auth = useAuth();

    // whether validations fails
    const [validate, setValidate] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();

        if(username && password) {
            auth.login(username, password, redirect);
        } else {
            setValidate(true);
            toast.error("Please enter the missing information!");
        }
    }

    return (
        <div className="bg-gray-200 bg-opacity-80 rounded-l-3xl flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold mb-2 mt-8">Welcome back! 👋</h2>
            <span>Please enter your credentials to log in.</span>
            <form className="mt-8 w-full items-center justify-center flex flex-col" onSubmit={event => handleLogin(event)}>
                <div className="w-4/5 justify-center flex flex-col p-6 pt-0">
                    <label htmlFor="username" className={`font-bold ${(validate && !username) && "text-red-700"}`}>Username</label>
                    <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !username) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                        type="text"
                        id="username"
                        placeholder="Username"
                        onChange={event => setUsername(event.target.value)} />
                </div>
                <div className="w-4/5 justify-center flex flex-col p-6 pt-0">
                    <label htmlFor="password" className={`font-bold ${(validate && !password) && "text-red-700"}`}>Password</label>
                    <input className={`block w-full mt-1 rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !password) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                        type="password"
                        id="password"
                        placeholder="Password"
                        onChange={event => setPassword(event.target.value)} />
                </div>
                <button type="submit" className='text-black bg-emerald-500 hover:bg-emerald-600 rounded-full px-4 py-2 text-xl duration-200'>
                    LOGIN
                </button>
            </form>
            <div className="flex py-5 items-center">
                <div className="flex-grow border-t border-black">
                    <div className="m-4 flex flex-col items-center justify-center">
                        <span>You are not registered yet?</span>
                        <Link className='text-gray-400 bg-gray-500 hover:bg-gray-600 rounded-full px-4 py-2 text-xl duration-200 mt-4' to={ROUTES.REGISTER + "?" + parameter}>Register</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}