import { Icon } from 'leaflet'
import ICONS from './IconRoutes'

export default new Icon({
    iconUrl: ICONS.MARKER,
    iconSize: [35, 35],
    iconAnchor: [17.5, 35], // point of icon which corresponds to marker's location
    popupAnchor: [0, -37.5] // popup pos relative to iconAnchor
});