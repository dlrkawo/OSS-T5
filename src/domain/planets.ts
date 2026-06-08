export const PLANETS = [
  { id: 'moon', nameKo: '달', nameEn: 'Moon', requiredMinutes: 120 },
  { id: 'mars', nameKo: '화성', nameEn: 'Mars', requiredMinutes: 300 },
  { id: 'jupiter', nameKo: '목성', nameEn: 'Jupiter', requiredMinutes: 900 },
  { id: 'saturn', nameKo: '토성', nameEn: 'Saturn', requiredMinutes: 1800 },
  { id: 'neptune', nameKo: '해왕성', nameEn: 'Neptune', requiredMinutes: 3000 },
] as const

export function unlockedPlanets(totalCompletedFocusMinutes: number) {
  return PLANETS.filter((planet) => totalCompletedFocusMinutes >= planet.requiredMinutes)
}
