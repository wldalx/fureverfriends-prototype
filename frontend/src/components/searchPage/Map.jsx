import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'

import ICONS from '../../utils/IconRoutes'
import markerIcon from '../../utils/MapMarker'


export default function Map({ queryResults, refs, hoverID, center, setCenter }) {
    // when clicking on marker highlight ProfileBox
    function markerOnClick(event) {
        const id = event.target.options.id
        const ref = refs.find(item => item.ref.current != null && item._id === id).ref
        ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
        ref.current.style.backgroundColor = "rgb(209 213 219)";
        setTimeout(() => { ref.current.style.backgroundColor = ""; }, 750); // after animation
    }

    // different icon when hovering over ProfileBox
    const hoverIcon = new Icon({
        iconUrl: ICONS.HOVERMARKER,
        iconSize: [35, 35],
        iconAnchor: [17.5, 35], // point of icon which corresponds to marker's location
        popupAnchor: [0, -37.5] // popup position relative to iconAnchor
    });

    // when hovering on ProfileBox: center corresponding marker
    useEffect(() => {
        const queryResult = queryResults?.find(queryResult => queryResult._id === hoverID)
        if (queryResult?.offerByUser?.coordinates?.length == 2)
            setCenter(queryResult.offerByUser.coordinates.toReversed())
    }, [queryResults, hoverID])

    // helper method to set center of the map
    // necessary because Leaflet is context-dependend and arguments are immutable
    function ChangeCenter({ center }) {
        const map = useMap();
        if (center) map.flyTo(center, 15)
    }

    return (
        <MapContainer className="flex-1 m-8 rounded-2xl" center={center} zoom={15}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeCenter center={center} />
            {queryResults && queryResults.map(queryResult =>
                !queryResult.offerByUser?.coordinates ?
                    ''
                    : <Marker key={queryResult._id} id={queryResult._id} position={queryResult.offerByUser.coordinates.toReversed()} eventHandlers={{ click: event => markerOnClick(event) }}
                        icon={(hoverID === queryResult._id) ? hoverIcon : markerIcon}>
                        <Popup autoPan={false}>{queryResult.offerByUser?.firstName + " " + queryResult.offerByUser?.lastName}</Popup>
                    </Marker>
            )}
        </MapContainer>
    );
};
