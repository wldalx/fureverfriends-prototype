import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Buffer } from "buffer/" // trailing slash required

import { MdOutlineVerifiedUser } from "react-icons/md"
import { HiCheck, HiOutlineX } from "react-icons/hi"

import RequestRoutes from "../../utils/RequestRoutes"
import InfoComponent from "../general/InfoComponent"


export default function VerificationTab() {

    const [isFetching, setIsFetching] = useState(true);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);

    function refreshData() {
        axios.get(RequestRoutes.USER + "?isVerified=false").then(res => {
            setUnverifiedUsers(res.data.filter(item => item.verificationProof))
            setIsFetching(false)
        })
    }
    useEffect(refreshData, []) // defer exec

    function handleVerifyUser(event, userId) {
        event.preventDefault()

        axios.put(RequestRoutes.USER + "/" + userId, {
            isVerified: true
        }).then(() => {
            refreshData()

            toast.success("User verified successfully.", {
                theme: "colored",
                style: { backgroundColor: "rgb(110 231 183)" }
            })
        }).catch(() => {
            toast.error("An error occured while verifying the user. Please try again later.")
        })
    }

    function handleBlockUser(event, userId) {
        event.preventDefault()

        axios.put(RequestRoutes.USER + "/" + userId, {
            verificationProof: null
        }).then(() => {
            refreshData()

            toast.success("Verification rejected successfully.", {
                theme: "colored",
                style: { backgroundColor: "rgb(110 231 183)" }
            })
        }).catch(() => {
            toast.error("An error occured while rejecting the verification. Please try again later.");
        })
    }

    function UnverifiedUserList() {

        if (unverifiedUsers.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center space-x-2 text-lg mb-8">
                    <MdOutlineVerifiedUser size={50} className="mb-4" />
                    <span>No unverified users.</span>
                </div>
            )
        }

        return (
            unverifiedUsers.map(user => {
                return (
                    <div key={user._id} className="bg-gray-50 shadow-lg hover:bg-gray-100 duration-200 m-4 space-y-2 flex flex-col rounded-xl">
                        <span className="text-xl mt-4 ml-4 font-bold">{user.firstName} {user.lastName}</span>
                        <div className="grid grid-cols-[70%_30%]">
                            <div className="flex flex-col">
                                <div className="flex flex-col justify-center m-4">
                                    <span className="font-bold">Status:</span>
                                    <span>{user.isVerified ? "Verified" : "Unverified"}</span>
                                </div>
                                <div className="flex flex-col justify-center m-4">
                                    <span className="font-bold">Verification Proof:</span>
                                    <span>{user.verificationProof ? "Uploaded" : "Not Uploaded"}</span>
                                </div>
                                {user.verificationProof &&
                                    <div className="flex flex-col justify-center m-4">
                                        <span className="font-bold">File:</span>
                                        <img src={user.verificationProof ? Buffer(user.verificationProof.data).toString() : ""} alt={`Verification Proof ${user.username}`} />
                                    </div>
                                }
                            </div>
                            <div className="flex flex-col w-full items-center justify-center space-y-2">
                                <button disabled={user.isVerified ? true : false} className="text-gray-300 bg-emerald-900 ring-1 ring-gray-500 disabled:bg-gray-400 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                                    onClick={event => {
                                        handleVerifyUser(event, user._id);
                                    }}>
                                    <span className="flex items-center"><HiCheck className="mr-2" />Verify User</span>
                                </button>
                                <button disabled={user.isVerified ? true : false} className="text-gray-300 bg-red-900 ring-1 ring-gray-500 disabled:bg-gray-400 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                                    onClick={event => {
                                        handleBlockUser(event, user._id);
                                    }}>
                                    <span className="flex items-center"><HiOutlineX size={20} className="mr-2" />Reject Verification</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            )
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="bg-white rounded-xl m-4 mb-2 flex flex-col">
                <h2 className="text-xl font-bold ml-4 mt-4">
                    User Verification
                    <InfoComponent>
                        In this tab, you have the ability to review verification proofs uploaded by users.<br/>
                        Each document undergoes thorough scrutiny to ensure it meets our platform's verification standards. If a proof is deemed insufficient, unclear, or incomplete, you have the authority to reject it. In such cases, users are promptly notified and requested to upload a new verification proof that meets our requirements.<br/>
                        Once a satisfactory proof is provided, you can proceed to verify the user's account, ensuring adherence to our policies and maintaining the platform's integrity and security.
                    </InfoComponent>
                </h2>
                {!isFetching && <UnverifiedUserList />}
            </div>
        </div>
    )
}