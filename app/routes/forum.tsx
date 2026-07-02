import { Link } from "react-router";

import { PublicationsList } from "~/components/PublicationsList";

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
  const actualYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FCF9F6]">
      <header className="relative">
        <nav className="flex w-full">
          <div className="flex min-h-10 w-full flex-wrap items-center justify-end gap-4 bg-[#11332C] px-4 py-2 md:gap-8">
            <Link
              to="/"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Inicio
            </Link>
            <Link
              to="/forum"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Foro
            </Link>
            <Link
              to="/#aboutUs"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Nosotros
            </Link>
            <Link
              to="/#history"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Historia
            </Link>
            <Link
              to="/login"
              className="text-[#F2B11C] hover:text-orange-200/70 hover:underline"
            >
              Iniciar sesion
            </Link>
            <Link
              to="/register"
              className="rounded-4xl border bg-[#F2B11C] px-3 py-1 text-[#11332C] hover:bg-[#FCF9F6] hover:text-[#F2B11C]"
            >
              Crear cuenta
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col px-6 py-10">
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
      </main>

      <footer className="bg-[#11332C] py-4">
        <div className="flex flex-row items-center justify-center">
          <p className="mx-2 text-sm text-[#F2B11C]">
            &copy;&nbsp; {actualYear}&nbsp; Malbec Connected
          </p>
          <p className="mx-2 text-sm text-[#F2B11C]">
            Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
