"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, Loader2, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // পেমেন্ট প্রসেসিং স্টেট
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bkashStatus, setBkashStatus] = useState<
    "initiating" | "success" | "error"
  >("initiating");

  const discountedTotal = cart.reduce(
    (acc, item) => acc + Number(item.offeredPrice) * item.quantity,
    0,
  );
  const grandTotal = discountedTotal;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });

  // প্রধান ফাংশন: অর্ডার কনফার্ম করা
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethod === "online") {
      setLoading(true);
      setShowPaymentModal(true);
      setBkashStatus("initiating");

      try {
        const response = await fetch("/api/bkash/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: grandTotal }),
        });

        const data = await response.json();
        console.log("Response from API:", data); // ব্রাউজার কনসোলে (F12) এটি দেখুন

        if (data.bkashURL) {
          window.location.href = data.bkashURL;
        } else {
          // বিকাশ থেকে আসা আসল এরর মেসেজটি দেখাবে
          toast.error(data.statusMessage || data.error || "Failed to start");
          setBkashStatus("error"); // আপনার মোডালে এরর দেখাবে
        }
      } catch (error) {
        setBkashStatus("error");
        toast.error("bKash payment failed to start. Try again.");
        setTimeout(() => setShowPaymentModal(false), 2000);
      } finally {
        setLoading(false);
      }
    } else {
      // Cash on Delivery প্রসেস
      processCODOrder();
    }
  };

  const processCODOrder = async () => {
    setLoading(true);
    try {
      // এখানে আপনার অর্ডারের সেভ লজিক থাকবে
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Order Placed Successfully!");
      clearCart();
      router.push("/success-page"); // আপনার সাকসেস পেজ
    } catch (error) {
      toast.error("Order failed.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-blue-600 underline"
        >
          Continue Shopping
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-slate-900 dark:text-slate-100">
      {/* --- bKash Processing Modal (ইউজারকে ওয়েট করানোর জন্য) --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <div className="relative w-full max-w-[380px] bg-white rounded-[24px] overflow-hidden shadow-2xl text-slate-900">
            <div className="bg-[#E2136E] p-6 text-white flex flex-col items-center">
              <img
                src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg"
                className="w-16 h-16 bg-white rounded-full p-2 mb-2"
                alt="bKash"
              />
              <h3 className="text-sm font-bold">bKash Secure Payment</h3>
            </div>

            <div className="p-10 text-center">
              {bkashStatus === "initiating" && (
                <div className="space-y-4">
                  <Loader2
                    className="animate-spin mx-auto text-[#E2136E]"
                    size={40}
                  />
                  <p className="text-sm font-medium">
                    Redirecting to bKash Gateway...
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Please do not close or refresh the window
                  </p>
                </div>
              )}

              {bkashStatus === "error" && (
                <div className="space-y-4">
                  <X className="mx-auto text-red-500" size={40} />
                  <p className="text-sm font-bold">Connection Failed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <h1 className="text-3xl font-black tracking-tighter">
            Checkout Details
          </h1>
          <form onSubmit={handleConfirmOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full Name"
                className="w-full h-12 px-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 outline-none text-sm"
              />
              <input
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Phone Number"
                className="w-full h-12 px-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 outline-none text-sm"
              />
            </div>
            <textarea
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Shipping Address"
              className="w-full p-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 outline-none text-sm resize-none"
              rows={3}
            />

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Select Payment Method
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, paymentMethod: "cod" })
                  }
                  className={`flex-1 h-14 rounded-xl border-2 font-bold text-xs tracking-widest transition-all ${formData.paymentMethod === "cod" ? "border-blue-600 bg-blue-50/10 text-blue-600 shadow-sm" : "border-slate-100"}`}
                >
                  CASH ON DELIVERY
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, paymentMethod: "online" })
                  }
                  className={`flex-1 h-14 rounded-xl border-2 font-bold text-xs tracking-widest transition-all ${formData.paymentMethod === "online" ? "border-pink-600 bg-pink-50/10 text-pink-600 shadow-sm" : "border-slate-100"}`}
                >
                  BKASH ONLINE
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-12 h-14 bg-blue-600 text-white rounded-xl font-black text-xs tracking-[2px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "CONFIRM ORDER"}
            </button>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-5">
          <div className="bg-slate-950 text-white p-8 rounded-[32px] sticky top-28 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">
              Order Summary
            </h2>
            <div className="space-y-4 mb-8">
              {cart.map((item: any, index: number) => (
                <div
                  key={item._id || item.id || index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-slate-400">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-bold">
                    ৳{(item.offeredPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-5 border-t border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                  Total Payable
                </p>
                <p className="text-4xl font-black text-blue-400 tracking-tighter">
                  ৳{grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="text-[9px] text-slate-400 font-medium">
                100% Secure Transaction via bKash
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
