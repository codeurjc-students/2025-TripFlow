import { API_BASE_URL } from "@/config/environment";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { getMock } from "@/mocks";
import { DEMO_KEY } from "@/providers/demoProvider";
import { offlineCacheService } from "@/services/offlineCacheService";
import { removeFromLocalStorage, retrieveFromLocalStorage } from "@/utils/localStorageUtils";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const CACHE_TTL_DEFAULT_MS = 5 * 60 * 1000;
const CACHE_TTL_LONG_MS = 30 * 60 * 1000;

const GET_CACHE_TTL: Array<{ match: (path: string) => boolean; ttlMs: number }> = [
  { match: (path) => path.startsWith("/api/v1/itineraries"), ttlMs: CACHE_TTL_LONG_MS },
  { match: (path) => path.startsWith("/api/v1/share/"), ttlMs: CACHE_TTL_LONG_MS },
  { match: (path) => path.startsWith("/api/v1/users"), ttlMs: CACHE_TTL_DEFAULT_MS },
];

export class OfflineReadOnlyError extends Error {
  constructor() {
    super("Offline mode is read-only.");
    this.name = "OfflineReadOnlyError";
  }
}

export class OfflineNoCacheError extends Error {
  constructor(path: string) {
    super(`No cached data available for ${path}.`);
    this.name = "OfflineNoCacheError";
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const isAuthEndpoint = (path: string): boolean => {
    return path.startsWith("/api/auth/") || path === "/api/auth";
}

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

function isOffline(): boolean {
  return !navigator.onLine;
}

function getCacheKey(path: string): string {
  return `${path}`;
}

function getGetTtl(path: string): number {
  const policy = GET_CACHE_TTL.find((entry) => entry.match(path));
  return policy?.ttlMs ?? CACHE_TTL_DEFAULT_MS;
}

function getCachedGetResponse<T>(path: string): T | null {
  const cached = offlineCacheService.get<T>(getCacheKey(path));
  if (!cached) return null;
  return cached.data;
}

function setCachedGetResponse<T>(path: string, data: T): void {
  const ttlMs = getGetTtl(path);
  offlineCacheService.set(getCacheKey(path), data, ttlMs);
}

async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function http<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<T> {
  const isDemo = retrieveFromLocalStorage<string>(DEMO_KEY) === "true";
  if (isDemo) return getMock(path, method, body) as Promise<T>;

  const isGet = method === "GET";

  if (isOffline() && !isGet) {
    throw new OfflineReadOnlyError();
  }

  if (isOffline() && isGet) {
    const cached = getCachedGetResponse<T>(path);
    if (cached !== null) return cached;
    throw new OfflineNoCacheError(path);
  }

  const isFormData = body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body) options.body = isFormData
    ? (body as FormData)
    : JSON.stringify(body);

  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (isGet) {
      const cached = getCachedGetResponse<T>(path);
      if (cached !== null) return cached;
    }
    throw error;
  }

  // Handle 401 with refresh logic
  if (response.status === 401 && !isAuthEndpoint(path)) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => http<T>(path, method, body));
    }

    isRefreshing = true;

    try {
      const refreshed = await refreshAuthToken();

      if (refreshed) {
        processQueue(null);
        isRefreshing = false;
        return http<T>(path, method, body);
      } else {
        processQueue(new Error("Session expired"));
        isRefreshing = false;
        removeFromLocalStorage(STORAGE_KEYS.AUTH);
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    } catch (error) {
      processQueue(error as Error);
      isRefreshing = false;
      removeFromLocalStorage(STORAGE_KEYS.AUTH);
      window.location.href = "/login";
      throw error;
    }
  }

  // Handle 403 Forbidden
  if (response.status === 403 && !isAuthEndpoint(path)) {
    window.location.href = "/";
  }

  // Handle 404 Not Found
  if (response.status === 404 && !isAuthEndpoint(path)) {
    window.location.href = "/404";
  }

  try {
    const data = await response.json() as T;

    if (response.ok && isGet) {
      setCachedGetResponse(path, data);
    }

    return data as T;
  } catch (error) {
    return {} as T;
  }
}