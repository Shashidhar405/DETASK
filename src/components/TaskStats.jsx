// TaskStats.jsx - Component for displaying task statistics and completion chart

import React from "react";

export default function TaskStats({ tasks, isDarkMode }) {
  // Calculate task statistics
  const total = tasks.length;
  const completed = tasks.filter((task) => task.isCompleted).length;
  const important = tasks.filter((task) => task.isImportant).length;
  const pending = tasks.filter((task) => !task.isCompleted).length;

  // Calculate percentages for chart
  const calculatePercentage = (value) =>
    total === 0 ? 0 : (value / total) * 100;

  const completedPercent = calculatePercentage(completed);
  const importantPercent = calculatePercentage(important);
  const pendingPercent = calculatePercentage(pending);

  return (
    // Stats container with theme-aware styling
    <div
      className={`p-4 rounded-lg ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      {/* Section Title */}
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Task Overview
      </h3>
      <div className="flex items-center justify-between mb-4">
        {/* Circular Progress Chart */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background circle for chart */}
            <circle
              cx="48"
              cy="48"
              r="36"
              className={`stroke-current ${
                isDarkMode ? "text-gray-700" : "text-gray-200"
              }`}
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle for completed tasks */}
            <circle
              cx="48"
              cy="48"
              r="36"
              className="stroke-current text-green-500"
              strokeWidth="8"
              strokeDasharray={`${completedPercent * 2.26} 226`}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          {/* Total tasks counter in center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {total}
            </span>
            <span
              className={`block text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total
            </span>
          </div>
        </div>
        {/* Task Statistics List */}
        <div className="space-y-2 flex-1 ml-6">
          {/* Completed Tasks Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Completed
              </span>
            </div>
            <span
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {completed}
            </span>
          </div>

          {/* Pending Tasks Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Pending
              </span>
            </div>
            <span
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {pending}
            </span>
          </div>

          {/* Important Tasks Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Important
              </span>
            </div>
            <span
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {important}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
