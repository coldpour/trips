export interface TripList {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  share_token: string | null;
}

export type PendingTripList = Omit<TripList, "id" | "created_at" | "user_id">;
