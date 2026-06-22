export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Protection des donnees</p>
        <h1 className="text-3xl font-semibold">Politique de confidentialite</h1>
      </div>

      <section className="space-y-3 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Donnees collectees</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Utilisation</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Droits de l'utilisateur</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales ligula in libero.
        </p>
      </section>
    </div>
  )
}
