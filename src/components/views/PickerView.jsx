import { useState } from "react"
import TaskToolbar from "../ui/TaskToolbar"

export default function PickerView() {
    const [taskText, setTaskText] = useState("")
    const [isEditing, setIsEditing] = useState(false)

    const handleSelectEmoji = (emoji) => {
        setTaskText((prev) => `${prev}${emoji}`)
    }

    return (
        <section className="mx-auto max-w-xl space-y-4 p-6">
            <h1 className="text-2xl font-bold">Crear tarea</h1>

            <div className="space-y-2">
                <textarea
                    value={taskText}
                    onChange={(event) => setTaskText(event.target.value)}
                    onFocus={() => setIsEditing(true)}
                    placeholder="Escribe una tarea..."
                    className="min-h-32 w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                {isEditing && <TaskToolbar onSelectEmoji={handleSelectEmoji} />}
            </div>

            <div className="rounded-md border bg-gray-50 p-4">
                <h2 className="font-semibold">Preview</h2>
                <p className="mt-2 whitespace-pre-wrap">{taskText || "Aquí se verá tu tarea..."}</p>
            </div>
        </section>
    )
}
