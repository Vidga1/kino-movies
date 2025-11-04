import { useQuery } from '@tanstack/react-query'
import { getGenres } from '../services/api.ts'

export function useGenres() {
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: Infinity,
  })

  const getGenreNames = (genreIds: number[] | undefined): string[] => {
    if (!genreIds || genreIds.length === 0) return []

    const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]))
    return genreIds
      .map((id) => genreMap.get(id))
      .filter((name): name is string => name !== undefined)
  }

  return {
    genres,
    getGenreNames,
  }
}
