import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { Package, MapPin, Clock, CheckCircle2, Truck, Home } from "lucide-react";

// This should align with the structure from `useOrders` hook
type OrderWithItems = {
  id: string;
  code: string;
  status: "received" | "packed" | "shipped" | "out_for_delivery" | "delivered";
  customer_name: string;
  phone: string;
  address: string;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
};

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get("code") || "");
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { getOrderByCode, loading } = useOrders();

  const handleTrack = useCallback(async (code?: string) => {
    const codeToTrack = code || orderCode;
    if (!codeToTrack.trim()) {
      toast({ title: "Error", description: "Please enter an order code" });
      return;
    }
    setNotFound(false);
    setOrder(null);
    const result = await getOrderByCode(codeToTrack.trim());
    if (result.success && result.order) {
      setOrder(result.order as OrderWithItems);
    } else {
      setNotFound(true);
      toast({ title: "Order Not Found", description: "Please check the code and try again.", variant: "destructive" });
    }
  }, [getOrderByCode, orderCode]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setOrderCode(code);
      handleTrack(code);
    }
  }, [searchParams, handleTrack]);

  const statusLabels = {
    received: "Commande Reçue",
    packed: "Emballée",
    shipped: "Expédiée",
    out_for_delivery: "En Livraison",
    delivered: "Livrée"
  };

  const statusIcons = {
    received: CheckCircle2,
    packed: Package,
    shipped: Truck,
    out_for_delivery: MapPin,
    delivered: Home
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack();
  };

  const getCurrentStatusIndex = (status: string) => {
    const statuses = ["received", "packed", "shipped", "out_for_delivery", "delivered"];
    return statuses.indexOf(status);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-head text-3xl font-semibold mb-6">Suivre ma Commande</h1>
        
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Entrez votre Code de Commande</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="flex gap-3">
              <Input
                placeholder="Ex: CB123456"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button 
                type="submit"
                variant="hero"
                disabled={loading}
              >
                {loading ? "Recherche..." : "Suivre"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-2">
              Vous pouvez trouver votre code de commande dans l'email de confirmation ou le SMS reçu.
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Commande #{order.code}</CardTitle>
                  <Badge 
                    variant={order.status === "delivered" ? "default" : "secondary"}
                    className="rounded-pill"
                  >
                    {statusLabels[order.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                  {Object.entries(statusLabels).map(([key, label], index) => {
                    const currentIndex = getCurrentStatusIndex(order.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = statusIcons[key as keyof typeof statusIcons];
                    
                    return (
                      <div key={key} className="flex flex-col items-center text-center">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            isCompleted 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-muted-foreground"
                          } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                          <Icon size={16} />
                        </div>
                        <span className={`text-xs ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Informations de Livraison</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>{order.customer_name}</strong></p>
                      <p>{order.phone}</p>
                      <p>{order.address}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Détails de la Commande</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{order.subtotal} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Livraison:</span>
                        <span>{order.shipping} MAD</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{order.total} MAD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Articles Commandés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-card grid place-items-center">
                          <Package size={24} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.total_price} MAD</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Besoin d'Aide?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contactez notre service client pour toute question concernant votre commande.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => window.open('https://wa.me/212607076940', '_blank')}>
                      Contacter via WhatsApp
                    </Button>
                    <a href="mailto:support@cocobloom.ma">
                      <Button variant="outline">
                        Envoyer un Email
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Order Found */}
        {notFound && !loading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="font-semibold mb-2">Commande Introuvable</h3>
              <p className="text-muted-foreground mb-4">
                Aucune commande trouvée avec ce code. Vérifiez le code et réessayez.
              </p>
              <Button variant="outline" onClick={() => setOrderCode("")}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default TrackOrder;