import { useEffect, useState } from "react"
import axios from 'axios'
import { toast } from "react-toastify"

import { ImCheckboxChecked } from "react-icons/im"
import { HiCheck, HiOutlineX } from "react-icons/hi"

import { useAuth } from "../../middleware/AuthMiddleware"
import RequestRoutes from '../../utils/RequestRoutes'
import InfoComponent from "../general/InfoComponent"


export default function ReportsTab() {

    const auth = useAuth();

    const [reports, setReports] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    function refreshData() {
        let temp = [];
        if (auth.role === "Moderator") {
            axios.get(RequestRoutes.REPORT).then(res => {
                temp = res.data.filter(report => report.open === true);
                setReports(temp);
            }).catch(() => {
                toast.error("An error occured while fetching the reports. Please try again later.");
            })
        } else if (auth.role === "User") {
            axios.get(RequestRoutes.REPORT + "?reportingUser=" + auth.userId).then(res => {
                setReports(res.data);
            }).catch(() => {
                toast.error("An error occured while fetching the reports. Please try again later.")
            })
        }
        setIsFetching(false);
    }
    useEffect(refreshData, [auth.role, auth.userId])

    function handleRejectReport(event, reportId) {
        event.preventDefault();

        axios.put(RequestRoutes.REPORT + "/" + reportId, {
            open: false
        }).then(() => {
            refreshData()
            toast.success("Report rejected successfully.", {
                theme: "colored",
                style: { backgroundColor: "rgb(110 231 183)" }
            })
        }).catch(() => {
            toast.error("An error occured while rejecting the report. Please try again later.")
        })

    }

    function handleBlockUser(event, userId, reportId) {
        event.preventDefault();

        axios.put(RequestRoutes.USER + "/" + userId, { blocked: true })
        .then(() => axios.put(RequestRoutes.REPORT + "/" + reportId, { open: false }))
        .then(() => {
            refreshData()
            toast.success("User blocked successfully.", {
                theme: "colored",
                style: { backgroundColor: "rgb(110 231 183)" }
            })
        }).catch(() => {
            toast.error("An error occured while blocking the user. Please try again later.")
        })
    }

    function ReportList() {

        if (reports.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center space-x-2 text-lg mb-8">
                    <ImCheckboxChecked size={50} className="mb-4" />
                    <span>No reports to review.</span>
                </div>
            )
        }

        return (
            reports.map(report => {
                return (
                    <div key={report._id} className="bg-gray-50 shadow-lg hover:bg-gray-100 duration-200 m-4 space-y-2 flex flex-col rounded-xl">
                        <span className="text-xl mt-4 ml-4 font-bold">{report.reportingUser?.firstName && report.reportingUser?.lastName ? report.reportingUser.firstName + " " + report.reportingUser.lastName : "Moderator"}</span>
                        <div className="grid grid-cols-[70%_30%]">
                            <div className="flex flex-col">
                                <div className="flex flex-col justify-center m-4">
                                    <span className="font-bold">Status:</span>
                                    <span>{report.open ? "Open" : "Closed"}</span>
                                </div>
                                <div className="flex flex-col justify-center m-4">
                                    <span className="font-bold">Reported By:</span>
                                    <span>{report.reportingUser?.firstName && report.reportingUser?.lastName ? report.reportingUser.firstName + " " + report.reportingUser.lastName : "Moderator"}</span>
                                </div>
                                <div className="flex flex-col justify-start m-4">
                                    <span className="font-bold">Subject:</span>
                                    <span>{report.subject}</span>
                                </div>
                                <div className="flex flex-col justify-start m-4">
                                    <span className="font-bold">Description:</span>
                                    <span>{report.description}</span>
                                </div>
                            </div>
                            {auth.role === "Moderator" &&
                                <div className="flex flex-col w-full items-center justify-center space-y-2">
                                    <button disabled={report.open ? false : true} className="text-gray-300 bg-emerald-900 ring-1 ring-gray-500 disabled:bg-gray-400 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                                        onClick={event => {
                                            handleRejectReport(event, report._id);
                                        }}>
                                        <span className="flex items-center"><HiCheck className="mr-2" />Reject Report</span>
                                    </button>
                                    <button disabled={report.open ? false : true} className="text-gray-300 bg-red-900 ring-1 ring-gray-500 disabled:bg-gray-400 hover:bg-red-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 mr-2"
                                        onClick={event => {
                                            handleBlockUser(event, report.reportedUser._id, report._id);
                                        }}>
                                        <span className="flex items-center"><HiOutlineX size={20} className="mr-2" />Block Account</span>
                                    </button>
                                </div>
                            }
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
                <h2 className="text-xl font-bold ml-4 mt-4">Reports
                    {auth.role === "User" ?
                        <InfoComponent>On this tab you can see the reports written by you for other accounts.<br/>Once sent, the reports can no longer be changed. A moderator will inspect the case and resolve them.</InfoComponent>
                        : <InfoComponent>
                            This tab allows you to review reports filed by users.<br />
                            Reports typically detail issues such as misconduct or violations of community guidelines. As a moderator, you have the authority to resolve these reports by taking appropriate actions, depending on the severity of the issue.<br />
                            Resolving a report involves carefully assessing the situation based on the information provided and applying the appropriate action to maintain a safe and respectful environment within the community. Your role in resolving reports helps ensure that all users adhere to the platform's policies and guidelines effectively.
                        </InfoComponent>}
                </h2>
                {!isFetching && (ReportList())}
            </div>
        </div>
    )
}