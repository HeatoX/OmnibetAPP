'use client';

import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UIProvider } from "@/context/UIContext";
import { AlertProvider } from "@/components/AlertContext";
import { SelectionProvider } from "@/context/SelectionContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children, paypalOptions }) {
    return (
        <AuthProvider>
            <ProfileProvider>
                <SubscriptionProvider>
                    <PayPalScriptProvider options={paypalOptions}>
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
