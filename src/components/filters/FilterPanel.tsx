import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { categories, priceRanges, SortKey } from "@/data/products";

interface Filters {
  sort: SortKey;
  category: string | null;
  name: string;
  code: string;
  price: { min: number; max: number } | null;
}

interface Props {
  value: Filters;
  onChange: (v: Filters) => void;
  onApply?: () => void;
  onReset?: () => void;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "best", label: "Meilleures Ventes" },
  { key: "new", label: "Nouveautés" },
  { key: "priceAsc", label: "Prix: Croissant" },
  { key: "priceDesc", label: "Prix: Décroissant" },
];

const FilterPanel = ({ value, onChange, onApply, onReset }: Props) => {
  const set = (partial: Partial<Filters>) => onChange({ ...value, ...partial });

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-2">Trier</h4>
        <div className="flex gap-2 overflow-x-auto">
          {sortOptions.map(o => (
            <Button key={o.key} variant={value.sort === o.key ? "hero" : "chip"} size="chip" onClick={() => set({ sort: o.key })}>
              {o.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Catégories</h4>
        <div className="flex gap-2 overflow-x-auto">
          <Button variant={!value.category ? "hero" : "chip"} size="chip" onClick={() => set({ category: null })}>Tous</Button>
          {categories.map(cat => (
            <Button key={cat} variant={value.category === cat ? "hero" : "chip"} size="chip" onClick={() => set({ category: cat })}>
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <Input placeholder="Nom du Produit" value={value.name} onChange={e => set({ name: e.target.value })} aria-label="Nom du Produit" />
        <Input placeholder="Code Produit (SKU)" value={value.code} onChange={e => set({ code: e.target.value })} aria-label="Code Produit" />
      </div>

      <div>
        <h4 className="font-semibold mb-2">Gamme de Prix</h4>
        <div className="flex gap-2 flex-wrap">
          {priceRanges.map(r => {
            const selected = value.price?.min === r.min && value.price?.max === r.max;
            return (
              <Button key={r.label} variant={selected ? "hero" : "chip"} size="chip" onClick={() => set({ price: selected ? null : { min: r.min, max: r.max } })}>
                {r.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onReset}>Réinitialiser</Button>
        <Button variant="hero" onClick={onApply}>Appliquer</Button>
      </div>
    </div>
  );
};

export type { Filters };
export default FilterPanel;
