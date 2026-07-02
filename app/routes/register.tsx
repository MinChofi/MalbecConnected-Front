import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { apiClient, getErrorMessage } from "~/lib/apiClient";
import { saveToken, type AuthUser } from "~/lib/auth";

interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      return "El usuario es obligatorio";
    }

    if (!password) {
      return "La contraseña es obligatoria";
    }

    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    if (!confirmPassword) {
      return "Tenés que confirmar la contraseña";
    }

    if (password !== confirmPassword) {
      return "Las contraseñas no coinciden";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          username: username.trim(),
          password,
        },
      });

      saveToken(response.token);
      void navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#F2B11C]/20 p-6 rounded-xl shadow-md w-100 space-y-4 text-[#11332C]/90"
      >
        <h2 className="text-xl font-bold text-center">Registrarse</h2>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-center items-center gap-2">
          <label htmlFor="UserInput" className="w-1/3">
            Usuario:
          </label>
          <input
            id="UserInput"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ingrese su usuario"
            className="p-2 border border-black rounded w-2/3"
            autoComplete="username"
            required
          />
        </div>

        <div className="flex justify-center items-center gap-2">
          <label htmlFor="PasswordInput" className="w-1/3">
            Contraseña:
          </label>
          <input
            id="PasswordInput"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingrese su contraseña"
            className="p-2 border border-black rounded w-2/3"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="flex justify-center items-center gap-2">
          <label htmlFor="ConfirmPasswordInput" className="w-1/3">
            Confirmar contraseña:
          </label>
          <input
            id="ConfirmPasswordInput"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirme su contraseña"
            className="p-2 border border-black rounded w-2/3"
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#F2B11C] p-2 rounded hover:bg-[#F2B11C]/70 text-white mt-6 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Registrando..." : "Registrarse"}
        </button>

        <div className="flex flex-row gap-2 justify-center items-center mt-4">
          <p className="text-black text-sm">¿Ya tienes cuenta?</p>
          <Link to="/login" className="hover:text-[#F2B11C]">
            Iniciar Sesión
          </Link>
        </div>
      </form>
    </div>
  );
}