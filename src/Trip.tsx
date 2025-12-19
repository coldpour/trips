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

  const nightsValue = calcNights(props);
  const people = calcTravelers(props);
  const travelCost = calcTravel(props);
  const lodgingCost = calcLodgingTotal(props);
  const activitiesCost = entertainment + (skiPassPerDay * nightsValue * people) + childcare;

  return (
    <form className='trip-details' onSubmit={handleSubmit}>
      {/* Section 1: Trip Basics (open by default) */}
      <details className="form-section" open>
        <summary>
          Trip Basics
          {nightsValue > 0 && <span className="form-section-meta">{nightsValue} nights</span>}
        </summary>
        <div className="form-section-content">
          <Input name="name" defaultValue={name} type="text" />

          <div className="travel-dates full-width">
            <Input name="arrive" defaultValue={arrive} type="date" />
            <Input name="depart" defaultValue={depart} type="date" />
          </div>
          <Input name="nights" defaultValue={nightsValue} />
        </div>
      </details>

      {/* Section 2: Travelers (collapsed) */}
      <details className="form-section">
        <summary>
          Travelers
          {people > 0 && <span className="form-section-meta">People: {people}</span>}
        </summary>
        <div className="form-section-content">
          <Input name="adults" defaultValue={adults} />
          <Input name="children" defaultValue={children} />
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

          <Input name="flightCostPerSeat" defaultValue={flightCostPerSeat} />
          <Input name="taxiOrRentalCar" defaultValue={taxiOrRentalCar} />
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
            defaultValue={lodgingPerPersonPerNight}
          />
          <Input name="lodgingPerNight" defaultValue={lodgingPerNight} />
          <Input name="lodgingTotal" defaultValue={lodgingTotal} />
          <Input name="lodging_url" defaultValue={lodging_url} type="url" label="Lodging URL" />
          {lodging_url && (
            <div className="lodging-link-display full-width">
              <a
                href={lodging_url}
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
          <Input name="entertainment" defaultValue={entertainment} />
          <Input name="skiPassPerDay" defaultValue={skiPassPerDay} />
          <Input name="childcare" defaultValue={childcare} />
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

          <Input name="fun" defaultValue={fun} />

          <div className="full-width">
            <ScoreComparison currentTrip={props} />
          </div>
        </div>
      </details>

      <div className="form-footer space-between">
        <Link to="/">Back</Link>

        <button type="submit" disabled={isPending}>
          Save
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
