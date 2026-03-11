import { SignInButton } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingCard() {
  return (
    <Card className="w-full max-w-md shadow-2xl relative z-10 border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 to-red-500"></div>
      <CardHeader className="text-center space-y-4 pt-10 pb-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-red-600 shadow-md">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            ChitChat
          </CardTitle>
          <CardDescription className="text-base font-medium text-zinc-500 dark:text-zinc-400">
            Made as an assignment for Tars
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center space-y-6 pb-10 px-8">
        <div className="w-full space-y-6">
          <SignInButton mode="modal">
            <Button className="w-full h-12 text-base font-semibold shadow-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
              Get Started
            </Button>
          </SignInButton>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Join our community{" "}
            <Link
              href={"https://hellotars.com/"}
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              hellotars.com
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
