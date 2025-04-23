import { useCallback, useMemo, useRef, useState } from "react"
import axios from "axios"
import Webcam from "react-webcam"
import countryList from 'react-select-country-list'
import { toast } from "react-toastify"

import { FaRegSave, FaRegEdit } from "react-icons/fa"
import { MdOutlineFileUpload, MdOutlineVerifiedUser, MdOutlineCamera, MdOutlineDeleteForever, MdOutlineDelete } from "react-icons/md"
import { CiFileOn } from "react-icons/ci"
import { FaClockRotateLeft } from "react-icons/fa6"
import { IoCameraOutline } from "react-icons/io5"
import { PiWarningOctagonBold } from "react-icons/pi"

import { useAuth } from "../../middleware/AuthMiddleware"
import RequestRoutes from "../../utils/RequestRoutes"
import { searchAddress } from "../../utils/AddressSearcher"
import InfoComponent from "../general/InfoComponent"


export default function ProfileTab() {

    const auth = useAuth();
    const [inEditMode, setEditMode] = useState(false);

    // useMemo caches calc results between re-renders
    const countryOptions = useMemo(() => countryList().getData(), []);

    const [firstName, setFirstName] = useState(auth.firstName)
    const [lastName, setLastName] = useState(auth.lastName)
    const [address, setAddress] = useState(auth.address)
    const [phoneNumber, setPhoneNumber] = useState(auth.phoneNumber)
    const [email, setEmail] = useState(auth.email)
    const [username, setUsername] = useState(auth.username)
    const [country, setCountry] = useState(auth.country)
    const [iban, setIban] = useState(auth.iban ? auth.iban : "")

    const [searchResults, setSearchResults] = useState([]);
    // set location + find results when typing in the location field
    async function search(event) {
        const loc = event.target.value
        setAddress(loc)
        const results = await searchAddress(loc, country)
        setSearchResults(results)
    }
    // select search result when clicking on it & update location
    function selectSearchResult(searchResult) {
        setSearchResults([])
        setAddress(searchResult.label)
    }

    function saveUpdatedUserCredentials(event) {
        event.preventDefault();
        if (firstName && lastName && address && phoneNumber && email && username && country && iban) {
            auth.updateUserInformation(firstName, lastName, address, phoneNumber, email, username, country, iban)
            setEditMode(inEditMode => !inEditMode)
            setValidate(false)
            toast.success("User credentials updated successfully.", {
                theme: "colored",
                style: { backgroundColor: "rgb(110 231 183)" }
            })
        } else {
            setValidate(true)
            toast.error("Please enter the missing information!")
        }
    }

    const [verificationMethod, setVerificationMethod] = useState("FileUpload")
    const verificationMethods = {
        "FileUpload": <FileUpload />,
        "Webcam": <WebcamForVerification />
    }
    const [verificationProof, setVerificationProof] = useState(null);
    const [screenshot, setScreenshot] = useState("")

    // whether validation failed
    const [validate, setValidate] = useState(false);

    // Component
    function WebcamForVerification() {
        const webcamRef = useRef(null)
        const capture = useCallback(() => {
            setScreenshot(webcamRef.current.getScreenshot())
        }, [webcamRef])

        function handleScreenshotSubmit(event) {
            event.preventDefault()

            if(!screenshot) {
                toast.error("Please wait until the webcam has connected.")
                return
            }
    
            axios.put(RequestRoutes.USER + "/" + auth.userId, {
                verificationProof: {
                    type: "image/jpeg",
                    data: screenshot
                }
            }).then(() => {
                auth.refreshUserInformation()
                toast.success("Screenshot uploaded successfully.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                })
            })
        }

        return (
            <div className="p-4 flex flex-col items-center max-h-36 w-full">
                {screenshot === "" && <Webcam
                    className="h-auto w-2/5 rounded-xl p-4"
                    videoConstraints={{ height: 720, width: 1280, facingMode: "user" }}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                />}
                <img className={screenshot === "" ? "" : "p-4 h-auto w-2/5"} src={screenshot} alt="" />
                <div className="flex flex-row">
                    <button className="text-gray-300 disabled:text-gray-500 bg-emerald-900 ring-1 ring-gray-500 hover:bg-emerald-950 disabled:bg-gray-200 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                        onClick={() => {
                            if (screenshot === "")
                                capture()
                            else
                                setScreenshot("")
                        }}><span className="flex flex-row items-center"><MdOutlineCamera className="mr-2" />{screenshot === "" ? "Take Photo" : "Cancel"}</span></button>
                    <button disabled={screenshot === ""} className="text-gray-300 disabled:text-gray-500 bg-emerald-900 ring-1 ring-gray-500 hover:bg-emerald-950 disabled:bg-gray-200 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                        onClick={event => handleScreenshotSubmit(event)}><span className="flex flex-row items-center"><MdOutlineFileUpload className="mr-2" />Upload Screenshot</span></button>
                </div>
            </div>
        )
    }

    // Component
    function FileUpload() {
        function handleIDFileSubmit(event) {
            event.preventDefault();
    
            const reader = new FileReader()
            reader.readAsDataURL(verificationProof)
            reader.onload = () => {
                axios.put(RequestRoutes.USER + "/" + auth.userId, {
                    verificationProof: {
                        type: verificationProof.type,
                        data: reader.result
                    }
                }).then(() => {
                    auth.refreshUserInformation();
                    toast.success("File uploaded successfully.", {
                        theme: "colored",
                        style: { backgroundColor: "rgb(110 231 183)" }
                    })
                })
            }
        }

        return (
            <form className="flex flex-col items-center justify-center space-x-2 space-y-4 text-lg m-auto" onSubmit={event => handleIDFileSubmit(event)}>
                <span className="font-bold">Please upload your ID to verify your account</span>
                <div className="flex flex-row items-center justify-center space-x-4">
                    <label htmlFor="id_card" className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 w-max text-lg duration-200">
                        <span className="flex items-center"><CiFileOn className="mr-2" />Select File</span>
                    </label>
                    <input type="file" accept=".pdf,.png,.jpg" hidden
                        id="id_card"
                        onChange={event => setVerificationProof(event.target.files[0])} />
                    <button disabled={!verificationProof} type="submit" className="text-gray-300 bg-emerald-900 ring-1 disabled:bg-gray-300 disabled:text-gray-500 ring-gray-500 hover:bg-emerald-950 rounded-full px-4 py-2 w-max text-lg duration-200">
                        <span className="flex items-center"><MdOutlineFileUpload className="mr-2" />Submit</span>
                    </button>
                </div>
            </form>
        )
    }

    // Component
    function AccountVerified() {
        if (auth.isVerified)
            return (
                <div className="flex flex-col items-center justify-center space-x-2 text-lg m-auto">
                    <MdOutlineVerifiedUser size={50} className="mb-4" />
                    <span>Your account has been verified successfully.</span>
                </div>
            )
        else if (!auth.isVerified && auth.verificationProof)
            return (
                <div className="flex flex-col items-center justify-center space-x-2 text-lg m-auto">
                    <FaClockRotateLeft size={50} className="mb-4" />
                    <span>Thanks for uploading your ID.</span>
                    <span>We verify your account as soon as possible.</span>
                </div>
            )
        else if (!auth.isVerified && !auth.verificationProof) {
            // Upload form for ID
            return <>
                <div className="flex flex-row items-center justify-center space-x-8">
                    <button className="text-gray-300 disabled:text-gray-500 bg-emerald-900 ring-1 ring-gray-500 hover:bg-emerald-950 disabled:bg-gray-200 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                        disabled={verificationMethod === "FileUpload"}
                        onClick={() => setVerificationMethod("FileUpload")}
                        >
                            <span className="flex flex-row items-center">
                                <CiFileOn className="mr-2" />File Upload
                            </span>
                    </button>
                    <button className="text-gray-300 disabled:text-gray-500 bg-emerald-900 ring-1 ring-gray-500 hover:bg-emerald-950 disabled:bg-gray-200 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                        disabled={verificationMethod === "Webcam"}
                        onClick={() => setVerificationMethod("Webcam")}
                        >
                            <span className="flex flex-row items-center">
                                <IoCameraOutline className="mr-2" />Webcam
                            </span>
                    </button>
                </div>

                {verificationMethods[verificationMethod]}
            </>
        }
    }

    // Component
    function DangerZone() {
        const [dangerousMode, setDangerousMode] = useState(false);

        function handleDeleteAccount() {
            axios.delete(RequestRoutes.USER + "/" + auth.userId)
            .then(res => {
                auth.logout()
                toast.success("Successfully deleted account.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                })
            }).catch(err => {
                if (err.response.status === 405)
                    toast.error("You cannot delete your account. " + err.response.data.error + ".")
                else
                    toast.error("An error occured during the deletion process. Please try again later.")
            })
        }

        return dangerousMode ?
            <div className="p-4 flex flex-col items-center w-full gap-3 mb-6 text-center">
                <MdOutlineDelete size="50" />
                <span>
                    Deleting your account cannot be undone.<br />
                    Be cautious! You will be logged out immediately.
                </span>
                <button className="text-gray-300 bg-red-900 ring-1 ring-gray-500 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                    onClick={event => handleDeleteAccount()}>
                        <span className="flex flex-row items-center">Delete Account</span>
                </button>
            </div>
            : <div className="p-4 flex flex-col items-center w-full gap-3 mb-6 text-center">
                    <PiWarningOctagonBold size="50" />
                    <span>
                        This is a dangerous zone. You can delete your account here.<br />
                        Actions are not revertable. Be cautious!
                    </span>
                    <button className="text-gray-300 bg-red-900 ring-1 ring-gray-500 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                        onClick={event => setDangerousMode(true)}>
                            <span className="flex flex-row items-center">I understand the risk</span>
                    </button>
            </div>
    }
        

    return (
        <div className="grid grid-rows-2 h-full">
            <div className="bg-white rounded-xl m-4 mb-2 flex flex-col h-max">
                <h2 className="text-xl font-bold ml-4 mt-4">
                    Your Information
                    <InfoComponent>This section lets you review your entered credentials. To make changes, click "Edit."</InfoComponent>
                </h2>
                <form className="grid grid-rows-[85%_15%] m-4">
                    <div className="grid grid-cols-2">
                        <div className="flex flex-col m-4 text-lg space-y-2">
                            <label htmlFor="firstName" className={ (validate && !firstName) ? "text-red-700 font-bold" : "" }>First Name:</label>
                            <input type="text"
                                disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !firstName) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="firstName"
                                minLength={3}
                                value={firstName}
                                onChange={event => setFirstName(event.target.value)} />
                            <label htmlFor="lastName" className={ (validate && !lastName) ? "text-red-700 font-bold" : ""}>Last Name:</label>
                            <input type="text"
                                disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !lastName) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="lastName"
                                minLength={3}
                                value={lastName}
                                onChange={event => setLastName(event.target.value)} />
                            <div className="block w-full relative">
                                <label htmlFor="address" className={ (validate && !address) ? "text-red-700 font-bold" : ""}>Address:</label>
                                <input type="text"
                                    disabled={inEditMode ? "" : "disabled"}
                                    className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !address) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                    id="address"
                                    minLength={3}
                                    value={address}
                                    onChange={event => search(event)} />
                                {(searchResults.length > 0) &&
                                    <ul className="absolute top-18 right-0 w-full bg-white ring-1 ring-gray-400">
                                        {searchResults.map((searchResult, index) =>
                                            <li key={index} className="text-sm p-1 hover:bg-gray-100" onClick={() => selectSearchResult(searchResult)}>{searchResult.label}</li>
                                        )}
                                    </ul>
                                }
                            </div>
                            <label htmlFor="country" className={ (validate && !country) ? "text-red-700 font-bold" : ""}>Country:</label>
                            <select disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 bg-white disabled:ring-gray-400 disabled:text-black text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !country) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="country"
                                minLength={3}
                                type="text"
                                value={country}
                                onChange={event => setCountry(event.target.value)}>
                                {countryOptions.map(country =>
                                    <option key={country.value} value={country.value}>{country.label}</option>
                                )}
                            </select>
                        </div>
                        <div className="flex flex-col m-4 text-lg space-y-2">
                            <label htmlFor="phoneNumber" className={ (validate && !phoneNumber) ? "text-red-700 font-bold" : "" }>Phone Number:</label>
                            <input type="tel"
                                disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !phoneNumber) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="phoneNumber"
                                minLength={3}
                                value={phoneNumber}
                                onChange={event => setPhoneNumber(event.target.value)} />
                            <label htmlFor="email" className={ (validate && !email) ? "text-red-700 font-bold" : ""}>Email:</label>
                            <input type="email"
                                disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !email) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="email"
                                minLength={3}
                                value={email}
                                onChange={event => setEmail(event.target.value)} />
                            <label htmlFor="username" className={ (validate && !username) ? "text-red-700 font-bold" : "" }>Username:</label>
                            <input type="text"
                                disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !username) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="username"
                                minLength={8}
                                value={username}
                                onChange={event => setUsername(event.target.value)} />
                            <label htmlFor="iban" className={ (validate && !iban) ? "text-red-700 font-bold" : "" }>IBAN:</label>
                            <input type="text"
                                disabled={inEditMode ? "" : "disabled"}
                                className={`block w-full mt-1 text-sm rounded-md border-0 py-2 pl-4 pr-2 ring-1 placeholder:text-gray-400 ${(validate && !iban) ? "text-red-700 ring-red-700 border-red-700" : "text-black ring-gray-400"}`}
                                id="iban"
                                minLength={3}
                                value={iban}
                                onChange={event => setIban(event.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-row mt-2 mb-6 items-center justify-center">
                        <button className={`${inEditMode ? "bg-red-900 hover:bg-red-950" : "bg-emerald-900 hover:bg-emerald-950"} text-gray-300 ring-1 ring-gray-500 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2`}
                            onClick={event => {
                                event.preventDefault();
                                setEditMode(inEditMode => !inEditMode)
                            }}>
                            <span className="flex items-center">{
                                inEditMode ?
                                <><MdOutlineDeleteForever size={20} className="mr-2" />Cancel</>
                                : <><FaRegEdit className="mr-2" />Edit</>
                            }</span>
                        </button>
                        <button disabled={inEditMode ? "" : "disabled"}
                            className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 disabled:bg-gray-400 ml-2"
                            onClick={event => saveUpdatedUserCredentials(event)}>
                            <span className="flex items-center"><FaRegSave className="mr-2" />Save</span>
                        </button>
                    </div>
                </form>
            </div >
            <div className="bg-white rounded-xl m-4 mt-2 flex flex-col">
                <h2 className="text-xl font-bold ml-4 mt-4">
                    Verification Status
                    <InfoComponent>
                        This section informs you about the verification status of your account. There are two options available to you regarding verification:<br/>
                        - <b>Upload a File:</b> You can upload an image file containing your verification documentation.<br/>
                        - <b>Use Webcam:</b> Alternatively, you can use your webcam to capture and submit the necessary verification documentation.<br/>
                        Please ensure that any uploaded files are in image format, as only image files are accepted for verification purposes. After submission, your documentation will be reviewed by a moderator, who will either verify your account or reject the submission based on the provided information.
                    </InfoComponent>
                </h2>
                <AccountVerified />
            </div>
            <div className="bg-white rounded-xl m-4 mt-2 flex flex-col">
                <h2 className="text-xl font-bold ml-4 mt-4">Danger Zone</h2>
                <DangerZone />
            </div>
        </div>
    )
}