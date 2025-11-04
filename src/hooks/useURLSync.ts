import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

interface FiltersShape {
  movie?: string
  actor?: string
  actorId?: number
  year?: number
  genres?: number[]
  minRating?: number
  sortBy?: string
}

export function useUrlFiltersSync<T extends FiltersShape>(filtersRef: React.MutableRefObject<T>) {
  const [searchParams, setSearchParams] = useSearchParams()

  const applyUrlFilters = useCallback(() => {
    const sp = new URLSearchParams()

    Object.entries(filtersRef.current).forEach(([key, value]) => {
      if (value == null) return

      if (Array.isArray(value)) {
        if (value.length === 0) return
        value.forEach((v) => sp.append(key, String(v)))
      } else {
        const stringValue = String(value)
        if (stringValue.trim() !== '') {
          sp.set(key, stringValue)
        }
      }
    })

    setSearchParams(sp, { replace: true })
  }, [setSearchParams, filtersRef])

  return {
    searchParams,
    applyUrlFilters,
  }
}
