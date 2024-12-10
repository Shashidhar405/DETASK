import { useState, useEffect, useRef } from "react";

export default function EditTaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  isDarkMode,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");

      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        setDate(deadlineDate.toISOString().split("T")[0]);
        setTime(deadlineDate.toTimeString().slice(0, 5));
      }

      setIsImportant(task.isImportant || false);

      // Set file information if task has an attachment
      if (task.attachment) {
        setFile(task.attachment.data);
        setFileInfo(task.attachment);
        if (task.attachment.type.startsWith("image/")) {
          setFilePreview(task.attachment.data);
        }
      }

      setError("");
    }
  }, [task]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      try {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFile(reader.result);
          setFileInfo({
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          });
          if (selectedFile.type.startsWith("image/")) {
            setFilePreview(reader.result);
          } else {
            setFilePreview(null);
          }
          setIsProcessing(false);
        };
        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing file. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      const updatedTask = {
        id: task.id,
        title,
        description,
        deadline: new Date(`${date}T${time || "23:59"}`).toISOString(),
        isCompleted: task.isCompleted,
        isImportant,
        attachment: file
          ? {
              data: file,
              ...fileInfo,
            }
          : null,
        userId: task.userId,
        createdAt: task.createdAt,
      };

      await onSubmit(updatedTask);
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg w-full max-w-md p-6 transition-colors duration-200 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Task
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

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Existing title and description inputs */}
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

          {/* File Upload Section */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Attachment (Max 5MB)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDarkMode
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              } ${
                isProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Processing file...
                  </p>
                </div>
              ) : filePreview || fileInfo ? (
                <div className="space-y-2">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded"
                    />
                  ) : (
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <svg
                        className="mx-auto h-8 w-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {fileInfo?.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFilePreview(null);
                      setFileInfo(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                  <svg
                    className="mx-auto h-12 w-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm">Click to upload or drag and drop</p>
                  <p className="text-xs">
                    Supports: Images, PDF, DOC, DOCX, TXT (Max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Existing date and time inputs */}
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

          {/* Existing checkbox options */}
          <div className="flex space-x-6">
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
              disabled={isProcessing}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isProcessing ? "Updating..." : "Update Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
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
