import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPriceIDFromType } from "@/lib/plan";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" });
    }

    const { newPlan } = await request.json();

    if (!newPlan) {
      return NextResponse.json({ error: "New Plan is Required" });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "No Profile Found" });
    }
    if (!profile.stripeSubscriptionId) {
      return NextResponse.json({ error: "No Acitve Subscription Found" });
    }
    const subscriptionId = profile.stripeSubscriptionId;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json({ error: "No Acitve Subscription Found" });
    }

    const updateSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        items: [{ id: subscriptionItemId, price: getPriceIDFromType(newPlan) }],
        proration_behavior: "create_prorations",
      }
    );

    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: newPlan,
        stripeSubscriptionId: updateSubscription.id,
        subscriptionActive: true,
      },
    });
    return NextResponse.json({ subscription: updateSubscription });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Internal Error",
      },
      {
        status: 500,
      }
    );
  }
}
