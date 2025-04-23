import mongoose from "mongoose"

/** return whether mongoose error is server error
 * @see https://mongoosejs.com/docs/api/error.html
 * @param {mongoose.Error} error
 * @returns {boolean}
 */
export function isServerError(error) {
    return error instanceof mongoose.Error.MissingSchemaError
        || error instanceof mongoose.Error.MongooseServerSelectionError
        || error instanceof mongoose.Error.OverwriteModelError;
}