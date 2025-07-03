// lib/api.ts
export const ordersApi = {
    // ... existing methods ...

    initiateMpesaPayment: async (data: { phoneNumber: string; amount: number }) => {
        const response = await fetch("/api/mpesa/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        return await response.json()
    },

    
}