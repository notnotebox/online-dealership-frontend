export function LegalPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Information legale</p>
        <h1 className="text-3xl font-semibold">Mentions legales</h1>
      </div>

      <section className="space-y-3 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Editeur du site</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor,
          dignissim sit amet, adipiscing nec, ultricies sed, dolor.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Hebergement</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Propriete intellectuelle</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis sem at nibh elementum imperdiet.
        </p>
      </section>
    </div>
  )
}
