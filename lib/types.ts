import { Doc } from "@/convex/_generated/dataModel";

export type GroupData = Doc<"conversations"> & {
  otherUser?: Doc<"users"> | null;
  participantDetails?: (Doc<"users"> | null)[];
  unreadCount?: number;
};
