import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthMiddleware"
import { useEffect } from "react"
import ROUTES from "../utils/Routes"
import PARAMS from '../utils/SearchParams.js'

export default function ProtectedRoute() {
    const navigate = useNavigate();
    const auth = useAuth();

    const location = useLocation()

    useEffect(() => {
        let parameter = new URLSearchParams();
        parameter.append(PARAMS.REDIRECT, location.pathname + location.search)

        if (auth.userId === "") {
            navigate(ROUTES.LOGIN + "?" + parameter);
        }
    }) // no array needed

    return (
        <Outlet />
    )
}