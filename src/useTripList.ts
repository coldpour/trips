import { useQuery } from "@tanstack/react-query";
import { supabase } from "./SupabaseContext";
import { Trip } from "./types/Trip";

export function useTripList() {
  return useQuery<Trip[]>({
    queryKey: ["trip", "list"],
    queryFn: async () => {
      const { data } = await supabase.from("trips").select("*");
      return data;
    },
  });
}
