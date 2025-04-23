import React, { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

import ROUTES from "../../utils/Routes"


export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: ROUTES.BASE + ROUTES.CHECKOUT + ROUTES.COMPLETED,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs"
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            <button disabled={isLoading || !stripe || !elements} id="submit">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
                </span>
            </button>

            {/* if message != "": show payment message */}
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}