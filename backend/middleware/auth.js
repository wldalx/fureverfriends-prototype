import { config } from "dotenv"
import jwt from 'jsonwebtoken'

import Account from "../models/Account.js"
import { isSameRef } from "../services/ComparisonService.js"

config({ path: '../.env' })


export function createJwtToken(account_id, role) {
    return jwt.sign(
        { subject:account_id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_MAX_AGE }
    )
}

export function getTokenContent(req) {
    // ? = coalescing null operator i.e. chain of null checks
    var token = req.header('Authorization')?.split(' ')[1]
    if(!token) token = req.cookies.token;
    if(!token) throw new Error("Token invalid")

    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch(error) {
        throw new Error("Token invalid")
    }
}

// retrieve account from DB
export async function getAccountFromToken(req) {
    const user = await Account.findById(getTokenContent(req).subject)
    if (!user) throw new Error("Token invalid")
    return user
}

/** middleware: check if authenticated */
export async function authenticate(req, res, next) {
    try {
        await getAccountFromToken(req)
    } catch(error) {
        res.status(403).json({error:error.message})
        return
    }

    next()
}

/** checks whether requestor has authorization
 * @param {express.http.ClientRequest} req - incoming HTTP request
 * @param {...object} filters - allowed claims e.g. {role:"Moderator"}
 *      only one filter has to match
 *      e.g. either moderator or user with same id can be modeled as
 *      `function({role:"Moderator"}, {role:"User", _id:1234})`
 */
export async function checkAuthorization(req, ...filters) {
    var account;
    try {
        account = await getAccountFromToken(req)
    } catch(error) {
        return false
    }
    return filters.some(filter =>
        Object.entries(filter).every(([property,value]) => {
            if(!(property in account)) return false
            if(Array.isArray(account[property]))
                // is subset of
                return value.every(item =>
                    // like Array.includes(), but type agnostic
                    account[property].some(val => isSameRef(val, item))
                )
            return isSameRef(account[property], value)
        })
    )
}

/** middleware factory
 * @param {...object} filters - allowed claims e.g. {role:"Moderator"}
 *      only one filter has to match e.g. either moderator or user
 *      with same id can be modeled as
 *      `({role:"Moderator"}, {role:"User", _id:1234})`
 * @returns {function(req,res,next)} middleware function
 */
export function authorize(...filters) {
    // middleware function
    return async (req, res, next) => {
        if(checkAuthorization(req, filters))
            next()
        else
            res.status(401).json({error:"Not authorized"})
    }
}