import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";

import {
  clearSession,
  getCachedUser,
  getStoredUser,
  getToken,
  SESSION_CHANGE_EVENT,
  type AuthUser,
} from "~/lib/auth";

interface PublicLayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export function PublicNavbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    getToken() ? getCachedUser() : null
  );
  const [isCheckingSession, setIsCheckingSession] = useState(() =>
    Boolean(getToken() && !getCachedUser())
  );

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      if (!getToken()) {
        setCurrentUser(null);
        setIsCheckingSession(false);
        return;
      }

      const cachedUser = getCachedUser();

      setCurrentUser(cachedUser);
      setIsCheckingSession(!cachedUser);

      try {
        const user = await getStoredUser();

        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error verificando sesion publica:", error);

        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    const handleSessionChange = () => {
      void syncSession();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === "malbecconnected_token" ||
        event.key === "malbecconnected_user"
      ) {
        void syncSession();
      }
    };

    void syncSession();
    window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    void navigate("/", { replace: true });
  };

  return (
    <header className="bg-[#11332C] px-4 py-3">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="font-bold text-[#F2B11C]">
          Malbec Connected
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
          >
            Inicio
          </Link>
          <Link
            to="/about-us"
            className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
          >
            About us
          </Link>

          {isCheckingSession ? (
            <span className="text-sm text-[#F2B11C]/80">Verificando sesion...</span>
          ) : currentUser ? (
            <>
              <Link
                to="/profile"
                className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
              >
                Perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-[#F2B11C] px-3 py-1 text-sm font-semibold text-[#11332C] hover:bg-[#d99b12]"
              >
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
              >
                Iniciar sesion
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-[#F2B11C] bg-[#F2B11C] px-3 py-1 text-sm font-semibold text-[#11332C] hover:bg-[#FCF9F6]"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export function PublicFooter() {
  const actualYear = new Date().getFullYear();

  return (
    <footer className="bg-[#11332C] py-4">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4">
        <p className="text-sm text-[#F2B11C]">
          &copy;&nbsp; {actualYear}&nbsp; Malbec Connected
        </p>
        <p className="text-sm text-[#F2B11C]">
          Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}

export function PublicLayout({
  children,
  mainClassName = "flex flex-1 flex-col",
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FCF9F6]">
      <PublicNavbar />
      <main className={mainClassName}>{children}</main>
      <PublicFooter />
    </div>
  );
}
