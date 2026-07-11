import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "About us | Malbec Connected" },
    {
      name: "description",
      content: "Conoce la historia y propuesta de Malbec Connected",
    },
  ];
}

export default function AboutUs() {
  return <Welcome />;
}
