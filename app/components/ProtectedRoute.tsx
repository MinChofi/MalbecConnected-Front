import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { getStoredUser, getToken } from "~/lib/auth";
import { getErrorMessage } from "~/lib/apiClient";

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "error";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!getToken()) {
      setStatus("unauthenticated");
      return;
    }

    void (async () => {
      try {
        const currentUser = await getStoredUser();

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
          setStatus("error");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FCF9F6] px-6">
        <p className="rounded-lg border border-[#F2B11C]/40 bg-white px-5 py-4 text-[#11332C] shadow-sm">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FCF9F6] px-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
          <h1 className="text-lg font-bold">No se pudo validar la sesión</h1>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
