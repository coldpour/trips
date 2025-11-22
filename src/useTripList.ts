import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./SupabaseContext";
import { Trip } from "./types/Trip";

export function useTripList() {
  return useQuery<Trip[]>({
    queryKey: ["trip", "list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*");
      if (error) throw error;
      return data;
    },
    retry: false,
  });
}

export function useTrip(id: string) {
  return useQuery<Trip>({
    queryKey: ["trip", { id }],
    queryFn: async (): Promise<Trip> => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id);
      if (error) throw error;
      return data[0];
    },
  });
}

export function updateTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Trip>) => {
      const { error } = await supabase.from("trips").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}

export function createTrip(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async (data: Partial<Trip>) => {
      const { error } = await supabase.from("trips").insert(data);
      if (error) throw error;
    },
    onSuccess
  })
}

export function deleteTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  })
}

export function duplicateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const payload = prepareTripDuplicate(trip);
      const { error } = await supabase
        .from("trips")
        .insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}

function prepareTripDuplicate(trip: Trip) {
  const { id: _id, created_at: _created_at, name, ...rest } = trip;
  const copyName = name ? `${name} (copy)` : "New Trip (copy)";
  return {
    ...rest,
    name: copyName,
  } satisfies Partial<Trip>;
}

export function moveTripToList(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripListId: string | null) => {
      const { error } = await supabase
        .from("trips")
        .update({ trip_list_id: tripListId })
        .eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}
