import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router";

import { ConfirmModal } from "~/components/ConfirmModal";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { getErrorMessage, getFieldErrors } from "~/lib/apiClient";
import { clearSession, getCurrentUser } from "~/lib/auth";
import {
  getBusinessProfile,
  saveBusinessProfile,
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

const MAX_DESCRIPTION_LENGTH = 1500;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const DATA_IMAGE_URL_PATTERN = /^data:image\/(?:png|jpeg);base64,/;
const FANTASY_NAME_ERROR =
  "Configura el Nombre de fantasía desde Perfil antes de publicar.";

type FormState = {
  title: string;
  productName: string;
  description: string;
  imageUrl: string;
  category: string;
  type: string;
  price: string;
  publicationDate: string;
};

type FormErrors = Partial<
  Record<keyof FormState | "wineryName" | "_form", string>
>;

const emptyForm: FormState = {
  title: "",
  productName: "",
  description: "",
  imageUrl: "",
  category: "",
  type: "",
  price: "",
  publicationDate: "",
};

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeBusinessProfile = (
  profile?: Partial<BusinessProfile>
): BusinessProfile => ({
  fantasyName: getString(profile?.fantasyName),
  address: getString(profile?.address),
  phone: getString(profile?.phone),
  contactEmail: getString(profile?.contactEmail),
});

const formatOptionalNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const getPublicationDateForForm = (publication: Publication) =>
  publication.publicationDate ?? publication.createdAt ?? new Date().toISOString();

const getFormFromPublication = (publication: Publication): FormState => ({
  title: publication.title,
  productName: publication.productName,
  description: publication.description,
  imageUrl: publication.imageUrl ?? "",
  category: publication.category ?? "",
  type: publication.type ?? "",
  price: formatOptionalNumber(publication.price),
  publicationDate: getPublicationDateForForm(publication),
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

const parseOptionalNumber = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return { value: undefined };
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return { error: "El precio debe ser un numero valido." };
  }

  return { value: parsedValue };
};

const isDataImageUrl = (value: string) => DATA_IMAGE_URL_PATTERN.test(value);

const buildPayload = (
  form: FormState,
  businessProfile: BusinessProfile,
  editingPublication: Publication | null
) => {
  const errors: FormErrors = {};
  const title = form.title.trim();
  const wineryName = businessProfile.fantasyName.trim();
  const productName = form.productName.trim();
  const description = form.description.trim();
  const imageUrl = form.imageUrl.trim();
  const category = form.category.trim();
  const type = form.type.trim();
  const price = parseOptionalNumber(form.price);
  const publicationDate = form.publicationDate.trim() || new Date().toISOString();
  const parsedPublicationDate = new Date(publicationDate);
  const existingImageUrl = editingPublication?.imageUrl ?? "";
  const imageChanged = !editingPublication || imageUrl !== existingImageUrl;

  if (!wineryName) {
    errors.wineryName = FANTASY_NAME_ERROR;
  }

  if (!title) {
    errors.title = "El titulo es obligatorio.";
  }

  if (!productName) {
    errors.productName = "El producto es obligatorio.";
  }

  if (!description) {
    errors.description = "La descripcion es obligatoria.";
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = "La descripcion no puede superar los 1500 caracteres.";
  }

  if (imageUrl && !isDataImageUrl(imageUrl) && imageChanged) {
    errors.imageUrl = "La imagen debe ser JPG o PNG.";
  }

  if (!category) {
    errors.category = "La categoria es obligatoria.";
  }

  if (!type) {
    errors.type = "El tipo es obligatorio.";
  }

  if (price.error) {
    errors.price = price.error;
  } else if (price.value !== undefined && price.value < 0) {
    errors.price = "El precio debe ser mayor o igual a 0.";
  }

  if (Number.isNaN(parsedPublicationDate.getTime())) {
    errors.publicationDate = "La fecha no es valida.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload: PublicationMutationInput = {
    title,
    wineryName,
    productName,
    description,
    category,
    type,
    publicationDate: parsedPublicationDate.toISOString(),
  };

  if (imageUrl && isDataImageUrl(imageUrl) && imageChanged) {
    payload.imageUrl = imageUrl;
  }

  if (price.value !== undefined) {
    payload.price = price.value;
  }

  return { payload };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No se pudo leer la imagen."));
    };

    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });

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

const formatDate = (date?: string) => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};

const getContactItems = (businessProfile: BusinessProfile) =>
  [
    { label: "Correo", value: businessProfile.contactEmail.trim() },
    { label: "Dirección", value: businessProfile.address.trim() },
    { label: "Teléfono", value: businessProfile.phone.trim() },
  ].filter((item) => item.value);

const baseFieldClass =
  "mt-1 w-full rounded-md border px-3 py-2 text-[#11332C] outline-none";

function DashboardContent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile>(() => getBusinessProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingPublication, setEditingPublication] =
    useState<Publication | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const clearFieldError = (field: keyof FormErrors) => {
    setFormErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const getFieldClass = (field: keyof FormErrors) =>
    `${baseFieldClass} ${
      formErrors[field]
        ? "border-red-500 focus:border-red-500"
        : "border-[#11332C]/20 focus:border-[#F2B11C]"
    }`;

  const renderFieldError = (field: keyof FormErrors) =>
    formErrors[field] ? (
      <p className="mt-1 text-xs font-semibold text-red-600">
        {formErrors[field]}
      </p>
    ) : null;

  const loadBusinessProfile = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const profile = normalizeBusinessProfile(currentUser.profile);

      setBusinessProfile(profile);
      saveBusinessProfile(profile);

      if (profile.fantasyName.trim()) {
        clearFieldError("wineryName");
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }, []);

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
    void loadBusinessProfile();
  }, [loadBusinessProfile]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    clearFieldError(field);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingPublication(null);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setFormSuccess("");

    if (!file) {
      return;
    }

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        imageUrl: "La imagen debe ser JPG o PNG.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        imageUrl: "La imagen no puede superar los 2 MB.",
      }));
      event.target.value = "";
      return;
    }

    try {
      const imageUrl = await readFileAsDataUrl(file);
      updateField("imageUrl", imageUrl);
    } catch (error) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        imageUrl: getErrorMessage(error),
      }));
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const result = buildPayload(form, businessProfile, editingPublication);

    if (result.errors || !result.payload) {
      setFormErrors(result.errors ?? {});
      setFormError(result.errors?._form ?? "Revisa los datos ingresados.");
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      if (editingPublication) {
        await updatePublication(editingPublication.id, result.payload);
        setFormSuccess("Publicacion actualizada correctamente.");
      } else {
        await createPublication(result.payload);
        setFormSuccess("Publicacion creada correctamente.");
      }

      resetForm();
      await loadPublications(false);
    } catch (error) {
      const backendFieldErrors = getFieldErrors(error) as FormErrors;

      setFormErrors(backendFieldErrors);
      setFormError(backendFieldErrors._form ?? getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setForm(getFormFromPublication(publication));
    setFormErrors({});
    setFormError("");
    setFormSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    clearSession();
    void navigate("/", { replace: true });
  };

  const businessName = businessProfile.fantasyName.trim();
  const profileContactItems = getContactItems(businessProfile);
  const getDisplayWineryName = (publication: Publication) =>
    businessName || publication.wineryName;
  const wineryNameError = formErrors.wineryName ?? (!businessName ? FANTASY_NAME_ERROR : "");

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
              Cerrar sesion
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
              {editingPublication ? "Editar publicacion" : "Crear publicacion"}
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
              Configura el Nombre de fantasía desde{" "}
              <Link
                to="/profile"
                className="font-semibold text-[#11332C] underline hover:text-[#F2B11C]"
              >
                Perfil
              </Link>{" "}
              antes de publicar.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <input
              type="hidden"
              name="publicationDate"
              value={form.publicationDate}
              readOnly
            />

            <div>
              <label
                htmlFor="publicationTitle"
                className="text-sm font-semibold text-[#11332C]"
              >
                Titulo
              </label>
              <input
                id="publicationTitle"
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={getFieldClass("title")}
                aria-invalid={Boolean(formErrors.title)}
              />
              {renderFieldError("title")}
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
                className={getFieldClass("productName")}
                aria-invalid={Boolean(formErrors.productName)}
              />
              {renderFieldError("productName")}
              <p className="mt-1 text-xs text-[#11332C]/70">
                Local asociado: {businessName || "sin configurar"}
              </p>
              {wineryNameError ? (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {wineryNameError}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="publicationDescription"
                className="text-sm font-semibold text-[#11332C]"
              >
                Descripcion
              </label>
              <textarea
                id="publicationDescription"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className={getFieldClass("description")}
                aria-invalid={Boolean(formErrors.description)}
              />
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                {renderFieldError("description")}
                <span className="ml-auto text-xs text-[#11332C]/60">
                  {form.description.length} / {MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="publicationImage"
                className="text-sm font-semibold text-[#11332C]"
              >
                Imagen
              </label>
              <input
                id="publicationImage"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => void handleImageChange(event)}
                className={getFieldClass("imageUrl")}
                aria-invalid={Boolean(formErrors.imageUrl)}
              />
              {renderFieldError("imageUrl")}

              {form.imageUrl ? (
                <div className="mt-3 overflow-hidden rounded-md border border-[#11332C]/10">
                  <img
                    src={form.imageUrl}
                    alt={form.title || "Preview de publicacion"}
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="publicationCategory"
                  className="text-sm font-semibold text-[#11332C]"
                >
                  Categoria
                </label>
                <select
                  id="publicationCategory"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className={getFieldClass("category")}
                  aria-invalid={Boolean(formErrors.category)}
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
                {renderFieldError("category")}
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
                  className={getFieldClass("type")}
                  aria-invalid={Boolean(formErrors.type)}
                >
                  <option value="">Seleccionar tipo</option>
                  {getPublicationTypeOptions(form.type).map((typeOption) => (
                    <option key={typeOption} value={typeOption}>
                      {typeOption}
                    </option>
                  ))}
                </select>
                {renderFieldError("type")}
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
                  min={0}
                  step={100}
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className={getFieldClass("price")}
                  aria-invalid={Boolean(formErrors.price)}
                />
                {renderFieldError("price")}
              </div>

              <div className="flex items-end">
                {renderFieldError("publicationDate")}
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
                    : "Crear publicacion"}
              </button>
              {editingPublication ? (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="rounded-md border border-[#11332C]/20 px-4 py-2 font-semibold text-[#11332C] hover:bg-[#11332C]/5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancelar edicion
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
                Mis Publicaciones
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
              Todavia no hay publicaciones cargadas.
            </div>
          ) : null}

          {!isLoading && publications.length > 0 ? (
            <div className="space-y-4">
              {publications.map((publication) => {
                const price = formatCurrency(publication.price);
                const publicationDate = formatDate(
                  publication.publicationDate ?? publication.createdAt
                );

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
                      {publication.description || "Sin descripcion disponible."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#11332C]/70">
                      {publication.category ? (
                        <span>Categoria: {publication.category}</span>
                      ) : null}
                      {publication.type ? <span>Tipo: {publication.type}</span> : null}
                      {price ? <span>Precio: {price}</span> : null}
                      {publicationDate ? <span>Fecha: {publicationDate}</span> : null}
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
        title="Eliminar publicacion"
        description={`Seguro que queres eliminar "${
          deleteTarget?.title ?? "esta publicacion"
        }"? Esta accion tambien la quitara de la home publica.`}
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
