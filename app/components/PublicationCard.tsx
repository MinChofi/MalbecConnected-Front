import { Link } from "react-router";

import type { Publication } from "~/lib/publications";

interface PublicationCardProps {
  publication: Publication;
}

const formatRating = (rating: number) =>
  rating > 0 ? rating.toFixed(1) : "Sin puntuar";

const getShortDescription = (description: string) => {
  if (description.length <= 150) {
    return description;
  }

  return `${description.slice(0, 147).trim()}...`;
};

const getContactItems = (publication: Publication) =>
  [
    { label: "Correo", value: publication.contactEmail?.trim() },
    { label: "Dirección", value: publication.address?.trim() },
    { label: "Teléfono", value: publication.phone?.trim() },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value));

export function PublicationCard({ publication }: PublicationCardProps) {
  const contactItems = getContactItems(publication);
  const displayWineryName = publication.businessName || publication.wineryName;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#11332C]/10 bg-white shadow-sm">
      {publication.imageUrl ? (
        <img
          src={publication.imageUrl}
          alt={publication.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-[#11332C]/10 text-sm font-semibold text-[#11332C]/70">
          Malbec Connected
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-semibold text-[#F2B11C]">
            {displayWineryName}
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#11332C]">
            {publication.title}
          </h2>
          <p className="mt-1 text-sm text-[#11332C]/70">
            {publication.productName}
          </p>
        </div>

        <p className="flex-1 text-sm leading-6 text-gray-700">
          {publication.description
            ? getShortDescription(publication.description)
            : "Sin descripción disponible."}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[#11332C]/80">
          <span>Puntaje: {formatRating(publication.averageRating)}</span>
          <span>
            {publication.commentsCount}{" "}
            {publication.commentsCount === 1 ? "comentario" : "comentarios"}
          </span>
        </div>

        {contactItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-[#11332C]/10 pt-3 text-xs text-[#11332C]/70">
            {contactItems.map((item) => (
              <span key={item.label}>
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          to={`/publicaciones/${encodeURIComponent(publication.id)}`}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-[#F2B11C] px-4 py-2 text-sm font-semibold text-[#11332C] transition hover:bg-[#d99b12]"
        >
          Ver publicación
        </Link>
      </div>
    </article>
  );
}
