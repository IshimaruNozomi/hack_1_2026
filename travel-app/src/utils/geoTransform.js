export function getDistanceMultiplier(satisfaction) {
  switch (parseInt(satisfaction)) {
    case 5:
      return 0.8
    case 4:
      return 0.9
    case 3:
      return 1.0
    case 2:
      return 1.1
    case 1:
      return 1.2
    default:
      return 1.0
  }
}

export function scalePosition(from, to, multiplier) {
  const lat = from[0] + (to[0] - from[0]) * multiplier
  const lng = from[1] + (to[1] - from[1]) * multiplier

  return [lat, lng]
}