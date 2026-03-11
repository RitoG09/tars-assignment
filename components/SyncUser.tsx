"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function SyncUser() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (!user) return;

    createUser({
      clerkId: user.id,
      username: user.username || user.firstName || "User",
      image: user.imageUrl,
      email: user.primaryEmailAddress?.emailAddress,
    });
  }, [user]);

  return null;
}
