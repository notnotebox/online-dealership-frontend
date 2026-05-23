import { type ChangeEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const steps = ['Infos personnelles', 'Situation', 'Informations complementaires', 'Pieces', 'Recapitulatif', 'Envoi']

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  professionalStatus: string
  monthlyIncome: string
  contribution: string
  desiredDeliveryDate: string
  comment: string
  idDocumentName: string
  addressProofName: string
  incomeProofName: string
  consentAccuracy: boolean
  consentPrivacy: boolean
}

const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  professionalStatus: '',
  monthlyIncome: '',
  contribution: '',
  desiredDeliveryDate: '',
  comment: '',
  idDocumentName: '',
  addressProofName: '',
  incomeProofName: '',
  consentAccuracy: false,
  consentPrivacy: false,
}

export function NewFilePage() {
  const { vehicleId } = useParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialFormState)
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const fileName = event.target.files?.[0]?.name ?? ''
    updateField(field, fileName)
  }

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const goPrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = () => {
    // Placeholder: integrate API call when backend is ready.
    console.log('Dossier envoye', form)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Creation de dossier</h1>
      <Card>
        <CardContent className="p-4 text-sm">
          Vehicule selectionne: <span className="font-medium">{vehicleId ?? 'Non renseigne'}</span>
        </CardContent>
      </Card>

      <div className="grid gap-2 md:grid-cols-6">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`rounded border px-3 py-2 text-left text-sm ${
              index === currentStep ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          {currentStep === 0 && (
            <>
              <h2 className="text-base font-semibold">1. Infos personnelles</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="h-10 rounded border px-3" placeholder="Prenom *" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                <input className="h-10 rounded border px-3" placeholder="Nom *" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                <input className="h-10 rounded border px-3" placeholder="Email *" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                <input className="h-10 rounded border px-3" placeholder="Telephone *" type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <h2 className="text-base font-semibold">2. Situation</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <select className="h-10 rounded border bg-background px-3" value={form.professionalStatus} onChange={(e) => updateField('professionalStatus', e.target.value)}>
                  <option value="">Situation professionnelle</option>
                  <option value="CDI">Salarie CDI</option>
                  <option value="CDD">Salarie CDD</option>
                  <option value="independant">Independant</option>
                  <option value="autre">Autre</option>
                </select>
                <input className="h-10 rounded border px-3" placeholder="Revenus mensuels nets (EUR)" type="number" min={0} value={form.monthlyIncome} onChange={(e) => updateField('monthlyIncome', e.target.value)} />
                <input className="h-10 rounded border px-3 md:col-span-2" placeholder="Apport prevu (EUR)" type="number" min={0} value={form.contribution} onChange={(e) => updateField('contribution', e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="text-base font-semibold">3. Informations complementaires</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="h-10 rounded border px-3" placeholder="Date souhaitee de livraison" type="date" value={form.desiredDeliveryDate} onChange={(e) => updateField('desiredDeliveryDate', e.target.value)} />
              </div>
              <textarea className="min-h-24 w-full rounded border px-3 py-2" placeholder="Commentaire complementaire (optionnel)" value={form.comment} onChange={(e) => updateField('comment', e.target.value)} />
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="text-base font-semibold">4. Pieces</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Piece d'identite</label>
                  <input className="block w-full rounded border p-2 text-sm" type="file" onChange={handleFileChange('idDocumentName')} />
                  {form.idDocumentName && <p className="text-xs text-muted-foreground">{form.idDocumentName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Justificatif de domicile</label>
                  <input className="block w-full rounded border p-2 text-sm" type="file" onChange={handleFileChange('addressProofName')} />
                  {form.addressProofName && <p className="text-xs text-muted-foreground">{form.addressProofName}</p>}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm text-muted-foreground">Justificatif de revenus</label>
                  <input className="block w-full rounded border p-2 text-sm" type="file" onChange={handleFileChange('incomeProofName')} />
                  {form.incomeProofName && <p className="text-xs text-muted-foreground">{form.incomeProofName}</p>}
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <h2 className="text-base font-semibold">5. Recapitulatif</h2>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p><span className="font-medium">Prenom:</span> {form.firstName || '-'}</p>
                <p><span className="font-medium">Nom:</span> {form.lastName || '-'}</p>
                <p><span className="font-medium">Email:</span> {form.email || '-'}</p>
                <p><span className="font-medium">Telephone:</span> {form.phone || '-'}</p>
                <p><span className="font-medium">Situation:</span> {form.professionalStatus || '-'}</p>
                <p><span className="font-medium">Revenus:</span> {form.monthlyIncome || '-'} EUR</p>
                <p><span className="font-medium">Apport:</span> {form.contribution || '-'} EUR</p>
                <p><span className="font-medium">Livraison:</span> {form.desiredDeliveryDate || '-'}</p>
                <p className="md:col-span-2"><span className="font-medium">Commentaire:</span> {form.comment || '-'}</p>
                <p><span className="font-medium">Piece d'identite:</span> {form.idDocumentName || '-'}</p>
                <p><span className="font-medium">Domicile:</span> {form.addressProofName || '-'}</p>
                <p className="md:col-span-2"><span className="font-medium">Revenus:</span> {form.incomeProofName || '-'}</p>
              </div>
            </>
          )}

          {currentStep === 5 && (
            <>
              <h2 className="text-base font-semibold">6. Envoi</h2>
              <label className="flex items-start gap-2 text-sm">
                <input className="mt-1" type="checkbox" checked={form.consentAccuracy} onChange={(e) => updateField('consentAccuracy', e.target.checked)} />
                <span>Je certifie que les informations renseignees sont exactes.</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input className="mt-1" type="checkbox" checked={form.consentPrivacy} onChange={(e) => updateField('consentPrivacy', e.target.checked)} />
                <span>J'accepte le traitement de mes donnees pour l'etude de mon dossier.</span>
              </label>
              <Button type="button" onClick={handleSubmit} disabled={!form.consentAccuracy || !form.consentPrivacy}>
                Envoyer le dossier
              </Button>
            </>
          )}

          <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={goPrevious} disabled={isFirstStep}>
              Precedent
            </Button>
            <Button type="button" onClick={goNext} disabled={isLastStep}>
              {isLastStep ? 'Termine' : 'Suivant'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
