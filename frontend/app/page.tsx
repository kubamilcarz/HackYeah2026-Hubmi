import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-[var(--surface-canvas)] px-4 py-8 text-[var(--content-primary)] sm:px-8">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 sm:p-10">
        <p className="type-label uppercase tracking-[0.12em] text-[var(--content-link)]">Splot</p>
        <h1 className="type-h1 mt-4">Łączymy potrzeby z lokalnym wsparciem.</h1>
        <p className="type-body mt-4 max-w-xl text-[var(--content-secondary)]">
          Splot pomaga mieszkańcom, organizacjom i samorządom odnaleźć bezpieczny kolejny krok.
        </p>
        <Link className="button button--primary mt-8" href="/design-system">
          Zobacz system projektowy
        </Link>
      </section>
    </main>
  );
}
