const originalSetImmediate = (globalThis as any).setImmediate
let setImmediateChannel: MessageChannel | null = null
const setImmediateQueue: (() => void)[] = []

function immediatePolyfill(callback: (...args: any[]) => void, ...args: any[]) {
  if (typeof originalSetImmediate === 'function') {
    return originalSetImmediate(callback, ...args)
  }

  if (typeof MessageChannel !== 'undefined') {
    if (!setImmediateChannel) {
      setImmediateChannel = new MessageChannel()
      setImmediateChannel.port1.addEventListener('message', () => {
        const fn = setImmediateQueue.shift()
        if (fn) {
          try {
            fn()
          } catch {}
        }
      })
      setImmediateChannel.port1.start()
    }
    setImmediateQueue.push(() => callback(...args))
    setImmediateChannel.port2.postMessage(0)
    return 0
  }

  return setTimeout(() => callback(...args), 0)
}

export function installSetImmediatePolyfill() {
  if (typeof (globalThis as any).setImmediate === 'function') {
    return
  }
  ;(globalThis as any).setImmediate = immediatePolyfill
}

export function uninstallSetImmediatePolyfill() {
  if ((globalThis as any).setImmediate === immediatePolyfill) {
    delete (globalThis as any).setImmediate
  }
}
