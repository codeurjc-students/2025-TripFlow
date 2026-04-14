import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ExtendedItinerary } from "@/types/itinerary";

import { formatBudget, formatDate, formatPeople, getDate } from "@/utils/formatUtils";

interface ItineraryPdfDocumentProps {
    itinerary: ExtendedItinerary;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 26,
        paddingHorizontal: 28,
        paddingBottom: 34,
        fontSize: 11,
        fontFamily: "Helvetica",
        color: "#1f2937",
    },
    topBand: {
        backgroundColor: "#0b3c5d",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    exportLabel: {
        color: "#bfdbfe",
        fontSize: 9,
        letterSpacing: 0.6,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    title: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#f8fafc",
        lineHeight: 1.2,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    summaryText: {
        fontSize: 11,
        color: "#334155",
    },
    sectionTitle: {
        fontSize: 12,
        color: "#0f172a",
        fontWeight: "bold",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    metaPanel: {
        border: "1 solid #dbe4ee",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#f8fafc",
        marginBottom: 14,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    metaItem: {
        width: "50%",
        paddingVertical: 6,
        paddingRight: 8,
    },
    metaLabel: {
        fontSize: 9,
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 11,
        color: "#0f172a",
        fontWeight: "bold",
    },
    daysContainer: {
        marginTop: 2,
    },
    dayBlock: {
        borderLeft: "3 solid #0b3c5d",
        paddingLeft: 10,
        marginBottom: 12,
    },
    dayTitle: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#0f172a",
    },
    activityCount: {
        fontSize: 9,
        color: "#64748b",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    activityCard: {
        border: "1 solid #e2e8f0",
        borderRadius: 6,
        padding: 9,
        marginBottom: 8,
        backgroundColor: "#ffffff",
    },
    activityTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    activityTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#0f172a",
        width: "72%",
    },
    activityTime: {
        fontSize: 9,
        color: "#0b3c5d",
        border: "1 solid #bfdbfe",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        textAlign: "center",
    },
    activityMeta: {
        fontSize: 10,
        color: "#4b5563",
        marginTop: 1,
    },
    detailsLabel: {
        fontSize: 9,
        color: "#64748b",
        textTransform: "uppercase",
        marginTop: 5,
        marginBottom: 2,
    },
    detailsText: {
        fontSize: 10,
        color: "#1f2937",
        lineHeight: 1.35,
    },
    noActivities: {
        fontSize: 10,
        color: "#6b7280",
        fontStyle: "italic",
        marginTop: 2,
    },
    pageNumber: {
        position: "absolute",
        bottom: 14,
        left: 28,
        right: 28,
        textAlign: "right",
        color: "#94a3b8",
        fontSize: 9,
    },
});

export default function ItineraryPdfDocument({ itinerary }: ItineraryPdfDocumentProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.topBand}>
                    <Text style={styles.exportLabel}>TripFlow</Text>
                    <Text style={styles.title}>{itinerary.title}</Text>
                </View>

                <Text style={styles.sectionTitle}>Resumen del viaje</Text>

                <View style={styles.metaPanel}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Destino</Text>
                        <Text style={styles.metaValue}>{itinerary.place}</Text>
                    </View>

                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Inicio</Text>
                        <Text style={styles.metaValue}>{formatDate(itinerary.date)}</Text>
                    </View>

                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Viajeros</Text>
                        <Text style={styles.metaValue}>{formatPeople(itinerary.people)}</Text>
                    </View>

                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Presupuesto</Text>
                        <Text style={styles.metaValue}>{formatBudget(itinerary.budget)}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Plan diario</Text>

                <View style={styles.daysContainer}>
                    {itinerary.days.map((day, dayIndex) => (
                        <View key={day.day} style={styles.dayBlock}>
                            <Text style={styles.dayTitle}>
                                Día {day.day} - {formatDate(getDate(itinerary.date, dayIndex), { excludeYear: true })}
                            </Text>

                            <Text style={styles.activityCount}>
                                {day.activities.length} actividad{day.activities.length === 1 ? "" : "es"}
                            </Text>

                            {day.activities.length === 0 && (
                                <Text style={styles.noActivities}>No hay actividades planeadas para este día.</Text>
                            )}

                            {day.activities.map((activity, activityIndex) => (
                                <View
                                    key={`${day.day}-${activityIndex}`}
                                    style={styles.activityCard}
                                    wrap={false}
                                >
                                    <View style={styles.activityTopRow}>
                                        <Text style={styles.activityTitle}>{activity.activity}</Text>
                                        <Text style={styles.activityTime}>{activity.time || "Sin hora"}</Text>
                                    </View>

                                    <Text style={styles.activityMeta}>Duracion: {activity.duration || "No especificada"}</Text>
                                    <Text style={styles.activityMeta}>
                                        Lugar: {activity.location.name} - {activity.location.address}
                                    </Text>

                                    <Text style={styles.detailsLabel}>Detalles</Text>
                                    <Text style={styles.detailsText}>{activity.details || "Sin descripcion"}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}
