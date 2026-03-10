// app/api/bkash/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // ১. প্রথমে Grant Token নিতে হবে (বিকাশ ইউজারনেম/পাসওয়ার্ড দিয়ে)
    // ২. তারপর Create Payment API কল করতে হবে mode: '0011' দিয়ে
    
    // আপাতত স্যান্ডবক্স টেস্ট করার জন্য একটি ডামি রেসপন্স সিমুলেশন:
    // আসল ইন্টিগ্রেশনে এখানে বিকাশের fetch কল হবে।
    const bkashURL = "https://sandbox.bka.sh/test-url-from-backend"; 

    return NextResponse.json({ bkashURL });
  } catch (error) {
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}