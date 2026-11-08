import test from "node:test";
import assert from "node:assert/strict";
import React from "../web/node_modules/react/index.js";
import { renderToStaticMarkup } from "../web/node_modules/react-dom/server.js";
import {
  markNotificationsRead,
  markNotificationRead,
  notificationKey,
  uniqueNotifications,
} from "../web/src/features/notifications/notificationUtils.mjs";
import { NotificationList } from "../web/src/features/notifications/NotificationList.mjs";

test("notification keys use stable backend identifiers, with id as a fallback", () => {
  assert.equal(notificationKey({ _id: "mongo-id", id: "other-id" }), "mongo-id");
  assert.equal(notificationKey({ id: "api-id" }), "api-id");
  assert.equal(notificationKey({ title: "Missing ID" }), null);
});

test("notification normalization drops missing and duplicate keys while preserving IDs", () => {
  const first = { _id: "n1", title: "One", unread: true };
  const second = { id: "n2", title: "Two", unread: false };
  assert.deepEqual(
    uniqueNotifications([first, second, { _id: "n1", title: "duplicate" }, { title: "no id" }]),
    [first, second]
  );
});

test("marking notifications read updates unread state without changing stable keys", () => {
  const notifications = [
    { _id: "n1", unread: true },
    { _id: "n2", unread: false },
  ];
  const updated = markNotificationsRead(notifications);
  assert.deepEqual(updated.map((item) => item.unread), [false, false]);
  assert.deepEqual(updated.map(notificationKey), ["n1", "n2"]);
  assert.deepEqual(notifications.map((item) => item.unread), [true, false]);
});

test("marking one notification read preserves other unread items and stable keys", () => {
  const notifications = [
    { _id: "n1", unread: true },
    { _id: "n2", unread: true },
  ];
  const updated = markNotificationRead(notifications, "n1");
  assert.deepEqual(updated.map((item) => item.unread), [false, true]);
  assert.deepEqual(updated.map(notificationKey), ["n1", "n2"]);
  assert.deepEqual(notifications.map((item) => item.unread), [true, true]);
});

test("both notification list variants render stable IDs with no React key warnings", () => {
  const notifications = uniqueNotifications([
    { _id: "n1", title: "First", desc: "Unread item", time: "Now", unread: true },
    { _id: "n2", title: "Second", desc: "Read item", time: "Yesterday", unread: false },
    { _id: "n1", title: "Duplicate", desc: "Duplicate", time: "Now", unread: true },
  ]);
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.join(" "));

  try {
    const popover = renderToStaticMarkup(
      React.createElement(NotificationList, {
        notifications,
        variant: "popover",
        onMarkRead: () => {},
      })
    );
    const dropdown = renderToStaticMarkup(
      React.createElement(NotificationList, {
        notifications,
        variant: "dropdown",
        onMarkRead: () => {},
      })
    );
    assert.match(popover, /First/);
    assert.match(dropdown, /Second/);
    assert.match(popover, /Mark First as read/);
    assert.match(dropdown, /Mark First as read/);
    assert.doesNotMatch(dropdown, /Mark Second as read/);
    assert.match(dropdown, /bg-\[#E6F7F3\]\/30/);
    assert.match(dropdown, /hover:bg-gray-50/);
    assert.equal((popover.match(/Mark First as read/g) || []).length, 1);
  } finally {
    console.error = originalError;
  }

  assert.deepEqual(errors, []);
});
