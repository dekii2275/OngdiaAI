/* Each pose and portrait is a standalone transparent PNG, never an atlas cell.
   Coordinates are fractions of the entire PNG and align the feet with the floor.
   The renderer preserves the original image and its generated alpha channel. */
(() => {
  const root = 'assets/characters/';
  const cast = {
    boy: { name: 'Bạn', folder: 'ban', height: 34, poses: ['idle', 'walk-1', 'walk-2'], ground: .982, crown: .014 },
    girl: { name: 'Duyên', folder: 'duyen', height: 34, poses: ['idle', 'bear'], ground: .982, crown: .018 },
    teacher: { name: 'Thảo', folder: 'thao', height: 38, poses: ['idle'], ground: .982, crown: .01 },
    chief: { name: 'Minh Anh', folder: 'minh-anh', height: 38, poses: ['idle'], ground: .982, crown: .009 },
    worker: { name: 'Mạnh', folder: 'manh', height: 38, poses: ['idle'], ground: .982, crown: .01 }
  };
  for (const character of Object.values(cast)) {
    character.portrait = root + character.folder + '/portrait.png';
    character.images = Object.fromEntries(character.poses.map(pose => [pose, root + character.folder + '/' + pose + '.png']));
  }
  const data = { cast, speakers: Object.fromEntries(Object.entries(cast).map(([id, character]) => [character.name, id])) };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else window.SceneCharacters = data;
})();
