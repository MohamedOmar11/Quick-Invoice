import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Manage pricing, payments, and promo codes.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Update monthly/yearly/lifetime prices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-primary hover:underline underline-offset-4" href="/admin/pricing">
              Open pricing
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Approve or reject manual payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-primary hover:underline underline-offset-4" href="/admin/payments">
              Review payments
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Promo Codes</CardTitle>
            <CardDescription>Create and manage promo codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-primary hover:underline underline-offset-4" href="/admin/promo-codes">
              Manage promo codes
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

