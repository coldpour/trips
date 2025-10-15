import { Link, useParams } from "react-router";
import { updateTrip, useTrip } from "./useTripList";
import { Trip } from "./types/Trip";
import { FormEvent } from "react";
import {
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

      <Input name="flightCostPerSeat" defaultValue={flightCostPerSeat} />
      <Input name="taxiOrRentalCar" defaultValue={taxiOrRentalCar} />
      <h3>Travel: {formatCurrency(calcTravel(props))}</h3>

      <Input
        name="lodgingPerPersonPerNight"
        defaultValue={lodgingPerPersonPerNight}
      />
      <Input name="lodgingPerNight" defaultValue={lodgingPerNight} />
      <Input name="lodgingTotal" defaultValue={lodgingTotal} />
      <h3>Lodging: {formatCurrency(calcLodgingTotal(props))}</h3>

      <Input name="entertainment" defaultValue={entertainment} />
      <Input name="skiPassPerDay" defaultValue={skiPassPerDay} />
      <Input name="childcare" defaultValue={childcare} />
      <h3>Cost: {formatCurrency(expenseTotal(props))}</h3>
      <Input name="fun" defaultValue={fun} />
      <h3>Score: {calcScore(props)}</h3>

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
