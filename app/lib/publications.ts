import { apiClient } from "./apiClient";

const PUBLICATIONS_PATH = "/api/publications";

type ApiRecord = Record<string, unknown>;

export interface PublicationComment {
  id: string;
  name: string;
  comment: string;
  rating: number;
  createdAt?: string;
}

export interface Publication {
  id: string;
  title: string;
  wineryName: string;
  productName: string;
  description: string;
  imageUrl?: string;
  category?: string;
  type?: string;
  price?: number;
  year?: number;
  averageRating: number;
  commentsCount: number;
  ratingsCount: number;
  comments: PublicationComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePublicationCommentInput {
  name: string;
  comment: string;
  rating: number;
}

export interface PublicationMutationInput {
  title: string;
  wineryName: string;
  productName: string;
  description: string;
  imageUrl?: string;
  category?: string;
  type?: string;
  price?: number;
  year?: number;
}

const isRecord = (value: unknown): value is ApiRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readPath = (source: ApiRecord, path: string) =>
  path.split(".").reduce<unknown>((current, key) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[key];
  }, source);

const getString = (source: ApiRecord, paths: string[]) => {
  for (const path of paths) {
    const value = readPath(source, path);

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
};

const getNumber = (source: ApiRecord, paths: string[]) => {
  for (const path of paths) {
    const value = readPath(source, path);

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
};

const getArray = (source: ApiRecord, paths: string[]) => {
  for (const path of paths) {
    const value = readPath(source, path);

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const getPublicationArray = (response: unknown): unknown[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    return [];
  }

  const directKeys = ["publications", "items", "results", "data"];

  for (const key of directKeys) {
    const value = response[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (isRecord(value)) {
      const nested: unknown[] = getPublicationArray(value);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

const getPublicationObject = (response: unknown): ApiRecord | null => {
  if (!isRecord(response)) {
    return null;
  }

  for (const key of ["publication", "item", "result", "data"]) {
    const value = response[key];

    if (isRecord(value)) {
      const nested: ApiRecord | null = getPublicationObject(value);
      return nested ?? value;
    }
  }

  return response;
};

const normalizeComment = (
  comment: unknown,
  index: number
): PublicationComment | null => {
  if (!isRecord(comment)) {
    return null;
  }

  const id =
    getString(comment, ["id", "_id"]) ??
    `${getString(comment, ["createdAt"]) ?? "comment"}-${index}`;
  const rating = getNumber(comment, ["rating", "score", "puntaje", "puntuacion"]) ?? 0;

  return {
    id,
    name:
      getString(comment, [
        "name",
        "author",
        "username",
        "userName",
        "user.username",
      ]) ?? "Anónimo",
    comment:
      getString(comment, ["comment", "content", "text", "message", "description"]) ??
      "",
    rating,
    createdAt: getString(comment, ["createdAt", "date"]),
  };
};

const normalizePublication = (publication: unknown): Publication | null => {
  if (!isRecord(publication)) {
    return null;
  }

  const id = getString(publication, ["id", "_id"]);

  if (!id) {
    return null;
  }

  const comments = getArray(publication, [
    "comments",
    "comentarios",
    "reviews",
    "valoraciones",
  ])
    .map(normalizeComment)
    .filter((comment): comment is PublicationComment => comment !== null);
  const commentRatings = comments
    .map((comment) => comment.rating)
    .filter((rating) => rating >= 1 && rating <= 5);
  const computedAverage =
    commentRatings.length === 0
      ? 0
      : commentRatings.reduce((total, rating) => total + rating, 0) /
        commentRatings.length;
  const averageRating =
    getNumber(publication, [
      "averageRating",
      "avgRating",
      "ratingAverage",
      "promedio",
      "puntajePromedio",
      "score",
      "rating",
    ]) ?? computedAverage;
  const commentsCount =
    getNumber(publication, ["commentsCount", "commentCount", "comentariosCount"]) ??
    comments.length;
  const ratingsCount =
    getNumber(publication, [
      "ratingsCount",
      "ratingCount",
      "valoracionesCount",
      "reviewsCount",
    ]) ??
    (commentRatings.length > 0 ? commentRatings.length : commentsCount);

  return {
    id,
    title:
      getString(publication, ["title", "titulo", "name"]) ??
      "Publicación sin título",
    wineryName:
      getString(publication, [
        "wineryName",
        "bodegaName",
        "vineriaName",
        "winery.name",
        "bodega.name",
        "vineria.name",
        "winery",
        "bodega",
        "vineria",
      ]) ?? "Bodega sin nombre",
    productName:
      getString(publication, [
        "productName",
        "productoName",
        "wineName",
        "product.name",
        "producto.name",
        "wine.name",
        "product",
        "producto",
        "wine",
        "vino",
      ]) ?? "Producto sin nombre",
    description:
      getString(publication, [
        "description",
        "shortDescription",
        "descripcion",
        "details",
        "detalle",
      ]) ?? "",
    imageUrl: getString(publication, [
      "imageUrl",
      "image",
      "image_url",
      "photo",
      "picture",
      "thumbnail",
      "product.imageUrl",
      "producto.imageUrl",
    ]),
    category: getString(publication, ["category", "categoria"]),
    type: getString(publication, ["type", "tipo", "productType"]),
    price: getNumber(publication, ["price", "precio"]),
    year: getNumber(publication, ["year", "anio", "año", "vintage"]),
    averageRating,
    commentsCount,
    ratingsCount,
    comments,
    createdAt: getString(publication, ["createdAt"]),
    updatedAt: getString(publication, ["updatedAt"]),
  };
};

export const getPublications = async () => {
  const response = await apiClient<unknown>(PUBLICATIONS_PATH);

  return getPublicationArray(response)
    .map(normalizePublication)
    .filter((publication): publication is Publication => publication !== null);
};

export const getPublication = async (id: string) => {
  const response = await apiClient<unknown>(
    `${PUBLICATIONS_PATH}/${encodeURIComponent(id)}`
  );
  const publication = normalizePublication(getPublicationObject(response));

  if (!publication) {
    throw new Error("No se encontró la publicación solicitada");
  }

  return publication;
};

export const createPublicationComment = async (
  id: string,
  body: CreatePublicationCommentInput
) => {
  await apiClient<unknown>(`${PUBLICATIONS_PATH}/${encodeURIComponent(id)}/comments`, {
    method: "POST",
    body,
  });
};

export const createPublication = async (body: PublicationMutationInput) => {
  const response = await apiClient<unknown>(PUBLICATIONS_PATH, {
    method: "POST",
    body,
  });

  return normalizePublication(getPublicationObject(response));
};

export const updatePublication = async (
  id: string,
  body: PublicationMutationInput
) => {
  const response = await apiClient<unknown>(
    `${PUBLICATIONS_PATH}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body,
    }
  );

  return normalizePublication(getPublicationObject(response));
};

export const deletePublication = async (id: string) => {
  await apiClient<unknown>(`${PUBLICATIONS_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
