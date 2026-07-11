import type { Route } from "./+types/home";
import { PublicLayout } from "~/components/PublicChrome";
import { PublicationsList } from "~/components/PublicationsList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Foro publico | Malbec Connected" },
    {
      name: "description",
      content: "Publicaciones de la comunidad en Malbec Connected",
    },
  ];
}

export default function Home() {
  return (
    <PublicLayout mainClassName="flex flex-1 flex-col px-6 py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#11332C]/70">
            Foro publico
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#11332C] md:text-4xl">
            Publicaciones de la comunidad
          </h1>
        </div>

        <PublicationsList />
      </section>
    </PublicLayout>
  );
}
