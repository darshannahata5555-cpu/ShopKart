import Razorpay from "razorpay";

// Create the client only when checkout is used. This lets the rest of the app
// run before a student has added Razorpay Test Mode keys to .env.
export function getRazorpayClient() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay Test Mode keys are not configured");
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}
