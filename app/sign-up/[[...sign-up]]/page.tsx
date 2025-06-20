import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto flex justify-center align-center">
      <SignUp forceRedirectUrl={"/create-profile"} />
    </div>
  );
};

export default SignUpPage;
