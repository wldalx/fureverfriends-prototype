import axios from "axios"

export async function searchAddress(address, country = 'de') {
    // Queries must be at least 2 chars long
    if (address.length < 2)
        return [] // i.e. no search results

    const request_url = 'https://api.opencagedata.com/geocode/v1/json?'
        + 'key=' + process.env.REACT_APP_GEO_API_KEY
        + '&q=' + encodeURIComponent(address)
        + '&pretty=1'
        + '&no_annotations=1'
        + '&limit=7'
        + '&countrycode=' + country

    let results = []
    await axios.get(request_url, { withCredentials: false })
        .then(response => {
            response.data.results.forEach(result => {
                results.push(
                    {
                        coordinates: [
                            result.geometry.lat,
                            result.geometry.lng
                        ],
                        label: result.formatted
                    }
                )
            })
        })
        .catch(error => console.error("Error:", error));

    return results
}