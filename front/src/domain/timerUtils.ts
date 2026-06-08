export function effectiveCountdownSeconds(minutes: number, demoShortSessions: boolean): number {
  if (demoShortSessions) return Math.max(5, Math.round(minutes * 2))
  return Math.max(1, minutes * 60)
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
