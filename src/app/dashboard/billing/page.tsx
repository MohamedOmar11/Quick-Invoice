"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Zap, UploadCloud, CreditCard, Gift } from "lucide-react";
import { UploadDropzone } from "@/utils/uploadthing";

export default function BillingPage() {
  const { data: session, update } = useSession();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"PAYPAL" | "INSTAPAY" | "VODAFONE" | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [ownerPayment, setOwnerPayment] = useState<{
    ownerInstapayUrl: string | null;
    ownerVodafoneCashNumber: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/app-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setOwnerPayment({
          ownerInstapayUrl: data.ownerInstapayUrl ?? null,
          ownerVodafoneCashNumber: data.ownerVodafoneCashNumber ?? null,
        });
      })
      .catch(() => {});
  }, []);

  const handleRedeemPromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      if (res.ok) {
        setPromoSuccess("Promo code applied successfully! You are now Pro.");
        update(); // Refresh session
      } else {
        const err = await res.text();
        setPromoError(err);
      }
    } catch (e) {
      setPromoError("Something went wrong");
    }
  };

  const handleManualPaymentSubmit = async () => {
    if (!screenshotUrl || !paymentMethod) return;
    setSubmittingPayment(true);
    setPaymentStatus(null);
    try {
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: paymentMethod, amount: 150, screenshotUrl }),
      });
      if (res.ok) {
        setPaymentStatus({ type: "success", message: "Payment submitted successfully. Waiting for admin approval." });
        setPaymentMethod(null);
        setScreenshotUrl("");
      } else {
        const msg = await res.text();
        setPaymentStatus({ type: "error", message: msg || "Failed to submit payment." });
      }
    } catch (e) {
      setPaymentStatus({ type: "error", message: "Something went wrong." });
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plan</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the {session?.user?.plan} plan.</CardDescription>
            </CardHeader>
            <CardContent>
              {session?.user?.plan === "FREE" ? (
                <div className="bg-muted/50 p-6 rounded-xl border border-dashed flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Free Plan
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">You have limited invoices and features.</p>
                  </div>
                  <Button onClick={() => setPaymentMethod("INSTAPAY")} className="rounded-full shadow-sm whitespace-nowrap">
                    Upgrade to Pro
                  </Button>
                </div>
              ) : (
                <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Pro Plan Active</h3>
                    <p className="text-primary/80 text-sm mt-1">Enjoy unlimited invoices and premium features.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {paymentMethod && (
            <Card className="border-primary shadow-md">
              <CardHeader>
                <CardTitle>Upgrade to Pro (150 EGP / month)</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentStatus && (
                  <div
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      paymentStatus.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-red-200 bg-red-50 text-red-900"
                    }`}
                  >
                    {paymentStatus.message}
                  </div>
                )}
                <div className="flex flex-wrap gap-4">
                  {["INSTAPAY", "VODAFONE", "PAYPAL"].map((method) => (
                    <Button 
                      key={method}
                      variant={paymentMethod === method ? "default" : "outline"} 
                      onClick={() => setPaymentMethod(method as any)}
                      className="rounded-full"
                    >
                      {method === "INSTAPAY" ? "InstaPay" : method === "VODAFONE" ? "Vodafone Cash" : "PayPal"}
                    </Button>
                  ))}
                </div>

                {paymentMethod === "PAYPAL" ? (
                  <div className="bg-muted p-6 rounded-lg text-center">
                    <CreditCard className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Pay securely with PayPal</h3>
                    <p className="text-sm text-muted-foreground mb-4">You will be redirected to PayPal to complete your subscription.</p>
                    <Button className="rounded-full w-full max-w-xs" disabled>PayPal Checkout (Coming Soon)</Button>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-6 rounded-lg border border-dashed space-y-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">
                        {paymentMethod === "INSTAPAY" ? "InstaPay Transfer" : "Vodafone Cash Transfer"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please transfer exactly <strong className="text-foreground">150 EGP</strong> to the following account:
                      </p>
                      {paymentMethod === "INSTAPAY" ? (
                        ownerPayment?.ownerInstapayUrl ? (
                          <div className="space-y-3">
                            <div className="bg-background border rounded-lg p-4 text-sm break-all inline-block mx-auto">
                              {ownerPayment.ownerInstapayUrl}
                            </div>
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => window.open(ownerPayment.ownerInstapayUrl as string, "_blank")}
                            >
                              Open InstaPay Link
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-destructive font-medium">
                            Owner InstaPay link is not configured yet.
                          </div>
                        )
                      ) : ownerPayment?.ownerVodafoneCashNumber ? (
                        <div className="bg-background border rounded-lg p-4 font-mono text-xl font-bold tracking-widest inline-block mx-auto mb-2">
                          {ownerPayment.ownerVodafoneCashNumber}
                        </div>
                      ) : (
                        <div className="text-sm text-destructive font-medium">
                          Owner Vodafone Cash number is not configured yet.
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label>Upload Payment Screenshot</Label>
                      {screenshotUrl ? (
                        <div className="relative rounded-lg overflow-hidden border">
                          <img src={screenshotUrl} alt="Screenshot" className="w-full h-auto max-h-[300px] object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="sm" onClick={() => setScreenshotUrl("")}>Remove</Button>
                          </div>
                        </div>
                      ) : (
                        <UploadDropzone
                          endpoint="paymentScreenshot"
                          onClientUploadComplete={(res) => {
                            setScreenshotUrl(res[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            setPaymentStatus({ type: "error", message: error.message });
                          }}
                        />
                      )}
                    </div>

                    <Button 
                      className="w-full rounded-full" 
                      disabled={!screenshotUrl || submittingPayment}
                      onClick={handleManualPaymentSubmit}
                    >
                      {submittingPayment ? "Submitting..." : "Submit for Approval"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Promo Code
              </CardTitle>
              <CardDescription>Have a promo or discount code?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input 
                  placeholder="Enter code" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())} 
                  className="uppercase"
                />
              </div>
              {promoError && <p className="text-sm text-destructive font-medium">{promoError}</p>}
              {promoSuccess && <p className="text-sm text-green-600 font-medium">{promoSuccess}</p>}
              <Button onClick={handleRedeemPromo} className="w-full" disabled={!promoCode}>Redeem</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
