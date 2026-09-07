// Service worker for Web Push notifications. This file must live at the
// site root (frontend/public/sw.js -> served as /sw.js) so its scope
// covers the whole app.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "RaktSetu", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "RaktSetu";
  const options = {
    body: data.body || "",
    icon: "/favicon-32x32.png",
    badge: "/favicon-32x32.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clicking the notification focuses an already-open RaktSetu tab if one
// exists, otherwise opens a new one at the request's URL.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});