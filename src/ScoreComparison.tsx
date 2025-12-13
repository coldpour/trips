import { Trip, PendingTrip } from "./types/Trip";
import { calcScore } from "./util/expenseTotal";
import { useTripList } from "./useTripList";

export function ScoreComparison({ 
  currentTrip, 
  trips: providedTrips 
}: { 
  currentTrip: Trip | PendingTrip;
  trips?: Trip[];
}) {
  const { data: fetchedTrips } = useTripList();
  const trips = providedTrips || fetchedTrips;
  
  if (!trips || trips.length === 0) return null;
  
  // Include current trip in the comparison set
  const allTrips = [...trips];
  const currentScore = calcScore(currentTrip);
  
  // Add current trip to the list if it has a valid score and isn't already in the list
  const currentTripId = 'id' in currentTrip ? currentTrip.id : null;
  const isCurrentTripInList = currentTripId && trips.some(t => t.id === currentTripId);
  
  if (currentScore > 0 && !isCurrentTripInList) {
    allTrips.push({ ...currentTrip, score: currentScore } as Trip & { score: number });
  }
  
  const tripsWithScores = allTrips
    .map(trip => ({
      ...trip,
      score: calcScore(trip)
    }))
    .filter(trip => trip.score > 0)
    .sort((a, b) => a.score - b.score);
  
  if (tripsWithScores.length === 0) return null;
  
  const minScore = Math.min(...tripsWithScores.map(t => t.score));
  const maxScore = Math.max(...tripsWithScores.map(t => t.score));

  const lowestTrip = tripsWithScores[0];
  const highestTrip = tripsWithScores[tripsWithScores.length - 1];
  
  const calculatePosition = (score: number) => {
    if (minScore === maxScore) return 50;
    return ((score - minScore) / (maxScore - minScore)) * 100;
  };
  
  const currentPosition = calculatePosition(currentScore);
  
  return (
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <h4 style={{ marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
        Score Comparison
      </h4>
      <div style={{ position: "relative", padding: "30px 0" }}>
        {/* Number line */}
        <div 
          style={{
            position: "relative",
            height: "4px",
            backgroundColor: "#ddd",
            borderRadius: "2px",
            margin: "0 40px"
          }}
        >
          {/* Current trip dot */}
          <div
            style={{
              position: "absolute",
              left: `${currentPosition}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "16px",
              height: "16px",
              backgroundColor: "var(--primary-color)",
              borderRadius: "50%",
              border: "3px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              zIndex: 10
            }}
          />
        </div>
        
        {/* Lowest score label */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            textAlign: "left",
            maxWidth: "35%"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>
            {lowestTrip.score}
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
            {lowestTrip.name || "Untitled"}
          </div>
        </div>
        
        {/* Highest score label */}
        <div
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            textAlign: "right",
            maxWidth: "35%"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>
            {highestTrip.score}
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
            {highestTrip.name || "Untitled"}
          </div>
        </div>
        
        {/* Current trip label above dot */}
        <div
          style={{
            position: "absolute",
            left: `calc(40px + ${currentPosition}%)`,
            top: "-10px",
            transform: "translateX(-50%)",
            textAlign: "center",
            minWidth: "80px"
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary-color)" }}>
            {currentScore}
          </div>
          <div style={{ fontSize: "11px", color: "var(--primary-color)", marginTop: "2px", fontWeight: "600" }}>
            {currentTrip.name || "Untitled"}
          </div>
        </div>
      </div>
    </div>
  );
}
