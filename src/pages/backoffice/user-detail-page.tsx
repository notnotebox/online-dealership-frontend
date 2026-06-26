import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/shared/application-status-badge'
import { DocumentRecordList } from '@/components/shared/document-record-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { backofficeUserApi } from '@/lib/api/backoffice-user-api'
import type { AdminUserDetail } from '@/lib/auth/auth-types'

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non renseigne'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function BackofficeUserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingRole, setIsSavingRole] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDetail() {
      if (!userId) {
        return
      }

      try {
        setIsLoading(true)
        const response = await backofficeUserApi.getUserDetail(userId)
        if (!cancelled) {
          setDetail(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger ce profil')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      cancelled = true
    }
  }, [userId])

  async function switchRole(nextRole: 'CLIENT' | 'MANAGER') {
    if (!detail) {
      return
    }

    try {
      setIsSavingRole(true)
      const updatedProfile = await backofficeUserApi.updateUserRole(detail.profile.id, nextRole)
      setDetail((current) => current ? { ...current, profile: updatedProfile } : current)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de modifier le role')
    } finally {
      setIsSavingRole(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du profil client...</div>
  }

  if (error && !detail) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link to="/backoffice/users">Retour aux utilisateurs</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!detail) {
    return null
  }

  const { profile } = detail
  const canPromoteToManager = profile.role === 'CLIENT'
  const canDemoteToClient = profile.role === 'MANAGER'
  const isStaffProfile = profile.role === 'MANAGER' || profile.role === 'ADMIN'
  const pageLabel = isStaffProfile ? 'Profil collaborateur' : 'Profil client'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{profile.firstName} {profile.lastName}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{pageLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/backoffice/users')}>Retour</Button>
          {canPromoteToManager ? (
            <Button onClick={() => void switchRole('MANAGER')} disabled={isSavingRole}>Passer en manager</Button>
          ) : null}
          {canDemoteToClient ? (
            <Button variant="outline" onClick={() => void switchRole('CLIENT')} disabled={isSavingRole}>Retirer les permissions manager</Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Role</p><p className="font-medium">{profile.role}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Completude</p><p className="font-medium">{profile.profileCompletionPercent ?? 0}%</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Telephone</p><p className="font-medium">{profile.phoneNumber ?? '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Date de naissance</p><p className="font-medium">{profile.dateOfBirth ?? '-'}</p></div>
              <div className="rounded-lg border p-3 md:col-span-2"><p className="text-xs text-muted-foreground">Adresse</p><p className="font-medium">{[profile.addressLine1, profile.addressLine2, profile.postalCode, profile.city, profile.country].filter(Boolean).join(', ') || '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Nationalite</p><p className="font-medium">{profile.nationality ?? '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Situation familiale</p><p className="font-medium">{profile.familyStatus ?? '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Situation professionnelle</p><p className="font-medium">{profile.professionalStatus ?? '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Foyer</p><p className="font-medium">{profile.householdSize ?? '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Revenus mensuels</p><p className="font-medium">{profile.monthlyIncome ?? '-'}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Charges mensuelles</p><p className="font-medium">{profile.monthlyCharges ?? '-'}</p></div>
              <div className="rounded-lg border p-3 md:col-span-2"><p className="text-xs text-muted-foreground">IBAN</p><p className="font-medium">{profile.iban ?? '-'}</p></div>
              <div className="rounded-lg border p-3 md:col-span-2"><p className="text-xs text-muted-foreground">Compte cree le</p><p className="font-medium">{formatDate(profile.createdAt)}</p></div>
            </div>
          </CardContent>
        </Card>

        {!isStaffProfile ? (
          <Card>
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="text-lg font-semibold">Dossiers du client</h2>
                <p className="text-sm text-muted-foreground">Brouillons et demandes deja deposees.</p>
              </div>

              {detail.applications.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                  Aucun dossier pour ce client.
                </div>
              ) : (
                <div className="space-y-3">
                  {detail.applications.map((application) => (
                    <div key={application.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{application.vehicleBrand} {application.vehicleTitle}</p>
                        <ApplicationStatusBadge status={application.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Creation : {formatDate(application.createdAt)}</span>
                        <span>Mise a jour : {formatDate(application.updatedAt)}</span>
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/backoffice/files/${application.id}`}>Ouvrir le dossier</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="text-lg font-semibold">Statut interne</h2>
              <p className="text-sm text-muted-foreground">
                Ce collaborateur fait partie de l equipe interne. Les droits peuvent etre ajustes ici par un administrateur.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {!isStaffProfile ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-lg font-semibold">Documents du profil</h2>
              <p className="text-sm text-muted-foreground">Documents personnels visibles uniquement par les administrateurs.</p>
            </div>
            <DocumentRecordList
              documents={detail.documents}
              emptyTitle="Aucun document disponible"
              emptyDescription="Le client n'a encore depose aucune piece dans son profil."
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
