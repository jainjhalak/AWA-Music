import { useSignIn } from "@clerk/clerk-react"
import { Button } from "./ui/button"


const SignInOAuthButtons = () => {
    const {signIn, isLoaded} = useSignIn()

    if(!isLoaded){
        return null
    }

    const signInWithGoogle = () => {
        signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/auth-callback"
        });
    };

  return (
    <Button onClick={signInWithGoogle} variant={"ghost"} className="w-full text-lime-100 hover:bg-green-900! h-11">
      Continue with Google
    </Button>
  )
}

export default SignInOAuthButtons
