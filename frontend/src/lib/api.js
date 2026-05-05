const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const API_URL = rawApiUrl.replace(/\/$/, '')

export function getApiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}${normalizedPath}`
}

export async function apiFetch(path, options) {
  try {
    return await fetch(getApiUrl(path), options)
  } catch (error) {
    throw new Error(
      `Cannot connect to the backend at ${API_URL}. Start backend server and verify Backend/.env (MONGODB_URI, JWT_SECRET, SESSION_SECRET).`
    )
  }
}
