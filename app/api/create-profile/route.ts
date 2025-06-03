import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("Creating Schema");
    const clerkUser = await currentUser();
    //若用户不存在
    if (!clerkUser) {
      return NextResponse.json(
        {
          error: "User not Found in Clerk",
        },
        {
          status: 404,
        }
      );
    }
    //若用户未提供邮箱
    const email = clerkUser.emailAddresses[0].emailAddress;
    if (!email) {
      return NextResponse.json(
        {
          error: "User does not have an email address",
        },
        {
          status: 400,
        }
      );
    }
    //检查用户是否已存在
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    if (existingProfile) {
      return NextResponse.json({
        message: "Profile already exists.",
      });
    }
    //若上方都不满足，则创建用户至数据库
    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json(
      {
        message: "Profile created successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "internal error",
      },
      { status: 500 }
    );
  }
}
