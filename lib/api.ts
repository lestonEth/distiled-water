const API_BASE = "/api"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred")
  }

  return data
}

// Auth API
export const authApi = {
  login: (email: string, password: string, userType: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, userType }),
    }),
}

// Users API
export const usersApi = {
  getAll: () => apiRequest("/users"),
  create: (userData: any) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
}

// Orders API
export const ordersApi = {
  getAll: () => apiRequest("/orders"),
  getByUser: (userId: string) => apiRequest(`/orders?userId=${userId}`),
  getByTransporter: (transporterId: string) => apiRequest(`/orders?transporterId=${transporterId}`),
  create: (orderData: any) =>
    apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  update: (id: string, updateData: any) =>
    apiRequest("/orders", {
      method: "PUT",
      body: JSON.stringify({ id, ...updateData }),
    }),

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

// Containers API
export const containersApi = {
  getAll: () => apiRequest("/containers"),
  update: (id: string, updateData: any) =>
    apiRequest("/containers", {
      method: "PUT",
      body: JSON.stringify({ id, ...updateData }),
    }),
}

// Feedback API
export const feedbackApi = {
  getAll: () => apiRequest("/feedback"),
  create: (feedbackData: any) =>
    apiRequest("/feedback", {
      method: "POST",
      body: JSON.stringify(feedbackData),
    }),
}
