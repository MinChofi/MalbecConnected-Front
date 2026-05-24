import { Link } from "react-router";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <form className="bg-[#F2B11C]/20 p-6 rounded-xl shadow-md w-100 space-y-4 text-[#11332C]/90">
        <h2 className="text-xl font-bold text-center">Registrarse</h2>

        <div className="flex justify-center items-center gap-2">
          <label htmlFor="UserInput" className="w-1/3">Usuario:</label>
          <input
            id="UserInput"
            type="email"
            placeholder="Ingrese su email"
            className="p-2 border border-black rounded w-2/3"
          />
        </div>

        <div className="flex justify-center itmes-center gap-2">
          <label htmlFor="PasswordInput" className="w-1/3">Contraseña:</label>
          <input
            id="PasswordInput"
            type="password"
            placeholder="Ingrese su contraseña"
            className="p-2 border border-black rounded w-2/3"
          />
        </div>

        <div className="flex justify-center itmes-center gap-2">
          <label htmlFor="PasswordInput" className="w-1/3">Confirmar contraseña:</label>
          <input
            id="PasswordInput"
            type="password"
            placeholder="Confirme su contraseña"
            className="p-2 border border-black rounded w-2/3"
          />
        </div>

        <button className="w-full bg-[#F2B11C] p-2 rounded hover:bg-[#F2B11C]/70 text-white mt-6">
          Entrar
        </button>

        <div className="flex flex-row gap-2 justify-center items-center mt-4">
          <p className="text-black text-sm">
            ¿Ya tienes cuenta?
          </p>
          <Link to="/login" className="hover:text-[#F2B11C]">Iniciar Sesión</Link>
        </div>
      </form>
    </div>
  );
}