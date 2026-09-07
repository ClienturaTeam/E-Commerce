import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import {
  Printer,
  Download,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  QrCode,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider, useStore, getProductGstRate } from "@/components/store/store-context";
import { products, inr } from "@/components/store/catalog";

export const Route = createFileRoute("/invoice/$orderId")({
  component: InvoiceRoute,
});

function InvoiceRoute() {
  return (
    <StoreProvider>
      <InvoicePage />
    </StoreProvider>
  );
}

function InvoicePage() {
  const { orderId } = Route.useParams();
  const { orders, user } = useStore();

  const foundOrder = React.useMemo(() => {
    return orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase() || o.id === orderId);
  }, [orderId, orders]);

  // Fallback sample order if orderId is standard sample
  const order = React.useMemo(() => {
    if (foundOrder) return foundOrder;

    const now = new Date();
    const item1 = products[0]!;
    const item2 = products[1] || products[0]!;

    return {
      id: orderId || "KARTLY-ORD-928415",
      date: now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      items: [
        { product: item1, qty: 1, priceAtPurchase: item1.price },
        { product: item2, qty: 1, priceAtPurchase: item2.price },
      ],
      subtotal: item1.price + item2.price,
      discount: (item1.mrp - item1.price) + (item2.mrp - item2.price),
      deliveryCharge: 0,
      couponDiscount: 0,
      totalAmount: item1.price + item2.price + 10,
      address: {
        id: "addr-1",
        name: user?.name || "Rahul Sharma",
        phone: user?.phone || "9876543210",
        house: "Flat 402, Sunshine Heights",
        street: "Road No. 12, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        type: "home" as const,
      },
      payment: {
        method: "upi" as const,
        providerName: "PhonePe",
        upiId: "rahul@ybl",
      },
      status: "DELIVERED" as const,
      estimatedDelivery: "Delivered",
      timeline: [],
    };
  }, [orderId, foundOrder, user]);

  const invoiceNo = `INV-2026-${order.id.replace(/[^0-9]/g, "").slice(0, 8) || "982410"}`;
  const platformFee = 10;

  // Calculate Product Level GST & Taxable Values
  let calculatedSubtotal = 0;
  let calculatedGstTotal = 0;

  const itemsBreakdown = order.items.map((line: any, idx: number) => {
    const unitPrice = line.priceAtPurchase || line.product.price;
    const qty = line.qty || 1;
    const rate = getProductGstRate(line.product);

    const lineTotal = unitPrice * qty;
    // GST Included Calculation
    const taxableValue = Math.round((lineTotal * 100) / (100 + rate));
    const gstAmount = lineTotal - taxableValue;

    calculatedSubtotal += taxableValue;
    calculatedGstTotal += gstAmount;

    return {
      sno: idx + 1,
      product: line.product,
      qty,
      unitPrice,
      taxableValue,
      hsnCode: line.product.category === "electronics" ? "HSN-8471" : line.product.category === "grocery" ? "HSN-1006" : "HSN-6203",
      rate,
      cgstRate: rate / 2,
      sgstRate: rate / 2,
      cgstAmount: Math.round(gstAmount / 2),
      sgstAmount: gstAmount - Math.round(gstAmount / 2),
      gstAmount,
      lineTotal,
    };
  });

  const totalTaxable = calculatedSubtotal;
  const totalGst = calculatedGstTotal;
  const totalCgst = Math.round(totalGst / 2);
  const totalSgst = totalGst - totalCgst;
  const grandTotal = order.totalAmount || totalTaxable + totalGst + platformFee;

  const handlePrintDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-[900px] px-4 py-8 space-y-6">
        {/* Action Controls Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to My Orders</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-primary-foreground hover:bg-brand-deep cursor-pointer transition-all shadow-md"
            >
              <Download className="size-4" /> Download PDF / Print Invoice
            </button>
          </div>
        </div>

        {/* PRINTABLE GST TAX INVOICE CONTAINER */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
          {/* Top Header Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-brand px-3 py-1 text-xl font-black italic tracking-tight text-primary-foreground shadow-xs">
                  Kartly
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  TAX INVOICE
                </span>
              </div>
              <h2 className="text-sm font-extrabold text-foreground pt-2">Kartly Retail Solutions Pvt Ltd</h2>
              <p className="text-xs text-muted-foreground">
                GSTIN: <strong className="text-foreground font-mono">29AAACK1234F1Z9</strong> | PAN: <strong className="text-foreground font-mono">AAACK1234F</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Reg Office: Outer Ring Road, Devarabeesanahalli, Bengaluru, KA - 560103
              </p>
              <p className="text-xs text-muted-foreground">Support: support@kartly.com | Toll-Free: 1800-200-9999</p>
            </div>

            {/* Invoice Reference Metadata */}
            <div className="sm:text-right space-y-1.5 text-xs">
              <div className="inline-flex items-center gap-1.5 bg-brand/10 border border-brand/20 px-3.5 py-1.5 rounded-lg text-brand font-black text-sm">
                Invoice No: {invoiceNo}
              </div>
              <p className="text-muted-foreground font-medium pt-1">
                Order ID: <strong className="text-foreground font-mono">#{order.id}</strong>
              </p>
              <p className="text-muted-foreground font-medium">
                Invoice Date: <strong className="text-foreground">{order.date}</strong>
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="size-3" /> PAYMENT STATUS: PAID ({(order as any).payment?.method?.toUpperCase() || "UPI"})
                </span>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-xl bg-muted/30 border border-border/70 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand block mb-1">
                BILLED TO & SHIPPING ADDRESS
              </span>
              <p className="font-extrabold text-foreground text-sm">
                {(order as any).address?.name || (order as any).deliveryAddress?.fullName || user?.name || "Kartly Customer"}
              </p>
              <p className="text-foreground/90 font-medium">
                {(order as any).address?.house ? `${(order as any).address.house}, ${(order as any).address.street}` : (order as any).deliveryAddress?.addressLine || "Indiranagar"}
              </p>
              <p className="text-muted-foreground">
                {(order as any).address?.city || "Bengaluru"}, {(order as any).address?.state || "Karnataka"} — <strong className="text-foreground font-bold">{(order as any).address?.pincode || "560001"}</strong>
              </p>
              <p className="text-muted-foreground font-medium pt-0.5 flex items-center gap-1">
                <Phone className="size-3 text-brand" /> Phone: +91 {(order as any).address?.phone || "9876543210"}
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-border sm:pl-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand block mb-1">
                SUPPLIER & FULFILLMENT DETAILS
              </span>
              <p className="font-extrabold text-foreground">Kartly Express Fulfillment Depot</p>
              <p className="text-muted-foreground">Fulfillment Node: KA-BLR-DEPOT-04</p>
              <p className="text-muted-foreground">
                Place of Supply: <strong className="text-foreground">Karnataka (State Code 29)</strong>
              </p>
              <p className="text-muted-foreground">
                Reverse Charge Applicable: <strong className="text-foreground">NO</strong>
              </p>
            </div>
          </div>

          {/* ITEM BREAKDOWN TABLE */}
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/80 text-foreground border-b border-border font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">HSN</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  <th className="p-3 text-center">GST %</th>
                  <th className="p-3 text-right">GST Amount</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {itemsBreakdown.map((item: any) => (
                  <tr key={item.product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-center font-bold text-muted-foreground">{item.sno}</td>
                    <td className="p-3">
                      <span className="font-bold text-foreground block">{item.product.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Brand: {item.product.brand} | Category: {item.product.category}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-[11px] text-muted-foreground">{item.hsnCode}</td>
                    <td className="p-3 text-center font-bold text-foreground">{item.qty}</td>
                    <td className="p-3 text-right">{inr(item.unitPrice)}</td>
                    <td className="p-3 text-right font-medium">{inr(item.taxableValue)}</td>
                    <td className="p-3 text-center font-extrabold text-brand">{item.rate}%</td>
                    <td className="p-3 text-right text-muted-foreground">{inr(item.gstAmount)}</td>
                    <td className="p-3 text-right font-bold text-foreground">{inr(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TAX BREAKDOWN & FINAL PRICING SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Detailed CGST & SGST Split */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <span className="font-extrabold text-foreground block uppercase text-[10px] tracking-wider border-b border-border pb-1.5">
                GST Tax Split Breakdown
              </span>
              <div className="flex justify-between text-muted-foreground">
                <span>Central GST (CGST)</span>
                <span className="font-bold text-foreground">{inr(totalCgst)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>State GST (SGST)</span>
                <span className="font-bold text-foreground">{inr(totalSgst)}</span>
              </div>
              <div className="flex justify-between text-foreground border-t border-border pt-1.5 font-extrabold">
                <span>Total Integrated GST</span>
                <span className="text-brand">{inr(totalGst)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground pt-2 leading-tight">
                * Taxes calculated as per Central Goods and Services Tax Act 2017.
              </p>
            </div>

            {/* Price Summary */}
            <div className="p-5 rounded-xl border border-brand/30 bg-brand/5 space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Taxable Amount</span>
                <span className="font-bold text-foreground">{inr(totalTaxable)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total GST Amount</span>
                <span className="font-bold text-brand">+{inr(totalGst)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee</span>
                <span className="font-bold text-foreground">+{inr(platformFee)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-foreground border-t border-brand/20 pt-2">
                <span>Grand Total (Payable)</span>
                <span className="text-brand text-lg">{inr(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* AUTHENTICITY & DIGITAL SIGNATURE SECTION */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <QrCode className="size-12 text-foreground p-1 bg-muted rounded-lg shrink-0" />
              <div>
                <p className="font-extrabold text-foreground text-xs">Digitally Signed & Verified Invoice</p>
                <p className="text-[11px]">
                  This is a computer-generated tax invoice and requires no physical signature under IT Act 2000.
                </p>
                <p className="text-[10px] text-muted-foreground font-mono pt-0.5">Verification Hash: {invoiceNo}-DIGITAL-AUTH-VERIFIED</p>
              </div>
            </div>

            <div className="text-right space-y-1 border border-border p-3 rounded-xl bg-card">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase">For Kartly Retail Solutions Pvt Ltd</p>
              <div className="h-8 flex items-center justify-end font-italic font-black text-brand text-sm tracking-wider">
                Kartly Authorized Signatory
              </div>
              <p className="text-[10px] font-bold text-foreground">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
