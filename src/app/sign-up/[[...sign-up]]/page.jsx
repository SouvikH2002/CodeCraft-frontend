import { SignUp } from "@clerk/nextjs";
function signup() {
  return (
    <div className="flex items-center justify-center h-full">
      <SignUp afterSignOutUrl="/" />
    </div>
  );
}

export default signup;
