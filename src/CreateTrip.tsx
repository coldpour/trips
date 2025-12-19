import { Link, useNavigate } from "react-router";
import { createTrip } from "./useTripList";
import { ScoreComparison } from "./ScoreComparison";
import { PendingTrip } from "./types/Trip";
import { ChangeEvent, FormEvent, useState } from "react";
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
import { capitalizeFirstLetter, formatCurrency } from "./util/format";
import { coerceNumber } from "./util/coerceNumber";

export function CreateTripRoute() {
  return (
    <div>
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <Link to="/" className="btn-secondary">← Back to Trips</Link>
      </div>
      <h2 style={{ marginBottom: "var(--space-xl)" }}>Plan a New Trip</h2>
      <TripDetails />
    </div>
  );
}

function TripDetails() {
  const navigate = useNavigate();
  const { mutate, isPending } = createTrip(() => navigate("/"));

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
  const [name, setName] = useState("");
  const [fun, setFun] = useState(0);
  const [nights, setNights] = useState(0);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [entertainment, setEntertainment] = useState(0);
  const [arrive, setArrive] = useState("");
  const [depart, setDepart] = useState("");
  const [flightCostPerSeat, setFlightCostPerSeat] = useState(0);
  const [taxiOrRentalCar, setTaxiOrRentalCar] = useState(0);
  const [skiPassPerDay, setSkiPassPerDay] = useState(0);
  const [childcare, setChildcare] = useState(0);
  const [lodgingTotal, setLodgingTotal] = useState(0);
  const [lodgingPerNight, setLodgingPerNight] = useState(0);
  const [lodgingPerPersonPerNight, setLodgingPerPersonPerNight] = useState(0);
  const [lodgingUrl, setLodgingUrl] = useState("");

  const props: PendingTrip = {
    name,
    fun,
    nights,
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
    lodging_url: lodgingUrl,
    trip_list_id: null,
  };

  const nightsValue = nights || calcNights(props);
  const people = calcTravelers(props);

  return (
    <form className="trip-details" onSubmit={handleSubmit}>
      {/* Trip Details Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">📝</span>
          <span>Trip Details</span>
        </div>
        <Input
          name="name"
          type="text"
          label="Trip Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="travel-dates">
          <Input
            name="arrive"
            type="date"
            label="Arrival Date"
            value={arrive}
            onChange={(e) => {
              setArrive(e.target.value);
              setNights(null);
            }}
          />
          <Input
            name="depart"
            type="date"
            label="Departure Date"
            value={depart}
            onChange={(e) => {
              setDepart(e.target.value);
              setNights(null);
            }}
          />
        </div>
        <Input
          name="nights"
          label="Number of Nights"
          value={nightsValue}
          onChange={(e) => {
            setNights(coerceNumber(e.target.value));
            setArrive(null);
            setDepart(null);
          }}
        />
      </div>

      {/* Travelers Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">👥</span>
          <span>Travelers</span>
        </div>
        <div className="form-row">
          <Input
            name="adults"
            label="Adults"
            value={adults}
            onChange={(e) => setAdults(coerceNumber(e.target.value))}
          />
          <Input
            name="children"
            label="Children"
            value={children}
            onChange={(e) => setChildren(coerceNumber(e.target.value))}
          />
        </div>
        <div className="calculated-value">
          Total People: {people}
        </div>
      </div>

      {/* Travel Costs Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">✈️</span>
          <span>Travel Costs</span>
        </div>
        <div className="form-row">
          <Input
            name="flightCostPerSeat"
            label="Flight Cost per Seat"
            value={flightCostPerSeat}
            onChange={(e) => setFlightCostPerSeat(coerceNumber(e.target.value))}
          />
          <Input
            name="taxiOrRentalCar"
            label="Taxi / Rental Car"
            value={taxiOrRentalCar}
            onChange={(e) => setTaxiOrRentalCar(coerceNumber(e.target.value))}
          />
        </div>
        <div className="calculated-value">
          Travel Total: {formatCurrency(calcTravel(props))}
        </div>
        {arrive && depart && name && adults && (
          <div className="search-links">
            <Link target="_blank" to={calcFlightLink(props)} className="search-link-btn">
              Search Flights
            </Link>
          </div>
        )}
      </div>

      {/* Lodging Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">🏠</span>
          <span>Lodging</span>
        </div>
        <div className="form-row">
          <Input
            name="lodgingPerPersonPerNight"
            label="Per Person Per Night"
            value={lodgingPerPersonPerNight}
            onChange={(e) =>
              setLodgingPerPersonPerNight(coerceNumber(e.target.value))
            }
          />
          <Input
            name="lodgingPerNight"
            label="Total Per Night"
            value={lodgingPerNight}
            onChange={(e) => setLodgingPerNight(coerceNumber(e.target.value))}
          />
        </div>
        <Input
          name="lodgingTotal"
          label="Total Lodging Cost"
          value={lodgingTotal}
          onChange={(e) => setLodgingTotal(coerceNumber(e.target.value))}
        />
        <Input
          name="lodging_url"
          type="url"
          label="Lodging URL"
          value={lodgingUrl}
          onChange={(e) => setLodgingUrl(e.target.value)}
        />
        <div className="calculated-value">
          Lodging Total: {formatCurrency(calcLodgingTotal(props))}
        </div>
        <div className="search-links">
          {nightsValue && name && people && (
            <Link target="_blank" to={calcAirbnbLink(props)} className="search-link-btn">
              Search Airbnb
            </Link>
          )}
          {arrive && depart && name && adults && (
            <Link target="_blank" to={calcHotelsLink(props)} className="search-link-btn">
              Search Hotels
            </Link>
          )}
          {lodgingUrl && (
            <a href={lodgingUrl} target="_blank" rel="noopener noreferrer" className="search-link-btn">
              Open Lodging Link
            </a>
          )}
        </div>
      </div>

      {/* Activities Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">🎢</span>
          <span>Activities & Entertainment</span>
        </div>
        <div className="form-row">
          <Input
            name="entertainment"
            label="Entertainment"
            value={entertainment}
            onChange={(e) => setEntertainment(coerceNumber(e.target.value))}
          />
          <Input
            name="skiPassPerDay"
            label="Ski Pass (per day)"
            value={skiPassPerDay}
            onChange={(e) => setSkiPassPerDay(coerceNumber(e.target.value))}
          />
        </div>
        <Input
          name="childcare"
          label="Childcare"
          value={childcare}
          onChange={(e) => setChildcare(coerceNumber(e.target.value))}
        />
      </div>

      {/* Fun Rating & Score Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">🎉</span>
          <span>Fun Rating & Score</span>
        </div>
        <Input
          name="fun"
          label="Fun Rating (0-10)"
          value={fun}
          max={10}
          onChange={(e) =>
            setFun(Math.max(0, Math.min(coerceNumber(e.target.value), 10)))
          }
        />
        <div style={{ display: "flex", gap: "var(--space-lg)", alignItems: "center", marginTop: "var(--space-md)" }}>
          <div className="calculated-value">
            Total Cost: {formatCurrency(expenseTotal(props))}
          </div>
          <div className="calculated-value">
            Trip Score: {calcScore(props)}
          </div>
        </div>
      </div>

      <ScoreComparison currentTrip={props} />

      <div className="form-footer">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save Trip"}
        </button>
      </div>
    </form>
  );
}

function Input({
  name,
  value,
  onChange,
  htmlFor = name,
  label = capitalizeFirstLetter(name),
  type = "tel",
  max,
}: {
  name: string;
  value: number | string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  htmlFor?: string;
  type?: string;
  max?: number;
}) {
  return (
    <label className="input-label" htmlFor={htmlFor}>
      <div>{label}</div>
      <input
        className="input-field"
        id={htmlFor}
        type={type}
        name={name}
        min={0}
        max={max}
        value={value || ""}
        onChange={onChange}
      />
    </label>
  );
}
