import { Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function DocumentUploadZone() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="rounded-md border border-dashed p-8 text-center">
          <Upload className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm">Glisser deposer vos documents ici</p>
          <p className="mb-4 text-xs text-muted-foreground">PDF, JPG, PNG - 10MB max</p>
          <Button variant="outline">Parcourir</Button>
        </div>
        <Progress value={45} />
        <Alert>
          <AlertDescription>Certains documents sont encore manquants.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
