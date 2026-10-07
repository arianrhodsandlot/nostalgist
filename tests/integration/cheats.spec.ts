import { describe, test, type TestContext } from 'node:test'
import { normalizeCheat, parseCheatFile, resolveCheatTargets } from '../../src/libs/cheats.ts'

// shaped after the files in https://github.com/libretro/libretro-database/tree/master/cht
const cheatFile = `cheats = 5

cheat0_desc = "Infinite Lives"
cheat0_code = "SXIOPO"
cheat0_enable = false

cheat1_desc = "Totally Invincible"
cheat1_code = "00AE:41"
cheat1_enable = true

cheat2_desc = "Keep Weapon After Dying"
cheat2_code = ""
cheat2_enable = false

cheat3_desc = "Watched By RetroArch"
cheat3_code = "00B0:FE"
cheat3_handler = 1
cheat3_enable = false

cheat4_code = "PEUZUGAA"
cheat4_enable = false
`

const cheats = [
  { code: 'SXIOPO', description: 'Invincible', enabled: false },
  { code: '00AE:41', description: 'Infinite Lives', enabled: true },
  { code: '0033:09', description: 'Invincible', enabled: false },
  { code: 'PEUZUGAA', enabled: false },
]

await describe('cheats', async () => {
  await describe('normalizeCheat', async () => {
    await test('turns a code into a cheat', (t: TestContext) => {
      t.assert.deepStrictEqual(normalizeCheat('SXIOPO'), { code: 'SXIOPO', enabled: false })
    })

    await test('leaves a cheat disabled unless it says otherwise', (t: TestContext) => {
      t.assert.deepStrictEqual(normalizeCheat({ code: 'SXIOPO' }), { code: 'SXIOPO', enabled: false })
      t.assert.deepStrictEqual(normalizeCheat({ code: 'SXIOPO', enabled: true }), {
        code: 'SXIOPO',
        enabled: true,
      })
    })

    await test('keeps a description, and omits an empty one', (t: TestContext) => {
      t.assert.deepStrictEqual(normalizeCheat({ code: 'SXIOPO', description: 'Infinite Lives' }), {
        code: 'SXIOPO',
        description: 'Infinite Lives',
        enabled: false,
      })
      t.assert.deepStrictEqual(normalizeCheat({ code: 'SXIOPO', description: '' }), {
        code: 'SXIOPO',
        enabled: false,
      })
    })
  })

  await describe('parseCheatFile', async () => {
    await test('reads the cheats a core can apply', (t: TestContext) => {
      // the entry without a code, and the one RetroArch handles itself, can not be applied through a core
      t.assert.deepStrictEqual(parseCheatFile(cheatFile), [
        { code: 'SXIOPO', description: 'Infinite Lives', enabled: false },
        { code: '00AE:41', description: 'Totally Invincible', enabled: true },
        { code: 'PEUZUGAA', enabled: false },
      ])
    })

    await test('rejects content that is not a cheat file', (t: TestContext) => {
      t.assert.throws(() => parseCheatFile('./Contra (USA).cht'), /does not look like a RetroArch cheat file/u)
    })
  })

  await describe('resolveCheatTargets', async () => {
    await test('resolves an index', (t: TestContext) => {
      t.assert.deepStrictEqual(resolveCheatTargets(cheats, 1), [1])
    })

    await test('resolves a description, and every cheat sharing it', (t: TestContext) => {
      t.assert.deepStrictEqual(resolveCheatTargets(cheats, 'Infinite Lives'), [1])
      t.assert.deepStrictEqual(resolveCheatTargets(cheats, 'Invincible'), [0, 2])
    })

    await test('falls back to a code when no description matches', (t: TestContext) => {
      t.assert.deepStrictEqual(resolveCheatTargets(cheats, 'PEUZUGAA'), [3])
    })

    await test('throws when nothing matches', (t: TestContext) => {
      t.assert.throws(() => resolveCheatTargets(cheats, 'Unknown'), /can not find a cheat/u)
      t.assert.throws(() => resolveCheatTargets(cheats, 4), RangeError)
      t.assert.throws(() => resolveCheatTargets(cheats, -1), RangeError)
    })
  })
})
