import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Doc } from "@/convex/_generated/dataModel";
import { GroupData } from "@/lib/types";

interface ChatHeaderProps {
  onBack: () => void;
  groupData?: GroupData | null;
  otherUser?: Doc<"users"> | null;
}

export function ChatHeader({ onBack, groupData, otherUser }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200/50 dark:border-white/5 bg-white/95 dark:bg-[#202c33]/95 backdrop-blur-sm shadow-sm z-10 shrink-0 h-16">
      <button
        onClick={onBack}
        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      {groupData ? (
        <>
          <div className="h-10 w-10 rounded-full border border-gray-200 shadow-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold">
            {groupData.groupName?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {groupData.groupName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {groupData.participantDetails?.length} members
            </span>
          </div>
        </>
      ) : otherUser ? (
        <>
          <div className="relative">
            <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
              <AvatarImage
                src={otherUser.image || ""}
                alt={otherUser.username}
              />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                {otherUser.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {otherUser.username}
            </span>
            <span
              className={`text-xs font-medium ${
                otherUser.isOnline
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {otherUser.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
