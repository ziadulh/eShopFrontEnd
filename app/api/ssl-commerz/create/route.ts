import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, customerName, customerPhone } = await req.json();

    // SSLCommerz স্যান্ডবক্স ক্রেডেনশিয়াল
    const store_id = "testbox"; 
    const store_passwd = "qwerty"; 
    
    const tran_id = 'REF' + Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // SSLCommerz এর প্রয়োজনীয় প্যারামিটার
    const details = new URLSearchParams();
    details.append('store_id', store_id);
    details.append('store_passwd', store_passwd);
    details.append('total_amount', String(amount));
    details.append('currency', 'BDT');
    details.append('tran_id', tran_id);
    details.append('success_url', `${baseUrl}/api/ssl-commerz/success`);
    details.append('fail_url', `${baseUrl}/api/ssl-commerz/fail`);
    details.append('cancel_url', `${baseUrl}/api/ssl-commerz/cancel`);
    details.append('ipn_url', `${baseUrl}/api/ssl-commerz/ipn`);
    details.append('cus_name', customerName || 'Customer');
    details.append('cus_email', 'test@test.com');
    details.append('cus_add1', 'Dhaka');
    details.append('cus_city', 'Dhaka');
    details.append('cus_state', 'Dhaka');
    details.append('cus_postcode', '1000');
    details.append('cus_country', 'Bangladesh');
    details.append('cus_phone', customerPhone || '01700000000');
    details.append('shipping_method', 'NO');
    details.append('product_name', 'Ecommerce_Product');
    details.append('product_category', 'General');
    details.append('product_profile', 'general');

    // সরাসরি SSLCommerz স্যান্ডবক্স এপিআই কল
    const response = await fetch("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: details,
    });

    // এখানে fetch না চললে আপনার Node.js ভার্সন আপডেট করতে হবে (v18+)
    const responseData = await response.json();

    if (responseData.status === 'SUCCESS' && responseData.GatewayPageURL) {
      return NextResponse.json({ url: responseData.GatewayPageURL });
    } else {
      return NextResponse.json({ 
        error: "Session failed", 
        details: responseData.failedreason || "Invalid response" 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("SSL Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}