import { Card, CardContent } from '@/components/ui/card'

const contactChannels = [
  { label: 'Telephone', value: '+33 1 80 00 00 00' },
  { label: 'Email', value: 'contact@m-motors.fr' },
  { label: 'Horaires', value: 'Lun - Ven, 9h - 18h' },
]

const faqItems = [
  {
    question: 'Quel delai pour une reponse ?',
    answer: 'Nous repondons en general sous 24h ouvrées.',
  },
  {
    question: 'Je veux suivre mon dossier.',
    answer: 'Connectez-vous puis ouvrez Mes dossiers pour voir les etapes.',
  },
  {
    question: 'Puis-je modifier mes documents apres envoi ?',
    answer: 'Oui, tant que le dossier est en cours vous pouvez ajouter des pieces.',
  },
]

export function ContactSupportPanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {contactChannels.map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-1 p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-lg font-semibold">Questions frequentes</h2>
          <div className="space-y-3 text-sm">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-md border p-3">
                <p className="font-medium">{item.question}</p>
                <p className="mt-1 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
