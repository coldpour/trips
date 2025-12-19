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
      <Link to="/">Back</Link>
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

  const travelCost = calcTravel(props);
  const lodgingCost = calcLodgingTotal(props);
  const activitiesCost = entertainment + (skiPassPerDay * nightsValue * people) + childcare;

  return (
    <form className={"trip-details"} onSubmit={handleSubmit}>
      {/* Section 1: Trip Basics (open by default) */}
      <details className="form-section" open>
        <summary>
          Trip Basics
          {nightsValue > 0 && <span className="form-section-meta">{nightsValue} nights</span>}
        </summary>
        <div className="form-section-content">
          <Input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="travel-dates full-width">
            <Input
              name="arrive"
              type="date"
              value={arrive}
              onChange={(e) => {
                setArrive(e.target.value);
                setNights(null);
              }}
            />
            <Input
              name="depart"
              type="date"
              value={depart}
              onChange={(e) => {
                setDepart(e.target.value);
                setNights(null);
              }}
            />
          </div>

          <Input
            name="nights"
            value={nightsValue}
            onChange={(e) => {
              setNights(coerceNumber(e.target.value));
              setArrive(null);
              setDepart(null);
            }}
          />
        </div>
      </details>

      {/* Section 2: Travelers (collapsed) */}
      <details className="form-section">
        <summary>
          Travelers
          {people > 0 && <span className="form-section-meta">People: {people}</span>}
        </summary>
        <div className="form-section-content">
          <Input
            name="adults"
            value={adults}
            onChange={(e) => setAdults(coerceNumber(e.target.value))}
          />
          <Input
            name="children"
            value={children}
            onChange={(e) => setChildren(coerceNumber(e.target.value))}
          />
        </div>
      </details>

      {/* Section 3: Travel Costs (collapsed) */}
      <details className="form-section">
        <summary>
          Travel Costs
          {travelCost > 0 && <span className="form-section-meta">{formatCurrency(travelCost)}</span>}
        </summary>
        <div className="form-section-content">
          {arrive && depart && name && adults ? (
            <div className="search-button-container full-width">
              <Link target="_blank" to={calcFlightLink(props)} className="search-button flights">
                <span className="search-button-icon">✈️</span>
                <span>Search Flights</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="search-button-info full-width">
              Fill in trip name, dates, and travelers to search flights
            </div>
          )}

          <Input
            name="flightCostPerSeat"
            value={flightCostPerSeat}
            onChange={(e) => setFlightCostPerSeat(coerceNumber(e.target.value))}
          />
          <Input
            name="taxiOrRentalCar"
            value={taxiOrRentalCar}
            onChange={(e) => setTaxiOrRentalCar(coerceNumber(e.target.value))}
          />
        </div>
      </details>

      {/* Section 4: Lodging (collapsed) */}
      <details className="form-section">
        <summary>
          Lodging
          {lodgingCost > 0 && <span className="form-section-meta">{formatCurrency(lodgingCost)}</span>}
        </summary>
        <div className="form-section-content">
          <div className="search-button-container full-width">
            {nightsValue && name && people ? (
              <Link target="_blank" to={calcAirbnbLink(props)} className="search-button airbnb">
                <span className="search-button-icon">🏠</span>
                <span>Search Airbnb</span>
                <span>→</span>
              </Link>
            ) : (
              <div className="search-button-info">
                Fill in trip name, nights, and travelers to search Airbnb
              </div>
            )}

            {arrive && depart && name && adults ? (
              <Link target="_blank" to={calcHotelsLink(props)} className="search-button hotels">
                <span className="search-button-icon">🏨</span>
                <span>Search Hotels</span>
                <span>→</span>
              </Link>
            ) : (
              <div className="search-button-info">
                Fill in trip name, dates, and travelers to search hotels
              </div>
            )}
          </div>

          <Input
            name="lodgingPerPersonPerNight"
            value={lodgingPerPersonPerNight}
            onChange={(e) =>
              setLodgingPerPersonPerNight(coerceNumber(e.target.value))
            }
          />
          <Input
            name="lodgingPerNight"
            value={lodgingPerNight}
            onChange={(e) => setLodgingPerNight(coerceNumber(e.target.value))}
          />
          <Input
            name="lodgingTotal"
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
          {lodgingUrl && (
            <div className="lodging-link-display full-width">
              <a
                href={lodgingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open lodging link →
              </a>
            </div>
          )}
        </div>
      </details>

      {/* Section 5: Activities & Entertainment (collapsed) */}
      <details className="form-section">
        <summary>
          Activities & Entertainment
          {activitiesCost > 0 && <span className="form-section-meta">{formatCurrency(activitiesCost)}</span>}
        </summary>
        <div className="form-section-content">
          <Input
            name="entertainment"
            value={entertainment}
            onChange={(e) => setEntertainment(coerceNumber(e.target.value))}
          />
          <Input
            name="skiPassPerDay"
            value={skiPassPerDay}
            onChange={(e) => setSkiPassPerDay(coerceNumber(e.target.value))}
          />
          <Input
            name="childcare"
            value={childcare}
            onChange={(e) => setChildcare(coerceNumber(e.target.value))}
          />
        </div>
      </details>

      {/* Section 6: Trip Evaluation (open by default) */}
      <details className="form-section" open>
        <summary>
          Trip Evaluation
          <span className="form-section-meta">Score: {calcScore(props)}</span>
        </summary>
        <div className="form-section-content">
          <div className="full-width">
            <h3>Total Cost: {formatCurrency(expenseTotal(props))}</h3>
          </div>

          <Input
            name="fun"
            max={10}
            value={fun}
            onChange={(e) =>
              setFun(Math.max(0, Math.min(coerceNumber(e.target.value), 10)))
            }
          />

          <div className="full-width">
            <ScoreComparison currentTrip={props} />
          </div>
        </div>
      </details>

      <div className="form-footer">
        <button type="submit" disabled={isPending}>
          Save
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
