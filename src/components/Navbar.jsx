import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import "../app/css/navbar.css"
const Navbar = () => {
  const { userId } = auth();
  return (
    <div>
      <ul
       className="navSpan"
      >
        <div>
          <Link href='/'>
            <i className='fa-solid fa-house'></i>
          </Link>
        </div>
        <div>
          <Link href='/dashboard'>
            <i class='fa-solid fa-chart-line'></i>{' '}
          </Link>
        </div>
        {/* <div className="flex items-center">
          <Link href="/editor">
            <li>Editor</li>
          </Link>
        </div> */}
        <div>
          {!userId ? (
            <>
              <Link href='/sign-in'>
                <li>Login</li>
              </Link>
              <Link href='/sign-up'>
                <li>Sign Up</li>
              </Link>
            </>
          ) : (
            <>
              <li className='flex items-center'>
                <UserButton />
              </li>
            </>
          )}
        </div>
      </ul>
    </div>
  )
};

export default Navbar;
