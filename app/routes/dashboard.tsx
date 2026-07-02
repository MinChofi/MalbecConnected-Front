import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router";

import { ConfirmModal } from "~/components/ConfirmModal";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { getErrorMessage } from "~/lib/apiClient";
import { removeToken } from "~/lib/auth";
import {
  getBusinessProfile,
  type BusinessProfile,
} from "~/lib/profile";
import {
  createPublication,
  deletePublication,
  getPublications,
  updatePublication,
  type Publication,
  type PublicationMutationInput,
} from "~/lib/publications";

type FormState = {
  title: string;
  productName: string;
  description: string;
  imageUrl: string;
  category: string;
  type: string;
  price: string;
  year: string;
};

const emptyForm: FormState = {
  title: "",
  productName: "",
  description: "",
  imageUrl: "",
  category: "",
  type: "",
  price: "",
  year: "",
};

const formatOptionalNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const getFormFromPublication = (publication: Publication): FormState => ({
  title: publication.title,
  productName: publication.productName,
  description: publication.description,
  imageUrl: publication.imageUrl ?? "",
  category: publication.category ?? "",
  type: publication.type ?? "",
  price: formatOptionalNumber(publication.price),
  year: formatOptionalNumber(publication.year),
});

const publicationTypeOptions = [
  "Tinto",
  "Blanco",
  "Rosado",
  "Espumante",
  "Otro",
];

const getPublicationTypeOptions = (currentType: string) => {
  const normalizedType = currentType.trim();

  if (!normalizedType || publicationTypeOptions.includes(normalizedType)) {
    return publicationTypeOptions;
  }

  return [...publicationTypeOptions, normalizedType];
};

const publicationCategoryOptions = [
  "Recomendación",
  "Consulta",
  "Reseña",
  "Evento",
  "Compra/Venta",
  "Otro",
];

const getPublicationCategoryOptions = (currentCategory: string) => {
  const normalizedCategory = currentCategory.trim();

  if (
    !normalizedCategory ||
    publicationCategoryOptions.includes(normalizedCategory)
  ) {
    return publicationCategoryOptions;
  }

  return [...publicationCategoryOptions, normalizedCategory];
};

const parseOptionalNumber = (value: string, label: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return { value: undefined };
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return { error: `${label} debe ser un número válido.` };
  }

  return { value: parsedValue };
};

const buildPayload = (form: FormState, businessProfile: BusinessProfile) => {
  const title = form.title.trim();
  const wineryName = businessProfile.fantasyName.trim();
  const productName = form.productName.trim();
  const description = form.description.trim();
  const imageUrl = form.imageUrl.trim();
  const category = form.category.trim();
  const type = form.type.trim();
  const price = parseOptionalNumber(form.price, "El precio");
  const year = parseOptionalNumber(form.year, "El año");

  if (!wineryName) {
    return {
      error: "Configura el nombre de fantasia desde Perfil antes de publicar.",
    };
  }

  if (!title || !productName || !description) {
    return {
      error: "Completa titulo, producto y descripcion antes de guardar.",
    };
  }

  if (price.error) {
    return { error: price.error };
  }

  if (year.error) {
    return { error: year.error };
  }

  const payload: PublicationMutationInput = {
    title,
    wineryName,
    productName,
    description,
  };

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }

  if (category) {
    payload.category = category;
  }

  if (type) {
    payload.type = type;
  }

  if (price.value !== undefined) {
    payload.price = price.value;
  }

  if (year.value !== undefined) {
    payload.year = year.value;
  }

  return { payload };
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
};

const getContactItems = (businessProfile: BusinessProfile) =>
  [
    { label: "Correo", value: businessProfile.contactEmail.trim() },
    { label: "Direccion", value: businessProfile.address.trim() },
    { label: "Telefono", value: businessProfile.phone.trim() },
  ].filter((item) => item.value);

function DashboardContent() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile>(() => getBusinessProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingPublication, setEditingPublication] =
    useState<Publication | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPublications = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setListError("");

    try {
      const data = await getPublications();
      setPublications(data);
    } catch (error) {
      setListError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPublications();
  }, [loadPublications]);

  useEffect(() => {
    setBusinessProfile(getBusinessProfile());
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPublication(null);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const result = buildPayload(form, businessProfile);

    if (result.error || !result.payload) {
      setFormError(result.error ?? "Revisá los datos ingresados.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingPublication) {
        await updatePublication(editingPublication.id, result.payload);
        setFormSuccess("Publicación actualizada correctamente.");
      } else {
        await createPublication(result.payload);
        setFormSuccess("Publicación creada correctamente.");
      }

      resetForm();
      await loadPublications(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setForm(getFormFromPublication(publication));
    setFormError("");
    setFormSuccess("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      await deletePublication(deleteTarget.id);
      setDeleteTarget(null);
      await loadPublications(false);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    void navigate("/", { replace: true });
  };

  const businessName = businessProfile.fantasyName.trim();
  const profileContactItems = getContactItems(businessProfile);
  const getDisplayWineryName = (publication: Publication) =>
    businessName || publication.wineryName;

  return (
    <div className="min-h-screen bg-[#FCF9F6]">
      <header className="bg-[#11332C] px-4 py-3">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-bold text-[#F2B11C]">
            Malbec Connected
          </Link>
          <div className="flex flex-wrap items-center gap-4">
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
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-[#11332C]/10 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#F2B11C]">
              Panel privado
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#11332C]">
              {editingPublication ? "Editar publicación" : "Crear publicación"}
            </h1>
          </div>

          {formError ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          {formSuccess ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {formSuccess}
            </div>
          ) : null}

          {!businessName ? (
            <div className="mb-4 rounded-md border border-[#F2B11C]/40 bg-[#FCF9F6] px-3 py-2 text-sm text-[#11332C]">
              Configura el nombre de fantasia desde{" "}
              <Link
                to="/profile"
                className="font-semibold text-[#11332C] underline hover:text-[#F2B11C]"
              >
                Perfil
              </Link>{" "}
              antes de publicar.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="publicationTitle"
                className="text-sm font-semibold text-[#11332C]"
              >
                Título
              </label>
              <input
                id="publicationTitle"
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="publicationProduct"
                className="text-sm font-semibold text-[#11332C]"
              >
                Producto
              </label>
              <input
                id="publicationProduct"
                type="text"
                value={form.productName}
                onChange={(event) =>
                  updateField("productName", event.target.value)
                }
                className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                required
              />
              <p className="mt-1 text-xs text-[#11332C]/70">
                Local asociado: {businessName || "sin configurar"}
              </p>
            </div>

            <div>
              <label
                htmlFor="publicationDescription"
                className="text-sm font-semibold text-[#11332C]"
              >
                Descripción
              </label>
              <textarea
                id="publicationDescription"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="publicationImage"
                className="text-sm font-semibold text-[#11332C]"
              >
                Imagen URL
              </label>
              <input
                id="publicationImage"
                type="url"
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="publicationCategory"
                  className="text-sm font-semibold text-[#11332C]"
                >
                  Categoría
                </label>
                <select
                  id="publicationCategory"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                >
                  <option value="">Seleccionar categoria</option>
                  {getPublicationCategoryOptions(form.category).map(
                    (categoryOption) => (
                      <option key={categoryOption} value={categoryOption}>
                        {categoryOption}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="publicationType"
                  className="text-sm font-semibold text-[#11332C]"
                >
                  Tipo
                </label>
                <select
                  id="publicationType"
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                >
                  <option value="">Seleccionar tipo</option>
                  {getPublicationTypeOptions(form.type).map((typeOption) => (
                    <option key={typeOption} value={typeOption}>
                      {typeOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="publicationPrice"
                  className="text-sm font-semibold text-[#11332C]"
                >
                  Precio
                </label>
                <input
                  id="publicationPrice"
                  type="number"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                />
              </div>

              <div>
                <label
                  htmlFor="publicationYear"
                  className="text-sm font-semibold text-[#11332C]"
                >
                  Año
                </label>
                <input
                  id="publicationYear"
                  type="number"
                  value={form.year}
                  onChange={(event) => updateField("year", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || !businessName}
                className="rounded-md bg-[#F2B11C] px-4 py-2 font-semibold text-[#11332C] hover:bg-[#d99b12] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving
                  ? "Guardando..."
                  : editingPublication
                    ? "Guardar cambios"
                    : "Crear publicación"}
              </button>
              {editingPublication ? (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="rounded-md border border-[#11332C]/20 px-4 py-2 font-semibold text-[#11332C] hover:bg-[#11332C]/5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-[#11332C]/10 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#F2B11C]">
                Publicaciones
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#11332C]">
                Catálogo administrable
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void loadPublications()}
              disabled={isLoading}
              className="rounded-md border border-[#11332C]/20 px-3 py-2 text-sm font-semibold text-[#11332C] hover:bg-[#11332C]/5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Actualizar
            </button>
          </div>

          {listError ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {listError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-md border border-[#F2B11C]/40 bg-[#FCF9F6] px-4 py-3 text-[#11332C]">
              Cargando publicaciones...
            </div>
          ) : null}

          {!isLoading && publications.length === 0 ? (
            <div className="rounded-md border border-[#11332C]/10 bg-[#FCF9F6] px-4 py-3 text-[#11332C]">
              Todavía no hay publicaciones cargadas.
            </div>
          ) : null}

          {!isLoading && publications.length > 0 ? (
            <div className="space-y-4">
              {publications.map((publication) => {
                const price = formatCurrency(publication.price);

                return (
                  <article
                    key={publication.id}
                    className="rounded-md border border-[#11332C]/10 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#F2B11C]">
                          {getDisplayWineryName(publication)}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-[#11332C]">
                          {publication.title}
                        </h3>
                        <p className="text-sm text-[#11332C]/70">
                          {publication.productName}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(publication)}
                          className="rounded-md border border-[#11332C]/20 px-3 py-1 text-sm font-semibold text-[#11332C] hover:bg-[#11332C]/5"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(publication);
                          }}
                          className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-700">
                      {publication.description || "Sin descripción disponible."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#11332C]/70">
                      {publication.category ? (
                        <span>Categoría: {publication.category}</span>
                      ) : null}
                      {publication.type ? <span>Tipo: {publication.type}</span> : null}
                      {price ? <span>Precio: {price}</span> : null}
                      {publication.year ? <span>Año: {publication.year}</span> : null}
                      <span>{publication.commentsCount} comentarios</span>
                    </div>

                    {profileContactItems.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-3 border-t border-[#11332C]/10 pt-3 text-xs text-[#11332C]/70">
                        {profileContactItems.map((item) => (
                          <span key={item.label}>
                            {item.label}: {item.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>

      {deleteError ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          {deleteError}
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Eliminar publicación"
        description={`¿Seguro que querés eliminar "${
          deleteTarget?.title ?? "esta publicación"
        }"? Esta acción también la quitará de la home pública.`}
        confirmLabel="Eliminar"
        isConfirming={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
