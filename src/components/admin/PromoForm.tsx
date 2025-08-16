import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Promo } from "@/types/models";

const promoSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters."),
  type: z.enum(["percent", "fixed", "freeship"]),
  value: z.coerce.number().min(0, "Value must be a positive number."),
  min_purchase_amount: z.coerce.number().min(0, "Minimum purchase must be a positive number."),
  is_active: z.boolean().default(true),
});

type PromoFormValues = z.infer<typeof promoSchema>;

interface PromoFormProps {
  initialData?: Promo | null;
  onSubmit: (data: PromoFormValues) => void;
  isSubmitting: boolean;
}

export default function PromoForm({ initialData, onSubmit, isSubmitting }: PromoFormProps) {
  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      code: initialData?.code || "",
      type: initialData?.type || "percent",
      value: initialData?.value || 0,
      min_purchase_amount: initialData?.min_purchase_amount || 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., WELCOME10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a promo type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percent">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="freeship">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="min_purchase_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Purchase Amount (MAD)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Active
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Promo Code"}
        </Button>
      </form>
    </Form>
  );
}
