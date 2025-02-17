import type { NostalgistOptions, NostalgistOptionsPartial } from '../types/nostalgist-options.ts'
import type { RetroArchConfig } from '../types/retroarch-config'
import { isAbsoluteUrl, merge } from './utils.ts'
import { vendors } from './vendors.ts'

const { path } = vendors

function getDefaultRetroarchConfig() {
  const defaultRetroarchConfig: RetroArchConfig = {
    menu_driver: 'rgui',
    menu_navigation_browser_filter_supported_extensions_enable: false,
    notification_show_when_menu_is_alive: true,
    savestate_auto_load: true,
    savestate_thumbnail_enable: true,
    stdin_cmd_enable: true,
    video_shader_enable: true,

    input_audio_mute: 'nul', // override default 'f9'
    input_cheat_index_minus: 'nul', // override default 't',
    input_cheat_index_plus: 'nul', // override default 'y',
    input_cheat_toggle: 'nul', // override default 'u',
    input_desktop_menu_toggle: 'nul', // override default 'f5'
    input_exit_emulator: 'nul', // override default 'esc',
    input_fps_toggle: 'nul', // override default 'f3'
    input_frame_advance: 'nul', // override default 'k',
    input_game_focus_toggle: 'nul', // override default 'scroll_lock'
    input_grab_mouse_toggle: 'nul', // override default 'f11'
    input_hold_fast_forward: 'nul', // override default 'l',
    input_hold_slowmotion: 'nul', // override default 'e',
    input_load_state: 'nul', // override default 'f4'
    input_netplay_game_watch: 'nul', // override default 'i',
    input_netplay_player_chat: 'nul', // override default 'tilde'
    input_pause_toggle: 'nul', // override default 'p',
    input_reset: 'nul', // override default 'h',
    input_rewind: 'nul', // override default 'r',
    input_save_state: 'nul', // override default 'f2'
    input_screenshot: 'nul', // override default 'f8'
    input_shader_next: 'nul', // override default 'm',
    input_shader_prev: 'nul', // override default 'n',
    input_shader_toggle: 'nul', // override default 'comma'
    input_state_slot_decrease: 'nul', // override default 'f6'
    input_state_slot_increase: 'nul', // override default 'f7'
    input_toggle_fast_forward: 'nul', // override default 'space'
    input_toggle_fullscreen: 'nul', // override default 'f',
    input_volume_down: 'nul', // override default 'subtract'
    input_volume_up: 'nul', // override default 'add'

    input_player1_analog_dpad_mode: 1,
    input_player2_analog_dpad_mode: 1,
    input_player3_analog_dpad_mode: 1,
    input_player4_analog_dpad_mode: 1,
  }
  return defaultRetroarchConfig
}

const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh'

const coreRepo = 'arianrhodsandlot/retroarch-emscripten-build'
const coreVersion = 'v1.20.0'
const coreDirectory = 'retroarch'

const shaderRepo = 'libretro/glsl-shaders'
const shaderVersion = '821487'

export function getDefaultOptions() {
  const defaultOptions: Omit<NostalgistOptions, 'core'> = {
    element: '',
    retroarchConfig: getDefaultRetroarchConfig(),
    retroarchCoreConfig: {},
    runEmulatorManually: false,
    setupEmulatorManually: false,

    resolveCoreJs(core) {
      return `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`
    },

    resolveCoreWasm(core) {
      return `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`
    },

    resolveRom(file) {
      if (typeof file !== 'string') {
        return file || []
      }

      if (isAbsoluteUrl(file)) {
        return file
      }

      const extension = path.extname(file)
      const romRepo = {
        '.bin': 'retrobrews/md-games',
        '.gb': 'retrobrews/gbc-games',
        '.gba': 'retrobrews/gba-games',
        '.gbc': 'retrobrews/gbc-games',
        '.md': 'retrobrews/md-games',
        '.nes': 'retrobrews/nes-games',
        '.sfc': 'retrobrews/snes-games',
        '.sms': 'retrobrews/sms-games',
      }[extension]

      if (romRepo) {
        const encodedFile = encodeURIComponent(file)
        return `${cdnBaseUrl}/${romRepo}@master/${encodedFile}`
      }

      return file
    },

    resolveBios(file) {
      return file
    },

    resolveShader(name) {
      if (!name) {
        return []
      }

      const preset = `${cdnBaseUrl}/${shaderRepo}@${shaderVersion}/${name}.glslp`
      const segments = name.split(path.sep)
      segments.splice(-1, 0, 'shaders')
      const shader = `${cdnBaseUrl}/${shaderRepo}@${shaderVersion}/${segments.join(path.sep)}.glsl`
      return [preset, shader]
    },
  }
  return defaultOptions
}

let globalOptions: NostalgistOptionsPartial = getDefaultOptions()
export function getGlobalOptions() {
  return globalOptions
}

export function updateGlobalOptions(options: NostalgistOptionsPartial) {
  merge(globalOptions, options)
}

export function resetGlobalOptions() {
  globalOptions = getDefaultOptions()
}
