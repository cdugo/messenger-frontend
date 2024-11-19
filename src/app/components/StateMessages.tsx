export function NoMessages() {
    return (
      <div className="flex flex-col items-center justify-center h-72 w-72">
        <p className="text-lg text-white">No messages here yet.</p>
        <p className="text-sm text-gray-400">Send a message to start a conversation!</p>
      </div>
    );
  }
  
  export function LoadingState() {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  export function NoServerSelected() {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <div className="flex flex-col items-center h-fit w-72 bg-neutral rounded-3xl px-4 py-12 text-center">
          <p className="text-lg text-white">Open a chat to start a conversation.</p>
          <p className="text-7xl mt-8 [text-shadow:_0_0_50px_rgba(255,255,255,0.5)]">💬</p>
        </div>
      </div>
    );
  }