/**
 * PayPal Server-Side Service
 * Handles order creation and capture using PayPal REST API
 */

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Generate an OAuth2 access token
 */
async function generateAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("Missing PayPal credentials");
    }

    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
}

/**
 * Create an order
 */
export async function createPayPalOrder(tierId, amount) {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_API}/v2/checkout/orders`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: amount.toString(),
                    },
                    description: `OmniBet AI - Plan ${tierId.toUpperCase()}`,
                },
            ],
        }),
    });

    const data = await response.json();
    return data;
}

/**
 * Capture payment for an order
 */
export async function capturePayPalOrder(orderID) {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    return data;
}
