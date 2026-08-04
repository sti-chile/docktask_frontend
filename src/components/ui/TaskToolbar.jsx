import EmojiPickerPopover from "./EmojiPickerPopover"

export default function TaskToolbar({ onSelectEmoji }) {
    return (
        <div className="flex items-center gap-2 rounded-md border bg-white p-2">
            <EmojiPickerPopover onSelectEmoji={onSelectEmoji} />

            <button type="button" className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100">
                B
            </button>

            <button type="button" className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100">
                Tag
            </button>
        </div>
    )
}
