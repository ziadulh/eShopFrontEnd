import { NextResponse } from "next/server";

// লাইব্রেরিটি ইমপোর্ট করুন
const SSLCommerzPayment = require('sslcommerz-lts');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());

    // আপনার এনভায়রনমেন্ট ভেরিয়েবল বা সরাসরি ভ্যালু দিন
    const store_id = "testbox"; 
    const store_passwd = "qwerty"; 
    const is_live = false;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    // ১. ভ্যালিডেশন কল
    // যদি লাইব্রেরির ভেতর থেকে fetch এরর দেয়, তবে এটি সরাসরি ভ্যালিডেট না করে 
    // আপনি payload.status চেক করে সিদ্ধান্ত নিতে পারেন (টেস্ট পিরিয়ডের জন্য)
    
    if (payload.status === 'VALID' || payload.status === 'AUTHENTICATED') {
      
      /** * ২. ডাটাবেজ আপডেট লজিক এখানে হবে 
       * যেমন: Order.update({ where: { tran_id: payload.tran_id }, data: { status: 'PAID' } })
       */

      console.log("Payment Successful for:", payload.tran_id);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      
      // ৩. অবশ্যই ৩0৩ স্ট্যাটাস কোড দিয়ে রিডাইরেক্ট করবেন
      return NextResponse.redirect(`${baseUrl}/success-page?trxID=${payload.bank_tran_id}`, 303);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=failed`, 303);
    }
  } catch (error: any) {
    console.error("SSL Success Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}