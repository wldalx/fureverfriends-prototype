import { config } from "dotenv"
import axios from "axios"

config({ path: '../.env' })


export async function getLocationCoordinates(address, country) {
    const request_url = 'https://api.opencagedata.com/geocode/v1/json?'
        + 'key=' + process.env.GEO_API_KEY
        + '&q=' + encodeURIComponent(address)
        + '&pretty=1'
        + '&no_annotations=1'
        + '&countrycode=' + country

    return await axios.get(request_url)
        .then(response => {
            if (response.status != 200)
                throw new Error('Network error');
            if (!response.data.results.length)
                throw new Error('No coordinates found');
            return [
                // @see http://mongodb.com/docs/manual/reference/operator/query/near
                /*lon*/ response.data.results[0].geometry.lng,
                /*lat*/ response.data.results[0].geometry.lat
            ];
        }).catch(() => null);
}