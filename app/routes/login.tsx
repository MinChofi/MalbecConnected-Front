import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { apiClient, getErrorMessage } from "~/lib/apiClient";
import {
  getStoredUser,
  getToken,
  setSession,
  type AuthUser,
} from "~/lib/auth";

interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getRedirectPath = (state: unknown) => {
  if (
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    typeof state.from === "string"
  ) {
    return state.from;
  }

  return "/";
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = getRedirectPath(location.state);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(() =>
    Boolean(getToken())
  );

  useEffect(() => {
    let isMounted = true;

    if (!getToken()) {
      return;
    }

    void (async () => {
      try {
        const currentUser = await getStoredUser();

        if (isMounted && currentUser) {
          void navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.error("Error verificando sesión en login:", error);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigate, redirectPath]);

  const validateForm = () => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return "Ingresá tu email o usuario.";
    }

    if (!password) {
      return "Ingresá tu contraseña.";
    }

    if (normalizedUsername.includes("@") && !emailRegex.test(normalizedUsername)) {
      return "Ingresá un email válido o un usuario sin @.";
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
      const response = await apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: {
          username: username.trim(),
          password,
        },
      });

      setSession(response.token, response.user);
      void navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <p className="rounded-xl bg-[#F2B11C]/20 px-6 py-4 text-[#11332C]/90 shadow-md">
          Verificando sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-[#F2B11C]/20 p-6 text-[#11332C]/90 shadow-md"
      >
        <h2 className="text-center text-xl font-bold">Iniciar sesión</h2>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="UserInput" className="text-sm font-semibold">
            Email o usuario
          </label>
          <input
            id="UserInput"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ingrese su email o usuario"
            className="mt-1 w-full rounded border border-black p-2"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="PasswordInput" className="text-sm font-semibold">
            Contraseña
          </label>
          <input
            id="PasswordInput"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingrese su contraseña"
            className="mt-1 w-full rounded border border-black p-2"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded bg-[#F2B11C] p-2 text-white hover:bg-[#F2B11C]/70 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Ingresando..." : "Entrar"}
        </button>
        <Link
          to="/"
          className="block w-full rounded border border-[#11332C]/30 p-2 text-center text-sm font-semibold text-[#11332C] transition hover:border-[#11332C]/60 hover:bg-white/60"
        >
          Volver
        </Link>

        <div className="mt-4 flex flex-row items-center justify-center gap-2">
          <p className="text-sm text-black">¿No tenés cuenta?</p>
          <Link to="/register" className="hover:text-[#F2B11C]">
            Registrate
          </Link>
        </div>
      </form>
    </div>
  );
}
