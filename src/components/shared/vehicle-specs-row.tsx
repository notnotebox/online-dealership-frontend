import { CarFront, DoorOpen, Fuel, Gauge, Users } from 'lucide-react'

type Props = {
  seats?: number
  doors?: number
  mileage: number
  fuel: string
  transmission: string
}

export function VehicleSpecsRow({ seats, doors, mileage, fuel, transmission }: Props) {
  const items = [
    { icon: Users, label: `${seats ?? '-'} seats` },
    { icon: DoorOpen, label: `${doors ?? '-'} doors` },
    { icon: Gauge, label: `${mileage.toLocaleString('fr-FR')} km` },
    { icon: Fuel, label: fuel },
    { icon: CarFront, label: transmission },
  ]

  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
