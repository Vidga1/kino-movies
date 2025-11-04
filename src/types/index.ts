export interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview?: string
  vote_average?: number
  backdrop_path?: string | null
  genre_ids?: number[]
}

export interface Genre {
  id: number
  name: string
}

export interface MovieContextType {
  favorites: Movie[]
  addToFavorites: (movie: Movie) => void
  removeFromFavorites: (movieId: number) => void
  isFavorite: (movieId: number) => boolean
}
