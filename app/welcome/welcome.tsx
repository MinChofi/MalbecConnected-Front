import { Link } from "react-router";

export function Welcome() {
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
              to="#aboutUs"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Nosotros
            </Link>
            <Link
              to="#history"
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

      <main className="flex flex-1 flex-col items-center gap-10 pb-10">
        <section className="relative w-full">
          <img
            src="/bg-welcome.jpg"
            alt="Copas de vino Malbec"
            className="h-[28rem] w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <Link
              to="/forum"
              className="rounded-md bg-[#F2B11C] px-6 py-3 text-base font-bold text-[#11332C] shadow-lg transition hover:bg-[#d99b12] focus:outline-none focus:ring-2 focus:ring-[#11332C] focus:ring-offset-2 focus:ring-offset-[#F2B11C]"
            >
              Ir al foro
            </Link>
          </div>
        </section>

        <section
          id="aboutUs"
          className="flex w-[90%] max-w-6xl flex-col border-b border-b-amber-400 pb-8 md:w-[70%]"
        >
          <h1 className="mb-4 text-center text-4xl text-[#F2B11C] underline">
            Acerca de Nosotros
          </h1>
          <div className="grid gap-6 md:grid-cols-2">
            <p className="text-gray-700">
              Malbec Connected reune publicaciones de vinerias y bodegas para
              que cada persona pueda descubrir nuevos productos, conocer su
              historia y compartir comentarios con otros amantes del vino.
            </p>
            <div
              aria-hidden="true"
              className="min-h-48 rounded-lg bg-[#11332C]/10"
            />
          </div>
        </section>

        <section
          id="history"
          className="flex w-[90%] max-w-6xl flex-col border-b border-b-amber-400 pb-8 md:w-[70%]"
        >
          <h1 className="mb-4 text-center text-4xl text-[#F2B11C] underline">
            Nuestra Historia
          </h1>
          <div className="grid gap-6 md:grid-cols-2">
            <div
              aria-hidden="true"
              className="min-h-48 rounded-lg bg-[#F2B11C]/20"
            />
            <p className="text-gray-700">
              La propuesta nace para conectar a productores, comercios y
              consumidores en un mismo espacio publico, donde los vinos puedan
              mostrarse con informacion real y opiniones de la comunidad.
            </p>
          </div>
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
