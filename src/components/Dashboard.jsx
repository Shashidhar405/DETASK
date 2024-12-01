// Dashboard.jsx - Main component for task management interface

// Import necessary dependencies and hooks for state management, routing, and Firebase

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import TaskStats from "./TaskStats";

// Main Dashboard component responsible for overall task management functionality
export default function Dashboard() {
  // State management for tasks and UI control
  const [tasks, setTasks] = useState([]); // Stores all tasks
  const [filter, setFilter] = useState("all"); // Controls task filter view
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls create task modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Controls edit task modal
  const [editingTask, setEditingTask] = useState(null); // Stores task being edited
  const [isLoading, setIsLoading] = useState(true); // Loading state indicator

  // Hook for accessing authentication context
  const { user, logout } = useAuth();

  // Hook for accessing theme context
  const { isDarkMode, toggleTheme } = useTheme();

  // Hook for navigation
  const navigate = useNavigate();

  // Effect hook to fetch and listen for task updates
  useEffect(() => {
    if (!user) return; // Guard clause if no user

    try {
      // Create query to fetch user's tasks
      const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

      // Set up real-time listener for tasks
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Transform and sort tasks by creation time
          const tasksData = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );

          setTasks(tasksData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching tasks:", error);
          setIsLoading(false);
        }
      );

      // Cleanup function to unsubscribe from listener
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up task listener:", error);
      setIsLoading(false);
    }
  }, [user]);

  // Handler for creating new tasks
  const handleCreateTask = async (taskData) => {
    try {
      await addDoc(collection(db, "tasks"), {
        ...taskData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  // Handler for updating existing tasks
  const handleUpdateTask = async (updatedTask) => {
    try {
      const taskRef = doc(db, "tasks", updatedTask.id);
      const taskData = {
        title: updatedTask.title,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
        isCompleted: updatedTask.isCompleted,
        isImportant: updatedTask.isImportant,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(taskRef, taskData);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  // Handler for user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Filter tasks based on current filter selection
  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "incomplete":
        return !task.isCompleted;
      case "completed":
        return task.isCompleted;
      case "important":
        return task.isImportant;
      default:
        return true;
    }
  });

  // Get display title based on current filter
  const getDisplayTitle = () => {
    switch (filter) {
      case "incomplete":
        return "Pending";
      case "completed":
        return "Completed";
      case "important":
        return "Important";
      default:
        return "All";
    }
  };

  // JSX for the dashboard layout
  return (
    <div
      className={`flex h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Left Sidebar */}
      <div
        className={`w-64 fixed h-full transition-colors duration-200 ${
          isDarkMode ? "bg-gray-800" : "bg-white border-r border-gray-200"
        }`}
      >
        {/* User Profile Section */}
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={
                  user?.photoURL ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>
                <p className="font-medium truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setFilter("all")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                filter === "all"
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-{/* Navigation */}gray-600 hover:bg-gray-100"
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <span>All Tasks</span>
              <span
                className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setFilter("incomplete")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                filter === "incomplete"
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Pending</span>
              <span
                className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tasks.filter((task) => !task.isCompleted).length}
              </span>
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                filter === "completed"
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Completed</span>
              <span
                className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tasks.filter((task) => task.isCompleted).length}
              </span>
            </button>

            <button
              onClick={() => setFilter("important")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                filter === "important"
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span>Important</span>
              <span
                className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tasks.filter((task) => task.isImportant).length}
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Buttons */}
        <div className="absolute bottom-0 left-0 w-full p-6 space-y-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isDarkMode ? (
              <>
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Light Mode</span>
              </>
            ) : (
              <>
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {getDisplayTitle()} Tasks
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Task</span>
            </button>
          </div>

          <div className="mb-6">
            <TaskStats tasks={tasks} isDarkMode={isDarkMode} />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div
                className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                  isDarkMode ? "border-white" : "border-blue-500"
                }`}
              ></div>
            </div>
          ) : (
            <>
              {filteredTasks.length === 0 ? (
                <div
                  className={`text-center py-12 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">No tasks found</p>
                  <p>
                    {filter === "all"
                      ? "Get started by creating your first task!"
                      : `No ${getDisplayTitle().toLowerCase()} tasks available.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDarkMode={isDarkMode}
                      onEdit={() => {
                        setEditingTask(task);
                        setIsEditModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        isDarkMode={isDarkMode}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleUpdateTask}
        task={editingTask}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
