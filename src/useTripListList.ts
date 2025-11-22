import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./SupabaseContext";
import { TripList } from "./types/TripList";

export function useTripListList() {
  return useQuery<TripList[]>({
    queryKey: ["tripList", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_lists")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    retry: false,
  });
}

export function createTripList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("trip_lists").insert({ name });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tripList"] });
    },
  });
}

export function updateTripList(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const { error } = await supabase
        .from("trip_lists")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tripList"] });
    },
  });
}

export function deleteTripList(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trip_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tripList"] });
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}
