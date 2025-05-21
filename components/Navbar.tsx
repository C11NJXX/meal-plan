"use client";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, useUser, SignOutButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return <p>Loading...</p>;
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 ">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href={"/"}>
          <Image
            className="text-xl font-bold text-emerald-700 cursor-pointer"
            alt="Logo"
            src={"/logo.png"}
            width={60}
            height={60}
          />
        </Link>

        {/* 根据是否登陆渲染不同的链接 */}
        <div className="min-w-48 h-full flex items-center justify-between">
          <SignedIn>
            <Link href={"/meal-plan"}>
              <span className="text-gray-700 hover:text-emerald-500 transition-colors">
                MealPlan
              </span>
            </Link>
            {user?.imageUrl ? (
              <Link href={"/profile"}>
                <Image
                  className="rounded-full"
                  src={user.imageUrl}
                  alt="Profile Image"
                  width={40}
                  height={40}
                />
              </Link>
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            )}
            <SignOutButton>
              <button
                className="bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
                style={{ padding: "4px" }}
              >
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>
          <SignedOut></SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
