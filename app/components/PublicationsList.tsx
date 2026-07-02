import { useEffect, useMemo, useState } from "react";

import { PublicationCard } from "~/components/PublicationCard";
import { getErrorMessage } from "~/lib/apiClient";
import { getPublications, type Publication } from "~/lib/publications";

type PublicationsStatus = "loading" | "success" | "error";

const getPublicationTimestamp = (publication: Publication) => {
  if (!publication.createdAt) {
    return null;
  }

  const timestamp = new Date(publication.createdAt).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
};

export function PublicationsList() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [status, setStatus] = useState<PublicationsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const data = await getPublications();

        if (isMounted) {
          setPublications(data);
          setStatus("success");
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

  const sortedPublications = useMemo(
    () =>
      [...publications].sort((firstPublication, secondPublication) => {
        const firstTimestamp = getPublicationTimestamp(firstPublication);
        const secondTimestamp = getPublicationTimestamp(secondPublication);

        if (firstTimestamp === null && secondTimestamp === null) {
          return 0;
        }

        if (firstTimestamp === null) {
          return 1;
        }

        if (secondTimestamp === null) {
          return -1;
        }

        return secondTimestamp - firstTimestamp;
      }),
    [publications]
  );

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-[#F2B11C]/40 bg-white px-5 py-4 text-[#11332C] shadow-sm">
        Cargando publicaciones...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
        No se pudieron cargar las publicaciones. {errorMessage}
      </div>
    );
  }

  if (sortedPublications.length === 0) {
    return (
      <div className="rounded-lg border border-[#11332C]/10 bg-white px-5 py-4 text-[#11332C] shadow-sm">
        Todavia no hay publicaciones disponibles.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sortedPublications.map((publication) => (
        <PublicationCard key={publication.id} publication={publication} />
      ))}
    </div>
  );
}
