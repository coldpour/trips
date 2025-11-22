export interface TripList {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export type PendingTripList = Omit<TripList, "id" | "created_at" | "user_id">;
