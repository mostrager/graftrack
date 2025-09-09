import { ChevronLeft, MoreVertical } from "lucide-react";

interface NativeHeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
}

export default function NativeHeader({
  title,
  onBack,
  onMenu,
  showBack = false,
  showMenu = false
}: NativeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left action */}
        <div className="w-10">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="touch-target flex items-center justify-center p-2 -ml-2"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="flex-1 text-center font-semibold text-lg truncate">
          {title}
        </h1>

        {/* Right action */}
        <div className="w-10">
          {showMenu && onMenu && (
            <button
              onClick={onMenu}
              className="touch-target flex items-center justify-center p-2 -mr-2"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}