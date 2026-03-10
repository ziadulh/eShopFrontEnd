import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // ২০২৬ স্যান্ডবক্স ক্রেডেনশিয়াল (User02)
    const username = "sandboxTokenizedUser02";
    const password = "sandboxTokenizedUser02@123";
    const app_key = "6wr797f90e9095689409890b5"; 
    const app_secret = "569896895698659856985698569856985698569856985698";

    // ধাপ ১: Grant Token
    const authRes = await fetch("https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "username": username,
        "password": password,
      },
      body: JSON.stringify({ app_key, app_secret }),
      cache: 'no-store' // ক্যাশ প্রতিরোধ করতে
    });

    const authData = await authRes.json();

    if (!authData.id_token) {
      console.error("Auth Fail:", authData);
      return NextResponse.json({ error: "Auth Failed", details: authData }, { status: 401 });
    }

    // ধাপ ২: Create Payment
    const payRes = await fetch("https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authData.id_token,
        "X-App-Key": app_key, // বড় হাতের 'X' দিয়ে ট্রাই করুন
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: "01770618575",
        callbackURL: "http://localhost:3000/api/bkash/callback", 
        amount: String(amount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "INV-" + Date.now(),
      }),
      cache: 'no-store'
    });

    const payData = await payRes.json();

    if (payData.bkashURL) {
      return NextResponse.json({ bkashURL: payData.bkashURL });
    } else {
      console.error("Payment Error:", payData);
      return NextResponse.json(payData, { status: 400 });
    }

  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}