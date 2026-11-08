import React from "react";
import { notificationKey, uniqueNotifications } from "./notificationUtils.mjs";

export function NotificationList({ notifications, variant = "popover", onMarkRead }) {
  const compact = variant === "popover";

  return React.createElement(
    React.Fragment,
    null,
    uniqueNotifications(notifications).map((notification) =>
      React.createElement(
        "div",
        {
          key: notificationKey(notification),
          className: compact
            ? "py-2.5"
            : `py-3 px-2 rounded-xl transition-colors ${
                notification.unread ? "bg-[#E6F7F3]/30" : "hover:bg-gray-50"
              }`,
        },
        React.createElement(
          "div",
          { className: "flex items-center justify-between" },
          React.createElement(
            "span",
            { className: compact ? "font-semibold text-xs text-gray-900" : "font-bold text-xs text-gray-900" },
            notification.title
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-gray-400" },
              notification.time
            ),
            notification.unread && onMarkRead
              ? React.createElement(
                  "button",
                  {
                    type: "button",
                    "aria-label": `Mark ${notification.title || "notification"} as read`,
                    className: "text-[10px] font-semibold text-[#4B9C93] hover:underline",
                    onClick: () => onMarkRead(notificationKey(notification)),
                  },
                  "Mark read"
                )
              : null
          )
        ),
        React.createElement(
          "p",
          {
            className: compact
              ? "text-[11px] text-gray-500 mt-0.5 leading-snug"
              : "text-[11.5px] text-gray-600 mt-0.5 leading-snug",
          },
          notification.desc
        )
      )
    )
  );
}
