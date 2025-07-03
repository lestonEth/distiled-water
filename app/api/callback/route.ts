// app/api/callback/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        // Verify the request is coming from Safaricom (optional but recommended)
        const headersList = headers();
        const origin = headersList.get("origin");

        // In production, you should validate the origin/IP against Safaricom's IPs
        // if (origin !== "https://sandbox.safaricom.co.ke" && process.env.NODE_ENV === "production") {
        //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        // }

        const body = await request.json();
        console.log("M-Pesa Callback Received:", body);

        // Validate the callback data structure
        if (!body.Body || !body.Body.stkCallback) {
            return NextResponse.json(
                { success: false, error: "Invalid callback format" },
                { status: 400 }
            );
        }

        const callbackData = body.Body.stkCallback;
        const checkoutRequestId = callbackData.CheckoutRequestID;
        const resultCode = callbackData.ResultCode;
        const resultDesc = callbackData.ResultDesc;
        const callbackMetadata = callbackData.CallbackMetadata;

        if (resultCode === "0") {
            // Payment was successful
            console.log("Payment successful for request:", checkoutRequestId);

            // Extract payment details from metadata
            let amount = 0;
            let mpesaReceiptNumber = "";
            let phoneNumber = "";

            if (callbackMetadata && callbackMetadata.Item) {
                callbackMetadata.Item.forEach((item: any) => {
                    if (item.Name === "Amount") amount = item.Value;
                    if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
                    if (item.Name === "PhoneNumber") phoneNumber = item.Value;
                });
            }

            // Here you would typically:
            // 1. Update your database to mark the payment as complete
            // 2. Trigger any post-payment actions (send email, unlock content, etc.)
            // 3. Maybe send a confirmation to the client via websocket or polling

            return NextResponse.json(
                { success: true, message: "Callback processed successfully" },
                { status: 200 }
            );
        } else {
            // Payment failed
            console.log("Payment failed for request:", checkoutRequestId, resultDesc);

            // Here you would typically:
            // 1. Update your database to mark the payment as failed
            // 2. Maybe notify the user or retry

            return NextResponse.json(
                { success: false, error: resultDesc },
                { status: 200 } // Still return 200 to acknowledge receipt
            );
        }
    } catch (error: any) {
        console.error("Error processing callback:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Callback processing failed" },
            { status: 500 }
        );
    }
}