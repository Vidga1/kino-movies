import { useState } from 'react'
import '../css/MovieCard.css'
import { useMovieContext } from '../contexts/MovieContext'
import { useGenres } from '../hooks/useGenres'
import type { Movie } from '../types'

interface MovieCardProps {
  movie: Movie
}

function MovieCard({ movie }: MovieCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext()
  const { getGenreNames } = useGenres()
  const favorite = isFavorite(movie.id)
  const [isOverviewExpanded, setIsOverviewExpanded] = useState<boolean>(false)

  const genreNames = getGenreNames(movie.genre_ids)

  function onFavoriteClick(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    if (favorite) removeFromFavorites(movie.id)
    else addToFavorites(movie)
  }

  const getRatingClass = (rating: number): string => {
    if (rating >= 7) return 'rating-high'
    if (rating >= 5) return 'rating-medium'
    return 'rating-low'
  }

  const rating = movie.vote_average !== undefined ? movie.vote_average.toFixed(1) : null
  const ratingClass = movie.vote_average !== undefined ? getRatingClass(movie.vote_average) : ''

  const MAX_OVERVIEW_LENGTH = 70
  const overview = movie.overview || ''
  const shouldTruncate = overview.length > MAX_OVERVIEW_LENGTH
  const displayOverview =
    shouldTruncate && !isOverviewExpanded
      ? `${overview.substring(0, MAX_OVERVIEW_LENGTH)}...`
      : overview

  return (
    <div className='movie-card'>
      <div className='movie-poster'>
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        {rating && ratingClass && <div className={`movie-rating ${ratingClass}`}>{rating}</div>}
        <div className='movie-overlay'>
          <button className={`favorite-btn ${favorite ? 'active' : ''}`} onClick={onFavoriteClick}>
            ♥
          </button>
        </div>
      </div>
      <div className='movie-info'>
        <h3>{movie.title}</h3>
        {genreNames.length > 0 && (
          <div className='movie-genres'>
            {genreNames.map((genre, index) => (
              <span key={index} className='genre-tag'>
                {genre}
              </span>
            ))}
          </div>
        )}
        {overview && (
          <div className='movie-overview'>
            <p className='overview-text'>{displayOverview}</p>
            {shouldTruncate && (
              <button
                className='overview-toggle'
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
              >
                {isOverviewExpanded ? 'Скрыть' : 'Показать больше'}
              </button>
            )}
          </div>
        )}
        <p className='movie-year'>{movie.release_date?.split('-')[0]}</p>
      </div>
    </div>
  )
}

export default MovieCard
