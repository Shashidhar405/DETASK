import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function TaskCard({ task, isDarkMode, onEdit }) {
  const handleComplete = async () => {
    const taskRef = doc(db, "tasks", task.id);
    try {
      if (!task.isCompleted) {
        // When marking as complete
        await updateDoc(taskRef, {
          isCompleted: true,
          completedAt: serverTimestamp(),
        });

        // Set a timeout to archive after 10 seconds // 24 hr 60 * 60 * 1000
        setTimeout(async () => {
          await updateDoc(taskRef, {
            isArchived: true,
            archivedAt: serverTimestamp(),
          });
        }, 10 * 1000); //
      } else {
        // When unchecking completion
        await updateDoc(taskRef, {
          isCompleted: false,
          completedAt: null,
          isArchived: false,
          archivedAt: null,
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskRef = doc(db, "tasks", task.id);
      await deleteDoc(taskRef);
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "";
    const date = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isOverdue = () => {
    if (!task.deadline || task.isCompleted) return false;
    return new Date(task.deadline) < new Date();
  };

  const renderAttachment = () => {
    if (!task.attachment) return null;

    return (
      <div className="mt-3 border-t pt-3">
        {task.attachment.type?.startsWith("image/") ? (
          <div className="mt-2">
            <a
              href={task.attachment.data}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src={task.attachment.data}
                alt="Attachment"
                className="max-h-32 rounded object-contain hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        ) : (
          <a
            href={task.attachment.data}
            download={task.attachment.name}
            className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <svg
              className="w-8 h-8 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div className="flex flex-col">
              <span className="text-sm truncate group-hover:text-blue-500">
                {task.attachment.name}
              </span>
              <span className="text-xs text-gray-500">Click to download</span>
            </div>
          </a>
        )}
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg p-4 shadow-lg transition-colors duration-200 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3
            className={`text-lg font-semibold ${
              task.isCompleted
                ? "text-gray-500 line-through"
                : isDarkMode
                ? "text-white"
                : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>

          <p
            className={`text-sm mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {task.description}
          </p>

          <div
            className={`mt-2 flex items-center ${
              isOverdue()
                ? "text-yellow-500"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              {formatDeadline(task.deadline)}
              {isOverdue() && " (Overdue)"}
            </span>
          </div>

          {renderAttachment()}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className={`transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-blue-400"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-red-400"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {task.isImportant && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Important
            </span>
          )}
          {!task.isCompleted && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Pending
            </span>
          )}
          {isOverdue() && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Overdue
            </span>
          )}
        </div>

        <button
          onClick={handleComplete}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            task.isCompleted
              ? "bg-green-500 text-white"
              : isDarkMode
              ? "bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white"
              : "bg-gray-100 text-gray-600 hover:bg-green-500 hover:text-white"
          }`}
        >
          {task.isCompleted ? "Completed" : "Mark Complete"}
        </button>
      </div>
    </div>
  );
}
