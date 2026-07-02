import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { ProtectedRoute } from "~/components/ProtectedRoute";
import { removeToken } from "~/lib/auth";
import {
  getBusinessProfile,
  saveBusinessProfile,
  type BusinessProfile,
} from "~/lib/profile";

type ProfileField = keyof BusinessProfile;

const emptyProfile: BusinessProfile = {
  fantasyName: "",
  address: "",
  phone: "",
  contactEmail: "",
};

const profileFields: Array<{
  id: string;
  label: string;
  field: ProfileField;
  type: string;
}> = [
  {
    id: "businessFantasyName",
    label: "Nombre de fantasia",
    field: "fantasyName",
    type: "text",
  },
  {
    id: "businessAddress",
    label: "Direccion",
    field: "address",
    type: "text",
  },
  {
    id: "businessPhone",
    label: "Telefono",
    field: "phone",
    type: "tel",
  },
  {
    id: "businessContactEmail",
    label: "Correo de contacto",
    field: "contactEmail",
    type: "email",
  },
];

const normalizeProfile = (profile: BusinessProfile): BusinessProfile => ({
  fantasyName: profile.fantasyName.trim(),
  address: profile.address.trim(),
  phone: profile.phone.trim(),
  contactEmail: profile.contactEmail.trim(),
});

export function meta() {
  return [
    { title: "Perfil | Malbec Connected" },
    {
      name: "description",
      content: "Perfil privado del local en Malbec Connected",
    },
  ];
}

function ProfileContent() {
  const navigate = useNavigate();
  const [savedProfile, setSavedProfile] =
    useState<BusinessProfile>(emptyProfile);
  const [form, setForm] = useState<BusinessProfile>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const storedProfile = getBusinessProfile();

    setSavedProfile(storedProfile);
    setForm(storedProfile);
  }, []);

  const updateField = (field: ProfileField, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(savedProfile);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedProfile = normalizeProfile(form);

    if (!normalizedProfile.fantasyName) {
      setErrorMessage("Completa el nombre de fantasia antes de guardar.");
      return;
    }

    saveBusinessProfile(normalizedProfile);
    setSavedProfile(normalizedProfile);
    setForm(normalizedProfile);
    setSuccessMessage("Perfil guardado correctamente.");
    setIsEditing(false);
  };

  const handleLogout = () => {
    removeToken();
    void navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FCF9F6]">
      <header className="bg-[#11332C] px-4 py-3">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-bold text-[#F2B11C]">
            Malbec Connected
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/dashboard"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-[#F2B11C] px-3 py-1 text-sm font-semibold text-[#11332C] hover:bg-[#d99b12]"
            >
              Cerrar sesion
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <section className="rounded-lg border border-[#11332C]/10 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#F2B11C]">
              Perfil del local
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#11332C]">
              Datos minimos de contacto
            </h1>
          </div>

          {errorMessage ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          <form onSubmit={handleSave} className="space-y-4">
            {profileFields.map((profileField) => (
              <div key={profileField.field}>
                <label
                  htmlFor={profileField.id}
                  className="text-sm font-semibold text-[#11332C]"
                >
                  {profileField.label}
                </label>
                <input
                  id={profileField.id}
                  type={profileField.type}
                  value={form[profileField.field]}
                  readOnly={!isEditing}
                  onChange={(event) =>
                    updateField(profileField.field, event.target.value)
                  }
                  className={`mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C] ${
                    isEditing ? "bg-white" : "bg-[#FCF9F6]"
                  }`}
                />
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="rounded-md bg-[#F2B11C] px-4 py-2 font-semibold text-[#11332C] hover:bg-[#d99b12]"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-md border border-[#11332C]/20 px-4 py-2 font-semibold text-[#11332C] hover:bg-[#11332C]/5"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded-md bg-[#F2B11C] px-4 py-2 font-semibold text-[#11332C] hover:bg-[#d99b12]"
                >
                  Editar
                </button>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
