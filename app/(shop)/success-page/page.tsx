"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const trxID = searchParams.get("trxID");
  const { clearCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    if (isMounted && trxID) {
      clearCart();
    }

    return () => {
      isMounted = false;
    };
  }, [trxID]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <CheckCircle2 size={80} className="text-emerald-500 mb-6" />
      <h1 className="text-3xl font-black">Payment Successful!</h1>
      <p className="mt-2 text-slate-500 text-sm">
        Transaction ID: <span className="font-bold text-blue-600">{trxID}</span>
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold"
      >
        Back to Home
      </button>
    </div>
  );
}

// Next.js এ useSearchParams ব্যবহার করলে Suspense দিয়ে র‍্যাপ করা জরুরি
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}