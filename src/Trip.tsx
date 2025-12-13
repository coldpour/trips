import { Link, useParams } from "react-router";
import { updateTrip, useTrip, useTripList } from "./useTripList";
import { Trip } from "./types/Trip";
import { FormEvent } from "react";
import {
  calcAirbnbLink,
  calcFlightLink,
  calcHotelsLink,
  calcLodgingTotal,
  calcNights,
  calcScore,
  calcTravel,
  calcTravelers,
  expenseTotal,
} from "./util/expenseTotal";
import { formatCurrency, capitalizeFirstLetter } from "./util/format";

export function TripRoute() {
  const { tid } = useParams();
  const { data: trip } = useTrip(tid);

  return (
    <div>
      <Link to="/">Back</Link>
      {trip && <TripDetails {...trip} />}
    </div>
  );
}

function TripDetails(props: Trip) {
  const { mutate, isPending } = updateTrip(props.id);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    mutate({
      // oxlint-disable-next-line @typescript-eslint/no-base-to-string
      name: String(formData.get("name")),
      entertainment: Number(formData.get("entertainment")),
      flightCostPerSeat: Number(formData.get("flightCostPerSeat")),
      taxiOrRentalCar: Number(formData.get("taxiOrRentalCar")),
      skiPassPerDay: Number(formData.get("skiPassPerDay")),
      childcare: Number(formData.get("childcare")),
      lodgingTotal: Number(formData.get("lodgingTotal")),
      lodgingPerNight: Number(formData.get("lodgingPerNight")),
      lodgingPerPersonPerNight: Number(
        formData.get("lodgingPerPersonPerNight"),
      ),
      children: Number(formData.get("children")),
      adults: Number(formData.get("adults")),
      nights: Number(formData.get("nights")),
      fun: Number(formData.get("fun")),
      // oxlint-disable-next-line @typescript-eslint/no-base-to-string
      arrive: String(formData.get("arrive")) || null,
      // oxlint-disable-next-line @typescript-eslint/no-base-to-string
      depart: String(formData.get("depart")) || null,
      // oxlint-disable-next-line @typescript-eslint/no-base-to-string
      lodging_url: String(formData.get("lodging_url")) || null,
    });
  };

  const {
    name,
    fun,
    adults,
    children,
    entertainment,
    arrive,
    depart,
    flightCostPerSeat,
    taxiOrRentalCar,
    skiPassPerDay,
    childcare,
    lodgingTotal,
    lodgingPerNight,
    lodgingPerPersonPerNight,
    lodging_url,
  } = props;

  return (
    <form className='trip-details' onSubmit={handleSubmit}>
      <Input name="name" defaultValue={name} type="text" />

      <div className="travel-dates">
        <Input name="arrive" defaultValue={arrive} type="date" />
        <Input name="depart" defaultValue={depart} type="date" />
      </div>
      <Input name="nights" defaultValue={calcNights(props)} />

      <Input name="adults" defaultValue={adults} />
      <Input name="children" defaultValue={children} />
      <h3>People: {calcTravelers(props)}</h3>
      {arrive && depart && name && adults ? (
        <Link target="_blank" to={calcFlightLink(props)}>
          Search Flights
        </Link>
      ) : null}
      <Input name="flightCostPerSeat" defaultValue={flightCostPerSeat} />
      <Input name="taxiOrRentalCar" defaultValue={taxiOrRentalCar} />
      <h3>Travel: {formatCurrency(calcTravel(props))}</h3>

      {calcNights(props) && name && calcTravelers(props) ? (
        <Link target="_blank" to={calcAirbnbLink(props)}>
          Search Airbnb
        </Link>
      ) : null}
      {arrive && depart && name && adults ? (
        <Link target="_blank" to={calcHotelsLink(props)}>
          Search Hotels
        </Link>
      ) : null}
      <Input
        name="lodgingPerPersonPerNight"
        defaultValue={lodgingPerPersonPerNight}
      />
      <Input name="lodgingPerNight" defaultValue={lodgingPerNight} />
      <Input name="lodgingTotal" defaultValue={lodgingTotal} />
      <Input name="lodging_url" defaultValue={lodging_url} type="url" label="Lodging URL" />
      {lodging_url && (
        <a 
          href={lodging_url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: "var(--primary-color)", 
            textDecoration: "underline",
            fontSize: "14px",
            marginBottom: "12px",
            display: "block"
          }}
        >
          → Open lodging link
        </a>
      )}
      <h3>Lodging: {formatCurrency(calcLodgingTotal(props))}</h3>

      <Input name="entertainment" defaultValue={entertainment} />
      <Input name="skiPassPerDay" defaultValue={skiPassPerDay} />
      <Input name="childcare" defaultValue={childcare} />
      <h3>Cost: {formatCurrency(expenseTotal(props))}</h3>
      <Input name="fun" defaultValue={fun} />
      <h3>Score: {calcScore(props)}</h3>
      
      <ScoreComparison currentTrip={props} />

      <div className="form-footer space-between">
        <Link to="/">Back</Link>

        <button type="submit" disabled={isPending}>
          Save
        </button>
      </div>
    </form>
  );
}

function ScoreComparison({ currentTrip }: { currentTrip: Trip }) {
  const { data: trips } = useTripList();
  
  if (!trips || trips.length === 0) return null;
  
  const tripsWithScores = trips
    .map(trip => ({
      ...trip,
      score: calcScore(trip)
    }))
    .filter(trip => trip.score > 0)
    .sort((a, b) => a.score - b.score);
  
  if (tripsWithScores.length === 0) return null;
  
  const minScore = Math.min(...tripsWithScores.map(t => t.score));
  const maxScore = Math.max(...tripsWithScores.map(t => t.score));
  const currentScore = calcScore(currentTrip);
  
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

function Input({
  name,
  defaultValue,
  htmlFor = name,
  label = capitalizeFirstLetter(name),
  type = "number",
}: {
  name: string;
  defaultValue: number | string;
  label?: string;
  htmlFor?: string;
  type?: string;
}) {
  return (
    <label className="input-label" htmlFor={htmlFor}>
      <div>{label}</div>
      <input
        id={htmlFor}
        type={type}
        defaultValue={defaultValue}
        name={name}
        min={0}
        className="input-field"
      />
    </label>
  );
}
