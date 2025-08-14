import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Package, MapPin, Clock, CheckCircle2, Truck, Home } from "lucide-react";

interface OrderStatus {
  id: string;
  code: string;
  status: "received" | "packed" | "shipped" | "out_for_delivery" | "delivered";
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  timeline: Array<{
    status: string;
    date: string;
    time: string;
    location?: string;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
}

const TrackOrder = () => {
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleTrack = async () => {
    if (!orderCode.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer un code de commande" });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock order data
    const mockOrder: OrderStatus = {
      id: "1",
      code: orderCode.toUpperCase(),
      status: "shipped",
      items: [
        { name: "Sérum Hydratant Visage", qty: 1, price: 390 },
        { name: "Crème Apaisante Visage", qty: 2, price: 340 }
      ],
      customer: {
        name: "Ahmed Benali",
        phone: "+212606123456",
        address: "123 Rue Mohammed V",
        city: "Casablanca"
      },
      timeline: [
        { status: "Commande Reçue", date: "15 Aug 2024", time: "10:30", location: "Centre de traitement Casablanca" },
        { status: "Emballée", date: "15 Aug 2024", time: "14:45", location: "Centre de traitement Casablanca" },
        { status: "Expédiée", date: "16 Aug 2024", time: "09:15", location: "Centre de distribution Casablanca" },
        { status: "En Transit", date: "16 Aug 2024", time: "16:20", location: "En route vers votre adresse" }
      ],
      totals: {
        subtotal: 1070,
        shipping: 30,
        total: 1100
      }
    };

    setOrder(mockOrder);
    setLoading(false);
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
            <div className="flex gap-3">
              <Input
                placeholder="Ex: CB123456"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button 
                variant="hero" 
                onClick={handleTrack}
                disabled={loading}
              >
                {loading ? "Recherche..." : "Suivre"}
              </Button>
            </div>
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
                      <p><strong>{order.customer.name}</strong></p>
                      <p>{order.customer.phone}</p>
                      <p>{order.customer.address}</p>
                      <p>{order.customer.city}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Détails de la Commande</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{order.totals.subtotal} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Livraison:</span>
                        <span>{order.totals.shipping} MAD</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{order.totals.total} MAD</span>
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
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-card"></div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qté: {item.qty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.price} MAD</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Historique de Livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < order.timeline.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {event.date} • {event.time}
                          </span>
                        </div>
                        <p className="font-medium">{event.status}</p>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        )}
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
                    <Button variant="outline">
                      Envoyer un Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Order Found */}
        {orderCode && !order && !loading && (
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