import Report from "../models/Report.js"
import User from "../models/User.js"
import { sanitizeRead as sanitizeUser } from "./UserController.js"
import { isServerError } from "../services/ErrorDetectionService.js"
import { isSameRef } from "../services/ComparisonService.js"
import { checkAuthorization, getTokenContent } from "../middleware/auth.js"


// GET reports
export async function get(req, res) {
    var reports;
    try {
        reports = await Report.find(req.query).select("_id reportingUser reportedUser")
        reports = await Promise.all(reports.map(async report => {
            // moderator or reporting/reported user
            if(!await checkAccess(req, report, /*write*/ false))
                return null

            // check sanitize foreach single user
            return await Report.findById(report._id).populate([
                {
                    path: "reportingUser",
                    select: await sanitizeUser(req, report.reportingUser)
                },
                {
                    path: "reportedUser",
                    select: await sanitizeUser(req, report.reportedUser)
                }
            ])
        }))
        reports = reports.filter(report => report != null)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    res.status(200).json(reports)
}

// GET specific report
export async function getById(req, res) {
    var report;
    try {
        report = await Report.findById(req.params.id)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    if(!report) {
        res.status(404).json({error:"Report not found"})
        return
    }

    // moderator or reporting/reported user
    if(!await checkAccess(req, report, /*write*/ false)) {
        res.status(403).json({error:"Not authorized"})
        return
    }

    res.status(200).json(report)
}

/** POST (create) report
 * 
 * NO AUTH: Everybody can report, regardless of having booked,
 * to prevent recurring platform trolls without paying them.
 */
export async function post(req, res) {
    var report;
    try {
        report = await Report.create(await sanitizeWrite(req, req.body, req.params.id))

        // add to User.reports[]
        await User.findByIdAndUpdate(
            report.reportingUser,
            {"$push": { "reports": report._id } },
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch(error) {
        res.status(isServerError(error) ? 500 : 400).json({error:error.message})
        return
    }

    res.status(200).json(report)
}

// DELETE report
export async function deleteById(req, res) {
    var report;
    try {
        report = await Report.findById(req.params.id)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    if(!report) {
        res.status(404).json({error:"Report not found"})
        return
    }

    // moderator or reporting user
    if(!await checkAccess(req, report)) {
        res.status(403).json({error:"Not authorized"})
        return
    }
    
    try {
        report = await Report.findByIdAndDelete(req.params.id)

        // remove from User.reports[]
        await User.findByIdAndUpdate(
            report.reportingUser,
            {"$pull": {"reports":req.params.id} },
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    res.status(200).json(report)
}

// PUT (update) report
export async function putById(req, res) {
    var report;
    try {
        report = await Report.findById(req.params.id)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    if(!report) {
        res.status(404).json({error:"Report not found"})
        return
    }

    // moderator or reporting user
    if(!await checkAccess(req, report)) {
        res.status(403).json({error:"Not authorized"})
        return
    }

    try {
        report = await Report.findByIdAndUpdate(
            req.params.id,
            await sanitizeWrite(req, req.body, req.params.id),
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch(error) {
        res.status(isServerError(error) ? 500 : 400).json({error:error.message})
        return
    }

    res.status(200).json(report)
}

// check access rights
async function checkAccess(req, report, write = true) {
    // moderator or reporting user
    const account = getTokenContent(req).subject;
    return await checkAuthorization(req, {role:'Moderator'})
        || (await checkAuthorization(req, {role:'User'}) &&
            isSameRef(account, report.reportingUser)
            || (!write && isSameRef(account, report.reportedUser))
        )
}

// sanitize report
async function sanitizeWrite(req, report, id) {
    if(await checkAuthorization(req, {role:'Moderator'})) return report

    const reportInDB = await Report.findById(id)
    if(reportInDB?.open == false) return {} // closed, so disallow changes

    if(report.open == false) delete report.open // only moderators can close
    if(report.reportingUser) // detect attempt to overwrite
        report.reportingUser = getTokenContent(req).subject

    return report
}