import { mockAuth } from "./auth";
import { mockCollaboration } from "./collaboration";
import { mockItineraries } from "./itineraries";
import { mockMaps } from "./maps";
import { mockStats } from "./stats";
import { mockUser } from "./user";

type MockHandler = (
  method: string,
  body?: unknown,
  url?: string
) => Promise<unknown>;

const mockRegistry: Record<string, MockHandler> = {
  ...mockAuth,
  ...mockCollaboration,
  ...mockItineraries,
  ...mockMaps,
  ...mockStats,
  ...mockUser
};

/**
 * Search and execute the appropriate mock based on the URL and method.
 *
 * @param url Requested URL (e.g., "/api/v1/itineraries/2")
 * @param method HTTP method (GET, POST, etc.)
 * @param body Optional request body
 * 
 * @returns Promise with the simulated result or an error if no mock exists
 */
export function getMock(url: string, method: string, body?: unknown): Promise<unknown> {
  const cleanUrl = url.split("?")[0];
  method = method.toUpperCase();

  // Exact match search
  if (mockRegistry[cleanUrl]) {
    return mockRegistry[cleanUrl](method, body, url);
  }

  // Dynamic parameter match search (:id)
  const dynamicRoute = Object.keys(mockRegistry).find((key) => {
    const keyParts = key.split("/");
    const urlParts = cleanUrl.split("/");

    if (keyParts.length !== urlParts.length) return false;

    return keyParts.every((part, index) => {
      return part.startsWith(":") || part === urlParts[index];
    });
  });

  if (dynamicRoute) {
    return mockRegistry[dynamicRoute](method, body, url);
  }

  // No mock found
  return Promise.reject(new Error(`No mock found for ${method} ${url}`));
}
