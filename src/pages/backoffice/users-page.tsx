import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { backofficeUserApi } from '@/lib/api/backoffice-user-api'
import { useAuth } from '@/lib/auth/auth-context'
import type { AdminUserSummary } from '@/lib/auth/auth-types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function UserSection({
  title,
  description,
  users,
  showDetails,
}: {
  title: string
  description: string
  users: AdminUserSummary[]
  showDetails: boolean
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {users.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Aucun utilisateur dans cette section.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Rôle : {user.role}</span>
                    <span>Profil : {user.profileCompletionPercent}%</span>
                    <span>Dossiers : {user.applicationCount}</span>
                    <span>Actifs : {user.activeApplicationCount}</span>
                    <span>Depuis : {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {showDetails ? (
                  <Button asChild variant="outline">
                    <Link to={`/backoffice/users/${user.id}`}>Voir le profil</Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BackofficeUsersPage() {
  const { profile, session } = useAuth()
  const role = profile?.role ?? session?.user.role
  const isAdmin = role === 'ADMIN'
  const [staffUsers, setStaffUsers] = useState<AdminUserSummary[]>([])
  const [clientUsers, setClientUsers] = useState<AdminUserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      try {
        setIsLoading(true)
        const staffPromise = backofficeUserApi.listStaff()
        const clientsPromise = isAdmin ? backofficeUserApi.listClients() : Promise.resolve([])
        const [staffResponse, clientResponse] = await Promise.all([staffPromise, clientsPromise])

        if (!cancelled) {
          setStaffUsers(staffResponse)
          setClientUsers(clientResponse)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les utilisateurs')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{isAdmin ? 'Utilisateurs' : 'Équipe'}</h1>
        <p className="text-sm text-muted-foreground">
          Les gestionnaires peuvent consulter l'équipe interne. Les profils clients complets restent réservés aux administrateurs.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement des utilisateurs...</div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      ) : null}

      {!isLoading ? (
        <div className="space-y-4">
          <UserSection
            title="Staff"
            description="Liste des administrateurs et gestionnaires accessibles à toute l'équipe interne."
            users={staffUsers}
            showDetails={isAdmin}
          />

          {isAdmin ? (
            <UserSection
              title="Clients"
              description="Liste réservée aux administrateurs. Vous pouvez consulter le profil client, ses brouillons et ses informations déposées."
              users={clientUsers}
              showDetails
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
