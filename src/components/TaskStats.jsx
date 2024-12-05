import React from "react";

export default function TaskStats({ tasks, isDarkMode }) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.isCompleted).length;
  const important = tasks.filter((task) => task.isImportant).length;
  const pending = tasks.filter((task) => !task.isCompleted).length;

  const calculatePercentage = (value) =>
    total === 0 ? 0 : (value / total) * 100;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  const completedDashArray = `${
    (calculatePercentage(completed) * circumference) / 100
  } ${circumference}`;
  const pendingDashArray = `${
    (calculatePercentage(pending) * circumference) / 100
  } ${circumference}`;
  const importantDashArray = `${
    (calculatePercentage(important) * circumference) / 100
  } ${circumference}`;

  const completedOffset = 0;
  const pendingOffset = (calculatePercentage(completed) * circumference) / 100;
  const importantOffset =
    ((calculatePercentage(completed) + calculatePercentage(pending)) *
      circumference) /
    100;

  return (
    <div
      className={`p-4 rounded-lg ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Task Overview
      </h3>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`stroke-current ${
                isDarkMode ? "text-gray-700" : "text-gray-200"
              }`}
              strokeWidth="8"
              fill="none"
            />

            {/* Completed Tasks - Green */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-current text-green-500"
              strokeWidth="8"
              strokeDasharray={completedDashArray}
              strokeDashoffset={0}
              strokeLinecap="round"
              fill="none"
            />

            {/* Pending Tasks - Yellow */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-current text-yellow-500"
              strokeWidth="8"
              strokeDasharray={pendingDashArray}
              strokeDashoffset={-pendingOffset}
              strokeLinecap="round"
              fill="none"
            />

            {/* Important Tasks - Blue (changed from red) */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-current text-blue-500"
              strokeWidth="8"
              strokeDasharray={importantDashArray}
              strokeDashoffset={-importantOffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

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

        <div className="space-y-2 flex-1 ml-6">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
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
