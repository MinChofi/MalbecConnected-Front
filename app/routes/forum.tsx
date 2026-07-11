import { Navigate } from "react-router";

export function meta() {
  return [
    { title: "Foro | Malbec Connected" },
    {
      name: "description",
      content: "Foro publico de publicaciones en Malbec Connected",
    },
  ];
}

export default function Forum() {
  return <Navigate to="/" replace />;
}
