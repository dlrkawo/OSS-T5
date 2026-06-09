export interface AlertOptions {
  desktopNotification: boolean
  soundAlert: boolean
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function notifyTimerEvent(title: string, body: string, options: AlertOptions): void {
  if (options.soundAlert) {
    playAlertTone()
  }

  if (
    options.desktopNotification &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    new Notification(title, { body })
  }
}

function playAlertTone(): void {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return

  const context = new AudioContextCtor()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 740
  gain.gain.setValueAtTime(0.001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.48)
  window.setTimeout(() => void context.close(), 650)
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
