import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts, useProduct } from "@/hooks/useProducts";
import ProductForm from "@/components/admin/ProductForm";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/models";

export default function ProductEdit() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { product: initialData, loading: isLoading } = useProduct(slug || '');
  const { createProduct, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: Omit<Product, 'id' | 'currency' | 'images' | 'variants' | 'specs' | 'volume'> & { quantity: number }) => {
    setIsSubmitting(true);
    try {
      const dataToSave: Omit<Product, 'id' | 'currency'> = {
        ...formData,
        subtitle: formData.subtitle || undefined,
        images: initialData?.images || ['/placeholder.svg'],
        variants: initialData?.variants || undefined,
        specs: initialData?.specs || undefined,
        volume: initialData?.volume || undefined,
        quantity: formData.quantity,
      };

      if (slug && initialData) {
        await updateProduct(initialData.id, dataToSave);
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        await createProduct(dataToSave);
        toast({ title: "Success", description: "Product created successfully." });
      }
      navigate("/admin/products");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save product. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && slug) {
    return <div>Loading product data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{slug ? "Edit Product" : "Add New Product"}</h1>
        <p className="text-muted-foreground">
          {slug ? "Update the details of your product." : "Fill out the form to add a new product."}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
