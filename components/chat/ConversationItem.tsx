import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { GroupData } from "@/lib/types";

interface ConversationItemProps {
  conv: GroupData;
  isSelected: boolean;
  currentUser: Doc<"users"> | null | undefined;
  users?: Doc<"users">[];
  onClick: (id: Id<"conversations">) => void;
}

export function ConversationItem({
  conv,
  isSelected,
  currentUser,
  users,
  onClick,
}: ConversationItemProps) {
  const displayAvatar = conv.isGroup ? "" : conv.otherUser?.image || "";
  const displayName = conv.isGroup ? conv.groupName : conv.otherUser?.username;
  const membersSubtext = conv.isGroup
    ? `${conv.participantDetails?.length} members`
    : conv.otherUser?.isOnline
      ? "Online"
      : "Offline";
  const isOnline = !conv.isGroup && (conv.otherUser?.isOnline || false);

  const typingOtherUserIds =
    conv.typingUsers?.filter((id) => id !== currentUser?._id) || [];
  const typingNames = typingOtherUserIds
    .map((id) => users?.find((u) => u._id === id)?.username)
    .filter(Boolean);

  let typingText = "";
  if (typingNames.length === 1) {
    typingText = `${typingNames[0]} is typing...`;
  } else if (typingNames.length > 1) {
    typingText = `${typingNames.join(", ")} are typing...`;
  }

  return (
    <div
      className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-4 ${
        isSelected
          ? "bg-orange-50 dark:bg-orange-950/30 border-r-4 border-orange-500"
          : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-r-4 border-transparent"
      }`}
      onClick={() => onClick(conv._id)}
    >
      <div className="relative shrink-0">
        {conv.isGroup ? (
          <div className="h-12 w-12 rounded-full border border-gray-200 shadow-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold text-lg">
            {conv.groupName?.substring(0, 2).toUpperCase()}
          </div>
        ) : (
          <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
              {displayName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {displayName}
          </span>
          {(conv.unreadCount ?? 0) > 0 && (
            <span className="bg-orange-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
              {conv.unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {typingText ? (
            <span className="text-orange-500 font-medium italic animate-pulse">
              {typingText}
            </span>
          ) : (
            conv.lastMessage ||
            (conv.isGroup ? membersSubtext : "Start a new conversation")
          )}
        </span>
      </div>
    </div>
  );
}
