import { ShoppingBag, Search, SlidersHorizontal, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/state/cart";
import { useState } from "react";

const Header = () => {
  const { itemsCount } = useCart();
  const location = useLocation();
  const onShop = location.pathname.startsWith("/shop");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-pill bg-secondary flex items-center justify-center">
            <span className="sr-only">Coco Bloom</span>
            <span className="text-sm font-semibold">CB</span>
          </div>
          <span className="font-head text-lg font-semibold">Coco Bloom</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="story-link">Accueil</Link>
          <Link to="/shop" className="story-link">Boutique</Link>
          <Link to="/track-order" className="story-link">Suivre Commande</Link>
          <Link to="/blog" className="story-link">Blog</Link>
          <Link to="/about" className="story-link">À Propos</Link>
          <Link to="/contact" className="story-link">Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Rechercher" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>
          {onShop && (
            <Button variant="ghost" size="icon" aria-label="Filtres" className="hidden sm:flex">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Panier">
              <ShoppingBag className="h-4 w-4" />
            </Button>
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] grid place-items-center">
                {itemsCount}
              </span>
            )}
          </Link>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="md:hidden">
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg py-2 story-link" onClick={() => setIsOpen(false)}>
                  Accueil
                </Link>
                <Link to="/shop" className="text-lg py-2 story-link" onClick={() => setIsOpen(false)}>
                  Boutique
                </Link>
                <Link to="/track-order" className="text-lg py-2 story-link" onClick={() => setIsOpen(false)}>
                  Suivre Commande
                </Link>
                <Link to="/blog" className="text-lg py-2 story-link" onClick={() => setIsOpen(false)}>
                  Blog
                </Link>
                <Link to="/about" className="text-lg py-2 story-link" onClick={() => setIsOpen(false)}>
                  À Propos
                </Link>
                <Link to="/contact" className="text-lg py-2 story-link" onClick={() => setIsOpen(false)}>
                  Contact
                </Link>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" aria-label="Rechercher">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                  {onShop && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" aria-label="Filtres">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtres
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
