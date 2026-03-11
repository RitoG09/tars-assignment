import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Id, Doc } from "@/convex/_generated/dataModel";

interface CreateGroupModalProps {
  users?: Doc<"users">[];
  currentUser?: Doc<"users"> | null;
  onCreateGroup: (name: string, participants: Id<"users">[]) => Promise<void>;
}

export function CreateGroupModal({
  users,
  currentUser,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<Id<"users">[]>(
    [],
  );

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupUsers.length === 0 || !currentUser)
      return;

    await onCreateGroup(groupName, [...selectedGroupUsers, currentUser._id]);

    setGroupName("");
    setSelectedGroupUsers([]);
    setIsGroupModalOpen(false);
  };

  return (
    <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-sm bg-orange-50 hover:bg-orange-100 text-orange-600 border-none px-3 h-9"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create Group</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <input
            className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {users
              ?.filter((u) => u._id !== currentUser?._id)
              .map((u) => (
                <div
                  key={u._id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
                  onClick={() => {
                    setSelectedGroupUsers((prev) =>
                      prev.includes(u._id)
                        ? prev.filter((id) => id !== u._id)
                        : [...prev, u._id],
                    );
                  }}
                >
                  <Checkbox checked={selectedGroupUsers.includes(u._id)} />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    {u.username}
                  </label>
                </div>
              ))}
          </div>
          <Button
            onClick={handleCreateGroup}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!groupName.trim() || selectedGroupUsers.length === 0}
          >
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
