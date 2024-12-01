// CreateTaskModal.jsx - Modal component for creating new tasks

// Import necessary hooks for state management

import { useState } from "react";

// CreateTaskModal component accepts props for controlling visibility and handling task creation
export default function CreateTaskModal({
  isOpen, // Boolean to control modal visibility
  onClose, // Function to close modal
  onSubmit, // Function to handle task creation
  isDarkMode, // Boolean for theme state
}) {
  // State management for form fields
  const [title, setTitle] = useState(""); // Task title
  const [description, setDescription] = useState(""); // Task description
  const [date, setDate] = useState(""); // Due date
  const [time, setTime] = useState(""); // Due time
  const [isCompleted, setIsCompleted] = useState(false); // Completion status
  const [isImportant, setIsImportant] = useState(false); // Priority status

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create ISO string from date and time inputs
      const deadline = new Date(`${date}T${time || "23:59"}`).toISOString();

      // Submit task data to parent component
      await onSubmit({
        title,
        description,
        deadline,
        isCompleted,
        isImportant,
      });

      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setIsCompleted(false);
      setIsImportant(false);
      onClose();
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    // Modal overlay with theme-aware styling
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg w-full max-w-md p-6 transition-colors duration-200 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Modal content container */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Create a Task
          </h2>
          <button
            onClick={onClose}
            className={`${
              isDarkMode
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ×
          </button>
        </div>

        {/* Task creation form */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input field */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              placeholder="Enter task title"
              required
            />
          </div>
          {/* Description textarea */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              placeholder="Enter task description"
              rows="3"
              required
            />
          </div>

          {/* Date and time inputs grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Due Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
                required
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Due Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
            </div>
          </div>
          {/* Checkbox options */}
          <div className="flex space-x-6">
            <label
              className={`flex items-center cursor-pointer ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className={`mr-2 rounded border-2 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-blue-500"
                    : "bg-white border-gray-300 text-blue-600"
                }`}
              />
              Mark as completed
            </label>

            <label
              className={`flex items-center cursor-pointer ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className={`mr-2 rounded border-2 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-blue-500"
                    : "bg-white border-gray-300 text-blue-600"
                }`}
              />
              Mark as important
            </label>
          </div>
          {/* Form action buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
