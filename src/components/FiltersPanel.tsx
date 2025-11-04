import { useGenres } from '../hooks/useGenres'
import { CloseIcon } from './CloseIcon'
import '../css/FiltersPanel.css'

interface FiltersPanelProps {
  selectedYear: number | null
  selectedGenres: number[]
  minRating: number | null
  sortBy: string
  handleYearChange: (year: number | null) => void
  handleGenreToggle: (genreId: number) => void
  handleRatingChange: (rating: number | null) => void
  handleSortByChange: (sort: string) => void
  // Search inputs props
  searchInput: string
  setSearchInput: (value: string) => void
  actorSearchInput: string
  setActorSearchInput: (value: string) => void
  showActorDropdown: boolean
  setShowActorDropdown: (value: boolean) => void
  showMovieDropdown: boolean
  setShowMovieDropdown: (value: boolean) => void
  actorsSearchQuery: any
  moviesSearchQuery: any
  handleActorSelect: (actorId: number, actorName: string) => void
  handleMovieSelect: (movieTitle: string) => void
  actorDropdownRef: React.RefObject<HTMLDivElement | null>
  movieDropdownRef: React.RefObject<HTMLDivElement | null>
  handleClearMovie: () => void
  handleClearActor: () => void
}

export function FiltersPanel({
  selectedYear,
  selectedGenres,
  minRating,
  sortBy,
  handleYearChange,
  handleGenreToggle,
  handleRatingChange,
  handleSortByChange,
  searchInput,
  setSearchInput,
  actorSearchInput,
  setActorSearchInput,
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
  handleClearMovie,
  handleClearActor,
}: FiltersPanelProps) {
  const { genres } = useGenres()

  const actors = actorsSearchQuery?.data?.results || []
  const moviesSuggestions = (moviesSearchQuery?.data?.results || []).filter(
    (movie: any) => movie.poster_path !== null
  )

  // Обработчик изменения значения
  const handleSelectChange = (selectId: string, handler: (value: any) => void) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (selectId === 'year') {
        handler(value ? parseInt(value, 10) : null)
      } else if (selectId === 'rating') {
        handler(value ? parseFloat(value) : null)
      } else {
        handler(value)
      }
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  const sortOptions = [
    { value: 'popularity.desc', label: 'Популярность' },
    { value: 'release_date.desc', label: 'Дата выпуска (новые)' },
    { value: 'release_date.asc', label: 'Дата выпуска (старые)' },
    { value: 'vote_average.desc', label: 'Рейтинг (высокий)' },
    { value: 'vote_average.asc', label: 'Рейтинг (низкий)' },
  ]

  return (
    <div className='filters-panel'>
      <div className='filters-row'>
        <div className='filter-group'>
          <label className='filter-label'>Год выпуска</label>
          <div className='select-wrapper'>
            <select
              className='filter-select'
              value={selectedYear || ''}
              onChange={handleSelectChange('year', (value) =>
                handleYearChange(value as number | null)
              )}
            >
              <option value=''>Все годы</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='filter-group'>
          <label className='filter-label'>Минимальный рейтинг</label>
          <div className='select-wrapper'>
            <select
              className='filter-select'
              value={minRating || ''}
              onChange={handleSelectChange('rating', (value) =>
                handleRatingChange(value as number | null)
              )}
            >
              <option value=''>Без ограничений</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}+
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='filter-group'>
          <label className='filter-label'>Сортировка</label>
          <div className='select-wrapper'>
            <select
              className='filter-select'
              value={sortBy}
              onChange={handleSelectChange('sort', (value) => handleSortByChange(value as string))}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className='search-inputs-row'>
        <div className='search-input-wrapper' ref={movieDropdownRef}>
          <input
            type='text'
            placeholder='Поиск по названию фильма...'
            className='search-input'
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            onFocus={() => {
              if (searchInput.trim() && moviesSuggestions.length > 0) {
                setShowMovieDropdown(true)
              }
            }}
          />
          {searchInput && (
            <button
              type='button'
              className='search-clear'
              onClick={handleClearMovie}
              aria-label='Clear movie search'
            >
              <CloseIcon />
            </button>
          )}
          {showMovieDropdown && moviesSuggestions.length > 0 && (
            <div className='actor-dropdown'>
              {moviesSuggestions.map((movie: any) => (
                <button
                  key={movie.id}
                  type='button'
                  className='actor-dropdown-item'
                  onClick={() => handleMovieSelect(movie.title)}
                >
                  {movie.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className='search-input-wrapper' ref={actorDropdownRef}>
          <input
            type='text'
            placeholder='Поиск по актёру...'
            className='search-input'
            value={actorSearchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setActorSearchInput(e.target.value)
            }
            onFocus={() => {
              if (actorSearchInput.trim() && actors.length > 0) {
                setShowActorDropdown(true)
              }
            }}
          />
          {actorSearchInput && (
            <button
              type='button'
              className='search-clear'
              onClick={handleClearActor}
              aria-label='Clear actor search'
            >
              <CloseIcon />
            </button>
          )}
          {showActorDropdown && actors.length > 0 && (
            <div className='actor-dropdown'>
              {actors.map((actor: any) => (
                <button
                  key={actor.id}
                  type='button'
                  className='actor-dropdown-item'
                  onClick={() => handleActorSelect(actor.id, actor.name)}
                >
                  {actor.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='filter-group genres-group'>
        <label className='filter-label'>Жанры</label>
        <div className='genres-list'>
          {genres.map((genre) => (
            <button
              key={genre.id}
              type='button'
              className={`genre-chip ${selectedGenres.includes(genre.id) ? 'active' : ''}`}
              onClick={() => handleGenreToggle(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
