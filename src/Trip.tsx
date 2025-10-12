import { useParams, Link } from "react-router";

export function Trip() {
  const { tid } = useParams();

  return (
    <div>
      <div>Trip {tid}</div>
      <Link to="/">Back</Link>
    </div>
  );
}
