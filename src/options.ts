import { NostalgistOptions } from './types/nostalgist-options'
import { RetroArchConfig } from './types/retroarch-config'

const defaultRetroarchConfig: RetroArchConfig = {
  menu_driver: 'rgui',
  rewind_enable: true,
  notification_show_when_menu_is_alive: true,
  stdin_cmd_enable: true,

  rgui_menu_color_theme: 4,
  rgui_show_start_screen: false,
  savestate_thumbnail_enable: true,

  input_rewind_btn: 6, // L2
  input_hold_fast_forward_btn: 7, // R2
  input_menu_toggle_gamepad_combo: 6, // L1+R1
  input_enable_hotkey_btn: 8, // select

  input_exit_emulator: 'nul', // override default 'esc',
  input_cheat_index_minus: 'nul', // override default 't',
  input_cheat_index_plus: 'nul', // override default 'y',
  input_cheat_toggle: 'nul', // override default 'u',
  input_frame_advance: 'nul', // override default 'k',
  input_hold_fast_forward: 'nul', // override default 'l',
  input_hold_slowmotion: 'nul', // override default 'e',
  input_netplay_game_watch: 'nul', // override default 'i',
  input_pause_toggle: 'nul', // override default 'p',
  input_reset: 'nul', // override default 'h',
  input_rewind: 'nul', // override default 'r',
  input_shader_next: 'nul', // override default 'm',
  input_shader_prev: 'nul', // override default 'n',
  input_toggle_fullscreen: 'nul', // override default 'f',

  input_player1_analog_dpad_mode: 1,
  input_player2_analog_dpad_mode: 1,
  input_player3_analog_dpad_mode: 1,
  input_player4_analog_dpad_mode: 1,
}

const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh'

const coreRepo = 'arianrhodsandlot/retroarch-emscripten-build'
const coreVersion = 'v1.16.0'
const coreDirectory = 'retroarch'

function isUrl(string: string) {
  return string.startsWith('http://') || string.startsWith('https://') || string.startsWith('//')
}

export function getDefaultOptions() {
  const defaultOptions: Omit<NostalgistOptions, 'core'> = {
    element: '#canvas',
    runEmulatorManually: false,
    retroarchConfig: defaultRetroarchConfig,
    retroarchCoreConfig: {},

    resolveCoreJs({ core }) {
      return `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`
    },

    resolveCoreWasm({ core }) {
      return `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`
    },

    resolveRom({ file }) {
      if (typeof file === 'string' && !isUrl(file)) {
        let romRepo = ''
        if (file.endsWith('.nes')) {
          romRepo = 'retrobrews/nes-games'
        } else if (file.endsWith('.sfc')) {
          romRepo = 'retrobrews/snes-games'
        } else if (file.endsWith('.gb') || file.endsWith('.gbc')) {
          romRepo = 'retrobrews/gbc-games'
        } else if (file.endsWith('.gba')) {
          romRepo = 'retrobrews/gba-games'
        } else if (file.endsWith('.sms')) {
          romRepo = 'retrobrews/sms-games'
        } else if (file.endsWith('.md') || file.endsWith('.bin')) {
          romRepo = 'retrobrews/md-games'
        }
        if (romRepo) {
          const encodedFile = encodeURIComponent(file)
          return `${cdnBaseUrl}/${romRepo}@master/${encodedFile}`
        }
      }
      return file || []
    },

    resolveBios({ file }) {
      return file || []
    },
  }
  return defaultOptions
}
