import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import FilterPanel, { type Filters } from "@/components/filters/FilterPanel";
import { useProducts } from "@/hooks/useProducts";

const initialFilters: Filters = {
  sort: "best",
  category: null,
  name: "",
  code: "",
  price: null,
};

const Shop = () => {
  const navigate = useNavigate();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [openSheet, setOpenSheet] = useState(false);
  const [visible, setVisible] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Boutique — Coco Bloom";
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const isLoading = loading || productsLoading;

  const filtered = useMemo(() => {
    let list = [...allProducts];
    // Text search: name includes q
    const text = (filters.name || q).toLowerCase();
    if (text) list = list.filter(p => p.name.toLowerCase().includes(text));
    // Category: match tags includes
    if (filters.category) list = list.filter(p => p.tags.some(t => t.toLowerCase().includes(filters.category!.toLowerCase())));
    // Price range
    if (filters.price) list = list.filter(p => p.price >= filters.price!.min && p.price <= filters.price!.max);
    // Sort
    switch (filters.sort) {
      case "priceAsc": list.sort((a,b) => a.price - b.price); break;
      case "priceDesc": list.sort((a,b) => b.price - a.price); break;
      case "new": list = list.reverse(); break; // mock newest
      default: break; // best = default order
    }
    return list;
  }, [filters, q]);

  const activeCount = [
    filters.category ? 1 : 0,
    filters.name ? 1 : 0,
    filters.code ? 1 : 0,
    filters.price ? 1 : 0,
    filters.sort !== "best" ? 1 : 0,
  ].reduce((a,b)=>a+b,0);

  const reset = () => setFilters(initialFilters);
  const applyMobile = () => setOpenSheet(false);

  const showMore = () => setVisible(v => v + 6);

  return (
    <main className="container mx-auto px-4 py-4">
      {/* Top bar */}
      <div className="sticky top-[56px] z-20 bg-background/80 backdrop-blur border-b -mx-4 px-4">
        <div className="h-12 flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Back" className="md:hidden" onClick={() => navigate(-1)}>
            <ChevronLeft />
          </Button>
          <h1 className="font-head text-lg font-semibold">Boutique</h1>
          <span className="w-10" />
        </div>
      </div>

      {/* Search row */}
      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
          <Input
            aria-label="Search"
            placeholder="Rechercher…"
            className="pl-9 rounded-pill"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <Button variant="chip" size="chip" className="md:hidden" onClick={() => setOpenSheet(true)} aria-label="Open filters">
          <Filter />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block">
          <div className="rounded-card border p-4 shadow-soft sticky top-[112px]">
            <FilterPanel value={filters} onChange={setFilters} onReset={reset} />
          </div>
        </aside>

        <section>
          {/* Active filters chip */}
          {activeCount > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <Button variant="chip" size="chip">{activeCount} filtres actifs</Button>
              <button className="text-sm underline" onClick={reset}>Effacer</button>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-card border p-4">
                  <Skeleton className="rounded-card w-full aspect-square" />
                  <Skeleton className="h-4 mt-4 w-3/4" />
                  <Skeleton className="h-4 mt-2 w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-muted-foreground">Aucun produit ne correspond à vos filtres</div>
              <div className="mt-4">
                <Button variant="outline" onClick={reset}>Effacer les filtres</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.slice(0, visible).map(p => (
                  <ProductCard key={p.id} product={p} />)
                )}
              </div>
              {visible < filtered.length && (
                <div className="flex justify-center mt-8">
                  <Button variant="hero" onClick={showMore}>Charger plus</Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side="bottom" className="rounded-t-[--radius-modal]">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterPanel value={filters} onChange={setFilters} onReset={reset} onApply={applyMobile} />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default Shop;
