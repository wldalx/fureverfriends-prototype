import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// automatically scroll to top on page change
export default function ScrollTop(props) {
    const loc = useLocation();
    
    useEffect(() => {
        window.scrollTo(0,0);
    }, [loc])

    return <>{props.children}</>;
}