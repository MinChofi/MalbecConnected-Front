import { PublicLayout } from "~/components/PublicChrome";

export function Welcome() {
  return (
    <PublicLayout mainClassName="flex flex-1 flex-col items-center gap-10 pb-10">
        <section className="relative w-full">
          <img
            src="/bg-welcome.jpg"
            alt="Copas de vino Malbec"
            className="h-[28rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#11332C]/55" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#F2B11C]">
                About us
              </p>
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                Bienvenido a Malbec Connected
              </h1>
              <p className="text-lg leading-8 text-white/90">
                Un espacio para descubrir publicaciones de bodegas, vinotecas y
                amantes del vino.
              </p>
            </div>
          </div>
        </section>

        <section
          id="aboutUs"
          className="flex w-[90%] max-w-6xl flex-col border-b border-b-amber-400 pb-8 md:w-[70%]"
        >
          <h1 className="mb-4 text-center text-4xl text-[#F2B11C] underline">
            About us
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
    </PublicLayout>
  );
}
