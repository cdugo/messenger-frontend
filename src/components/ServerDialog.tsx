import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiClient } from "@/app/api/apiClient";
import { Server, ServerWithUsers } from "@/app/types/server";
import { useRouter } from "next/navigation";
import { useServer } from "@/app/contexts/ServerContext";
import LoadingSpinner from "./LoadingSpinner";
import { PlusIcon } from "./icons/PlusIcon";
import { ServerMembersDialog } from './ServerMembersDialog';

interface ServerDialogProps {
  onServerCreated: (server: Server) => void;
  onServerJoined: (server: Server) => void;
}

export function ServerDialog({ onServerCreated, onServerJoined }: ServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableServers, setAvailableServers] = useState<ServerWithUsers[]>([]);
  const [joiningServerId, setJoiningServerId] = useState<string | null>(null);
  const router = useRouter();
  const { setCurrentServer } = useServer();

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const server = await apiClient.createServer({name, description});
      onServerCreated(server);
      setCurrentServer(server);
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinServer = async (server: ServerWithUsers) => {
    setJoiningServerId(server.id);
    try {
      const joinedServer = await apiClient.joinServer(server.id);
      
      // First update the parent components
      onServerJoined(joinedServer);
      
      // Close the dialog before updating the current server
      setIsOpen(false);
      
      // Use a small timeout to ensure the dialog is closed before navigation
      setTimeout(() => {
        setCurrentServer(joinedServer);
        router.push(`/?serverId=${joinedServer.id}`);
      }, 100);
      
    } catch (error) {
      console.error('Failed to join server:', error);
    } finally {
      setJoiningServerId(null);
    }
  };

  const loadServers = async () => {
    try {
      const [allServers, meResponse] = await Promise.all([
        apiClient.getAllServers(),
        apiClient.getMe()
      ]);
    
      
      const userServerIds = new Set(meResponse.servers.map(s => s.id));
      
      const availableServers = allServers.filter(server => !userServerIds.has(server.id));
      setAvailableServers(availableServers);
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          onClick={() => {
            setIsOpen(true);
            loadServers();
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <PlusIcon />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Server</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Server</TabsTrigger>
            <TabsTrigger value="join">Join Server</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <form onSubmit={handleCreateServer} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Server name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : "Create Server"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="join">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {availableServers.length > 0 ? (
                availableServers.map((server) => (
                  <div
                    key={server.id}
                    className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                  >
                    {joiningServerId === server.id ? (
                      <div className="flex justify-center">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{server.name}</h3>
                            <p className="text-sm text-gray-400">{server.description}</p>
                          </div>
                          <ServerMembersDialog users={server.users} />
                        </div>
                        <button
                          onClick={() => handleJoinServer(server)}
                          className="w-full mt-2 bg-accent hover:bg-accent/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                          Join Server
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No available servers to join
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 