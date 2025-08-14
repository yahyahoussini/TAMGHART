import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <main>
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center animate-enter rounded-card bg-card p-6 md:p-10 shadow-soft">
          <div>
            <h1 className="font-head text-3xl md:text-5xl font-semibold mb-4">Votre boutique bio‑cosmétiques est presque prête</h1>
            <p className="text-muted-foreground mb-6">Répondez à quelques questions pour générer une belle page d'accueil adaptée à votre marque.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="xl" className="hover-scale">Fournir le contenu</Button>
              <Button variant="chip" size="chip">Aperçu du thème</Button>
            </div>
          </div>
          <div className="h-56 md:h-72 rounded-card bg-secondary" aria-hidden />
        </div>
      </section>
    </main>
  );
};

export default Index;
