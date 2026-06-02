import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EmojiPickerPopover({ onSelectEmoji }) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData) => {
    onSelectEmoji(emojiData.emoji);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
      >
        😊 Emoji
      </button>

      {open && (
        <div className="absolute z-50 mt-2 rounded-lg border bg-white shadow-lg">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
