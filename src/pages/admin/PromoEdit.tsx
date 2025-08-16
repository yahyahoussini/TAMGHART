import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePromos } from "@/hooks/usePromos";
import PromoForm from "@/components/admin/PromoForm";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Promo } from "@/types/models";

export default function PromoEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { promos, createPromo, updatePromo } = usePromos();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData = id ? promos.find(p => p.id === id) : null;

  const handleSubmit = async (formData: Omit<Promo, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (id && initialData) {
        await updatePromo(id, formData);
        toast({ title: "Success", description: "Promo code updated successfully." });
      } else {
        await createPromo(formData);
        toast({ title: "Success", description: "Promo code created successfully." });
      }
      navigate("/admin/promos");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save promo code.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{id ? "Edit Promo Code" : "Add New Promo Code"}</h1>
        <p className="text-muted-foreground">
          {id ? "Update the details of the promo code." : "Fill out the form to add a new promo code."}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Promo Code Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PromoForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
