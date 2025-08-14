import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts, useProduct } from "@/hooks/useProducts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/state/cart";
import { track } from "@/lib/analytics";
import { Star, CheckCircle2, Leaf, ShieldCheck, Plus, Minus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const phoneRegex = /^\+212[5-7]\d{8}$/; // Morocco mobile/phone (simplified)
const CodSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().regex(phoneRegex, "Utilisez le format +212 ex: +2126XXXXXXXX"),
  city: z.string().min(2, "Ville requise"),
  address: z.string().min(5, "Adresse requise"),
  notes: z.string().optional(),
  preferredTime: z.string().optional(),
});

type CodForm = z.infer<typeof CodSchema>;

function QuestionModal({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    toast({ title: "Question envoyée", description: "Nous vous répondrons rapidement." });
    setOpen(false);
    setQuestion("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="chip" size="chip" onClick={() => setOpen(true)}>Poser une question</Button>
      <DialogContent className="rounded-[--radius-modal]">
        <DialogHeader>
          <DialogTitle>Question sur {productName}</DialogTitle>
          <DialogDescription>Nous répondons généralement sous 24h.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <Textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Tapez votre question..." aria-label="Votre question" />
          <DialogFooter>
            <Button type="submit" variant="hero" disabled={!question.trim()}>Envoyer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Product = () => {
  const { slug } = useParams();
  const { product, loading: productLoading } = useProduct(slug || '');
  const { products } = useProducts(); // For related products
  const add = useCart(s => s.add);

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CodForm>({ resolver: zodResolver(CodSchema) });

  useEffect(() => {
    if (product) {
      const title = `${product.name} — Coco Bloom`;
      const desc = `${product.name}${product.volume ? ` · ${product.volume}` : ""} — ${product.description}`;
      document.title = title;
      // Meta description
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      if (meta) meta.content = desc.slice(0, 155);
      // Canonical
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      if (link) link.href = window.location.href;
    }
  }, [product]);

  if (productLoading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="text-center">Chargement du produit...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-10">
        <h1 className="font-head text-2xl font-semibold mb-2">Produit introuvable</h1>
        <p className="text-muted-foreground">Le produit que vous recherchez n'existe pas.</p>
        <div className="mt-6"><Link to="/shop" className="underline">Retour à la Boutique</Link></div>
      </main>
    );
  }

  const price = `${product.price} MAD`;
  const rating = { value: 4.6, count: 128 }; // mock

  const canAdd = product.variants ? product.variants.every(v => selections[v.id]) : true;

  const onSelect = (groupId: string, option: string) => {
    setSelections(prev => ({ ...prev, [groupId]: option }));
    track({ name: "variant_select", payload: { productId: product.id, group: groupId, option } });
  };

  const onAddToCart = () => {
    if (!canAdd) return;
    add({ productId: product.id, qty, unitPrice: product.price, variantSelections: selections });
    toast({ title: "Ajouté au panier", description: product.name });
    track({ name: "add_to_cart", payload: { productId: product.id, qty, variants: selections } });
  };

  const openBuyNow = () => {
    setBuyOpen(true);
    track({ name: "buy_now_opened", payload: { productId: product.id } });
  };

  const whatsappText = encodeURIComponent([
    `Bonjour, je souhaite commander:`,
    `${product.name}${product.volume ? ` · ${product.volume}` : ""}`,
    product.variants ? `Options: ${product.variants.map(v => `${v.name}: ${selections[v.id] || "-"}`).join(", ")}` : undefined,
    `Qté: ${qty}`,
  ].filter(Boolean).join("\n"));
  const whatsappUrl = `https://wa.me/212607076940?text=${whatsappText}`;

  const onWhatsapp = () => {
    track({ name: "whatsapp_click", payload: { productId: product.id, qty } });
    window.open(whatsappUrl, "_blank");
  };

  const submitCod = async (data: CodForm) => {
    await new Promise(r => setTimeout(r, 500)); // mock
    const code = `CB${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setOrderCode(code);
    track({ name: "cod_submit", payload: { productId: product.id, orderCode: code } });
    reset();
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating.value,
      reviewCount: rating.count,
    },
  };

  return (
    <main className="container mx-auto px-4 pb-24 pt-4">
      {/* Above the fold */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* Media gallery */}
        <div>
          <div className="rounded-card bg-secondary overflow-hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((src, i) => (
                  <CarouselItem key={i}>
                    <div className="aspect-square grid place-items-center">
                      <img src={src} alt={`${product.name} image ${i + 1}`} className="max-h-72" loading="lazy" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          {/* Thumbnails */}
          <div className="mt-3 flex gap-2">
            {product.images.map((src, i) => (
              <div key={i} className="size-14 rounded-md overflow-hidden bg-secondary grid place-items-center">
                <img src={src} alt={`Thumbnail ${i + 1}`} className="h-10" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="font-head text-2xl font-semibold leading-tight line-clamp-2">
            {product.name}{product.volume ? ` · ${product.volume}` : ""}
          </h1>

          {/* Rating + price */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Star className="text-accent" size={16} />
              <span>{rating.value}</span>
              <span className="text-muted-foreground">({rating.count})</span>
            </div>
            <div className="text-2xl font-semibold">{price}</div>
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-pill"><CheckCircle2 className="mr-1" size={14}/> En Stock</Badge>
            {product.tags.includes("végan") && (
              <Badge variant="secondary" className="rounded-pill"><Leaf className="mr-1" size={14}/> Végan</Badge>
            )}
            {product.specs?.some(s => /dermatologist/i.test(s)) && (
              <Badge variant="secondary" className="rounded-pill"><ShieldCheck className="mr-1" size={14}/> Testé Dermatologiquement</Badge>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-6 space-y-4">
              {product.variants.map(v => (
                <div key={v.id}>
                  <div className="text-sm font-medium mb-2">{v.name}</div>
                  <div className="flex gap-2 flex-wrap">
                    {v.options.map(opt => (
                      <Button key={opt} variant={selections[v.id] === opt ? "hero" : "chip"} size="chip" onClick={() => onSelect(v.id, opt)}>
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Quantité</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Diminuer" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus/></Button>
              <Input className="w-16 text-center" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value || '1')))} aria-label="Quantité" />
              <Button variant="outline" size="icon" aria-label="Augmenter" onClick={() => setQty(q => q + 1)}><Plus/></Button>
            </div>
          </div>

          {/* Primary actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="hero" onClick={openBuyNow} disabled={!canAdd}>Acheter Maintenant</Button>
            <Button variant="secondary" onClick={onAddToCart} disabled={!canAdd}>Ajouter au Panier</Button>
            <Button variant="outline" onClick={onWhatsapp}>Commander via WhatsApp</Button>
          </div>
        </div>
      </section>

      {/* Benefit proof */}
      <section className="mt-10 grid md:grid-cols-3 gap-4">
        <div className="rounded-card border p-4 shadow-soft">
          <div className="font-medium mb-1">Deep hydration</div>
          <p className="text-sm text-muted-foreground">Locks in moisture for 24h with clean, gentle ingredients.</p>
        </div>
        <div className="rounded-card border p-4 shadow-soft">
          <div className="font-medium mb-1">Clinically tested</div>
          <p className="text-sm text-muted-foreground">Dermatologist-tested for sensitive skin.</p>
        </div>
        <div className="rounded-card border p-4 shadow-soft">
          <div className="font-medium mb-1">Visible results</div>
          <p className="text-sm text-muted-foreground">92% reported softer skin after 7 days.</p>
        </div>
      </section>

      {/* Ingredients & safety */}
      <section className="mt-10">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Key Ingredients</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Hyaluronic Acid — hydration</li>
                <li>Niacinamide — even tone</li>
                <li>Vitamin E — antioxidant support</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Full INCI list</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">Aqua, Glycerin, Butyrospermum Parkii (Shea) Butter, Sodium Hyaluronate, Niacinamide, Tocopherol, ...</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Allergen info</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">Free from parabens, phthalates, and synthetic dyes. Always patch test.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* How to use */}
      <section className="mt-10 rounded-card border p-4 shadow-soft">
        <h2 className="font-head text-xl font-semibold mb-2">How to use</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sm text-muted-foreground">
          <li>Apply 2–3 drops to clean skin.</li>
          <li>Massage gently until absorbed.</li>
          <li>Follow with moisturizer and SPF AM.</li>
        </ol>
        <div className="mt-3 text-sm"><a className="underline" href="#">Compatible Routine</a></div>
      </section>

      {/* Routine builder / cross-sell */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-head text-xl font-semibold">Pairs well with</h2>
          <Button variant="chip" size="chip">Add bundle</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.filter(p => p.id !== product.id).slice(0,3).map(p => (
            <Link key={p.id} to={`/product/${p.slug}`} className="min-w-[200px] rounded-card border p-4 shadow-soft hover:shadow-softer">
              <div className="rounded-card bg-secondary aspect-square grid place-items-center overflow-hidden">
                <img src={p.images[0]} alt={p.name} className="h-24" loading="lazy" />
              </div>
              <div className="mt-3 text-sm line-clamp-2">{p.name}{p.volume ? ` · ${p.volume}` : ""}</div>
              <div className="text-base font-semibold">{p.price} MAD</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Social proof placeholders */}
      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold mb-3">Reviews</h2>
        <div className="rounded-card border p-4 text-sm text-muted-foreground">Reviews coming soon.</div>
      </section>

      {/* Q&A */}
      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold mb-3">Q&A</h2>
        <div className="rounded-card border p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Have a question about this product?</div>
          <QuestionModal productName={product.name} />
        </div>
      </section>

      {/* Policies / trust */}
      <section className="mt-10 grid md:grid-cols-3 gap-4">
        <div className="rounded-card border p-4"><div className="font-medium">Delivery</div><p className="text-sm text-muted-foreground">48–72h nationwide</p></div>
        <div className="rounded-card border p-4"><div className="font-medium">Returns</div><p className="text-sm text-muted-foreground">Free returns within 7 days</p></div>
        <div className="rounded-card border p-4"><div className="font-medium">Secure COD</div><p className="text-sm text-muted-foreground">Pay on delivery, satisfaction guaranteed</p></div>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="font-head text-xl font-semibold mb-2">FAQ</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="f1">
            <AccordionTrigger>Shipping times</AccordionTrigger>
            <AccordionContent>Orders ship within 24h and arrive in 48–72h.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="f2">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>We offer free returns within 7 days.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="f3">
            <AccordionTrigger>How COD works</AccordionTrigger>
            <AccordionContent>Pay cash or card on delivery. Our courier will contact you.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Sticky bottom bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur md:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-lg font-semibold mr-auto">{price}</div>
          <Button variant="secondary" onClick={onAddToCart} disabled={!canAdd}>Ajouter au Panier</Button>
          <Button variant="hero" onClick={openBuyNow} disabled={!canAdd}>Acheter Maintenant</Button>
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* COD Modal */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="rounded-[--radius-modal]">
          <DialogHeader>
            <DialogTitle>Cash on Delivery</DialogTitle>
            <DialogDescription>Enter your details to place the order.</DialogDescription>
          </DialogHeader>

          {orderCode ? (
            <div className="space-y-3">
              <div className="text-lg">Your order code:</div>
              <div className="text-2xl font-semibold">{orderCode}</div>
              <Link to="/track-order" className="underline">Track Order</Link>
              <div className="pt-2">
                <Button variant="secondary" onClick={() => { setOrderCode(null); setBuyOpen(false); }}>Close</Button>
              </div>
            </div>
          ) : (
            <form className="grid gap-3" onSubmit={handleSubmit(submitCod)}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full name</label>
                <Input placeholder="Jane Doe" aria-label="Full name" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Phone (+212)</label>
                <Input placeholder="+2126XXXXXXXX" aria-label="Phone" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">City</label>
                <Input placeholder="Casablanca" aria-label="City" {...register("city")} />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Address</label>
                <Textarea placeholder="Street, building, floor" aria-label="Address" {...register("address")} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Preferred delivery time</label>
                <Input placeholder="e.g., 9am–12pm" aria-label="Preferred delivery time" {...register("preferredTime")} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea placeholder="Any instructions for the courier" aria-label="Notes" {...register("notes")} />
              </div>

              <DialogFooter>
                <Button type="submit" variant="hero" disabled={isSubmitting || !canAdd}>
                  {isSubmitting ? "Submitting…" : "Place Order"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Product;
