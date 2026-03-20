export type ItineraryStatus = "DRAFT" | "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface ItineraryCoverImage {
    altDescription: string;
    imageUrl: string;
    authorUsername: string;
}

export interface Activity {
    activity: string;
    details: string;
    location: {
        name: string;
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    time: string;
    duration: string;
}

export interface ItineraryDay {
    day: number;
    activities: Activity[];
}

export interface Permissions {
    view: boolean;
    edit: boolean;
    delete: boolean;
}

export interface Itinerary {
    id: number;
    title: string;
    place: string;
    people: number;
    budget: number;
    date: string;
    status: ItineraryStatus;
    countDays: number;
    tags: string[];
    coverImage: ItineraryCoverImage;
    permissions: Permissions;
}

export interface ExtendedItinerary extends Itinerary {
    days: ItineraryDay[];
}

export type ItineraryChangeType = "UPDATED";

export interface ItineraryChangeEvent {
    itineraryId: number;
    changeType: ItineraryChangeType;
    actorUsername: string;
    timestamp: string;
}
