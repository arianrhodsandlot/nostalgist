import type { RetroArchInputConfig } from './input';
import type { RetroArchInputPlayerConfig } from './input-player';
import type { RetroArchNotificationConfig } from './notification';
import type { RetroArchQuickMenuConfig } from './quick-menu';
import type { RetroArchRewindConfig } from './rewind';
import type { RetroArchRunAheadConfig } from './run-ahead';
import type { RetroArchSaveConfig } from './save';
import type { RetroArchSkeletonConfig } from './skeleton';
import type { RetroArchThemeConfig } from './theme';
import type { RetroArchVideoConfig } from './video';
interface RetroArchFullConfig extends RetroArchInputConfig, RetroArchInputPlayerConfig, RetroArchNotificationConfig, RetroArchQuickMenuConfig, RetroArchRewindConfig, RetroArchRunAheadConfig, RetroArchSaveConfig, RetroArchSkeletonConfig, RetroArchThemeConfig, RetroArchVideoConfig {
    fps_update_interval: number;
    frame_time_counter_reset_after_fastforwarding: boolean;
    frame_time_counter_reset_after_load_state: boolean;
    frame_time_counter_reset_after_save_state: boolean;
    frontend_log_level: number;
    game_specific_options: boolean;
    gamma_correction: number;
    global_core_options: boolean;
    quit_press_twice: boolean;
}
/**
 * RetroArch config list.
 * These config fields are just copied from templates so not all options can make effects in browser.
 */
export type RetroArchConfig = Partial<RetroArchFullConfig>;
export {};
