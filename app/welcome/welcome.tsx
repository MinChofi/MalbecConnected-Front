import { Link } from "react-router";

export function Welcome() {
  const actualYear = new Date().getFullYear();

  return (
    <body className="flex flex-col h-full w-full">
        <header className="relative row items-center gap-9">
          <nav className="flex w-full">
            <div className="flex justify-end items-center bg-[#11332C] h-10 w-full gap-8 pr-4">
              <Link to="/" className="text-[#F2B11C] hover:underline hover:text-[#F2B11C]/70">Inicio</Link>
              <Link to="#aboutUs" className="text-[#F2B11C] hover:underline hover:text-[#F2B11C]/70">Nosotros</Link>
              <Link to="#history" className="text-[#F2B11C] hover:underline hover:text-[#F2B11C]/70">Historia</Link>
              <Link to="/login" className="text-[#F2B11C] hover:underline hover:text-orange-200/70">Iniciar sesión</Link>
              <Link to="/register" className="bg-[#F2B11C] border rounded-4xl p-1 hover:bg-[#FCF9F6] hover:text-[#F2B11C]">Crear cuenta</Link>
            </div>
          </nav>
        </header>

        <main className="flex flex-col items-center justify-center pb-4 gap-6 bg-[#FCF9F6]">

          <section>
            <img src="" alt="" className="w-full h-192"/>
          </section>

          <section id="aboutUs" className="flex flex-col w-[70%] pb-4 border border-b-amber-400">
            <h1 className="text-[#F2B11C] text-center underline text-4xl mb-4">Acerca de Nosotros</h1>
            <div className="grid grid-cols-2 mt-3 gap-4">
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga, ipsam obcaecati. Perferendis ex, ducimus eum veniam fugit natus nulla voluptate quis a, consequatur deleniti voluptatibus reprehenderit tempora cupiditate eius fugiat.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis doloribus maxime facere exercitationem totam unde odit quisquam, neque tenetur ipsam quis quam tempora hic soluta modi deleniti? Placeat, doloremque rem.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod debitis, dolores nemo magnam quae hic iste? Inventore voluptatum quis perspiciatis itaque consequuntur obcaecati quae iure nobis at tempora? Voluptates, veniam.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias sunt cumque, eaque impedit necessitatibus perspiciatis totam aspernatur quaerat blanditiis saepe esse accusamus fuga ea nam cum, quo provident et. Iure?
              </p>
              <img src="" alt="imagen1" />
            </div>
          </section>

          <section id="history" className="flex flex-col w-[70%] pb-4 border border-b-amber-400">
            <h1 className="text-[#F2B11C] text-center underline text-4xl mb-4">Nuestra Historia</h1>
            <div className="grid grid-cols-2 mt-3 gap-4">
              <img src="" alt="imagen1" />
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga, ipsam obcaecati. Perferendis ex, ducimus eum veniam fugit natus nulla voluptate quis a, consequatur deleniti voluptatibus reprehenderit tempora cupiditate eius fugiat.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis doloribus maxime facere exercitationem totam unde odit quisquam, neque tenetur ipsam quis quam tempora hic soluta modi deleniti? Placeat, doloremque rem.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod debitis, dolores nemo magnam quae hic iste? Inventore voluptatum quis perspiciatis itaque consequuntur obcaecati quae iure nobis at tempora? Voluptates, veniam.
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias sunt cumque, eaque impedit necessitatibus perspiciatis totam aspernatur quaerat blanditiis saepe esse accusamus fuga ea nam cum, quo provident et. Iure?
              </p>
            </div>
          </section>

        </main>

        <footer className="py-4 bg-[#11332C]">
          <div className="flex flex-row justify-center items-center">
            <p className="text-[#F2B11C] mx-2 text-sm">
              &copy;&nbsp; {actualYear}&nbsp; Malbec Connected
            </p>
            <p className="text-[#F2B11C] mx-2 text-sm">Todos los derechos reservados</p>
          </div>
        </footer>
    </body>
  )
}
