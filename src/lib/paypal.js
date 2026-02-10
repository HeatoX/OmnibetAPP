/**
 * PayPal Server-Side Service
 * Handles order creation and capture using PayPal REST API
 */

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// V42.11: Specific environment detection based on PayPal standard prefixes
// Sandbox starts with 'AS', Live starts with 'AW' or 'AV'
const IS_SANDBOX = process.env.PAYPAL_ENV === 'sandbox' ||
    (PAYPAL_CLIENT_ID && (PAYPAL_CLIENT_ID.startsWith('AS') || PAYPAL_CLIENT_ID.includes('sb-')));

const PAYPAL_API = IS_SANDBOX
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

console.log(`[PayPal Backend] Configured for ${IS_SANDBOX ? 'SANDBOX' : 'LIVE'} mode`);

/**
 * Generate an OAuth2 access token
 */
async function generateAccessToken() {
    console.log(`[PayPal lib] Fetching token for ${PAYPAL_API} with ID: ${PAYPAL_CLIENT_ID ? PAYPAL_CLIENT_ID.substring(0, 8) + '...' : 'MISSING'}`);

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("Missing PayPal credentials (PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET)");
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
