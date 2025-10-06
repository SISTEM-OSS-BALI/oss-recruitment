import { useParams } from "next/navigation";

export default function Content() {
  const params = useParams();
  const id = params.id;
  return <div>{id}</div>;
}
