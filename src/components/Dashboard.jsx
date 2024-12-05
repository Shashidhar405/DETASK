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

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Fetch tasks and set up real-time listener
  useEffect(() => {
    if (!user) return;

    try {
      const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
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

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up task listener:", error);
      setIsLoading(false);
    }
  }, [user]);

  // Archive logic
  useEffect(() => {
    const checkAndArchiveTasks = async () => {
      const completedTasks = tasks.filter(
        (task) =>
          task.isCompleted &&
          !task.isArchived &&
          task.completedAt &&
          new Date().getTime() -
            new Date(task.completedAt.seconds * 1000).getTime() >
            10 * 1000 //24hrs --> 24 * 60 * 60 * 1000
      );

      for (const task of completedTasks) {
        const taskRef = doc(db, "tasks", task.id);
        try {
          await updateDoc(taskRef, {
            isArchived: true,
            archivedAt: serverTimestamp(),
          });
          console.log("Task archived:", task.id); // For debugging
        } catch (error) {
          console.error("Error archiving task:", error);
        }
      }
    };

    // Check for tasks to archive every 5 sec
    const interval = setInterval(checkAndArchiveTasks, 5 * 1000); // every 1 hr --> 60 * 60 * 1000

    // Initial check
    checkAndArchiveTasks();

    return () => clearInterval(interval);
  }, [tasks]);

  const handleCreateTask = async (taskData) => {
    try {
      await addDoc(collection(db, "tasks"), {
        ...taskData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        completedAt: taskData.isCompleted ? serverTimestamp() : null,
        isArchived: false,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const taskRef = doc(db, "tasks", updatedTask.id);
      const taskData = {
        title: updatedTask.title,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
        isCompleted: updatedTask.isCompleted,
        isImportant: updatedTask.isImportant,
        attachment: updatedTask.attachment,
        updatedAt: serverTimestamp(),
      };

      // If completion status changed, set completedAt
      if (
        updatedTask.isCompleted !==
        tasks.find((t) => t.id === updatedTask.id)?.isCompleted
      ) {
        taskData.completedAt = updatedTask.isCompleted
          ? serverTimestamp()
          : null;
        taskData.isArchived = false; // Reset archive status when completion changes
      }

      await updateDoc(taskRef, taskData);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filter) {
      case "incomplete":
        return !task.isCompleted && !task.isArchived && matchesSearch;
      case "completed":
        return task.isCompleted && !task.isArchived && matchesSearch;
      case "important":
        return task.isImportant && !task.isArchived && matchesSearch;
      case "archive":
        return task.isArchived && matchesSearch;
      default:
        return !task.isArchived && matchesSearch;
    }
  });

  const getDisplayTitle = () => {
    switch (filter) {
      case "incomplete":
        return "Pending";
      case "completed":
        return "Completed";
      case "important":
        return "Important";
      case "archive":
        return "Archive";
      default:
        return "All";
    }
  };

  return (
    <div
      className={`flex h-full transition-colors duration-200 ${
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
            {/* All Tasks */}
            <button
              onClick={() => setFilter("all")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                filter === "all"
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
                {tasks.filter((task) => !task.isArchived).length}
              </span>
            </button>

            {/* Pending Tasks */}
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
                {
                  tasks.filter((task) => !task.isCompleted && !task.isArchived)
                    .length
                }
              </span>
            </button>

            {/* Completed Tasks */}
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
                {
                  tasks.filter((task) => task.isCompleted && !task.isArchived)
                    .length
                }
              </span>
            </button>

            {/* Important Tasks */}
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
                {
                  tasks.filter((task) => task.isImportant && !task.isArchived)
                    .length
                }
              </span>
            </button>

            {/* Archive Tasks */}
            <button
              onClick={() => setFilter("archive")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                filter === "archive"
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span>Archive</span>
              <span
                className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tasks.filter((task) => task.isArchived).length}
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Buttons */}
        <div className="absolute bottom-0 left-0 w-full p-6 space-y-3">
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
            <TaskStats
              tasks={tasks.filter((task) => !task.isArchived)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div
              className={`relative ${
                isDarkMode ? "text-gray-200" : "text-gray-600"
              }`}
            >
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
              <div className="absolute left-3 top-3">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Archive Banner */}
          {filter === "archive" && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-blue-50"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`flex-shrink-0 ${
                    isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-100" : "text-blue-800"
                    }`}
                  >
                    About Archive
                  </h3>
                  <div
                    className={`mt-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-blue-700"
                    }`}
                  >
                    <p>
                      Completed tasks are automatically moved to the archive
                      after 24 hours. This helps keep your main task list clean
                      and organized while maintaining a record of your completed
                      work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Display */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div
                className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                  isDarkMode ? "border-white" : "border-blue-500"
                }`}
              ></div>
            </div>
          ) : (
            <div className="h-[calc(100vh-320px)] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div
                  className={`text-center py-12 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {filter === "archive" ? (
                    <div className="text-center py-8">
                      <div
                        className={`mb-4 ${
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
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                        <h3 className="text-lg font-medium mb-2">
                          No archived tasks yet
                        </h3>
                        <p className="text-sm">
                          Completed tasks will be automatically moved here after
                          24 hours
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        {searchQuery
                          ? "No tasks match your search"
                          : filter === "all"
                          ? "Get started by creating your first task!"
                          : `No ${getDisplayTitle().toLowerCase()} tasks available.`}
                      </p>
                    </>
                  )}
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
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        isDarkMode={isDarkMode}
      />

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
