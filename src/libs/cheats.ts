import type { NostalgistCheat, NostalgistCheatInput, NostalgistCheatTarget } from '../types/nostalgist-options.ts'
import { vendors } from './vendors.ts'

const { ini } = vendors

/**
 * RetroArch's own cheats are handled by the frontend instead of the core, and are described by an address and a
 * value rather than by a code. `cmd_cheat_set_code` has no way to express them.
 * See https://github.com/libretro/RetroArch/blob/master/cheat_manager.h
 */
const retroArchHandledCheat = 1

/** Turns whatever was passed as a cheat into a cheat whose `enabled` is always set. */
export function normalizeCheat(cheat: NostalgistCheatInput): NostalgistCheat {
  const { code, description, enabled } = typeof cheat === 'string' ? { code: cheat } : cheat
  return { code, ...(description ? { description } : {}), enabled: enabled === true }
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
    // cheat files do contain entries without a code, which RetroArch would not apply either
    if (!code || Number(parsed[`cheat${index}_handler`]) === retroArchHandledCheat) {
      continue
    }
    cheats.push(
      normalizeCheat({
        code,
        description: parsed[`cheat${index}_desc`],
        enabled: parsed[`cheat${index}_enable`] === true,
      }),
    )
  }
  return cheats
}

/**
 * Finds the cheats a target points at, which is an index, a description, or a code, in that order.
 * Every match is returned, because cheat files do contain repeated descriptions, and nothing is returned
 * when the target points at no cheat at all.
 */
export function resolveCheatTargets(cheats: NostalgistCheat[], target: NostalgistCheatTarget): number[] {
  if (typeof target === 'number') {
    return Number.isInteger(target) && target >= 0 && target < cheats.length ? [target] : []
  }

  const byDescription = cheats.flatMap((cheat, index) => (cheat.description === target ? [index] : []))
  if (byDescription.length > 0) {
    return byDescription
  }
  return cheats.flatMap((cheat, index) => (cheat.code === target ? [index] : []))
}
