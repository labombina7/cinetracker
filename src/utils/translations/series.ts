export const seriesTranslations = {
  es: {
    seasons: "Temporadas",
    episodes: "episodios",
    specials: "Especiales",
    status: {
      returning: "En emisión",
      ended: "Finalizada",
      canceled: "Cancelada",
      inProduction: "En producción",
      planned: "Anunciada"
    },
    nextEpisode: "Próximo episodio",
    lastEpisode: "Último episodio",
    today: "hoy",
    tomorrow: "mañana",
    inDays: (n: number) => `en ${n} días`,
    upcoming: "Próximamente",
    noDate: "Sin fecha",
    hideSpoilers: "Ocultar spoilers",
    tapToReveal: "Toca para ver",
    minutes: "min",
    loadError: "No se pudo cargar la temporada.",
    retry: "Reintentar",
    ratingsByEpisode: "Nota por episodio",
    noOverview: "Sin sinopsis disponible.",
    directedBy: "Dirección",
    writtenBy: "Guion",
    guestStars: "Actores invitados",
    episodeLabel: (s: number, e: number) => `T${s} · E${e}`
  },
  en: {
    seasons: "Seasons",
    episodes: "episodes",
    specials: "Specials",
    status: {
      returning: "Airing",
      ended: "Ended",
      canceled: "Canceled",
      inProduction: "In production",
      planned: "Announced"
    },
    nextEpisode: "Next episode",
    lastEpisode: "Last episode",
    today: "today",
    tomorrow: "tomorrow",
    inDays: (n: number) => `in ${n} days`,
    upcoming: "Upcoming",
    noDate: "No date",
    hideSpoilers: "Hide spoilers",
    tapToReveal: "Tap to reveal",
    minutes: "min",
    loadError: "Couldn't load the season.",
    retry: "Retry",
    ratingsByEpisode: "Rating by episode",
    noOverview: "No overview available.",
    directedBy: "Directed by",
    writtenBy: "Written by",
    guestStars: "Guest stars",
    episodeLabel: (s: number, e: number) => `S${s} · E${e}`
  }
};

export type SeriesTranslations = (typeof seriesTranslations)['es'];
