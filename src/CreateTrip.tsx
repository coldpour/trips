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
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <Link to="/" className="btn-secondary">← Back to Trips</Link>
      </div>
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
  const handleLodgingTotalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const total = coerceNumber(e.target.value);
    setLodgingTotal(total);

    if (total === 0) {
      setLodgingPerNight(0);
      setLodgingPerPersonPerNight(0);
      return;
    }

    if (nightsValue) {
      setLodgingPerNight(roundToTwo(total / nightsValue));
    }

    if (nightsValue && people) {
      setLodgingPerPersonPerNight(
        roundToTwo(total / (nightsValue * people)),
      );
    }
  };

  return (
    <form className="trip-details" onSubmit={handleSubmit}>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>Plan Your Trip</h1>
      
      <div className="form-section">
        <h3 className="form-section-header">Basic Information</h3>
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

      <div className="form-section">
        <h3 className="form-section-header">Travelers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
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
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Travelers: {people}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Travel Costs</h3>
        {arrive && depart && name && adults ? (
          <div className="search-links">
            <Link target="_blank" to={calcFlightLink(props)} className="search-link">
              🔍 Search Flights
            </Link>
          </div>
        ) : null}
        <Input
          name="flightCostPerSeat"
          label="Flight Cost Per Seat"
          value={flightCostPerSeat}
          onChange={(e) => setFlightCostPerSeat(coerceNumber(e.target.value))}
        />
        <Input
          name="taxiOrRentalCar"
          label="Taxi or Rental Car Total"
          value={taxiOrRentalCar}
          onChange={(e) => setTaxiOrRentalCar(coerceNumber(e.target.value))}
        />
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Travel: {formatCurrency(calcTravel(props))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Lodging</h3>
        <div className="search-links">
          {nightsValue && name && people ? (
            <Link target="_blank" to={calcAirbnbLink(props)} className="search-link">
              🏠 Search Airbnb
            </Link>
          ) : null}
          {arrive && depart && name && adults ? (
            <Link target="_blank" to={calcHotelsLink(props)} className="search-link">
              🏨 Search Hotels
            </Link>
          ) : null}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>
          Enter lodging cost using any one of these three methods:
        </p>
        <Input
          name="lodgingTotal"
          label="Total Lodging Cost"
          value={lodgingTotal}
          onChange={handleLodgingTotalChange}
        />
        <Input
          name="lodgingPerNight"
          label="Cost Per Night"
          value={lodgingPerNight}
          onChange={(e) => setLodgingPerNight(coerceNumber(e.target.value))}
        />
        <Input
          name="lodgingPerPersonPerNight"
          label="Cost Per Person Per Night"
          value={lodgingPerPersonPerNight}
          onChange={(e) =>
            setLodgingPerPersonPerNight(coerceNumber(e.target.value))
          }
        />
        <Input
          name="lodging_url"
          type="url"
          label="Lodging URL (Optional)"
          value={lodgingUrl}
          onChange={(e) => setLodgingUrl(e.target.value)}
        />
        {lodgingUrl && (
          <a 
            href={lodgingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="search-link"
            style={{ display: 'inline-flex', marginTop: 'var(--space-sm)' }}
          >
            🔗 Open lodging link →
          </a>
        )}
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Lodging: {formatCurrency(calcLodgingTotal(props))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Activities & Entertainment</h3>
        <Input
          name="entertainment"
          label="Entertainment Total"
          value={entertainment}
          onChange={(e) => setEntertainment(coerceNumber(e.target.value))}
        />
        <Input
          name="skiPassPerDay"
          label="Ski Pass Per Day"
          value={skiPassPerDay}
          onChange={(e) => setSkiPassPerDay(coerceNumber(e.target.value))}
        />
        <Input
          name="childcare"
          label="Childcare Total"
          value={childcare}
          onChange={(e) => setChildcare(coerceNumber(e.target.value))}
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Trip Evaluation</h3>
        <div className="calculated-value highlight" style={{ fontSize: '24px', marginBottom: 'var(--space-lg)' }}>
          Total Cost: {formatCurrency(expenseTotal(props))}
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
        <div className="calculated-value highlight" style={{ fontSize: '24px', marginTop: 'var(--space-lg)' }}>
          Trip Score: {calcScore(props)}
        </div>
      </div>
      
      <ScoreComparison currentTrip={props} />

      <div className="form-footer">
        <button type="submit" disabled={isPending} className="btn-primary" style={{ fontSize: '16px', padding: 'var(--space-md) var(--space-xl)' }}>
          {isPending ? 'Saving...' : 'Save Trip'}
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

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}
