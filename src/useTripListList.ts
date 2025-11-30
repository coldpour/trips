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

export function generateShareToken(tripListId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const shareToken = crypto.randomUUID();
      const { error } = await supabase
        .from("trip_lists")
        .update({ share_token: shareToken })
        .eq("id", tripListId);
      if (error) throw error;
      return shareToken;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tripList"] });
    },
  });
}

export function revokeShareToken(tripListId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("trip_lists")
        .update({ share_token: null })
        .eq("id", tripListId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tripList"] });
    },
  });
}

export function useSharedTripList(shareToken: string | undefined) {
  return useQuery({
    queryKey: ["shared-tripList", shareToken],
    queryFn: async () => {
      if (!shareToken) throw new Error("Share token required");
      
      // Call secure function that requires the token parameter
      const { data: tripListData, error: listError } = await supabase
        .rpc("get_shared_trip_list", { token: shareToken });
      if (listError) throw listError;
      if (!tripListData || tripListData.length === 0) {
        throw new Error("Trip list not found");
      }
      const tripList = tripListData[0];
      
      // Get trips using secure function
      const { data: trips, error: tripsError } = await supabase
        .rpc("get_shared_trips", { token: shareToken });
      if (tripsError) throw tripsError;
      
      return { tripList, trips: trips || [] };
    },
    enabled: !!shareToken,
    retry: false,
  });
}
