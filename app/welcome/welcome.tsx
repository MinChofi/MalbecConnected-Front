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
            Acerca de nosotros
          </h1>
          <div className="grid gap-6 md:grid-cols-2">
            <p className="text-gray-700">
              En Malbec-Connected creemos que cada vino cuenta una historia que
              merece ser conocida en el mundo. Somos una plataforma digital que
              conecta bodegas boutique argentinas con restaurantes y vinotecas
              internacionales, simplificando el proceso de comercialización y
              brindando una experiencia basada en la calidad, la selección
              personalizada y la identidad de cada productor. Nuestro objetivo
              es acercar el auténtico vino argentino a nuevos mercados, creando
              vínculos comerciales duraderos y de confianza.
            </p>
            <img
              src="/about-us-photo.jpeg"
              alt="Botellas y copas de vino argentino en una mesa"
              className="h-full min-h-48 w-full rounded-lg object-cover"
            />
          </div>
        </section>

        <section
          id="history"
          className="flex w-[90%] max-w-6xl flex-col border-b border-b-amber-400 pb-8 md:w-[70%]"
        >
          <h1 className="mb-4 text-center text-4xl text-[#F2B11C] underline">
            Nuestra historia
          </h1>
          <div className="grid gap-6 md:grid-cols-2">
            <img
              src="/our-history-photo.jpeg"
              alt="Viñedo argentino con paisaje de montaña"
              className="h-full min-h-48 w-full rounded-lg object-cover"
            />
            <p className="text-gray-700">
              Malbec-Connected nace al identificar una necesidad concreta:
              muchas pequeñas y medianas bodegas elaboran vinos de excelencia,
              pero encuentran grandes dificultades para llegar al mercado
              internacional. A partir de esa realidad, surge la idea de crear
              una plataforma que combine tecnología, logística y promoción para
              reducir esas barreras. Hoy trabajamos para que cada botella
              represente no solo un producto, sino también la historia, la
              tradición y la pasión de quienes hacen del vino argentino un
              referente mundial.
            </p>
          </div>
        </section>
    </PublicLayout>
  );
}
