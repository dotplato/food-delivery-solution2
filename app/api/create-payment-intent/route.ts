// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
  });

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  if (!amount) {
    return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in cents
      currency: 'usd',
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}