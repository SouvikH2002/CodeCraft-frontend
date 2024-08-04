import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { userId } = auth();
  return (
    <div className="bg-cyan-950 rounded-b-xl">
      <ul className="flex justify-between py-4 px-6">
        <div>
          <Link href="/">
            <li>Home</li>
          </Link>
        </div>
        <div className="flex items-center">
          <Link href="/dashboard">
            <li>Dashboard</li>
          </Link>
        </div>
        {/* <div className="flex items-center">
          <Link href="/editor">
            <li>Editor</li>
          </Link>
        </div> */}
        <div className="flex gap-6 items-center">
          {!userId ? (
            <>
              <Link href="/sign-in">
                <li>Login</li>
              </Link>
              <Link href="/sign-up">
                <li>Sign Up</li>
              </Link>
            </>
          ) : (
            <>
              <li className="flex items-center">
                <UserButton />
              </li>
            </>
          )}
        </div>
      </ul>
    </div>
  );
};

export default Navbar;
