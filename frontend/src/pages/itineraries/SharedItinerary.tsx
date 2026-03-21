import styles from "@styles/pages/SharedItinerary.module.css";

import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

import type { ExtendedItinerary as Itinerary } from "@/types/itinerary";

import { getSharedItineraryByToken } from "@/services/itineraryService";

import Loader from "@/components/shared/Loader";
import ExtendedItinerary from "@/components/dashboard/itineraries/ExtendedItinerary";
import Layout from "@/layouts/Layout";

export default function SharedItineraryPage() {
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { token } = useParams<{ token: string }>();
    if (!token) return <Navigate to="/404" replace />;

    useEffect(() => {
        const fetchSharedItinerary = async () => {
            try {
                setIsLoading(true);
                const data = await getSharedItineraryByToken(token);
                setItinerary(data);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSharedItinerary();
    }, [token]);

    return (
        <Layout>
            <section className={styles.sharedPage}>
                {isLoading && <Loader size={32} variant="dots" />}
                {!isLoading && itinerary && (
                    <ExtendedItinerary itinerary={itinerary} isExternal />
                )}
            </section>
        </Layout>
    );
}
