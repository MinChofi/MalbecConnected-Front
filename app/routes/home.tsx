import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Malbec Connected" },
    { name: "description", content: "Donde el Malbec se conecta con vos!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
