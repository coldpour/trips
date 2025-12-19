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
    <div className="form-section" style={{ marginTop: 'var(--space-xl)' }}>
      <h3 className="form-section-header">Score Comparison</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
        See how this trip compares to your other trips
      </p>
      <div style={{ position: "relative", padding: "40px 0" }}>
        {/* Number line */}
        <div 
          style={{
            position: "relative",
            height: "6px",
            background: "linear-gradient(90deg, var(--danger) 0%, var(--warning) 50%, var(--success) 100%)",
            borderRadius: "3px",
            margin: "0 50px",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          {/* Current trip dot */}
          <div
            style={{
              position: "absolute",
              left: `${currentPosition}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "20px",
              height: "20px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
              borderRadius: "50%",
              border: "3px solid var(--bg-primary)",
              boxShadow: "0 4px 8px rgba(99, 102, 241, 0.4)",
              zIndex: 10,
              animation: "pulse 2s ease-in-out infinite"
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
            maxWidth: "40px"
          }}
        >
          <div style={{ 
            fontSize: "14px", 
            fontWeight: "700", 
            color: "var(--text-primary)",
            backgroundColor: "var(--danger-bg)",
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "4px"
          }}>
            {lowestTrip.score}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "500" }}>
            Lowest
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
            maxWidth: "40px"
          }}
        >
          <div style={{ 
            fontSize: "14px", 
            fontWeight: "700", 
            color: "var(--text-primary)",
            backgroundColor: "var(--success-bg)",
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "4px"
          }}>
            {highestTrip.score}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "500" }}>
            Highest
          </div>
        </div>
        
        {/* Current trip label above dot */}
        <div
          style={{
            position: "absolute",
            left: `calc(50px + ${currentPosition}%)`,
            top: "-15px",
            transform: "translateX(-50%)",
            textAlign: "center",
            minWidth: "100px"
          }}
        >
          <div style={{ 
            display: "inline-block",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            fontSize: "16px",
            fontWeight: "700"
          }}>
            {currentScore}
          </div>
          <div style={{ 
            fontSize: "11px", 
            color: "var(--text-secondary)", 
            marginTop: "4px", 
            fontWeight: "600",
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            This Trip
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
