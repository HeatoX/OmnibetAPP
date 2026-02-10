'use client';

import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UIProvider } from "@/context/UIContext";
import { AlertProvider } from "@/components/AlertContext";
import { SelectionProvider } from "@/context/SelectionContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children, paypalOptions }) {
    // V42.10: Using most basic options to avoid 400 errors from PayPal
    const refinedOptions = {
        "client-id": paypalOptions["client-id"],
        "data-sdk-integration-source": "react-paypal-js",
        // intent and currency will use default (CAPTURE / USD) if omitted or can be re-added if confirmed working
    };

    return (
        <AuthProvider>
            <ProfileProvider>
                <SubscriptionProvider>
                    <PayPalScriptProvider options={refinedOptions}>
                        <UIProvider>
                            <AlertProvider>
                                <SelectionProvider>
                                    {children}
                                </SelectionProvider>
                            </AlertProvider>
                        </UIProvider>
                    </PayPalScriptProvider>
                </SubscriptionProvider>
            </ProfileProvider>
        </AuthProvider>
    );
}
