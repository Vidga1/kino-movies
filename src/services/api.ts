import type { Movie, Genre } from '../types'

const API_KEY = 'a4882b1f27be9e79861c7942e5a0cf9c'
const BASE_URL = 'https://api.themoviedb.org/3'

export interface ApiResponse {
  results: Movie[]
  page: number
  total_pages: number
  total_results: number
}

export interface GenresResponse {
  genres: Genre[]
}

export const getGenres = async (): Promise<Genre[]> => {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ru-RU`)
  const data: GenresResponse = await response.json()
  return data.genres
}

export const getPopularMovies = async (page: number = 1): Promise<ApiResponse> => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ru-RU&page=${page}`
  )
  const data: ApiResponse = await response.json()
  return data
}

export const searchMovies = async (query: string, page: number = 1): Promise<ApiResponse> => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(
      query
    )}&page=${page}`
  )
  const data: ApiResponse = await response.json()
  return data
}

export interface Person {
  id: number
  name: string
  known_for: Movie[]
}

export interface PersonSearchResponse {
  results: Person[]
  page: number
  total_pages: number
  total_results: number
}

export const searchActors = async (
  query: string,
  page: number = 1
): Promise<PersonSearchResponse> => {
  const response = await fetch(
    `${BASE_URL}/search/person?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(
      query
    )}&page=${page}`
  )
  const data: PersonSearchResponse = await response.json()
  return data
}

export interface DiscoverFilters {
  year?: number
  genres?: number[]
  minRating?: number
  sortBy?: string
}

export const discoverMovies = async (
  filters: DiscoverFilters,
  page: number = 1
): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: 'ru-RU',
    page: page.toString(),
  })

  if (filters.year) {
    params.set('primary_release_year', filters.year.toString())
  }

  if (filters.genres && filters.genres.length > 0) {
    params.set('with_genres', filters.genres.join(','))
  }

  if (filters.minRating) {
    params.set('vote_average.gte', filters.minRating.toString())
  }

  if (filters.sortBy) {
    params.set('sort_by', filters.sortBy)
  } else {
    params.set('sort_by', 'popularity.desc')
  }

  const response = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`)
  const data: ApiResponse = await response.json()
  return data
}

export const getMoviesByActor = async (actorId: number, page: number = 1): Promise<ApiResponse> => {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&with_cast=${actorId}&page=${page}`
  )
  const data: ApiResponse = await response.json()
  return data
}
