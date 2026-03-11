import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { customerDetails, items, totalAmount, paymentMethod } = await req.json();
    await dbConnect();

    const orderId = "ORD" + Date.now(); // ইউনিক আইডি জেনারেশন

    const newOrder = new Order({
      orderId,
      customer: customerDetails,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: "pending", // শুরুতে পেন্ডিং থাকবে
    });

    const ooo = await newOrder.save();
    console.log('test ziadul', ooo);
    

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Order creation failed" }, { status: 500 });
  }
}