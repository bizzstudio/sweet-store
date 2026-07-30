// src/component/checkout/CheckoutPromptBar.jsx
import React from "react";

// בר פעולה בולט ורוחבי בעמוד התשלום (בצהוב המערכת).
// מציג אייקון + שאלה מודגשת + קריאה-לפעולה, ומתנהג ככפתור לכל דבר.
const CheckoutPromptBar = ({ icon, question, cta, onClick, className = "" }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`checkout-prompt-bar ${className}`}
        >
            {icon && <span className="checkout-prompt-bar__icon">{icon}</span>}
            <span className="checkout-prompt-bar__text">
                <span className="checkout-prompt-bar__question">{question}</span>
                <span className="checkout-prompt-bar__cta">{cta}</span>
            </span>
        </button>
    );
};

export default CheckoutPromptBar;
