import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  searchMovies,
  getPopularMovies,
  searchActors,
  getMoviesByActor,
  discoverMovies,
  type DiscoverFilters,
} from '../services/api.ts'
import { useUrlFiltersSync } from './useURLSync'
import { useInfiniteScroll } from './useInfiniteScroll'

interface FiltersShape {
  movie?: string
  actor?: string
  actorId?: number
  year?: number
  genres?: number[]
  minRating?: number
  sortBy?: string
}

export function useMovies() {
  const filtersRef = useRef<FiltersShape>({})
  const { applyUrlFilters, searchParams } = useUrlFiltersSync(filtersRef)

  const [searchInput, setSearchInput] = useState<string>('')
  const [actorSearchInput, setActorSearchInput] = useState<string>('')
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null)
  const [showActorDropdown, setShowActorDropdown] = useState<boolean>(false)
  const [showMovieDropdown, setShowMovieDropdown] = useState<boolean>(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<string>('popularity.desc')

  const actorDropdownRef = useRef<HTMLDivElement>(null)
  const movieDropdownRef = useRef<HTMLDivElement>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitializedRef = useRef<boolean>(false)

  // Получаем значения из URL
  const movieQuery = searchParams.get('movie') || ''
  const actorQuery = searchParams.get('actor') || ''
  const actorIdParam = searchParams.get('actorId')
  const yearParam = searchParams.get('year')
  const genresParam = searchParams.getAll('genres')
  const minRatingParam = searchParams.get('minRating')
  const sortByParam = searchParams.get('sortBy')

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = useMemo(() => {
    return (
      selectedYear !== null ||
      selectedGenres.length > 0 ||
      minRating !== null ||
      sortBy !== 'popularity.desc'
    )
  }, [selectedYear, selectedGenres, minRating, sortBy])

  // Queries
  const popularMoviesQuery = useInfiniteQuery({
    queryKey: ['popularMovies'],
    queryFn: ({ pageParam = 1 }) => getPopularMovies(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: !movieQuery && !selectedActorId && !hasActiveFilters,
  })

  const searchMoviesQuery = useInfiniteQuery({
    queryKey: ['searchMovies', movieQuery],
    queryFn: ({ pageParam = 1 }) => searchMovies(movieQuery, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: !!movieQuery.trim() && !selectedActorId && !hasActiveFilters,
  })

  const actorMoviesQuery = useInfiniteQuery({
    queryKey: ['actorMovies', selectedActorId],
    queryFn: ({ pageParam = 1 }) => getMoviesByActor(selectedActorId!, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: selectedActorId !== null && !hasActiveFilters,
  })

  const discoverMoviesQuery = useInfiniteQuery({
    queryKey: ['discoverMovies', selectedYear, selectedGenres, minRating, sortBy],
    queryFn: ({ pageParam = 1 }) => {
      const discoverFilters: DiscoverFilters = {
        year: selectedYear || undefined,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        minRating: minRating || undefined,
        sortBy: sortBy !== 'popularity.desc' ? sortBy : undefined,
      }
      return discoverMovies(discoverFilters, pageParam)
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: hasActiveFilters && !movieQuery && !selectedActorId,
  })

  const actorsSearchQuery = useQuery({
    queryKey: ['actorsSearch', actorSearchInput],
    queryFn: () => searchActors(actorSearchInput.trim(), 1),
    enabled: !!actorSearchInput.trim() && !searchInput.trim() && !selectedActorId,
    staleTime: 30000,
  })

  const moviesSearchQuery = useQuery({
    queryKey: ['moviesSearch', searchInput],
    queryFn: () => searchMovies(searchInput.trim(), 1),
    enabled: !!searchInput.trim() && !actorSearchInput.trim() && !selectedActorId,
    staleTime: 30000,
  })

  const activeQuery = useMemo(() => {
    if (hasActiveFilters) return discoverMoviesQuery
    if (selectedActorId) return actorMoviesQuery
    if (movieQuery) return searchMoviesQuery
    return popularMoviesQuery
  }, [
    hasActiveFilters,
    discoverMoviesQuery,
    selectedActorId,
    actorMoviesQuery,
    movieQuery,
    searchMoviesQuery,
    popularMoviesQuery,
  ])

  // Handlers
  const createTextChangeHandler = useCallback(
    (key: keyof FiltersShape, setter: (value: string) => void) => (value: string) => {
      setter(value)

      const newFilters: FiltersShape = { ...filtersRef.current }

      const trimmed = value.trim()
      if (trimmed) {
        ;(newFilters as any)[key] = trimmed
      } else {
        delete (newFilters as any)[key]
      }

      filtersRef.current = newFilters

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        applyUrlFilters()
      }, 500)
    },
    [applyUrlFilters]
  )

  const onMovieChange = createTextChangeHandler('movie', setSearchInput)
  const onActorChange = createTextChangeHandler('actor', setActorSearchInput)

  const handleMovieSearchChange = useCallback(
    (value: string) => {
      onMovieChange(value)
      setShowMovieDropdown(true)
      // При вводе в поиск фильмов очищаем поиск актёров
      if (value.trim()) {
        setSelectedActorId(null)
        setActorSearchInput('')
        const { actor, actorId, ...rest } = filtersRef.current
        filtersRef.current = { ...rest }
      } else {
        setShowMovieDropdown(false)
      }
    },
    [onMovieChange]
  )

  const handleMovieSelect = useCallback(
    (movieTitle: string) => {
      setSearchInput(movieTitle)
      setShowMovieDropdown(false)

      const newFilters: FiltersShape = { ...filtersRef.current }
      newFilters.movie = movieTitle
      delete newFilters.actor
      delete newFilters.actorId
      filtersRef.current = newFilters

      setSelectedActorId(null)
      setActorSearchInput('')
      applyUrlFilters()
    },
    [applyUrlFilters]
  )

  const handleActorSearchChange = useCallback(
    (value: string) => {
      onActorChange(value)
      setShowActorDropdown(true)
      setSelectedActorId(null)

      if (!value.trim()) {
        setShowActorDropdown(false)
      }
    },
    [onActorChange]
  )

  const handleActorSelect = useCallback(
    (actorId: number, actorName: string) => {
      setSelectedActorId(actorId)
      setActorSearchInput(actorName)
      setShowActorDropdown(false)

      const newFilters: FiltersShape = { ...filtersRef.current }
      newFilters.actor = actorName
      newFilters.actorId = actorId
      delete newFilters.movie
      filtersRef.current = newFilters

      setSearchInput('')
      applyUrlFilters()
    },
    [applyUrlFilters]
  )

  const handleClearMovie = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    setSearchInput('')
    setShowMovieDropdown(false)
    const { movie, ...rest } = filtersRef.current
    filtersRef.current = rest
    applyUrlFilters()
  }, [applyUrlFilters])

  const handleClearActor = useCallback(() => {
    setActorSearchInput('')
    setSelectedActorId(null)
    setShowActorDropdown(false)
    const { actor, actorId, ...rest } = filtersRef.current
    filtersRef.current = rest
    applyUrlFilters()
  }, [applyUrlFilters])

  const handleClear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    setSearchInput('')
    setActorSearchInput('')
    setSelectedActorId(null)
    setShowActorDropdown(false)
    setSelectedYear(null)
    setSelectedGenres([])
    setMinRating(null)
    setSortBy('popularity.desc')
    filtersRef.current = {}
    applyUrlFilters()
  }, [applyUrlFilters])

  // Handlers для фильтров
  const handleYearChange = useCallback(
    (year: number | null) => {
      setSelectedYear(year)
      const newFilters: FiltersShape = { ...filtersRef.current }
      if (year !== null) {
        newFilters.year = year
      } else {
        delete newFilters.year
      }
      filtersRef.current = newFilters
      applyUrlFilters()
    },
    [applyUrlFilters]
  )

  const handleGenreToggle = useCallback(
    (genreId: number) => {
      setSelectedGenres((prev) => {
        const newGenres = prev.includes(genreId)
          ? prev.filter((id) => id !== genreId)
          : [...prev, genreId]

        const newFilters: FiltersShape = { ...filtersRef.current }
        if (newGenres.length > 0) {
          newFilters.genres = newGenres
        } else {
          delete newFilters.genres
        }
        filtersRef.current = newFilters
        applyUrlFilters()

        return newGenres
      })
    },
    [applyUrlFilters]
  )

  const handleRatingChange = useCallback(
    (rating: number | null) => {
      setMinRating(rating)
      const newFilters: FiltersShape = { ...filtersRef.current }
      if (rating !== null) {
        newFilters.minRating = rating
      } else {
        delete newFilters.minRating
      }
      filtersRef.current = newFilters
      applyUrlFilters()
    },
    [applyUrlFilters]
  )

  const handleSortByChange = useCallback(
    (sort: string) => {
      setSortBy(sort)
      const newFilters: FiltersShape = { ...filtersRef.current }
      if (sort !== 'popularity.desc') {
        newFilters.sortBy = sort
      } else {
        delete newFilters.sortBy
      }
      filtersRef.current = newFilters
      applyUrlFilters()
    },
    [applyUrlFilters]
  )

  // Инициализация из URL при первой загрузке
  useEffect(() => {
    if (isInitializedRef.current) return

    const hasUrlFilters =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).toString().length > 0
        : false

    if (hasUrlFilters) {
      if (movieQuery) {
        setSearchInput(movieQuery)
        filtersRef.current.movie = movieQuery
      }
      if (actorQuery) {
        setActorSearchInput(actorQuery)
        filtersRef.current.actor = actorQuery
      }
      if (actorIdParam !== null) {
        setSelectedActorId(parseInt(actorIdParam, 10))
        filtersRef.current.actorId = parseInt(actorIdParam, 10)
      }
      if (yearParam) {
        const year = parseInt(yearParam, 10)
        if (!isNaN(year)) {
          setSelectedYear(year)
          filtersRef.current.year = year
        }
      }
      if (genresParam.length > 0) {
        const genres = genresParam.map((g) => parseInt(g, 10)).filter((g) => !isNaN(g))
        setSelectedGenres(genres)
        filtersRef.current.genres = genres
      }
      if (minRatingParam) {
        const rating = parseFloat(minRatingParam)
        if (!isNaN(rating)) {
          setMinRating(rating)
          filtersRef.current.minRating = rating
        }
      }
      if (sortByParam) {
        setSortBy(sortByParam)
        filtersRef.current.sortBy = sortByParam
      }
    }

    isInitializedRef.current = true
  }, [movieQuery, actorQuery, actorIdParam, yearParam, genresParam, minRatingParam, sortByParam])

  // Закрытие выпадающих списков при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actorDropdownRef.current && !actorDropdownRef.current.contains(event.target as Node)) {
        setShowActorDropdown(false)
      }
      if (movieDropdownRef.current && !movieDropdownRef.current.contains(event.target as Node)) {
        setShowMovieDropdown(false)
      }
    }

    if (showActorDropdown || showMovieDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActorDropdown, showMovieDropdown])

  // Infinite scroll
  const movies = useMemo(() => {
    const allMovies = activeQuery.data?.pages.flatMap((page) => page.results) ?? []
    return allMovies.filter((movie) => movie.poster_path !== null)
  }, [activeQuery.data])
  const hasNextPage = activeQuery.hasNextPage
  const isFetchingNextPage = activeQuery.isFetchingNextPage
  const fetchNextPage = activeQuery.fetchNextPage

  const infiniteScroll = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  })

  return {
    searchInput,
    setSearchInput: handleMovieSearchChange,
    actorSearchInput,
    setActorSearchInput: handleActorSearchChange,
    selectedActorId,
    showActorDropdown,
    setShowActorDropdown,
    showMovieDropdown,
    setShowMovieDropdown,
    actorsSearchQuery,
    moviesSearchQuery,
    handleActorSelect,
    handleMovieSelect,
    actorDropdownRef,
    movieDropdownRef,
    observerTarget: infiniteScroll.observerTarget,
    activeQuery,
    movies,
    hasNextPage,
    isFetchingNextPage,
    handleClearMovie,
    handleClearActor,
    handleClear,
    // Filters
    selectedYear,
    selectedGenres,
    minRating,
    sortBy,
    handleYearChange,
    handleGenreToggle,
    handleRatingChange,
    handleSortByChange,
    hasActiveFilters,
  }
}
