// stripe listen --forward-to localhost:3000/api/webhook
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionDeleted(subscription);
      }
      default:
        console.log("Unhandled event type" + event.type);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({});
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  //从check-out route中的session.metadata中获取用户id等信息
  const userId = session.metadata?.clerkUserId;

  if (!userId) {
    console.log("No user id");
    return;
  }
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.log("No subscription id");
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        subscriptionTier: session.metadata?.planType || null,
      },
    });
  } catch (error: any) {
    console.log(error.message);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoice.id as string;
  if (!subId) {
    console.log("No sub id");
    return;
  }
  let userId: string | null;
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subId },
      select: { userId: true },
    });
    if (!profile?.userId) {
      console.log("No user id");
      return;
    }
    userId = profile.userId;
  } catch (error: any) {
    console.log(error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        subscriptionActive: false,
      },
    });
  } catch (error: any) {
    console.log(error.message);
  }
}

async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const subId = subscription.id as string;

  let userId: string | null;
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subId },
      select: { userId: true },
    });
    if (!profile?.userId) {
      console.log("No user id");
      return;
    }
    userId = profile.userId;
  } catch (error: any) {
    console.log(error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        subscriptionActive: false,
        stripeSubscriptionId: null,
        subscriptionTier: null,
      },
    });
  } catch (error: any) {
    console.log(error.message);
  }
  throw new Error("Function not implemented.");
}
