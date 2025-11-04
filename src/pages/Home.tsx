import MovieCard from '../components/MovieCard'
import { FiltersPanel } from '../components/FiltersPanel'
import { useMovies } from '../hooks/useMovies'
import '../css/Home.css'

function Home() {
  const {
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
    observerTarget,
    activeQuery,
    movies,
    hasNextPage,
    isFetchingNextPage,
    handleClearMovie,
    handleClearActor,
    selectedYear,
    selectedGenres,
    minRating,
    sortBy,
    handleYearChange,
    handleGenreToggle,
    handleRatingChange,
    handleSortByChange,
  } = useMovies()

  return (
    <div className='home'>
      <FiltersPanel
        selectedYear={selectedYear}
        selectedGenres={selectedGenres}
        minRating={minRating}
        sortBy={sortBy}
        handleYearChange={handleYearChange}
        handleGenreToggle={handleGenreToggle}
        handleRatingChange={handleRatingChange}
        handleSortByChange={handleSortByChange}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        actorSearchInput={actorSearchInput}
        setActorSearchInput={setActorSearchInput}
        showActorDropdown={showActorDropdown}
        setShowActorDropdown={setShowActorDropdown}
        showMovieDropdown={showMovieDropdown}
        setShowMovieDropdown={setShowMovieDropdown}
        actorsSearchQuery={actorsSearchQuery}
        moviesSearchQuery={moviesSearchQuery}
        handleActorSelect={handleActorSelect}
        handleMovieSelect={handleMovieSelect}
        actorDropdownRef={actorDropdownRef}
        movieDropdownRef={movieDropdownRef}
        handleClearMovie={handleClearMovie}
        handleClearActor={handleClearActor}
      />

      {activeQuery.isError && (
        <div className='error-message'>
          {searchInput || actorSearchInput
            ? 'Failed to search movies...'
            : 'Failed to load movies...'}
        </div>
      )}

      {activeQuery.isLoading && activeQuery.isFetching && !activeQuery.isFetchingNextPage ? (
        <div className='loading'>Loading...</div>
      ) : (
        <>
          <div className='movies-grid'>
            {movies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
          {hasNextPage && (
            <div ref={observerTarget} className='observer-target'>
              {isFetchingNextPage && <div className='loading'>Loading more...</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home
