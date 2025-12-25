import { Link, useParams } from "react-router";
import { updateTrip, useTrip } from "./useTripList";
import { ScoreComparison } from "./ScoreComparison";
import { Trip } from "./types/Trip";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  calcAirbnbLink,
  calcFlightLink,
  calcHotelsLink,
  calcLodgingTotal,
  calcNights,
  calcTravel,
  calcTravelers,
  expenseTotal,
} from "./util/expenseTotal";
import { formatCurrency, capitalizeFirstLetter } from "./util/format";
import { coerceNumber } from "./util/coerceNumber";
import { addDaysToDate } from "./util/date";

export function TripRoute() {
  const { tid } = useParams();
  const { data: trip } = useTrip(tid);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <Link to="/" className="btn-secondary">← Back to Trips</Link>
      </div>
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
      flightCost: Number(formData.get("flightCost")),
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
      // oxlint-disable-next-line @typescript-eslint/no-base-to-string
      flight_url: String(formData.get("flight_url")) || null,
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
    flightCost,
    taxiOrRentalCar,
    skiPassPerDay,
    childcare,
    lodgingTotal,
    lodgingPerNight,
    lodgingPerPersonPerNight,
    lodging_url,
    flight_url,
  } = props;
  const [nights, setNights] = useState(calcNights(props));
  const [adultCount, setAdultCount] = useState(adults ?? 0);
  const [childCount, setChildCount] = useState(children ?? 0);
  const [arriveValue, setArriveValue] = useState(arrive ?? "");
  const [departValue, setDepartValue] = useState(depart ?? "");
  const [flightUrlValue, setFlightUrlValue] = useState(flight_url ?? "");
  const [flightCostValue, setFlightCostValue] = useState(flightCost ?? 0);
  const [flightCostPerSeatValue, setFlightCostPerSeatValue] = useState(
    flightCostPerSeat ?? 0,
  );
  const [lodgingTotalValue, setLodgingTotalValue] = useState(lodgingTotal ?? 0);
  const [lodgingPerNightValue, setLodgingPerNightValue] = useState(
    lodgingPerNight ?? 0,
  );
  const [lodgingPerPersonPerNightValue, setLodgingPerPersonPerNightValue] =
    useState(lodgingPerPersonPerNight ?? 0);
  const people = adultCount + childCount;
  const handleAdultsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextAdults = coerceNumber(e.target.value);
    setAdultCount(nextAdults);
  };
  const handleChildrenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextChildren = coerceNumber(e.target.value);
    setChildCount(nextChildren);
  };
  const handleFlightCostChange = (e: ChangeEvent<HTMLInputElement>) => {
    const total = coerceNumber(e.target.value);
    setFlightCostValue(total);
    setFlightCostPerSeatValue(0);
  };
  const handleFlightCostPerSeatChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const perSeat = coerceNumber(e.target.value);
    setFlightCostPerSeatValue(perSeat);
    setFlightCostValue(0);
  };
  const handleArriveChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setArriveValue(value);
    if (!value) {
      setDepartValue("");
      return;
    }
    const nightsToUse = nights && nights > 0 ? nights : 1;
    setDepartValue(addDaysToDate(value, nightsToUse));
  };
  const handleLodgingTotalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const total = coerceNumber(e.target.value);
    setLodgingTotalValue(total);
    if (total) {
      setLodgingPerNightValue(0);
      setLodgingPerPersonPerNightValue(0);
    }
  };
  const handleLodgingPerNightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const perNight = coerceNumber(e.target.value);
    setLodgingPerNightValue(perNight);
    if (perNight) {
      setLodgingTotalValue(0);
      setLodgingPerPersonPerNightValue(0);
    }
  };
  const handleLodgingPerPersonPerNightChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const perPersonPerNight = coerceNumber(e.target.value);
    setLodgingPerPersonPerNightValue(perPersonPerNight);
    if (perPersonPerNight) {
      setLodgingTotalValue(0);
      setLodgingPerNightValue(0);
    }
  };

  return (
    <form className='trip-details' onSubmit={handleSubmit}>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>Edit Trip</h1>
      
      <div className="form-section">
        <h3 className="form-section-header">Basic Information</h3>
        <Input name="name" defaultValue={name} type="text" label="Trip Name" />

        <div className="travel-dates">
          <Input
            name="arrive"
            value={arriveValue}
            onChange={handleArriveChange}
            type="date"
            label="Arrival Date"
          />
          <Input
            name="depart"
            value={departValue}
            onChange={(e) => setDepartValue(e.target.value)}
            type="date"
            label="Departure Date"
          />
        </div>
        <Input
          name="nights"
          value={nights}
          label="Number of Nights"
          onChange={(e) => setNights(coerceNumber(e.target.value))}
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Travelers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <Input
            name="adults"
            value={adultCount}
            label="Adults"
            onChange={handleAdultsChange}
          />
          <Input
            name="children"
            value={childCount}
            label="Children"
            onChange={handleChildrenChange}
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
          name="flightCost"
          value={flightCostValue}
          onChange={handleFlightCostChange}
          label="Total Flight Cost"
        />
        <Input
          name="flightCostPerSeat"
          value={flightCostPerSeatValue}
          onChange={handleFlightCostPerSeatChange}
          label="Flight Cost Per Seat"
        />
        <Input
          name="flight_url"
          value={flightUrlValue}
          onChange={(e) => setFlightUrlValue(e.target.value)}
          type="url"
          label="Flight URL (Optional)"
        />
        {flightUrlValue && (
          <a
            href={flightUrlValue}
            target="_blank"
            rel="noopener noreferrer"
            className="search-link"
            style={{ display: 'inline-flex', marginTop: 'var(--space-sm)' }}
          >
            ✈️ Open flight link →
          </a>
        )}
        <Input name="taxiOrRentalCar" defaultValue={taxiOrRentalCar} label="Taxi or Rental Car Total" />
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Travel: {formatCurrency(calcTravel({
            ...props,
            adults: adultCount,
            children: childCount,
            flightCost: flightCostValue,
            flightCostPerSeat: flightCostPerSeatValue,
          }))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Lodging</h3>
        <div className="search-links">
          {calcNights(props) && name && calcTravelers(props) ? (
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
          value={lodgingTotalValue}
          label="Total Lodging Cost"
          onChange={handleLodgingTotalChange}
        />
        <Input
          name="lodgingPerNight"
          value={lodgingPerNightValue}
          label="Cost Per Night"
          onChange={handleLodgingPerNightChange}
        />
        <Input
          name="lodgingPerPersonPerNight"
          value={lodgingPerPersonPerNightValue}
          label="Cost Per Person Per Night"
          onChange={handleLodgingPerPersonPerNightChange}
        />
        <Input name="lodging_url" defaultValue={lodging_url} type="url" label="Lodging URL (Optional)" />
        {lodging_url && (
          <a 
            href={lodging_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="search-link"
            style={{ display: 'inline-flex', marginTop: 'var(--space-sm)' }}
          >
            🔗 Open lodging link →
          </a>
        )}
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Lodging: {formatCurrency(calcLodgingTotal({
            ...props,
            nights,
            adults: adultCount,
            children: childCount,
            lodgingTotal: lodgingTotalValue,
            lodgingPerNight: lodgingPerNightValue,
            lodgingPerPersonPerNight: lodgingPerPersonPerNightValue,
          }))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Activities & Entertainment</h3>
        <Input name="entertainment" defaultValue={entertainment} label="Entertainment Total" />
        <Input name="skiPassPerDay" defaultValue={skiPassPerDay} label="Ski Pass Per Day" />
        <Input name="childcare" defaultValue={childcare} label="Childcare Total" />
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Trip Evaluation</h3>
        <div className="calculated-value highlight" style={{ fontSize: '24px', marginBottom: 'var(--space-lg)' }}>
          Total Cost: {formatCurrency(expenseTotal(props))}
        </div>
        <Input name="fun" defaultValue={fun} label="Fun Rating (0-10)" />
      </div>
      
      <ScoreComparison currentTrip={props} />

      <div className="form-footer space-between">
        <Link to="/" className="btn-secondary">← Back to Trips</Link>
        <button type="submit" disabled={isPending} className="btn-primary" style={{ fontSize: '16px', padding: 'var(--space-md) var(--space-xl)' }}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function Input({
  name,
  defaultValue,
  value,
  onChange,
  htmlFor = name,
  label = capitalizeFirstLetter(name),
  type = "number",
}: {
  name: string;
  defaultValue?: number | string;
  value?: number | string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  htmlFor?: string;
  type?: string;
}) {
  const inputProps =
    value === undefined ? { defaultValue } : { value, onChange };
  return (
    <label className="input-label" htmlFor={htmlFor}>
      <div>{label}</div>
      <input
        id={htmlFor}
        type={type}
        {...inputProps}
        name={name}
        min={0}
        className="input-field"
      />
    </label>
  );
}
