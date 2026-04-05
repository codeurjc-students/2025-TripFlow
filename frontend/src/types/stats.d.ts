
export type UserStatKey = "activities" | "places_visited" | "total_days";

export interface UserStat {
    key: UserStatKey;
    value: number;
};

export interface UserStatsResponse {
    stats: UserStat[];
}

export interface UsersByPlanItem {
    plan: string;
    count: number;
}

export interface UsersByPlanStatsResponse {
    items: UsersByPlanItem[];
}
