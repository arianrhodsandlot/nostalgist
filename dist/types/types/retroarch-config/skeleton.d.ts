/**
 * @see {@link https://github.com/libretro/RetroArch/blob/master/retroarch.cfg | RetroArch Skeleton config file in the repo of RetroArch}
 */
export interface RetroArchSkeletonConfig {
    /**
     * If set to a directory, the content history playlist will be saved
     * to this directory.
     */
    content_history_dir: string;
    savestate_auto_load: boolean;
    /**
     * Automatically saves a savestate at the end of RetroArch's lifetime.
     * The path is $SRAM_PATH.auto.
     * RetroArch will automatically load any savestate with this path on startup if savestate_auto_load is set.
     */
    savestate_auto_save: boolean;
    /**
     * Path to a libretro implementation.
     */
    libretro_path: string;
    /**
     * Sets log level for libretro cores (GET_LOG_INTERFACE).
     * If a log level issued by a libretro core is below libretro_log_level, it is ignored.
     * DEBUG logs are always ignored unless verbose mode is activated (--verbose).
     * DEBUG = 0, INFO = 1, WARN = 2, ERROR = 3.
     */
    libretro_log_level: number | string;
    /**
     * Enable or disable verbosity level of frontend.
     */
    log_verbosity: boolean;
    /**
     * If this option is enabled, every content file loaded in RetroArch will be
     * automatically added to a history list.
     */
    history_list_enable: boolean;
    /**
     * Enable performance counters
     */
    perfcnt_enable: boolean;
    /**
     * Path to core options config file.
     * This config file is used to expose core-specific options.
     * It will be written to by RetroArch.
     * A default path will be assigned if not set.
     */
    core_options_path: string;
    /**
     * Path to content history file.
     * RetroArch keeps track of all content loaded in the menu and from CLI directly for convenient quick loading.
     * A default path will be assigned if not set.
     */
    content_history_path: string;
    /**
     * Path to music content history file (optional).
     * RetroArch keeps track of all music content loaded in the menu and from CLI directly for convenient quick loading.
     * A default path will be assigned if not set.
     */
    content_music_history_path: string;
    /**
     * Path to image content history file (optional).
     * RetroArch keeps track of all image content loaded in the menu and from CLI directly for convenient quick loading.
     * A default path will be assigned if not set.
     */
    content_image_history_path: string;
    /**
     * Path to video content history file (optional).
     * RetroArch keeps track of all video content loaded in the menu and from CLI directly for convenient quick loading.
     * A default path will be assigned if not set.
     */
    content_video_history_path: string;
    /**
     * Number of entries that will be kept in content history file.
     */
    content_history_size: number;
    /**
     * Content directory. Interacts with RETRO_ENVIRONMENT_GET_CONTENT_DIRECTORY.
     * Usually set by developers who bundle libretro/RetroArch apps to point to assets.
     */
    content_directory: string;
    /**
     * Sets start directory for menu config browser.
     */
    rgui_config_directory: string;
    /**
     * Show startup screen in menu.
     * Is automatically set to false when seen for the first time.
     * This is only updated in config if config_save_on_exit is set to true, however.
     */
    rgui_show_start_screen: boolean;
    /**
     * Flushes config to disk on exit. Useful for menu as settings can be modified.
     * Overwrites the config. #include's and comments are not preserved.
     */
    config_save_on_exit: boolean;
    /**
     * Shows hidden files and folders in directory listings.
     */
    show_hidden_files: false;
    /**
     * Input driver. Depending on video driver, it might force a different input driver.
     */
    input_driver: string;
    /**
     * Joypad driver. ("udev", "linuxraw", "paraport", "sdl2", "hid", "dinput")
     */
    input_joypad_driver: string;
    /**
     * Video driver to use. "gl", "xvideo", "sdl", "d3d"
     */
    video_driver: string;
    /**
     * Which context implementation to use.
     * Possible ones for desktop are: glx, x-egl, kms-egl, sdl-gl, wgl.
     * By default, tries to use first suitable driver.
     */
    video_context_driver: string;
    /**
     * Audio driver backend. Depending on configuration possible candidates are: alsa, pulse, oss, jack, rsound, roar, openal, sdl, xaudio.
     */
    audio_driver: string;
    /**
     * Audio resampler driver backend. Which audio resampler to use.
     * Default will use "sinc".
     */
    audio_resampler: string;
    /**
     * Camera driver.
     */
    camera_driver: string;
    /**
     * Location driver.
     */
    location_driver: string;
    /**
     * Menu driver to use. ("rgui", "xmb", "glui")
     */
    menu_driver: string;
    /**
     * Record driver. Used when recording video.
     */
    record_driver: string;
    /**
     * Suspends the screensaver if set to true. Is a hint that does not necessarily have to be honored
     * by video driver.
     */
    suspend_screensaver_enable: boolean;
    /**
     * Display framerate.
     */
    fps_show: boolean;
    /**
     * Display memory.
     */
    memory_show: boolean;
    /**
     * Display total number of frames rendered. (only displays if fps_show is enabled)
     */
    framecount_show: string;
    /**
     * Which monitor to prefer. 0 (default) means no particular monitor is preferred, 1 and up (1 being first monitor),
     * suggests RetroArch to use that particular monitor.
     */
    video_monitor_index: number;
    /**
     * Start in fullscreen. Can be changed at runtime.
     */
    video_fullscreen: boolean;
    /**
     * If fullscreen, prefer using a windowed fullscreen mode.
     */
    video_windowed_fullscreen: boolean;
    /**
     * Fullscreen resolution. Resolution of 0 uses the resolution of the desktop.
     */
    video_fullscreen_x: number;
    /**
     * Fullscreen resolution. Resolution of 0 uses the resolution of the desktop.
     */
    video_fullscreen_y: number;
    /**
     * Video refresh rate of your CRT monitor.
     * Used to calculate a suitable audio input rate.
     */
    crt_video_refresh_rate: number;
    /**
     * Video refresh rate of your monitor.
     * Used to calculate a suitable audio input rate.
     */
    video_refresh_rate: number;
    /**
     * Forcibly disable sRGB FBO support. Some Intel OpenGL drivers on Windows
     * have video problems with sRGB FBO support enabled.
     */
    video_force_srgb_disable: boolean;
    /**
     * If this is true and video_aspect_ratio is not set,
     * aspect ratio is decided by libretro implementation.
     * If this is false, 1:1 PAR will always be assumed if video_aspect_ratio is not set.
     */
    video_aspect_ratio_auto: boolean;
    /**
     * A floating point value for video aspect ratio (width / height).
     * If this is not set, aspect ratio is assumed to be automatic.
     * Behavior then is defined by video_aspect_ratio_auto.
     */
    video_aspect_ratio: string;
    /**
     * Windowed x resolution scale and y resolution scale
     * (Real x res: base_size * xscale * aspect_ratio, real y res: base_size * yscale)
     */
    video_scale: number;
    /**
     * Percentage of opacity to use for the window (100 is completely opaque).
     */
    video_window_opacity: number;
    /**
     * Whether to enable the default window decorations like border, titlebar etc.
     */
    video_window_show_decorations: boolean;
    /**
     * Forcibly disable composition. Only works in Windows Vista/7 for now.
     */
    video_disable_composition: boolean;
    /**
     * Video vsync.
     */
    video_vsync: boolean;
    /**
     * Interval at which a Vsync swap is performed.
     * 1 is normal, 2 is doubled frames, 3 is tripled frames, etc.
     */
    video_swap_interval: number;
    /**
     * Max amount of swapchain images.
     * Single buffering = 1, Double buffering = 2, 3 = Triple buffering
     */
    video_max_swapchain_images: number;
    /**
     * Attempts to hard-synchronize CPU and GPU. Can reduce latency at cost of performance.
     */
    video_hard_sync: boolean;
    /**
     * Sets how many frames CPU can run ahead of GPU when using video_hard_sync.
     * Maximum is 3.
     */
    video_hard_sync_frames: number;
    /**
     * Sets how many milliseconds to delay after VSync before running the core.
     * Can reduce latency at cost of higher risk of stuttering.
     * Maximum is 15.
     */
    video_frame_delay: number;
    /**
     * Inserts a black frame inbetween frames.
     * Useful for 120 Hz monitors who want to play 60 Hz material with eliminated ghosting.
     * video_refresh_rate should still be configured as if it is a 60 Hz monitor (divide refresh rate by 2).
     */
    video_black_frame_insertion: boolean;
    /**
     * Use threaded video driver. Using this might improve performance at possible cost of latency and more video stuttering.
     */
    video_threaded: boolean;
    /**
     * Use a shared context for HW rendered libretro cores.
     * Avoids having to assume HW state changes inbetween frames.
     */
    video_shared_context: boolean;
    /**
     * Smoothens picture with bilinear filtering. Should be disabled if using pixel shaders.
     */
    video_smooth: boolean;
    /**
     * Forces rendering area to stay equal to content aspect ratio or as defined in video_aspect_ratio.
     */
    video_force_aspect: boolean;
    /**
     * Only scales video in integer steps.
     * The base size depends on system-reported geometry and aspect ratio.
     * If video_force_aspect is not set, X/Y will be integer scaled independently.
     */
    video_scale_integer: boolean;
    /**
     * Index of the aspect ratio selection in the menu.
     * 20 = Config, 21 = 1:1 PAR, 22 = Core Provided, 23 = Custom Aspect Ratio
     */
    aspect_ratio_index: number;
    /**
     * Forces cropping of overscanned frames.
     * Exact behavior of this option is implementation specific.
     */
    video_crop_overscan: boolean;
    /**
     * Path to shader. Shader can be either Cg, CGP (Cg preset) or GLSL, GLSLP (GLSL preset)
     */
    video_shader: string;
    /**
     * Load video_shader on startup.
     * Other shaders can still be loaded later in runtime.
     */
    video_shader_enable: boolean;
    /**
     * CPU-based video filter. Path to a dynamic library.
     */
    video_filter: string;
    /**
     * Path to a font used for rendering messages. This path must be defined to enable fonts.
     * Do note that the _full_ path of the font is necessary!
     */
    video_font_path: string;
    /**
     * Size of the font rendered in points.
     */
    video_font_size: number;
    /**
     * Enable usage of OSD messages.
     */
    video_font_enable: boolean;
    /**
     * Offset for where messages will be placed on screen. Values are in range 0.0 to 1.0 for both x and y values.
     * [0.0, 0.0] maps to the lower left corner of the screen.
     */
    video_message_pos_x: number;
    /**
     * Offset for where messages will be placed on screen. Values are in range 0.0 to 1.0 for both x and y values.
     * [0.0, 0.0] maps to the lower left corner of the screen.
     */
    video_message_pos_y: number;
    /**
     * Color for message. The value is treated as a hexadecimal value.
     * It is a regular RGB hex number, i.e. red is "ff0000".
     */
    video_message_color: string;
    /**
     * Background color for OSD messages. Red/Green/Blue values are from 0 to 255 and opacity is 0.0 to 1.0.
     */
    video_message_bgcolor_enable: boolean;
    /**
     * Background color for OSD messages. Red/Green/Blue values are from 0 to 255 and opacity is 0.0 to 1.0.
     */
    video_message_bgcolor_red: number;
    /**
     * Background color for OSD messages. Red/Green/Blue values are from 0 to 255 and opacity is 0.0 to 1.0.
     */
    video_message_bgcolor_green: number;
    /**
     * Background color for OSD messages. Red/Green/Blue values are from 0 to 255 and opacity is 0.0 to 1.0.
     */
    video_message_bgcolor_blue: number;
    /**
     * Background color for OSD messages. Red/Green/Blue values are from 0 to 255 and opacity is 0.0 to 1.0.
     */
    video_message_bgcolor_opacity: number;
    /**
     * Allows libretro cores to set rotation modes.
     * Setting this to false will honor, but ignore this request.
     * This is useful for vertically oriented content where one manually rotates the monitor.
     */
    video_allow_rotate: boolean;
    /**
     * Forces a certain rotation of the video.
     * The rotation is added to rotations which the libretro core sets (see video_allow_rotate).
     * The angle is <value> * 90 degrees counter-clockwise.
     */
    video_rotation: number;
    /**
     * Forces a certain orientation of the screen from the operating system.
     * The angle is <value> * 90 degrees counter-clockwise.
     */
    screen_orientation: number;
    /**
     * HDR settings
     */
    video_hdr_enable: boolean;
    /**
     * HDR settings
     */
    video_hdr_max_nits: string;
    /**
     * HDR settings
     */
    video_hdr_paper_white_nits: string;
    /**
     * HDR settings
     */
    video_hdr_contrast: string;
    /**
     * HDR settings
     */
    video_hdr_expand_gamut: boolean;
    /**
     * Enable audio.
     */
    audio_enable: boolean;
    /**
     * Enable menu audio sounds.
     */
    audio_enable_menu: boolean;
    /**
     * Enable menu audio sounds.
     */
    audio_enable_menu_ok: boolean;
    /**
     * Enable menu audio sounds.
     */
    audio_enable_menu_cancel: boolean;
    /**
     * Enable menu audio sounds.
     */
    audio_enable_menu_notice: boolean;
    /**
     * Enable menu audio sounds.
     */
    audio_enable_menu_bgm: boolean;
    /**
     * Mutes audio.
     */
    audio_mute_enable: boolean;
    /**
     * Mutes audio mixer volume globally.
     */
    audio_mixer_mute_enable: boolean;
    /**
     * Audio output samplerate.
     */
    audio_out_rate: number;
    /**
     * Override the default audio device the audio_driver uses. This is driver dependant. E.g. ALSA wants a PCM device, OSS wants a path (e.g. /dev/dsp), Jack wants portnames (e.g. system:playback1,system:playback_2), and so on ...
     */
    audio_device: string;
    /**
     * Audio DSP plugin that processes audio before it's sent to the driver. Path to a dynamic library.
     */
    audio_dsp_plugin: string;
    /**
     * Will sync (block) on audio. Recommended.
     */
    audio_sync: boolean;
    /**
     * Desired audio latency in milliseconds. Might not be honored if driver can't provide given latency.
     */
    audio_latency: number;
    /**
     * Enable audio rate control.
     */
    audio_rate_control: boolean;
    /**
     * Controls audio rate control delta. Defines how much input rate can be adjusted dynamically.
     * Input rate = in_rate * (1.0 +/- audio_rate_control_delta)
     */
    audio_rate_control_delta: number;
    /**
     * Controls maximum audio timing skew. Defines the maximum change in input rate.
     * Input rate = in_rate * (1.0 +/- max_timing_skew)
     */
    audio_max_timing_skew: number;
    /**
     * Audio volume. Volume is expressed in dB.
     * 0 dB is normal volume. No gain will be applied.
     * Gain can be controlled in runtime with input_volume_up/input_volume_down.
     */
    audio_volume: number;
    /**
     * Audio mixer volume. Volume is expressed in dB.
     * 0 dB is normal volume. No gain will be applied.
     */
    audio_mixer_volume: number;
    /**
     * Enable microphone support.
     */
    microphone_enable: boolean;
    /**
     * Desired microphone latency in milliseconds. Might not be honored if driver can't provide given latency.
     */
    microphone_latency: number;
    /**
     * Enable the overlay.
     */
    input_overlay_enable: boolean;
    /**
     * Show the overlay behind the menu instead of in front.
     */
    input_overlay_behind_menu: boolean;
    /**
     * Hide the current overlay from appearing inside the menu.
     */
    input_overlay_hide_in_menu: boolean;
    /**
     * Path to input overlay.
     */
    input_overlay: string;
    /**
     * Opacity of all the UI elements of the overlay.
     */
    input_overlay_opacity: number;
    /**
     * Scale of all UI elements of the overlay.
     */
    input_overlay_scale: number;
    /**
     * Center of all UI elements of the overlay.
     */
    input_overlay_center_x: number;
    /**
     * Center of all UI elements of the overlay.
     */
    input_overlay_center_y: number;
    /**
     * Path to input remapping file.
     */
    input_remapping_path: string;
    /**
     * Input bind timer timeout.
     * Amount of seconds to wait until proceeding to the next bind. Default: 5, minimum: 1
     */
    input_bind_timeout: number;
    /**
     * If enabled, overrides the input binds with the remapped binds set for the current core.
     */
    input_remap_binds_enable: boolean;
    /**
     * Maximum amount of users supported by RetroArch.
     */
    input_max_users: number;
    /**
     * Keyboard layout for input driver if applicable (udev/evdev for now).
     * Syntax is either just layout (e.g. "no"), or a layout and variant separated with colon ("no:nodeadkeys").
     */
    input_keyboard_layout: string;
    /**
     * Defines axis threshold. Possible values are [0.0, 1.0]
     */
    input_axis_threshold: number;
    input_analog_deadzone: number;
    input_analog_sensitivity: number;
    /**
     * Enable input auto-detection. Will attempt to autoconfigure
     * joypads, Plug-and-Play style.
     */
    input_autodetect_enable: boolean;
    /**
     * Show the input descriptors set by the core instead of the
     * default ones.
     */
    input_descriptor_label_show: boolean;
    /**
     * Hide input descriptors that were not set by the core.
     */
    input_descriptor_hide_unbound: boolean;
    /**
     * Influence how input polling is done inside RetroArch.
     * 0 : Early  - Input polling is performed before call to retro_run.
     * 1 : Normal - Input polling is performed when retro_input_poll is
     *     requested.
     * 2 : Late   - Input polling is performed on first call to retro_input_state
     *     per frame
     *
     * Setting it to 0 or 2 can result in less latency depending on
     * your configuration.
     *
     * When netplay is enabled, the default polling behavior (1) will
     * be used regardless of the value set here.
     */
    input_poll_type_behavior: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p1: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p2: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p3: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p4: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p5: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p6: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p7: number;
    /**
     * Sets which libretro device is used for a user.
     * Devices are indentified with a number.
     * This is normally saved by the menu.
     * Device IDs are found in libretro.h.
     * These settings are overridden by explicit command-line arguments which refer to input devices.
     * None: 0
     * Joypad (RetroPad): 1
     * Mouse: 2
     * Keyboard: 3
     * Generic Lightgun: 4
     * Joypad w/ Analog (RetroPad + Analog sticks): 5
     * Multitap (SNES specific): 257
     * Super Scope (SNES specific): 260
     * Justifier (SNES specific): 516
     * Justifiers (SNES specific): 772
     */
    input_libretro_device_p8: number;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_a: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_b: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_y: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_x: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_start: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_select: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_l: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_r: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_left: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_right: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_up: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_down: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_l2: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_r2: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_l3: string;
    /**
     * Keyboard input. Will recognize letters ("a" to "z") and the following special keys (where "kp_"
     * is for keypad keys):
     *
     *   left, right, up, down, enter, kp_enter, tab, insert, del, end, home,
     *   rshift, shift, ctrl, alt, space, escape, add, subtract, kp_plus, kp_minus,
     *   f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12,
     *   num0, num1, num2, num3, num4, num5, num6, num7, num8, num9, pageup, pagedown,
     *   keypad0, keypad1, keypad2, keypad3, keypad4, keypad5, keypad6, keypad7, keypad8, keypad9,
     *   period, capslock, numlock, backspace, multiply, divide, print_screen, scroll_lock,
     *   tilde, backquote, pause, quote, comma, minus, slash, semicolon, equals, leftbracket,
     *   backslash, rightbracket, kp_period, kp_equals, rctrl, ralt
     *
     * Keyboard input, Joypad and Joyaxis will all obey the "nul" bind, which disables the bind completely,
     * rather than relying on a default.
     */
    input_player1_r3: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_l_x_plus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_l_x_minus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_l_y_plus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_l_y_minus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_r_x_plus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_r_x_minus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_r_y_plus: string;
    /**
     * Two analog sticks (DualShock-esque).
     * Bound as usual, however, if a real analog axis is bound,
     * it can be read as a true analog.
     * Positive X axis is right, Positive Y axis is down.
     */
    input_player1_r_y_minus: string;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player1_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player2_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player3_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player4_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player5_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player6_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player7_joypad_index: number;
    /**
     * If desired, it is possible to override which joypads are being used for user 1 through 8.
     * First joypad available is 0.
     */
    input_player8_joypad_index: number;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_a_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_b_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_y_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_x_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_start_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_select_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_l_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_r_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_left_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_right_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_up_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_down_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_l2_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_r2_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_l3_btn: string;
    /**
     * Input device buttons.
     * Figure these out by using the RetroArch configuration menu
     * You can use joypad hats with hnxx, where n is the hat, and xx is a string representing direction.
     * E.g. "h0up"
     */
    input_player1_r3_btn: string;
    /**
     * Menu buttons.
     */
    menu_search_btn: string;
    /**
     * Menu buttons.
     */
    menu_info_btn: string;
    /**
     * Menu buttons.
     */
    menu_default_btn: string;
    /**
     * Menu buttons.
     */
    menu_scroll_down_btn: string;
    /**
     * Menu buttons.
     */
    menu_scroll_up_btn: string;
    /**
     * Swap buttons for OK/Cancel
     */
    menu_swap_ok_cancel_buttons: boolean;
    /**
     * Swap buttons for scrolling (10 items vs alphabetical)
     */
    menu_swap_scroll_buttons: boolean;
    /**
     * Axis for RetroArch D-Pad.
     * Needs to be either '+' or '-' in the first character signaling either positive or negative direction of the axis, then the axis number.
     * Do note that every other input option has the corresponding _btn and _axis binds as well; they are omitted here for clarity.
     */
    input_player1_left_axis: string;
    /**
     * Axis for RetroArch D-Pad.
     * Needs to be either '+' or '-' in the first character signaling either positive or negative direction of the axis, then the axis number.
     * Do note that every other input option has the corresponding _btn and _axis binds as well; they are omitted here for clarity.
     */
    input_player1_right_axis: string;
    /**
     * Axis for RetroArch D-Pad.
     * Needs to be either '+' or '-' in the first character signaling either positive or negative direction of the axis, then the axis number.
     * Do note that every other input option has the corresponding _btn and _axis binds as well; they are omitted here for clarity.
     */
    input_player1_up_axis: string;
    /**
     * Axis for RetroArch D-Pad.
     * Needs to be either '+' or '-' in the first character signaling either positive or negative direction of the axis, then the axis number.
     * Do note that every other input option has the corresponding _btn and _axis binds as well; they are omitted here for clarity.
     */
    input_player1_down_axis: string;
    /**
     * Holding the turbo while pressing another button will let the button enter a turbo mode
     * where the button state is modulated with a periodic signal.
     * The modulation stops when the button itself (not turbo button) is released.
     */
    input_player1_turbo: string;
    /**
     * Describes the period and how long of that period a turbo-enabled button should behave.
     * Numbers are described in frames.
     */
    input_turbo_period: number;
    /**
     * Describes the period and how long of that period a turbo-enabled button should behave.
     * Numbers are described in frames.
     */
    input_turbo_duty_cycle: number;
    /**
     * This goes all the way to user 8 (*_player2_*, *_player3_*, etc), but omitted for clarity.
     * All input binds have corresponding binds for keyboard (none), joykeys (_btn) and joyaxes (_axis) as well.
  
  /**
     * Toggles fullscreen.
     */
    input_toggle_fullscreen: string;
    /**
     * Saves state.
     */
    input_save_state: string;
    /**
     * Loads state.
     */
    input_load_state: string;
    /**
     * State slots. With slot set to 0, save state name is *.state (or whatever defined on commandline).
     * When slot is != 0, path will be $path%d, where %d is slot number.
     */
    input_state_slot_increase: string;
    /**
     * State slots. With slot set to 0, save state name is *.state (or whatever defined on commandline).
     * When slot is != 0, path will be $path%d, where %d is slot number.
     * defaults to f6
     */
    input_state_slot_decrease: string;
    /**
     * Toggles between fast-forwarding and normal speed.
     * defaults to space
     */
    input_toggle_fast_forward: string;
    /**
     * Hold for fast-forward. Releasing button disables fast-forward.
     * defaults to l
     */
    input_hold_fast_forward: string;
    /**
     * Key to exit RetroArch cleanly.
     * Killing it in any hard way (SIGKILL, etc) will terminate RetroArch without saving RAM, etc.
     * On Unix-likes, SIGINT/SIGTERM allows a clean deinitialization.
     * defaults to escape
     */
    input_exit_emulator: string;
    /**
     * Applies next and previous shader in directory.
     * defaults to m
     */
    input_shader_next: string;
    /**
     * Applies next and previous shader in directory.
     * defaults to n
     */
    input_shader_prev: string;
    /**
     * Applies next and previous shader in directory.
     * defaults to comma
     */
    input_shader_toggle: string;
    /**
     * Hold button down to rewind. Rewinding must be enabled.
     * defaults to r
     */
    input_rewind: string;
    /**
     * Toggle between recording and not.
     * defaults to o
     */
    input_movie_record_toggle: string;
    /**
     * Toggle between paused and non-paused state
     * defaults to p
     */
    input_pause_toggle: string;
    /**
     * Frame advance when content is paused
     * defaults to k
     */
    input_frame_advance: string;
    /**
     * Reset the content.
     * defaults to h
     */
    input_reset: string;
    /**
     * Cheats.
     * defaults to y
     */
    input_cheat_index_plus: string;
    /**
     * Cheats.
     * defaults to t
     */
    input_cheat_index_minus: string;
    /**
     * Cheats.
     * defaults to u
     */
    input_cheat_toggle: string;
    /**
     * Mute/unmute audio
     * defaults to f9
     */
    input_audio_mute: string;
    /**
     * Take screenshot
     * defaults to f8
     */
    input_screenshot: string;
    /**
     * Netplay flip users.
     * defaults to i
     */
    input_netplay_flip_players: string;
    /**
     * Hold for slowmotion.
     * defaults to e
     */
    input_slowmotion: string;
    /**
     * Toggles sync to exact content framerate.
     */
    input_toggle_vrr_runloop: string;
    /**
     * Enable other hotkeys.
     * If this hotkey is bound to either keyboard, joybutton or joyaxis,
     * all other hotkeys will be disabled unless this hotkey is also held at the same time.
     * This is useful for RETRO_KEYBOARD centric implementations
     * which query a large area of the keyboard, where it is not desirable
     * that hotkeys get in the way.
     *
     * Alternatively, all hotkeys for keyboard could be disabled by the user.
     */
    input_enable_hotkey_btn: number;
    /**
     * Adds a delay in frames before the assigned hotkey blocks input.  Useful if the the
     * hotkey input is mapped to another action.
     */
    input_hotkey_block_delay: number;
    /**
     * Increases audio volume.
     */
    input_volume_up: string;
    /**
     * Decreases audio volume.
     */
    input_volume_down: string;
    /**
     * Toggles to next overlay. Wraps around.
     */
    input_overlay_next: string;
    /**
     * Toggles eject for disks. Used for multiple-disk content.
     */
    input_disk_eject_toggle: string;
    /**
     * Cycles through disk images. Use after ejecting.
     * Complete by toggling eject again.
     */
    input_disk_next: string;
    /**
     * Toggles menu.
     */
    input_menu_toggle: string;
    /**
     * Toggles display of on-screen technical statistics.
     */
    input_toggle_statistics: string;
    /**
     * RetroPad button combination to toggle menu
     * 0: None
     * 1: Down + Y + L1 + R1
     * 2: L3 + R3
     * 3: L1 + R1 + Start + Select
     * 4: Start + Select
     * 5: L3 + R1
     * 6: L1 + R1
     * 7: Hold Start (2 seconds)
     * 8: Hold Select (2 seconds)
     * 9: Down + Select
     * 10: L2 + R2
     */
    input_menu_toggle_gamepad_combo: number;
    /**
     * RetroPad button combination to quit
     * 0: None
     * 1: Down + Y + L1 + R1
     * 2: L3 + R3
     * 3: L1 + R1 + Start + Select
     * 4: Start + Select
     * 5: L3 + R1
     * 6: L1 + R1
     * 7: Hold Start (2 seconds)
     * 8: Hold Select (2 seconds)
     * 9: Down + Select
     * 10: L2 + R2
     */
    input_quit_gamepad_combo: number;
    /**
     * allow any RetroPad to control the menu
     */
    all_users_control_menu: boolean;
    /**
     * Toggles mouse grab. When mouse is grabbed, RetroArch hides the mouse,
     * and keeps the mouse pointer inside the window to allow relative mouse input
     * to work better.
     */
    input_grab_mouse_toggle: string;
    /**
     * If disabled, will hide 'Online Updater' inside the menu.
     */ menu_show_online_updater: boolean;
    /**
     * If disabled, will hide the ability to update cores (and core info files) inside the menu.
     */ menu_show_core_updater: boolean;
    /**
     * If disabled, the libretro core will keep running in the background when we
     * are in the menu.
     */ menu_pause_libretro: boolean;
    /**
     * If disabled, we use separate controls for menu operation.
     */ menu_unified_controls: boolean;
    /**
     * Enable mouse controls inside the menu.
     */ menu_mouse_enable: boolean;
    /**
     * Enable touch controls inside the menu.
     */ menu_pointer_enable: boolean;
    /**
     * Shows current date and/or time inside menu.
     */ menu_timedate_enable: boolean;
    /**
     * Shows current battery level inside menu.
     */ menu_battery_level_enable: boolean;
    /**
     * Shows current core inside menu.
     */ menu_core_enable: boolean;
    /**
     * Path to an image to set as menu wallpaper.
     */
    menu_wallpaper: string;
    /**
     * Dynamically load a new wallpaper depending on context.
     */
    menu_dynamic_wallpaper_enable: boolean;
    /**
     * Type of thumbnail to display. 0 = none, 1 = snaps, 2 = titles, 3 = boxarts
     */
    menu_thumbnails: number;
    /**
     * Type of thumbnail to display. 0 = none, 1 = snaps, 2 = titles, 3 = boxarts
     */
    menu_left_thumbnails: number;
    /**
     * Wrap-around to beginning and/or end if boundary of list is reached horizontally or vertically.
     */
    menu_navigation_wraparound_enable: boolean;
    /**
     * Filter files being shown in filebrowser by supported extensions.
     */
    menu_navigation_browser_filter_supported_extensions_enable: boolean;
    /**
     * Collapse subgroup settings into main group to create one big listing of settings
     * per category.
     */
    menu_collapse_subgroups_enable: boolean;
    /**
     * Prevent libretro cores from closing RetroArch on exit by loading a dummy core.
     */
    load_dummy_on_core_shutdown: boolean;
    /**
     * Check for firmware requirement(s) before loading a content.
     */
    check_firmware_before_loading: boolean;
    /**
     * Start UI companion driver's interface on boot (if available).
     */
    ui_companion_start_on_boot: boolean;
    /**
     * Toggle companion UI on startup (currently only used to show the WIMP UI)
     */
    ui_companion_toggle: boolean;
    /**
     * Only init the WIMP UI for this session if this is enabled
     */
    desktop_menu_enable: boolean;
    /**
     * Override the default camera device the camera driver uses. This is driver dependant.
     */
    camera_device: string;
    /**
     * Override the default privacy permission for cores that want to access camera services. Is "false" by default.
     */
    camera_allow: boolean;
    /**
     * Override the default privacy permission for cores that want to access location services. Is "false" by default.
     */
    location_allow: boolean;
    /**
     * URL to core update directory on buildbot.
     */
    core_updater_buildbot_url: string;
    /**
     * URL to assets update directory on buildbot.
     */
    core_updater_buildbot_assets_url: string;
    /**
     * After downloading, automatically extract archives that the downloads are contained inside.
     */
    core_updater_auto_extract_archive: boolean;
    /**
     * When being client over netplay, use keybinds for user 1.
     */
    netplay_client_swap_input: boolean;
    /**
     * The username of the person running RetroArch. This will be used for playing online, for instance.
     */
    netplay_nickname: string;
    /**
     * The amount of delay frames to use for netplay. Increasing this value will increase
     * performance, but introduce more latency.
     */
    netplay_delay_frames: number;
    /**
     * Netplay mode for the current user.
     * false is Server, true is Client.
     */
    netplay_mode: boolean;
    /**
     * Enable or disable spectator mode for the user during netplay.
     */
    netplay_spectator_mode_enable: boolean;
    /**
     * The IP Address of the host to connect to.
     */
    netplay_ip_address: string;
    /**
     * The port of the host IP Address. Can be either a TCP or UDP port.
     */
    netplay_ip_port: number;
    /**
     * Force game hosting to go through a man-in-the-middle server to get around firewalls and NAT/UPnP problems.
     */
    netplay_use_mitm_server: boolean;
    /**
     * The requested MITM server to use.
     */
    netplay_mitm_server: string;
    /**
     * Sets the System/BIOS directory.
     * Implementations can query for this directory to load BIOSes, system-specific configs, etc.
     */
    system_directory: string;
    /**
     * Save all downloaded files to this directory.
     */
    core_assets_directory: string;
    /**
     * Assets directory. This location is queried by default when menu interfaces try to look for
     * loadable assets, etc.
     */
    assets_directory: string;
    /**
     * Dynamic wallpapers directory. The place to store the wallpapers dynamically
     * loaded by the menu depending on context.
     */
    dynamic_wallpapers_directory: string;
    /**
     * Thumbnails directory. To store thumbnail files.
     */
    thumbnails_directory: string;
    /**
     * File browser directory. Sets start directory for menu file browser.
     */
    rgui_browser_directory: string;
    /**
     * Core directory for libretro core implementations.
     */
    libretro_directory: string;
    /**
     * Core info directory for libretro core information.
     */
    libretro_info_path: string;
    /**
     * Path to content database directory.
     */
    content_database_path: string;
    /**
     * Saved queries are stored to this directory.
     */
    cursor_directory: string;
    /**
     * Path to cheat database directory.
     */
    cheat_database_path: string;
    /**
     * Defines a directory where CPU-based video filters are kept.
     */
    video_filter_dir: string;
    /**
     * Directory where DSP plugins are kept.
     */
    audio_filter_dir: string;
    /**
     * Defines a directory where shaders (Cg, CGP, GLSL) are kept for easy access.
     */
    video_shader_dir: string;
    /**
     * Recording output directory. Where recordings are saved.
     */
    recording_output_directory: string;
    /**
     * Recording config directory. Where recording settings are kept.
     */
    recording_config_directory: string;
    /**
     * Overlay directory. Where overlays are kept for easy access.
     */
    overlay_directory: string;
    /**
     * Directory to dump screenshots to.
     */
    screenshot_directory: string;
    /**
     * Directory for joypad autoconfigs.
     * If a joypad is plugged in, that joypad will be autoconfigured if a config file
     * corresponding to that joypad is present in joypad_autoconfig_dir.
     * Input binds which are made explicit (input_playerN_*_btn/axis) will take priority over autoconfigs.
     * Autoconfigs can be created with manually, or with the frontend.
     * Requires input_autodetect_enable to be enabled.
     */
    joypad_autoconfig_dir: string;
    /**
     * Save all remapped controls to this directory.
     */
    input_remapping_directory: string;
    /**
     * Save all playlists/collections to this directory.
     */
    playlist_directory: string;
    /**
     * Save all save files (*.srm) to this directory. This includes related files like .bsv, .rtc, .psrm, etc ...
     * This will be overridden by explicit command line options.
     */
    savefile_directory: string;
    /**
     * Save all save states (*.state) to this directory.
     * This will be overridden by explicit command line options.
     */
    savestate_directory: string;
    /**
     * If set to a directory, content which is temporarily extracted
     * will be extracted to this directory.
     */
    cache_directory: string;
    /**
     * Enable the RetroAchievements feature.
     */
    cheevos_enable: boolean;
    /**
     * RetroAchievements.org credentials.
     */
    cheevos_username: string;
    /**
     * RetroAchievements.org credentials.
     */
    cheevos_password: string;
    /**
     * Show a popup when logging in to RetroAchievements.
     */
    cheevos_visibility_account: boolean;
    /**
     * The hardcore mode disables savestates and cheating features. Achievements
     * earned in hardcore mode are uniquely marked so that you can show others
     * what you've achieved without emulator assistance features.
     */
    cheevos_hardcore_mode_enable: boolean;
    /**
     * Show a popup when an achievement is unlocked.
     */
    cheevos_visibility_unlock: boolean;
    /**
     * Play the 'unlock' audio sound when an achievement is unlocked.
     */
    cheevos_unlock_sound_enable: boolean;
    /**
     * Take a screenshot when an achievement is triggered.
     */
    cheevos_auto_screenshot: boolean;
    /**
     * Show a popup when all achievements for a game are unlocked.
     */
    cheevos_visibility_mastery: boolean;
    /**
     * Shows additional diagnostic and error messages
     */
    cheevos_verbose_enable: boolean;
    /**
     * Show achievements' badges in Quick Menu \> Achievements List.
     * (note: has no effect if menu_driver = rgui).
     */
    cheevos_badges_enable: boolean;
    /**
     * Show an on-screen indicator when attempting challenging achievements
     * to provide feedback when the attempt has failed (for achievements that
     * support it)
     */
    cheevos_challenge_indicators: boolean;
    /**
     * Shows a message when a leaderboard activates.
     */
    cheevos_visibility_lboard_start: boolean;
    /**
     * Shows a message with your score when a leaderboard is submitted to the server.
     */
    cheevos_visibility_lboard_submit: boolean;
    /**
     * Shows an on-screen tracker with the current value of active leaderboards.
     */
    cheevos_visibility_lboard_trackers: boolean;
    /**
     * Send some messages to the RetroAchievements.org saying, for example,
     * where you are in the game, how many lives you have, your score, etc.
     */
    cheevos_richpresence_enable: boolean;
    /**
     * Even after unlocking achievements in previous sessions, you may still want
     * to see them triggering in the current session. (encore mode)
     */
    cheevos_start_active: boolean;
    /**
     * Unnoficial achievements are used only for achievement creators and testers.
     */
    cheevos_test_unofficial: boolean;
    /**
     * Enable rewinding. This will take a performance hit when playing, so it is disabled by default.
     */
    rewind_enable: boolean;
    /**
     * Rewinding buffer size in megabytes. Bigger rewinding buffer means you can rewind longer.
     * The buffer should be approx. 20MB per minute of buffer time.
     */
    rewind_buffer_size: number;
    /**
     * Rewind granularity. When rewinding defined number of frames, you can rewind several frames at a time, increasing the rewinding speed.
     */
    rewind_granularity: number;
    /**
     * Pause gameplay when window focus is lost.
     */
    pause_nonactive: boolean;
    /**
     * Pause gameplay when controller disconnects.
     */
    pause_on_disconnect: boolean;
    /**
     * Autosaves the non-volatile SRAM at a regular interval. This is disabled by default unless set otherwise.
     * The interval is measured in seconds. A value of 0 disables autosave.
     */
    autosave_interval: string;
    /**
     * Records video after CPU video filter.
     */
    video_post_filter_record: boolean;
    /**
     * Records output of GPU shaded material if available.
     */
    video_gpu_record: boolean;
    /**
     * Screenshots output of GPU shaded material if available.
     */
    video_gpu_screenshot: boolean;
    /**
     * Watch content shader files for changes and auto-apply as necessary.
     */
    video_shader_watch_files: boolean;
    /**
     * Block SRAM from being overwritten when loading save states.
     * Might potentially lead to buggy games.
     */
    block_sram_overwrite: boolean;
    /**
     * When saving a savestate, save state index is automatically increased before
     * it is saved.
     * Also, when loading content, the index will be set to the highest existing index.
     * There is no upper bound on the index.
     */
    savestate_auto_index: boolean;
    /**
     * Slowmotion ratio. When slowmotion, content will slow down by factor.
     */
    slowmotion_ratio: number;
    /**
     * The maximum rate at which content will be run when using fast forward. (E.g. 5.0 for 60 fps content =\> 300 fps cap).
     * RetroArch will go to sleep to ensure that the maximum rate will not be exceeded.
     * Do not rely on this cap to be perfectly accurate.
     * If this is set at 0, then fastforward ratio is unlimited (no FPS cap)
     */
    fastforward_ratio: number;
    /**
     * Enable stdin/network command interface.
     */
    network_cmd_enable: boolean;
    network_cmd_port: number;
    /**
     * Enable stdin/network command interface.
     */
    stdin_cmd_enable: boolean;
    /**
     * Enable Sustained Performance Mode in Android 7.0+
     */
    sustained_performance_mode: boolean;
    /**
     * File format to use when writing playlists to disk
     */
    playlist_use_old_format: boolean;
    /**
     * Keep track of how long each core+content has been running for over time
     */
    content_runtime_log: boolean;
    /**
     */
    vibrate_on_keypress: boolean;
    /**
     * Enable device vibration for supported cores
     */
    enable_device_vibration: boolean;
    /**
     * Enable game mode on supported platforms.
     * Depending on the system, it can result in more stable frame times, less audio
     * crackling, better performance and lower latency. On Linux, Feral GameMode
     * needs to be installed (https://github.com/FeralInteractive/gamemode).
     */
    gamemode_enable: boolean;
}
