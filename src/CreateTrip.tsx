import { Link, useNavigate } from "react-router";
import { createTrip } from "./useTripList";
import { PendingTrip } from "./types/Trip";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  calcLodgingTotal,
  calcNights,
  calcOtherExpenses,
  calcScore,
  calcTravel,
  calcTravelers,
  expenseTotal
} from "./util/expenseTotal";
import { capitalizeFirstLetter, formatCurrency } from "./util/format";

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
      arrive: String(formData.get("arrive")) || null,
      depart: String(formData.get("depart")) || null,
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
  };

  const nightsValue = nights || calcNights(props);

  function coerceNumber(value: string | number | null): number {
    if (value === null) {
      return 0;
    }
    if (isNaN(Number(value))) {
      return 0;
    }
    if (typeof value === "number") {
      return value;
    }

    return Number(value.replace(/^0+/, ""));
  }

  return (
    <form className={"trip-details"} onSubmit={handleSubmit}>
      <Input
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        name="nights"
        value={nightsValue}
        onChange={(e) => setNights(coerceNumber(e.target.value))}
      />

      <div className="travel-dates">
        <Input
          name="arrive"
          type="date"
          value={arrive}
          onChange={(e) => setArrive(e.target.value)}
        />
        <Input
          name="depart"
          type="date"
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
        />
      </div>
      <h3>People: {calcTravelers(props)}</h3>
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

      <h3>Travel: {formatCurrency(calcTravel(props))}</h3>
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

      <h3>Lodging: {formatCurrency(calcLodgingTotal(props))}</h3>
      <Input
        name="lodgingTotal"
        value={lodgingTotal}
        onChange={(e) => setLodgingTotal(coerceNumber(e.target.value))}
      />
      <Input
        name="lodgingPerNight"
        value={lodgingPerNight}
        onChange={(e) => setLodgingPerNight(coerceNumber(e.target.value))}
      />
      <Input
        name="lodgingPerPersonPerNight"
        value={lodgingPerPersonPerNight}
        onChange={(e) => setLodgingPerPersonPerNight(coerceNumber(e.target.value))}
      />

      <h3>Expenses: {formatCurrency(calcOtherExpenses(props))}</h3>
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
        onChange={(e) => setFun(Math.max(0, Math.min(coerceNumber(e.target.value), 10)))}
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
        value={value || ''}
        onChange={onChange}
      />
    </label>
  );
}
