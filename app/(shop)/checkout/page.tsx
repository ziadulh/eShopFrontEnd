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
  const [paymentStatus, setPaymentStatus] = useState<
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
    setLoading(true);

    try {
      // ১. প্রথমে আমাদের ডাটাবেজে অর্ডারটি সেভ করা (COD এবং Online উভয়ের জন্য)
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerDetails: formData,
          items: cart,
          totalAmount: grandTotal,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // ২. পেমেন্ট মেথড অনুযায়ী পরবর্তী পদক্ষেপ
      if (formData.paymentMethod === "online") {
        setShowPaymentModal(true);
        setPaymentStatus("initiating");

        const sslResponse = await fetch("/api/ssl-commerz/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: grandTotal,
            customerName: formData.name,
            customerPhone: formData.phone,
            orderId: orderData.orderId, // আমাদের জেনারেট করা অর্ডার আইডি পাঠানো
          }),
        });

        const sslData = await sslResponse.json();
        if (sslData.url) {
          window.location.href = sslData.url;
        } else {
          throw new Error("SSL Session failed");
        }
      } else {
        // ৩. ক্যাশ অন ডেলিভারি হলে সরাসরি সাকসেস পেজে (অর্ডার আইডি সহ)
        toast.success("Order Placed Successfully!");
        clearCart();
        router.push(
          `/success-page?orderId=${orderData.orderId}&status=pending`,
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setPaymentStatus("error");
      setTimeout(() => setShowPaymentModal(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const processCODOrder = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Order Placed Successfully!");
      clearCart();
      router.push("/success-page");
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
      {/* --- SSLCommerz Processing Modal --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <div className="relative w-full max-w-[380px] bg-white rounded-[24px] overflow-hidden shadow-2xl text-slate-900">
            <div className="bg-[#005a8b] p-6 text-white flex flex-col items-center">
              <img
                src="https://securepay.sslcommerz.com/gwprocess/v4/image/gw/sslc.png"
                className="h-10 bg-white rounded-lg px-2 py-1 mb-2"
                alt="SSLCommerz"
              />
              <h3 className="text-sm font-bold">Secure Checkout</h3>
            </div>

            <div className="p-10 text-center">
              {paymentStatus === "initiating" && (
                <div className="space-y-4">
                  <Loader2
                    className="animate-spin mx-auto text-[#005a8b]"
                    size={40}
                  />
                  <p className="text-sm font-medium">
                    Redirecting to Payment Gateway...
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Bikash, Nagad, Cards & More
                  </p>
                </div>
              )}

              {paymentStatus === "error" && (
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
                  className={`flex-1 h-14 rounded-xl border-2 font-bold text-xs tracking-widest transition-all ${formData.paymentMethod === "online" ? "border-blue-900 bg-blue-50/10 text-blue-900 shadow-sm" : "border-slate-100"}`}
                >
                  PAY ONLINE
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
                100% Secure Transaction via SSLCommerz
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}