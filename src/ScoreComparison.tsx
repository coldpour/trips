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
    <div className="score-comparison-container">
      <h3 className="score-comparison-title">How this trip compares</h3>
      <div className="score-comparison-visualization">
        {/* Number line */}
        <div className="score-line">
          {/* Current trip dot */}
          <div
            className="score-marker"
            style={{
              left: `${currentPosition}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
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
          <div style={{ fontSize: "var(--font-sm)", fontWeight: "var(--font-semibold)", color: "var(--text-secondary)" }}>
            {lowestTrip.score}
          </div>
          <div style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)", marginTop: "2px" }}>
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
          <div style={{ fontSize: "var(--font-sm)", fontWeight: "var(--font-semibold)", color: "var(--text-secondary)" }}>
            {highestTrip.score}
          </div>
          <div style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)", marginTop: "2px" }}>
            {highestTrip.name || "Untitled"}
          </div>
        </div>

        {/* Current trip label above dot */}
        <div
          style={{
            position: "absolute",
            left: `calc(var(--space-2xl) + ${currentPosition}%)`,
            top: "-10px",
            transform: "translateX(-50%)",
            textAlign: "center",
            minWidth: "80px"
          }}
        >
          <div style={{ fontSize: "var(--font-base)", fontWeight: "var(--font-bold)", color: "var(--primary-color)" }}>
            {currentScore}
          </div>
          <div style={{ fontSize: "var(--font-xs)", color: "var(--primary-color)", marginTop: "2px", fontWeight: "var(--font-semibold)" }}>
            {currentTrip.name || "Untitled"}
          </div>
        </div>
      </div>
    </div>
  );
}
