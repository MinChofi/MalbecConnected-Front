import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";

import { getErrorMessage } from "~/lib/apiClient";
import {
  getBusinessProfile,
  type BusinessProfile,
} from "~/lib/profile";
import {
  createPublicationComment,
  getPublication,
  type Publication,
} from "~/lib/publications";

type DetailStatus = "loading" | "success" | "error";

const emptyProfile: BusinessProfile = {
  fantasyName: "",
  address: "",
  phone: "",
  contactEmail: "",
};

const formatRating = (rating: number) =>
  rating > 0 ? rating.toFixed(1) : "Sin puntuar";

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
    { label: "Direccion", value: businessProfile.address.trim() },
    { label: "Telefono", value: businessProfile.phone.trim() },
  ].filter((item) => item.value);

export function meta() {
  return [
    { title: "Publicación | Malbec Connected" },
    {
      name: "description",
      content: "Detalle público de publicación en Malbec Connected",
    },
  ];
}

export default function PublicationDetail() {
  const { id } = useParams();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile>(emptyProfile);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPublication = useCallback(
    async (showLoading = true) => {
      if (!id) {
        setErrorMessage("No se encontró la publicación solicitada.");
        setStatus("error");
        return;
      }

      if (showLoading) {
        setStatus("loading");
      }

      setErrorMessage("");

      try {
        const data = await getPublication(id);
        setPublication(data);
        setStatus("success");
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        setStatus("error");
      }
    },
    [id]
  );

  useEffect(() => {
    void loadPublication();
  }, [loadPublication]);

  useEffect(() => {
    setBusinessProfile(getBusinessProfile());
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const normalizedName = name.trim();
    const normalizedComment = comment.trim();
    const parsedRating = Number(rating);

    if (!normalizedName) {
      setFormError("Ingresá tu nombre.");
      return;
    }

    if (!normalizedComment) {
      setFormError("Ingresá un comentario.");
      return;
    }

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      setFormError("La puntuación debe estar entre 1 y 5.");
      return;
    }

    if (!id) {
      setFormError("No se encontró la publicación solicitada.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPublicationComment(id, {
        name: normalizedName,
        comment: normalizedComment,
        rating: parsedRating,
      });
      setName("");
      setComment("");
      setRating("5");
      setSuccessMessage("Comentario publicado correctamente.");
      await loadPublication(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessName = businessProfile.fantasyName.trim();
  const profileContactItems = getContactItems(businessProfile);
  const displayWineryName = publication
    ? businessName || publication.wineryName
    : "";

  return (
    <div className="min-h-screen bg-[#FCF9F6]">
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
              to="/forum"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Foro
            </Link>
            <Link
              to="/login"
              className="text-[#F2B11C] hover:text-[#F2B11C]/70 hover:underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/forum"
          className="text-sm font-semibold text-[#11332C] hover:text-[#F2B11C]"
        >
          Volver al foro
        </Link>

        {status === "loading" ? (
          <div className="mt-6 rounded-lg border border-[#F2B11C]/40 bg-white px-5 py-4 text-[#11332C] shadow-sm">
            Cargando publicación...
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            No se pudo cargar la publicación. {errorMessage}
          </div>
        ) : null}

        {status === "success" && publication ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <article className="overflow-hidden rounded-lg border border-[#11332C]/10 bg-white shadow-sm">
              {publication.imageUrl ? (
                <img
                  src={publication.imageUrl}
                  alt={publication.title}
                  className="h-80 w-full object-cover"
                />
              ) : (
                <div className="flex h-80 w-full items-center justify-center bg-[#11332C]/10 text-lg font-semibold text-[#11332C]/70">
                  Malbec Connected
                </div>
              )}

              <div className="space-y-5 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#F2B11C]">
                    {displayWineryName}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-[#11332C]">
                    {publication.title}
                  </h1>
                  <p className="mt-2 text-[#11332C]/75">
                    {publication.productName}
                  </p>
                </div>

                <p className="leading-7 text-gray-700">
                  {publication.description || "Sin descripción disponible."}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-[#11332C]/80">
                  <span>Puntaje promedio: {formatRating(publication.averageRating)}</span>
                  <span>{publication.commentsCount} comentarios</span>
                  <span>{publication.ratingsCount} valoraciones</span>
                </div>

                {profileContactItems.length > 0 ? (
                  <div className="flex flex-wrap gap-3 border-t border-[#11332C]/10 pt-4 text-sm text-[#11332C]/70">
                    {profileContactItems.map((item) => (
                      <span key={item.label}>
                        {item.label}: {item.value}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>

            <aside className="space-y-6">
              <section className="rounded-lg border border-[#11332C]/10 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-[#11332C]">
                  Comentar y puntuar
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {formError ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  ) : null}

                  {successMessage ? (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      {successMessage}
                    </div>
                  ) : null}

                  <div>
                    <label
                      htmlFor="commentName"
                      className="text-sm font-semibold text-[#11332C]"
                    >
                      Nombre
                    </label>
                    <input
                      id="commentName"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="commentText"
                      className="text-sm font-semibold text-[#11332C]"
                    >
                      Comentario
                    </label>
                    <textarea
                      id="commentText"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="commentRating"
                      className="text-sm font-semibold text-[#11332C]"
                    >
                      Puntuación
                    </label>
                    <select
                      id="commentRating"
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[#11332C]/20 px-3 py-2 text-[#11332C] outline-none focus:border-[#F2B11C]"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-[#F2B11C] px-4 py-2 font-semibold text-[#11332C] transition hover:bg-[#d99b12] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Publicando..." : "Publicar comentario"}
                  </button>
                </form>
              </section>

              <section className="rounded-lg border border-[#11332C]/10 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-[#11332C]">
                  Comentarios
                </h2>

                {publication.comments.length === 0 ? (
                  <p className="mt-4 text-sm text-[#11332C]/70">
                    Todavía no hay comentarios para esta publicación.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {publication.comments.map((publicationComment) => {
                      const formattedDate = formatDate(
                        publicationComment.createdAt
                      );

                      return (
                        <article
                          key={publicationComment.id}
                          className="rounded-md border border-[#11332C]/10 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-[#11332C]">
                              {publicationComment.name}
                            </h3>
                            <span className="text-sm text-[#11332C]/70">
                              {publicationComment.rating}/5
                            </span>
                          </div>
                          {formattedDate ? (
                            <p className="mt-1 text-xs text-[#11332C]/50">
                              {formattedDate}
                            </p>
                          ) : null}
                          <p className="mt-3 text-sm leading-6 text-gray-700">
                            {publicationComment.comment}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
