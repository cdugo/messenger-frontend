import { Input } from "@medusajs/ui";

interface TextBoxProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}
  
export function TextBox({ value, onChange, onSubmit }: TextBoxProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  };

  const lineHeight = 24;
  const maxHeight = lineHeight * 5;

  return (
    <form onSubmit={onSubmit} className="flex flex-row items-center justify-between w-full min-h-[56px] rounded-[100px] bg-[#191919] px-4">
        <div className="flex flex-row items-center w-full">
          <div className="bg-[#2A2A2A] rounded-full p-2 w-8 h-8 flex items-center justify-center mr-3 shrink-0">
              <PlusIcon />
          </div>
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full my-3 pr-4 bg-transparent focus:outline-none border-none resize-none text-white
              scrollbar-thin scrollbar-thumb-[#3A3A3A] hover:scrollbar-thumb-[#404040] scrollbar-track-transparent"
            placeholder="Type a message..."
            rows={1}
            style={{
              minHeight: '24px',
              maxHeight: `${maxHeight}px`,
              overflowY: 'auto',
              lineHeight: `${lineHeight}px`
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              const newHeight = Math.min(target.scrollHeight, maxHeight);
              target.style.height = `${newHeight}px`;
            }}
          />
        </div>
        <button 
          type="submit"
          className="hover:opacity-70 cursor-pointer ml-3 shrink-0 bg-transparent border-0 p-0"
        >
            <SendIcon />
        </button>
    </form>
  );
}

function PlusIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25 14.25C7.25 14.6642 7.58579 15 8 15C8.41421 15 8.75 14.6642 8.75 14.25V8.75L14.25 8.75C14.6642 8.75 15 8.41421 15 8C15 7.58579 14.6642 7.25 14.25 7.25L8.75 7.25V1.75C8.75 1.33579 8.41421 1 8 1C7.58579 1 7.25 1.33579 7.25 1.75V7.25L1.75 7.25C1.33579 7.25 1 7.58579 1 8C1 8.41421 1.33579 8.75 1.75 8.75L7.25 8.75V14.25Z" fill="#EEEEEE"/>
    </svg>
}

function SendIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.6184 7.37466L0.9752 0.0714624C0.443803 -0.192736 -0.142991 0.318887 0.0314055 0.897607L2.0462 6.6932C2.12827 6.96369 2.36217 7.1566 2.63915 7.17966L9.52475 8.00161L2.63915 8.82356C2.36217 8.84663 2.12827 9.03954 2.0462 9.31002L0.0314055 15.1035C-0.142991 15.6822 0.441751 16.1939 0.9752 15.9276L15.6204 8.62437C15.8892 8.49017 16 8.29936 16 7.99952C16 7.69967 15.8913 7.50886 15.6204 7.37466H15.6184Z" fill="white" fill-opacity="0.372"/>
    </svg>
}
