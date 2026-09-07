import * as React from "react";
import { X, HelpCircle, Receipt, ShieldCheck, Info, Sparkles } from "lucide-react";
import { inr } from "./catalog";
import { getProductGstRate, type CartLine } from "./store-context";

type GstModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartLine[];
  gstTotal: number;
};

export function GstBreakdownModal({ isOpen, onClose, items, gstTotal }: GstModalProps) {
  if (!isOpen) return null;

  const safeItems = items.filter((i) => i && i.product && typeof i.product.price === "number");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-brand/20 text-brand flex items-center justify-center">
              <Receipt className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">GST & Taxes Breakdown</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Statutory Tax Breakdown as per Indian Tax Norms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto font-sans">
          {/* Summary Box */}
          <div className="bg-brand/10 border border-brand/20 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Total GST Applied
              </span>
              <span className="text-xl font-black text-brand">{inr(gstTotal)}</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-brand text-primary-foreground text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="size-3.5 fill-current" /> 100% Tax Compliant
            </span>
          </div>

          {/* Itemized GST Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Product-Wise GST Split ({safeItems.length} Items)
            </h4>

            <div className="border border-border rounded-xl divide-y divide-border bg-background overflow-hidden">
              {safeItems.map((line) => {
                const rate = getProductGstRate(line.product);
                const itemSubtotal = line.product.price * line.qty;
                const itemGst = Math.round((itemSubtotal * rate) / 100);

                return (
                  <div key={line.product.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={line.product.image}
                        alt={line.product.title}
                        className="size-10 object-contain bg-muted p-1 rounded-md shrink-0 border border-border"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{line.product.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {inr(line.product.price)} × {line.qty} = <span className="font-medium">{inr(itemSubtotal)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-extrabold text-brand bg-brand/10 px-2 py-0.5 rounded block mb-0.5">
                        GST {rate}%
                      </span>
                      <span className="font-extrabold text-foreground">{inr(itemGst)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-muted/50 border border-border p-3.5 rounded-xl space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
              <Info className="size-4 text-brand shrink-0" />
              <span>How GST is calculated:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
              <li><strong className="text-foreground">Grocery & Essentials:</strong> 5% GST</li>
              <li><strong className="text-foreground">Fashion & Clothing:</strong> 12% GST</li>
              <li><strong className="text-foreground">Electronics & Appliances:</strong> 18% GST</li>
              <li>All prices are inclusive of vendor statutory margins and calculated per item.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-brand hover:bg-brand-deep text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

type PlatformModalProps = {
  isOpen: boolean;
  onClose: () => void;
  feeAmount?: number;
};

export function PlatformFeeModal({ isOpen, onClose, feeAmount = 10 }: PlatformModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Platform Fee ({inr(feeAmount)})</h3>
              <p className="text-[11px] text-slate-400 font-medium">Why we charge a nominal platform fee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 font-sans text-xs">
          <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 rounded-xl text-center space-y-1">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
              Nominal Charge
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{inr(feeAmount)}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Fixed charge per order</p>
          </div>

          <div className="space-y-2.5 text-muted-foreground leading-relaxed">
            <p className="text-foreground font-semibold">
              The nominal Platform Fee of {inr(feeAmount)} helps us sustain high quality service operations:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border">
                <span className="text-brand font-bold">⚡</span>
                <div>
                  <strong className="text-foreground">24/7 Cloud Infrastructure:</strong> High speed checkout and server security.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border">
                <span className="text-brand font-bold">📦</span>
                <div>
                  <strong className="text-foreground">Fulfillment & Packaging:</strong> Quality checks and secure outer packaging.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border">
                <span className="text-brand font-bold">🎧</span>
                <div>
                  <strong className="text-foreground">Customer Care:</strong> Dedicated support team for quick resolution.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-brand hover:bg-brand-deep text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
