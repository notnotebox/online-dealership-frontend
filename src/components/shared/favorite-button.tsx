import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type FavoriteButtonProps = {
  vehicleId: string
  className?: string
  size?: 'icon' | 'icon-sm' | 'icon-xs'
}

export function FavoriteButton({ vehicleId, className, size = 'icon' }: FavoriteButtonProps) {
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const favorite = isFavorite(vehicleId)

  async function handleClick() {
    if (!isAuthenticated || isUpdating) {
      return
    }

    setIsUpdating(true)
    try {
      await toggleFavorite(vehicleId)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button asChild size={size} variant="secondary" className={cn(className)}>
        <Link to="/login" aria-label="Se connecter pour ajouter aux favoris">
          <Heart className="h-4 w-4" />
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size={size}
      variant={favorite ? 'default' : 'secondary'}
      onClick={() => void handleClick()}
      aria-pressed={favorite}
      aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={cn(
        favorite && 'bg-rose-600 text-white hover:bg-rose-600/90',
        className,
      )}
      disabled={isUpdating}
    >
      <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
    </Button>
  )
}
