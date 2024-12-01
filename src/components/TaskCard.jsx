// TaskCard.jsx - Component for displaying individual task items

// Import Firebase utilities for database operations

import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

// Handle task completion toggle
export default function TaskCard({ task, isDarkMode, onEdit }) {
  const handleComplete = async () => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      isCompleted: !task.isCompleted, // Toggle completion status
    });
  };

  // Handle task deletion with confirmation
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskRef = doc(db, "tasks", task.id);
      await deleteDoc(taskRef);
    }
  };

  // Format deadline for display
  const formatDeadline = (deadline) => {
    if (!deadline) return "";
    const date = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format for today's deadlines
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    // Format for tomorrow's deadlines
    else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    // Format for other dates
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.deadline || task.isCompleted) return false;
    return new Date(task.deadline) < new Date();
  };

  return (
    // Task card container with theme-aware styling
    <div
      className={`rounded-lg p-4 shadow-lg transition-colors duration-200 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        {/* Task Content Section */}
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

          {/* Task Description */}
          <p
            className={`text-sm mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {task.description}
          </p>

          {/* Deadline Display */}
          <div
            className={`mt-2 flex items-center ${
              isOverdue()
                ? "text-red-500"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            <svg
              className="w-4 h-4 mr-1"
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
        </div>

        {/* Action Buttons */}
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

      {/* Status Tags and Complete Button */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {task.isImportant && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Important
            </span>
          )}
          {isOverdue() && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Overdue
            </span>
          )}
        </div>

        {/* Complete/Incomplete Toggle Button */}
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
