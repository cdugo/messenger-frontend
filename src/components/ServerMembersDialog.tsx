import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/app/types/user";
import { Avatar } from "@medusajs/ui";
import { UsersIcon } from "./icons/UsersIcon";

interface ServerMembersDialogProps {
  users: User[];
}

export function ServerMembersDialog({ users }: ServerMembersDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          <UsersIcon />
          <span className="text-sm">{users.length} members</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Server Members</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center gap-3 p-3 hover:bg-neutral-800 rounded-lg"
            >
              <Avatar
                fallback={user.username[0].toUpperCase()}
                className="w-8 h-8 rounded-full bg-gray-700 text-white"
              />
              <div>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 