let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// Ensure API_URL has a protocol (defaults to https for production domains)
if (API_URL && !API_URL.startsWith('http')) {
    API_URL = `https://${API_URL}`;
}

// Remove trailing slash to prevent double slashes in paths
if (API_URL.endsWith('/')) {
    API_URL = API_URL.slice(0, -1);
}


export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Handle unauthorized (optional: logout user logic here or in context)
    }

    return response;
}
