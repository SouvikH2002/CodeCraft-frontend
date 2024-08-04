import { SignIn } from "@clerk/nextjs";
function signpage() {
  return (
    <div className="flex items-center justify-center h-full">
      <SignIn afterSignOutUrl="/" />
    </div>
  );
}

export default signpage;
