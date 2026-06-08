const TRIVIA = [
  '화성의 하루 길이는 지구와 매우 비슷하다.',
  '목성은 태양계에서 가장 큰 행성이다.',
  '달은 지구의 유일한 자연 위성이다.',
  '해왕성은 태양계에서 가장 강한 바람이 분다.',
  '토성의 고리는 주로 얼음과 암석 조각으로 이루어져 있다.',
  '국제우주정거장은 시속 약 28,000km로 지구를 돈다.',
]

export function pickTrivia(seed: number): string {
  return TRIVIA[Math.abs(seed) % TRIVIA.length]
}
