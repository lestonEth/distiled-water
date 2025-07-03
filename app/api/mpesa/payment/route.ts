// app/api/mpesa/payment/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";

// M-Pesa API credentials - store these in environment variables
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "dY6KRmds1TI3zInPWX8OvOtouLHJgbgOXeqyctGEvpECBPKQ";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "LrDrAog2AsCPVG9ZFZfjKWIIth4x8SLG6yIRJN4s3a6XjJrPkFQPSC5sH1xeaqXP";
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "174379";
const PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://mutually-factual-weevil.ngrok-free.app/callback";
const TRANSACTION_TYPE = "CustomerPayBillOnline"; // or "CustomerBuyGoodsOnline"

// Helper function to generate M-Pesa password
function generatePassword() {
    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3);
    const password = Buffer.from(
        `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`
    ).toString("base64");
    return { password, timestamp };
}

// Get OAuth token from M-Pesa
async function getAccessToken() {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
        "base64"
    );

    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
    }
}

// Initiate STK Push
async function initiateSTKPush(phoneNumber: string, amount: number) {
    const accessToken = await getAccessToken();
    console.log("accessToken", accessToken);
    const { password, timestamp } = generatePassword();
    // Format phone number (add country code, remove leading 0)
    const formattedPhone = phoneNumber.startsWith("0")
        ? `254${phoneNumber.substring(1)}`
        : phoneNumber;

    const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: TRANSACTION_TYPE,
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: BUSINESS_SHORT_CODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: "PaymentRef", // Customize as needed
        TransactionDesc: "Payment for services", // Customize as needed
    };

    console.log("payload", payload);
    try {
        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error initiating STK Push:", error.response.data);
        throw error;
    }
}

export async function POST(request: Request) {
    const { phoneNumber, amount } = await request.json();

    // Validate input
    if (!phoneNumber || !amount) {
        return NextResponse.json(
            { success: false, error: "Phone number and amount are required" },
            { status: 400 }
        );
    }

    try {
        const response = await initiateSTKPush(phoneNumber, amount);

        return NextResponse.json({
            success: true,
            reference: response.CheckoutRequestID,
            message: "Payment request sent to your phone",
            response: response.ResponseDescription,
        });
    } catch (error: any) {
        console.error("Payment error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Payment initiation failed",
            },
            { status: 400 }
        );
    }
}