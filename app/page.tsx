import { SignInButton, Show, UserButton, SignOutButton } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Main Content */}
      <Card className="w-full max-w-md shadow-2xl relative z-10 border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <CardHeader className="text-center space-y-4 pt-10 pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              ChitChat
            </CardTitle>
            <CardDescription className="text-base font-medium text-zinc-500 dark:text-zinc-400">
              A modern way to connect and chat
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-6 pb-10 px-8">
          <Show when="signed-out">
            <div className="w-full space-y-6">
              <SignInButton mode="modal">
                <Button className="w-full h-12 text-base font-semibold shadow-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
                  Get Started
                </Button>
              </SignInButton>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                Join our community and start chatting today.
              </p>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="w-full space-y-8 flex flex-col items-center">
              <div className="rounded-xl border border-orange-200/50 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 p-5 w-full text-center shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight text-orange-800 dark:text-orange-300">
                  Welcome back!
                </h2>
                <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mt-1 font-medium">
                  You are successfully logged in
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-6 w-full">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-70 blur-sm"></div>
                  <div className="relative rounded-full ring-2 ring-background bg-background">
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "w-14 h-14 shadow-sm",
                        },
                      }}
                    />
                  </div>
                </div>

                <SignOutButton>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl font-medium border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </Show>
        </CardContent>
      </Card>
    </main>
  );
}
