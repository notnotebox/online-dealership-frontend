import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Vehicle } from '@/types/domain'
import { VehicleSpecsRow } from './vehicle-specs-row'

type Props = Vehicle & { onFavorite?: () => void }

export function VehicleCard(props: Props) {
  const { id, brand, model, year, mode, price, monthlyPrice, availability, onFavorite } = props

  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="relative p-0">
        <div className="flex h-44 w-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
          Image temporaire
        </div>
        <div className="absolute left-3 top-3">
          <Badge variant="secondary">{mode === 'buy' ? 'Achat' : 'Location'}</Badge>
        </div>
        <Button size="icon" variant="secondary" className="absolute right-3 top-3" onClick={onFavorite}>
          <Heart className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{brand} {model}</h3>
            <p className="text-sm text-muted-foreground">{year}</p>
          </div>
          <p className="font-semibold">
            {mode === 'buy' ? `${price?.toLocaleString('fr-FR')} EUR` : `${monthlyPrice} EUR/mois`}
          </p>
        </div>
        <VehicleSpecsRow {...props} />
        <p className="text-sm">{availability ? 'Disponible' : 'Indisponible'}</p>
      </CardContent>
      <CardFooter className="mt-auto p-4">
        <Button asChild className="w-full">
          <Link to={`/vehicles/${id}`}>Voir le detail</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
