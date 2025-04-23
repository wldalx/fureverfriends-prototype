import { useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import 'react-toastify/ReactToastify.css'

import ROUTES from "./utils/Routes"
import ScrollTop from "./utils/ScrollTop"
import AuthMiddleware from "./middleware/AuthMiddleware"
import ProtectedRoute from "./middleware/ProtectedRoute"

import LandingPage from "./components/landingPage/LandingPage"
import LoginPage from "./components/loginPage/LoginPage"
import RegistrationPage from "./components/registerPage/RegistrationPage"
import OfferPage from "./components/offerPage/OfferPage"
import SearchPage from "./components/searchPage/SearchPage"
import ImprintPage from "./components/legalPages/ImprintPage"
import PrivacyPage from "./components/legalPages/PrivacyPage"
import NotFoundPage from "./components/general/NotFoundPage"
import BookingPage from "./components/bookingPage/BookingPage"
import ProfilePage from "./components/profilePage/ProfilePage"
import CheckoutPage from "./components/checkoutPage/CheckoutPage"
import CompletedPage from "./components/checkoutPage/CompletedPage"

import NavigationBar from "./components/general/NavigationBar"
import Footer from "./components/general/Footer"


export default function App() {
  // used for searchPage, bookingPage, checkoutPage
  const [booking, setBooking] = useState({});

  return (
    <BrowserRouter>
      <ScrollTop>
        <AuthMiddleware>
          <ToastContainer />
          <NavigationBar />
          <Routes>
            <Route path={ROUTES.LANDING} element={<LandingPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegistrationPage />} />
            <Route path={ROUTES.OFFER + "/:id"} element={<OfferPage />} />
            <Route path={ROUTES.SEARCH} element={<SearchPage setBooking={setBooking} />} />
            <Route path={ROUTES.IMPRINT} element={<ImprintPage />} />
            <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.BOOKING + "/:id"} element={<BookingPage booking={booking} setBooking={setBooking} />} />
              <Route path={ROUTES.CHECKOUT} element={<CheckoutPage booking={booking} />} />
              <Route path={ROUTES.CHECKOUT + ROUTES.COMPLETED} element={<CompletedPage />} />
            </Route>
          </Routes>
          <Footer />
        </AuthMiddleware>
      </ScrollTop>
    </BrowserRouter>
  );
}
