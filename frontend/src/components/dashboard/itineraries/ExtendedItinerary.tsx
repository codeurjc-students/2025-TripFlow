import styles from "@styles/components/dashboard/itineraries/ExtendedItinerary.module.css";

import { useState } from "react";

import type { ExtendedItinerary } from "@/types/itinerary";

import {
    formatBudget,
    formatDate,
    formatImageAuthorUrl,
    formatPeople,
    getDate
} from "@/utils/formatUtils";

import { 
    CalendarIcon,
    MapPinIcon,
    PiggyBankIcon,
    UsersIcon,
    ChevronLeft,
    ChevronRight,
    ListIcon,
    Maximize2Icon,
    Users2Icon,
} from "lucide-react";

import Badge from "@components/shared/Badge";
import Button from "@components/shared/Button";
import AttributionImage from "@components/shared/AttributionImage";
import ActivityCard from "@components/dashboard/itineraries/ActivityCard";

interface ExtendedItineraryProps {
    itinerary: ExtendedItinerary;
    onOpenCollaboration?: () => void;
}

const ICON_SIZE = 24;

export default function ExtendedItinerary({ itinerary, onOpenCollaboration }: ExtendedItineraryProps) {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const handlePrev = () => {
        setCurrentDayIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentDayIndex((prev) => Math.min(itinerary.days.length - 1, prev + 1));
    };

    const currentDay = itinerary.days[currentDayIndex];
    const currentDate = getDate(itinerary.date, currentDayIndex);

    return (
        <section className={styles.extendedItinerary}>
            
            {!isFocusMode ? (
                <div key="overview" className={styles.fadeWrapper}>
                    <AttributionImage
                        src={itinerary.coverImage.imageUrl}
                        alt={itinerary.coverImage.altDescription}
                        attribution={`@${itinerary.coverImage.authorUsername}`}
                        attributionLink={formatImageAuthorUrl(itinerary.coverImage.authorUsername)}
                        loading="eager"
                        className={styles.banner}
                    >
                        <Badge
                            style="semi_thin"
                            status={itinerary.status}
                        />
                    </AttributionImage>

                    {/* Tags & Mode Trigger */}
                    <div className={styles.tagsRow}>
                        <div className={styles.tags}>
                            {itinerary.tags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    style="semi_thin"
                                    title={tag}
                                />
                            ))}
                        </div>

                        <div className={styles.modeActions}>
                            <Button 
                                style={["tool_bordered"]}
                                onClick={() => setIsFocusMode(true)}
                                ariaLabel="Ver itinerario día a día"
                            >
                                <Maximize2Icon size={20} />
                            </Button>

                            {onOpenCollaboration && (
                                <Button
                                    style={["tool_bordered"]}
                                    onClick={onOpenCollaboration}
                                    ariaLabel="Gestionar colaboradores"
                                >
                                    <Users2Icon size={20} />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Trip Info */}
                    <div className={styles.tripInfo}>
                        <div className={styles.item}>
                            <MapPinIcon size={ICON_SIZE} />
                            <span>{itinerary.place}</span>
                        </div>
                        <div className={styles.item}>
                            <CalendarIcon size={ICON_SIZE} />
                            <span>{formatDate(itinerary.date, { shortMonth: true })}</span>
                        </div>
                        <div className={styles.item}>
                            <UsersIcon size={ICON_SIZE} />
                            <span>{formatPeople(itinerary.people)}</span>
                        </div>
                        <div className={styles.item}>
                            <PiggyBankIcon size={ICON_SIZE} />
                            <span>{formatBudget(itinerary.budget)}</span>
                        </div>
                    </div>

                    {itinerary.days.map((day, index) => (
                        <div key={day.day} className={styles.dayCard}>
                            <h3 className={styles.dayTitle}>
                                Día {`${day.day} - ${formatDate(
                                    getDate(itinerary.date, index),
                                    { excludeYear: true }
                                )}`}
                            </h3>

                            <div className={styles.activities}>
                                {[...day.activities]
                                    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
                                    .map((activity, actIndex) => (
                                        <ActivityCard activity={activity} key={actIndex} />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div key="focus" className={styles.fadeWrapper}>
                    <div className={styles.dayNavigator}>
                        <div className={styles.navArrows}>
                            <Button 
                                onClick={handlePrev} 
                                disabled={currentDayIndex === 0} 
                                style={["tool_bordered", "rounded"]}
                                ariaLabel="Día anterior"
                            >
                                <ChevronLeft size={24} />
                            </Button>

                            <Button 
                                onClick={handleNext} 
                                disabled={currentDayIndex === itinerary.days.length - 1} 
                                style={["tool_bordered", "rounded"]}
                                ariaLabel="Día siguiente"
                            >
                                <ChevronRight size={24} />
                            </Button>
                        </div>
                        
                        <div className={styles.navDate}>
                            <span>Día {currentDay.day}</span>
                            <span>{formatDate(currentDate, { excludeYear: true })}</span>
                        </div>

                        <div className={styles.closeFocusButton}>
                            <Button 
                                style={["tool_bordered"]}
                                onClick={() => setIsFocusMode(false)}
                                ariaLabel="Volver al resumen"
                            >
                                <ListIcon size={20} />
                            </Button>
                        </div>
                    </div>

                    <div key={currentDay.day} className={`${styles.dayCard} ${styles.animatedDay}`}>
                        <div className={styles.activities}>
                            {[...currentDay.activities]
                                .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
                                .map((activity, actIndex) => (
                                    <ActivityCard activity={activity} key={actIndex} />
                                ))}
                        </div>
                        
                        {currentDay.activities.length === 0 && (
                            <p className={styles.emptyDayMessage}>
                                No hay actividades planeadas para este día.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}