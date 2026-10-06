const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { cast, speakers } = require('../web/js/characters.js');
const web = path.resolve(__dirname, '../web');

test('five independent character models and all their poses have transparent PNG assets', () => {
  assert.equal(Object.keys(cast).length, 5);
  const hashes = new Set();
  for (const [id, character] of Object.entries(cast)) {
    assert.equal(speakers[character.name], id);
    assert.ok(character.crown >= 0 && character.ground <= 1 && character.crown < character.ground);
    for (const source of [...Object.values(character.images), character.portrait]) {
      assert.ok(source.startsWith('assets/characters/' + character.folder + '/'));
      const png = fs.readFileSync(path.join(web, source));
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', source);
      assert.equal(png.readUInt8(25), 6, source + ' must preserve RGBA alpha');
      assert.ok(png.readUInt32BE(16) >= 768 && png.readUInt32BE(20) >= 768, source + ' must be high resolution');
      const hash = createHash('sha256').update(png).digest('hex');
      assert.ok(!hashes.has(hash), source + ' must be an independent asset');
      hashes.add(hash);
    }
  }
  assert.deepEqual(cast.boy.poses, ['idle', 'walk-1', 'walk-2']);
  assert.ok(cast.girl.images.bear);
});

// Read the TrueType cmap so a missing Vietnamese glyph cannot silently fall back
// to an unrelated system font. This also checks the downloaded files are fonts.
function hasGlyph(font, code) {
  let cmap;
  for (let offset = 12, count = font.readUInt16BE(4); count--; offset += 16) {
    if (font.toString('ascii', offset, offset + 4) === 'cmap') cmap = font.readUInt32BE(offset + 8);
  }
  assert.ok(cmap, 'TrueType cmap required');
  for (let offset = cmap + 4, count = font.readUInt16BE(cmap + 2); count--; offset += 8) {
    const sub = cmap + font.readUInt32BE(offset + 4), format = font.readUInt16BE(sub);
    if (format !== 4) continue;
    const segments = font.readUInt16BE(sub + 6) / 2, ends = sub + 14;
    const starts = ends + segments * 2 + 2, deltas = starts + segments * 2, ranges = deltas + segments * 2;
    for (let i = 0; i < segments; i++) {
      if (code < font.readUInt16BE(starts + i * 2) || code > font.readUInt16BE(ends + i * 2)) continue;
      const delta = font.readInt16BE(deltas + i * 2), range = font.readUInt16BE(ranges + i * 2);
      if (!range) return ((code + delta) & 65535) !== 0;
      const glyph = font.readUInt16BE(ranges + i * 2 + range + (code - font.readUInt16BE(starts + i * 2)) * 2);
      return glyph !== 0 && ((glyph + delta) & 65535) !== 0;
    }
  }
  return false;
}

test('both bundled font families cover every Vietnamese vowel and tone, uppercase and lowercase', () => {
  const vowels = 'aăâeêioôơuưy';
  const marks = ['', '\u0300', '\u0301', '\u0303', '\u0309', '\u0323'];
  let characters = 'đĐ';
  for (const vowel of vowels) for (const mark of marks) characters += (vowel + mark).normalize('NFC');
  characters += characters.toUpperCase();
  for (const filename of ['BeVietnamPro-Regular.ttf', 'BeVietnamPro-SemiBold.ttf', 'Lora-Variable.ttf']) {
    const font = fs.readFileSync(path.join(web, 'assets/fonts', filename));
    for (const character of new Set(characters)) assert.ok(hasGlyph(font, character.codePointAt(0)), filename + ': missing ' + character);
  }
});
