(function (root) {
  'use strict';
  // Coordinates refer to the painted floor, measured at the character's feet.
  const FLOORS = {
    classroom: [[45, 65], [88, 65], [86, 73], [83, 78], [82, 93], [37, 94], [38, 78], [42, 71], [45, 71]],
    hallway: [[16, 68], [85, 68], [87, 92], [15, 92]]
  };
  function inside(point, polygon) {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
      if ((yi > point.y) !== (yj > point.y) && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) result = !result;
    }
    return result;
  }
  function walkable(point, location = 'classroom', escortX = 82, obstacles = []) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
    const polygon = FLOORS[location] || FLOORS.classroom;
    if (location === 'hallway' && point.x > escortX + 4) return false;
    if (obstacles.some(actor => Math.hypot((point.x - actor.x) / 2.4, (point.y - actor.y) / 1.7) < 1)) return false;
    // A small foot radius avoids clipping the edges of desks and walls.
    return [[0, 0], [-1.1, 0], [1.1, 0], [0, -.6], [0, .6]].every(([x, y]) => inside({ x: point.x + x, y: point.y + y }, polygon));
  }
  function project(point, location = 'classroom', escortX = 82, obstacles = []) {
    if (walkable(point, location, escortX, obstacles)) return { ...point };
    let best = null, distance = Infinity;
    for (let y = 66; y <= 94; y++) for (let x = 15; x <= 89; x++) {
      if (!walkable({ x, y }, location, escortX, obstacles)) continue;
      const d = (point.x - x) ** 2 + (point.y - y) ** 2;
      if (d < distance) { distance = d; best = { x, y }; }
    }
    return best;
  }
  function clearLine(a, b, location, escortX, obstacles = []) {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / .5);
    for (let i = 0; i <= steps; i++) {
      const t = steps ? i / steps : 0;
      if (!walkable({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, location, escortX, obstacles)) return false;
    }
    return true;
  }
  function path(start, destination, location = 'classroom', escortX = 82, obstacles = []) {
    const origin = project(start, location, escortX, obstacles), goal = project(destination, location, escortX, obstacles);
    if (!origin || !goal) return [];
    if (clearLine(origin, goal, location, escortX, obstacles)) return [goal];
    // Visibility graph around the concave walkway. All edges stay on painted floor.
    const nodes = [origin, goal];
    for (const [x, y] of FLOORS[location] || FLOORS.classroom) {
      const point = project({ x, y }, location, escortX, obstacles);
      if (point) nodes.push(point);
    }
    for (const actor of obstacles) for (const dx of [-3.4, 3.4]) for (const dy of [-2.7, 2.7]) {
      const point = { x: actor.x + dx, y: actor.y + dy };
      if (walkable(point, location, escortX, obstacles)) nodes.push(point);
    }
    const distances = nodes.map(() => Infinity), previous = nodes.map(() => -1), done = new Set(); distances[0] = 0;
    while (done.size < nodes.length) {
      let current = -1;
      for (let i = 0; i < nodes.length; i++) if (!done.has(i) && (current < 0 || distances[i] < distances[current])) current = i;
      if (current < 0 || !Number.isFinite(distances[current])) break;
      if (current === 1) break;
      done.add(current);
      for (let next = 0; next < nodes.length; next++) {
        if (done.has(next) || next === current || !clearLine(nodes[current], nodes[next], location, escortX, obstacles)) continue;
        const distance = distances[current] + Math.hypot(nodes[current].x - nodes[next].x, nodes[current].y - nodes[next].y);
        if (distance < distances[next]) { distances[next] = distance; previous[next] = current; }
      }
    }
    if (!Number.isFinite(distances[1])) return [];
    const result = []; let index = 1;
    while (index !== 0) { result.unshift(nodes[index]); index = previous[index]; if (index < 0) return []; }
    return result;
  }
  function move(start, destination, location = 'classroom', escortX = 82, obstacles = []) {
    if (walkable(destination, location, escortX, obstacles) && clearLine(start, destination, location, escortX, obstacles)) return { ...destination };
    // Slide along furniture instead of walking through it or jumping around it.
    for (const candidate of [{ x: destination.x, y: start.y }, { x: start.x, y: destination.y }]) {
      if (walkable(candidate, location, escortX, obstacles) && clearLine(start, candidate, location, escortX, obstacles)) return candidate;
    }
    return { ...start };
  }
  const api = { inside, walkable, project, clearLine, path, move, FLOORS };
  root.SceneNavigation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
