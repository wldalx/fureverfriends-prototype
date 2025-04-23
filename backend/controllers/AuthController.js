import bcryptjs from "bcryptjs"
import { config } from "dotenv"
import ms from "ms" // installed by npmjs.org/jsonwebtoken

import Account from "../models/Account.js"
import User from "../models/User.js"
import { createJwtToken, getAccountFromToken } from "../middleware/auth.js"
import { isServerError } from "../services/ErrorDetectionService.js"

config({ path: '../.env' })


// login by creating a new token
export async function token(req, res) {
    var account;
    try {
        // throws error if not found
        account = await getAccountByCredentials(req.body)
    } catch (error) {
        res.status(403).json({ error: error.message })
        return
    }

    try {
        if(account instanceof User)
            account = await User.populate(account, "profilePicture")
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    var token;
    try {
        token = createJwtToken(account._id, account.role)
        if (!token) throw new Error("Token could not be created")
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
    res.cookie("token", token, {
        httpOnly: false,
        maxAge: ms(process.env.TOKEN_MAX_AGE.toString())
    })
    res.status(200).json({ token, account })
}

export async function clearCookie(req, res) {
    res.clearCookie("token")
    res.status(200).json({ message: "Logout successful" })
}

export async function getStatus(req, res) {
    var account;
    try {
        account = await getAccountFromToken(req)
    } catch (error) {
        account = null
    }

    try {
        if(account instanceof User)
            account = await User.populate(account, "profilePicture")
    } catch (error) {
        res.status(isServerError(error) ? 500 : 400).json({ error: error.message })
        return
    }

    res.status(200).json({ account });
}


// helper method
async function getAccountByCredentials({ username, password }) {
    if(!username || !password)
        throw new Error('Missing credentials "username" or "password"')

    const account = await Account.findOne({username})

    // for internal debugging
    if(!account) console.warn('No Account with username "' + username + '"')
    else console.log('Account "' + username + '" found')

    if (!account || !bcryptjs.compareSync(password, account.password))
        throw new Error('Username or password incorrect')

    return account
}