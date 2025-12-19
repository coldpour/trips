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
    <div className="score-comparison">
      <h3 className="score-comparison-title">Score Comparison</h3>

      <div className="score-line-wrapper">
        <div className="score-line-labels">
          <div className="score-line-label">
            <div className="score-line-label-name">{lowestTrip.name || "Untitled"}</div>
            <div className="score-line-label-value">Score: {lowestTrip.score}</div>
          </div>
          <div className="score-line-label">
            <div className="score-line-label-name">{highestTrip.name || "Untitled"}</div>
            <div className="score-line-label-value">Score: {highestTrip.score}</div>
          </div>
        </div>

        <div className="score-line">
          <div
            className="score-marker"
            style={{ left: `${currentPosition}%` }}
          />
        </div>

        <div className="score-current">
          <span className="score-current-label">Your Trip: </span>
          {currentScore}
        </div>
      </div>
    </div>
  );
}
