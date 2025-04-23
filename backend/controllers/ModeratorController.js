import Moderator from "../models/Moderator.js"
import { isServerError } from "../services/ErrorDetectionService.js"


// GET moderators
export async function get(req, res) {
    var moderators
    try {
        moderators = await Moderator.find(req.query)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    res.status(200).json(moderators)
}

// GET specific moderator
export async function getById(req, res) {
    var moderator
    try {
        moderator = await Moderator.findById(req.params.id)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    if(!moderator) {
        res.status(404).json({error:"Moderator not found"})
        return
    }

    res.status(200).json(moderator)
}

// POST (create) moderator
export async function post(req, res) {
    var moderator
    try {
        moderator = await Moderator.create(req.body)
    } catch(error) {
        res.status(isServerError(error) ? 500 : 400).json({error:error.message})
        return
    }

    res.status(200).json(moderator)
}

// DELETE moderator
export async function deleteById(req, res) {
    var moderator
    try {
        moderator = await Moderator.findByIdAndDelete(req.params.id)
    } catch(error) {
        res.status(500).json({error:error.message})
        return
    }

    if(!moderator) {
        res.status(404).json({error:"Moderator not found"})
        return
    }

    res.status(200).json(moderator)
}

// PUT (update) moderator
export const putById = async (req, res) => {
    var moderator
    try {
        moderator = await Moderator.findByIdAndUpdate(
            req.params.id,
            req.body,
            {runValidators:true, new:true /*return updated object*/}
        )
    } catch(error) {
        res.status(isServerError(error) ? 500 : 400).json({error:error.message})
        return
    }

    if(!moderator) {
        res.status(404).json({error:"Moderator not found"})
        return
    }

    res.status(200).json(moderator)
}