import type { NostalgistCheat, NostalgistCheatInput } from '../types/nostalgist-options.ts'
import { vendors } from './vendors.ts'

const { ini } = vendors

/**
 * RetroArch's own cheats are handled by the frontend instead of the core, and are described by an address and a
 * value rather than by a code. `cmd_cheat_set_code` has no way to express them.
 * See https://github.com/libretro/RetroArch/blob/master/cheat_manager.h
 */
const retroArchHandledCheat = 1

export function normalizeCheat(cheat: NostalgistCheatInput): NostalgistCheat {
  return typeof cheat === 'string' ? { code: cheat } : cheat
}

/**
 * Parses the content of a [RetroArch cheat file](https://github.com/libretro/libretro-database/tree/master/cht).
 * Bear in mind that these files tend to mark every cheat as disabled, so `enableCheat` will likely be needed
 * after loading one.
 */
export function parseCheatFile(content: string): NostalgistCheat[] {
  const parsed = ini.parse(content)
  if (!('cheats' in parsed)) {
    throw new Error('the content does not look like a RetroArch cheat file')
  }

  const cheats: NostalgistCheat[] = []
  for (let index = 0; index < Number(parsed.cheats); index += 1) {
    const code = parsed[`cheat${index}_code`]
    if (!code || Number(parsed[`cheat${index}_handler`]) === retroArchHandledCheat) {
      continue
    }
    const description = parsed[`cheat${index}_desc`]
    cheats.push({
      code,
      ...(description ? { description } : {}),
      enabled: parsed[`cheat${index}_enable`] === true,
    })
  }
  return cheats
}
