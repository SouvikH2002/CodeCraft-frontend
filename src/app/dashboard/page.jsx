"use client";
import { useUser } from "@clerk/nextjs";

function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }
  return (
    <>
      <div className="h-full flex flex-col items-center justify-center text-2xl">
        Hello, {user.firstName} welcome to The Dashboard
    </div>
    </>
  );
}

export default Dashboard;
