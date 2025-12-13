import { Link, useNavigate } from "react-router";
import { createTrip } from "./useTripList";
import { PendingTrip } from "./types/Trip";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  calcAirbnbLink,
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
  };

  const nightsValue = nights || calcNights(props);
  const people = calcTravelers(props);

  return (
    <form className={"trip-details"} onSubmit={handleSubmit}>
      <Input
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="travel-dates">
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
      <h3>People: {people}</h3>

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
      <h3>Travel: {formatCurrency(calcTravel(props))}</h3>

      {nightsValue && name && people ? (
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
        <a 
          href={lodgingUrl} 
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

      <h3>Cost: {formatCurrency(expenseTotal(props))}</h3>
      <Input
        name="fun"
        value={fun}
        onChange={(e) =>
          setFun(Math.max(0, Math.min(coerceNumber(e.target.value), 10)))
        }
      />
      <h3>Score: {calcScore(props)}</h3>
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
