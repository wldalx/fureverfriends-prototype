import Hero from "./Hero"
import HoldersSection from './HoldersSection'
import SittersSection from './SittersSection'
import Services from './Services'
import About from './About'
import Achievements from './Achievements'

export default function LandingPage() {

    return (
        <>
            <Hero />

            <Services />

            <HoldersSection />

            <SittersSection />

            <Achievements />

            <About />
        </>
    );
};
