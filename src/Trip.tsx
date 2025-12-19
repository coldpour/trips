import { Link, useParams } from "react-router";
import { updateTrip, useTrip } from "./useTripList";
import { ScoreComparison } from "./ScoreComparison";
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
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <Link to="/" className="btn-secondary">← Back to Trips</Link>
      </div>
      {trip && (
        <>
          <h2 style={{ marginBottom: "var(--space-xl)" }}>Edit Trip: {trip.name}</h2>
          <TripDetails {...trip} />
        </>
      )}
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

  const nightsValue = calcNights(props);
  const people = calcTravelers(props);

  return (
    <form className="trip-details" onSubmit={handleSubmit}>
      {/* Trip Details Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">📝</span>
          <span>Trip Details</span>
        </div>
        <Input name="name" type="text" label="Trip Name" defaultValue={name} />
        <div className="travel-dates">
          <Input name="arrive" type="date" label="Arrival Date" defaultValue={arrive} />
          <Input name="depart" type="date" label="Departure Date" defaultValue={depart} />
        </div>
        <Input name="nights" label="Number of Nights" defaultValue={nightsValue} />
      </div>

      {/* Travelers Section */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">👥</span>
          <span>Travelers</span>
        </div>
        <div className="form-row">
          <Input name="adults" label="Adults" defaultValue={adults} />
          <Input name="children" label="Children" defaultValue={children} />
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
            defaultValue={flightCostPerSeat}
          />
          <Input
            name="taxiOrRentalCar"
            label="Taxi / Rental Car"
            defaultValue={taxiOrRentalCar}
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
            defaultValue={lodgingPerPersonPerNight}
          />
          <Input
            name="lodgingPerNight"
            label="Total Per Night"
            defaultValue={lodgingPerNight}
          />
        </div>
        <Input
          name="lodgingTotal"
          label="Total Lodging Cost"
          defaultValue={lodgingTotal}
        />
        <Input
          name="lodging_url"
          type="url"
          label="Lodging URL"
          defaultValue={lodging_url}
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
          {lodging_url && (
            <a href={lodging_url} target="_blank" rel="noopener noreferrer" className="search-link-btn">
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
            defaultValue={entertainment}
          />
          <Input
            name="skiPassPerDay"
            label="Ski Pass (per day)"
            defaultValue={skiPassPerDay}
          />
        </div>
        <Input
          name="childcare"
          label="Childcare"
          defaultValue={childcare}
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
          defaultValue={fun}
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
        <Link to="/" className="btn-secondary">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : "Update Trip"}
        </button>
      </div>
    </form>
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
