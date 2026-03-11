import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Doc } from "@/convex/_generated/dataModel";

interface UserItemProps {
  user: Doc<"users">;
  isSelected: boolean;
  onClick: () => Promise<void>;
}

export function UserItem({ user, isSelected, onClick }: UserItemProps) {
  return (
    <div
      className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-4 ${
        isSelected
          ? "bg-orange-50 dark:bg-orange-950/30 border-r-4 border-orange-500"
          : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-r-4 border-transparent"
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
          <AvatarImage src={user.image || ""} alt={user.username} />
          <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
          {user.username}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          Start a new conversation
        </span>
      </div>
    </div>
  );
}
