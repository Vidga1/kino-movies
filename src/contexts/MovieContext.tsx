import { createContext, useState, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Movie, MovieContextType } from '../types'

const MovieContext = createContext<MovieContextType | undefined>(undefined)

export const useMovieContext = (): MovieContextType => {
  const context = useContext(MovieContext)
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider')
  }
  return context
}

interface MovieProviderProps {
  children: ReactNode
}

export const MovieProvider = ({ children }: MovieProviderProps) => {
  const [favorites, setFavorites] = useState<Movie[]>([])
  const isInitialMount = useRef(true)

  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites')

    if (storedFavs) {
      try {
        const parsedFavs: Movie[] = JSON.parse(storedFavs)
        if (Array.isArray(parsedFavs) && parsedFavs.length > 0) {
          setFavorites(parsedFavs)
        }
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error)
      }
    }
    isInitialMount.current = false
  }, [])

  useEffect(() => {
    if (!isInitialMount.current) {
      try {
        localStorage.setItem('favorites', JSON.stringify(favorites))
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error)
      }
    }
  }, [favorites])

  const addToFavorites = (movie: Movie): void => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === movie.id)) {
        return prev
      }
      return [...prev, movie]
    })
  }

  const removeFromFavorites = (movieId: number): void => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId))
  }

  const isFavorite = (movieId: number): boolean => {
    return favorites.some((movie) => movie.id === movieId)
  }

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  }

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
}
