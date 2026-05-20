self.addEventListener('push', event => {
  let data = { title: 'Simple-x', body: '', tag: 'default', url: '/simple_x-app/' }
  try {
    if (event.data) Object.assign(data, event.data.json())
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      icon: '/simple_x-app/icon-512.png',
      badge: '/simple_x-app/icon-512.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/simple_x-app/'
  const fullUrl = new URL(targetUrl, self.location.origin).href
  const appBase = self.registration.scope  // e.g. https://host/simple_x-app/

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const appClient = windowClients.find(c => c.url.startsWith(appBase))
      if (appClient) {
        // Focus first so the window is ready to receive the message, then navigate
        return appClient.focus().then(focused => {
          focused.postMessage({ type: 'navigate', url: targetUrl })
        }).catch(() => {
          // focus() can fail on some mobile browsers — fall back to opening a new window
          return clients.openWindow(fullUrl)
        })
      }
      return clients.openWindow(fullUrl)
    })
  )
})
