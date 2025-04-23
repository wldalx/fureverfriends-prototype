import { createContext, useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from 'react-toastify'

import REQUESTS from '../utils/RequestRoutes'
import ROUTES from "../utils/Routes"

const AuthContext = createContext()

export default function AuthMiddleware({ children }) {

    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const [userId, setUserId] = useState("");
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [address, setAddress] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [isVerified, setIsVerified] = useState(false)
    const [verificationProof, setVerificationProof] = useState("")
    const [profilePicture, setProfilePicture] = useState("")
    const [offer, setOffer] = useState("")
    const [bookings, setBookings] = useState("")
    const [reports, setReports] = useState("")
    const [role, setRole] = useState("");
    const [country, setCountry] = useState("");
    const [iban, setIban] = useState("");
    const [moderatorRights, setModeratorRights] = useState([]);

    const location = useLocation()
    useEffect(() => {
        axios.get(REQUESTS.AUTH + "/status").then(res => {
            if (res.data.account) {
                setUserId(res.data.account._id);
                setFirstName(res.data.account.firstName);
                setLastName(res.data.account.lastName);
                setAddress(res.data.account.address);
                setPhoneNumber(res.data.account.phoneNumber);
                setEmail(res.data.account.email);
                setUsername(res.data.account.username);
                setIsVerified(res.data.account.isVerified);
                setVerificationProof(res.data.account.verificationProof);
                setProfilePicture(res.data.account.profilePicture);
                setOffer(res.data.account.offer);
                setBookings(res.data.account.bookings);
                setReports(res.data.account.reports);
                setRole(res.data.account.role);
                setCountry(res.data.account.country);
                setIban(res.data.account.iban);
                setModeratorRights(res.data.account.rights);

                navigate(location.pathname + location.search)
            }
        }).catch(error => console.error(error))
    }, [])

    const login = (username, password, redirect) => {
        axios.post(REQUESTS.AUTH + "/token", {
            "username": username,
            "password": password
        })
            .then(res => {
                if (res.status === 200) {
                    if(res.data.account.blocked) {
                        toast.error("Your account has been blocked by a moderator. Please contact the support for further information.")
                        return
                    }

                    setUserId(res.data.account._id);
                    setFirstName(res.data.account.firstName);
                    setLastName(res.data.account.lastName);
                    setAddress(res.data.account.address);
                    setPhoneNumber(res.data.account.phoneNumber);
                    setEmail(res.data.account.email);
                    setUsername(res.data.account.username);
                    setIsVerified(res.data.account.isVerified);
                    setVerificationProof(res.data.account.verificationProof);
                    setProfilePicture(res.data.account.profilePicture);
                    setOffer(res.data.account.offer);
                    setBookings(res.data.account.bookings);
                    setReports(res.data.account.reports);
                    setRole(res.data.account.role);
                    setCountry(res.data.account.country);
                    setIban(res.data.account.iban);
                    setModeratorRights(res.data.account.rights);

                    toast.success("Login successful. Welcome back!", {
                        theme: "colored",
                        style: { backgroundColor: "rgb(110 231 183)" }
                    });

                    navigate(redirect)
                }
            }).catch(() => {
                toast.error("Username or password incorrect. Please try again.");
            })
    }

    const logout = () => {
        axios.delete(REQUESTS.AUTH + "/token")
            .then(res => {
                if (res.status === 200) {
                    setUserId("");
                    setFirstName("");
                    setLastName("");
                    setAddress("");
                    setPhoneNumber("");
                    setEmail("");
                    setUsername("");
                    setIsVerified(false);
                    setVerificationProof("");
                    setProfilePicture("");
                    setOffer("");
                    setBookings("");
                    setReports("");
                    setRole("");
                    setCountry("");
                    setIban("");
                    setModeratorRights([]);

                    navigate(ROUTES.LANDING);

                    toast.success("Logout successful.", {
                        theme: "colored",
                        style: { backgroundColor: "rgb(110 231 183)" }
                    });
                } else {
                    toast.error("An error occured while logging out. Please try again later.");
                }
            })
            .catch(() => {
                toast.error("An error occured while logging out. Please try again later.");
            })
    }

    const register = (email, username, password, firstName, lastName, address, phoneNumber, country, redirect) => {
        axios.post(REQUESTS.USER, {

            email: email,
            username: username,
            password: password,
            firstName: firstName,
            lastName: lastName,
            address: address,
            country: country,
            phoneNumber: phoneNumber

        }).then(() => {

            axios.post(REQUESTS.AUTH + "/token", {
                "username": username,
                "password": password
            }).then(res => {
                setUserId(res.data.account._id);
                setFirstName(res.data.account.firstName);
                setLastName(res.data.account.lastName);
                setAddress(res.data.account.address);
                setPhoneNumber(res.data.account.phoneNumber);
                setEmail(res.data.account.email);
                setUsername(res.data.account.username);
                setIsVerified(res.data.account.isVerified);
                setVerificationProof(res.data.account.verificationProof);
                setProfilePicture(res.data.account.profilePicture);
                setOffer(res.data.account.offer);
                setBookings(res.data.account.bookings);
                setReports(res.data.account.reports);
                setRole(res.data.account.role);
                setCountry(res.data.account.country);
                setIban(res.data.account.iban);

                toast.success("Registration successful. Welcome to FurEverFriends!", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                });
                navigate(redirect)
            })
        }
        ).catch(err => {
            if (err.response.status >= 400)
                toast.error(err.response.data.error)
            else
                toast.error("An error occured during the registration process. Please try again later.")
        })
    }

    const updateUserInformation = (firstName, lastName, address, phoneNumber, email, username, country, iban) => {
        axios.put(REQUESTS.USER + "/" + userId, {
            firstName: firstName,
            lastName: lastName,
            address: address,
            phoneNumber: phoneNumber,
            email: email,
            username: username,
            country: country,
            iban: iban
        }).then(() => {
            setFirstName(firstName);
            setLastName(lastName);
            setAddress(address);
            setPhoneNumber(phoneNumber);
            setEmail(email);
            setUsername(username);
            setCountry(country);
            setIban(iban);
        })
    }

    const refreshUserInformation = () => {
        axios.get(REQUESTS.USER + "/" + userId).then(res => {
            setUserId(res.data._id);
            setFirstName(res.data.firstName);
            setLastName(res.data.lastName);
            setAddress(res.data.address);
            setPhoneNumber(res.data.phoneNumber);
            setEmail(res.data.email);
            setUsername(res.data.username);
            setIsVerified(res.data.isVerified);
            setVerificationProof(res.data.verificationProof);
            setProfilePicture(res.data.profilePicture);
            setOffer(res.data.offer);
            setBookings(res.data.bookings);
            setReports(res.data.reports);
            setRole(res.data.role);
            setCountry(res.data.country);
            setIban(res.data.iban);
        })
    }

    return (
        <AuthContext.Provider value={{ userId, firstName, lastName, address, phoneNumber, email, username, isVerified, verificationProof, profilePicture, offer, bookings, reports, role, country, iban, moderatorRights, login, logout, register, updateUserInformation, refreshUserInformation }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}