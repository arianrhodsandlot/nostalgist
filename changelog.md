# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.19.0] - 2025-11-19
### Added
- Add support for extracting the default cores; update default retroarch-emscripten-build version to v1.22.2

## [0.18.0] - 2025-11-16
### Added
- Update default retroarch-emscripten-build version to v1.22.0

## [0.17.1] - 2025-10-27
### Fixed
- Bypass inputs while focusing interactable elements and ensure all event listeners to be removed after exiting

## [0.17.0] - 2025-08-29
### Added
- Prefer exposed methods over sending messages
### Fixed
- Fix test
- Fix test
- Fix test
- Throw an error if response is not ok

## [0.16.0] - 2025-07-22
### Added
- Add support for caching state and sram

## [0.15.2] - 2025-06-07
### Fixed
- Fix setImmediate polyfill

## [0.15.1] - 2025-06-07
### Fixed
- Handle setImmediate polyfill properly

## [0.15.0] - 2025-05-09
### Added
- Update default retroarch-emscripten-build version to v1.21.0

## [0.14.2] - 2025-04-25
### Fixed
- Fix blobs passed to shortcuts are not detected, fix #54

## [0.14.1] - 2025-04-01
### Fixed
- Fix files may be not resolved when inside a object's fileContent field

## [0.14.0] - 2025-03-06
### Added
- Add a new launch option `cache` for caching loaded resources
- Add a new method getStatus
- `loadState` now supports loading resolvable files

## [0.13.0] - 2025-02-28
### Added
- Support resolving multiple files wrapped by functions or promises
- Add support for loading FileSystemFileHandle directly, close #52
- Better name detecting strategy for files, fix #53
- Add a new static method
### Fixed
- Add the missing await to avoid launching failures
- Do not overwrite passed file name unexpectedly
- Fix Response inside an object not being loaded
- Improve types for resolvable files

## [0.12.1] - 2025-01-29
### Fixed
- Fix types of resolvable files are not correctly detected
- Fix type declarations of resolvers in the parameter of `Nostalgist.launch`

## [0.12.0] - 2025-01-28
### Added
- Support loading resolvable files from parameters
- Add support for saving and importing SRAM
- Update default retroarch-emscripten-build version to v1.20.0
### Fixed
- Fix the exit method not working

## [0.11.0] - 2024-08-16
### Fixed
- fix the crash when `AL` and `Browser` are not accessible
- improve the type declaration for the "rom" argument of the "launch" method

### Changed
- remove redundant dependencies
- remove `getBrowserFS`

## [0.10.0] - 2024-07-24
### Changed
- update default retroarch-emscripten-build version to v1.19.1
- add `getEmscripten` and `getEmscriptenAL`

## [0.9.2] - 2024-03-15
### Fixed
- fix the error when launching with a malformed link

## [0.9.1] - 2024-03-05

### Fixed
- better options merging strategy
- improve ESM detection
- register the exit process when cancelling after a real launch

## [0.9.0] - 2024-03-04
### Added
- add support for cancelling a launch via an `AbortController`
- add `beforeLaunch` and `onLaunch` parameters to allow us to hook into the launching process
- add `getBrowserFS` method for accessing the corresponding `BFSEmscriptenFS` object of the emulator
- add a new method `sendCommand` for sending commands to RetroArch
- add support for launching with an initial state

## [0.8.1] - 2024-02-24
### Fixed
- fix passing a custom canvas element not working properly

## [0.8.0] - 2024-02-07
### Changed
- update default retroarch-emscripten-build version to v1.17.0
- disable some default inputs in RetroArch
- when some of the passed config items are objects, like `retroarchConfig`, they will be merged with the default items instead of overwriting the default items entirely
### Fixed
- fix export name when using ESM build of retroarch

## [0.7.0] - 2024-01-28
### Added
- add support for shaders
### Fixed
- fix BIOS files not written to the system directory

## [0.6.0] - 2024-01-13
### Added
- add a new screenshot method ([fa8fd06](https://github.com/arianrhodsandlot/nostalgist/commit/fa8fd06d1aaad6c2a35df4fc1051c43f3471f7b4))
- treat data url and blob url as absolute ([ce4aed6](https://github.com/arianrhodsandlot/nostalgist/commit/ce4aed6991f0127049884d9fd21a8c6b79a8d52d))

## [0.5.1] - 2023-11-07
### Fixed
- fix canvas size ([eb2d985](https://github.com/arianrhodsandlot/nostalgist/commit/eb2d9858e5d7c569060a46153e88dd659896a5ab))

## [0.5.0] - 2023-11-06
### Added
- add support for RetroArch nightly ESM builds, fix [#10](https://github.com/arianrhodsandlot/nostalgist/issues/10) ([3cfeaa6](https://github.com/arianrhodsandlot/nostalgist/commit/3cfeaa6a3ee2f5f64b0268bb696768116ed03fd7))

## [0.4.2] - 2023-10-16
### Fixed
- fix a possible failure when writing config files ([ee924cf](https://github.com/arianrhodsandlot/nostalgist/commit/ee924cf291890b832a27f589dde6c3f0aa697432))

## [0.4.1] - 2023-10-15
### Fixed
- fix bios not working properly ([94824b5](https://github.com/arianrhodsandlot/nostalgist/commit/94824b56232806bfb9ede4cc15acacb2057371f1))
- fix error while exiting and styles are not updated ([546f24a](https://github.com/arianrhodsandlot/nostalgist/commit/546f24a24f5d8d4182247f4e200abf4cb3f87cd1))
- fix misc small issues ([a0a9546](https://github.com/arianrhodsandlot/nostalgist/commit/a0a95465aa0b52235e66ceca20736391ea686467))

### Added
- add a new option `emscriptenModule` ([ee2bbd5](https://github.com/arianrhodsandlot/nostalgist/commit/ee2bbd522fc91dc59fda19336e12b8f80eb97208))
- add some new methods about pressing button programmatically ([46a9426](https://github.com/arianrhodsandlot/nostalgist/commit/46a94260bab76f42bed4e6749a5c83e4895f86ab))
- expose vendors ([04ccafd](https://github.com/arianrhodsandlot/nostalgist/commit/04ccafd167fd9954d8ba6de0b9cd1fff7d97a529))

## [0.4.0] - 2023-10-15
### Fixed
- fix bios not working properly ([adb9637](https://github.com/arianrhodsandlot/nostalgist/commit/adb9637ae0e7ab589cd0d2901c1fc2a2ab576ed1))
- fix misc small issues ([43dba6f](https://github.com/arianrhodsandlot/nostalgist/commit/43dba6f7c6229e9357456cd2683e6d1f843d2a63))

### Added
- add a new option `emscriptenModule` ([24885e6](https://github.com/arianrhodsandlot/nostalgist/commit/24885e65a544490369cfb83c3ab99836d9733cd8))
- add some new methods about pressing button programmatically ([d46e453](https://github.com/arianrhodsandlot/nostalgist/commit/d46e4537fba11bf65065a72f0f3150d1ceb1684a))
- expose vendors ([71bb325](https://github.com/arianrhodsandlot/nostalgist/commit/71bb325f89465e6d102bc910441826443e459c34))

## [0.3.1] - 2023-10-12
### Fixed
- update default styles ([6cc7b08](https://github.com/arianrhodsandlot/nostalgist/commit/6cc7b0802565ce7dda17be2334dca5292a7dfc63))

## [0.3.0] - 2023-10-12
### Added
- implement the option `retroarchCoreConfig` ([6ed2e7c](https://github.com/arianrhodsandlot/nostalgist/commit/6ed2e7c78d48c0d3854d6af485bd190ad6bb24eb))
- shortcut methods now support `File` and `{ fileName, fileContent }` as parameter ([4da61ac](https://github.com/arianrhodsandlot/nostalgist/commit/4da61ac31225c519978e632886e22f63fa81f3c4))

## [0.2.0] - 2023-10-11
### Added
- add a new option `respondToGlobalEvents` ([e541a96](https://github.com/arianrhodsandlot/nostalgist/commit/e541a96de10257fcad10de5d310bdf0fed783842))
- add support for setting style, update default style ([afca83b](https://github.com/arianrhodsandlot/nostalgist/commit/afca83bbcc9f9121463f84ec5940ed8280fbab1d))

## [0.1.7] - 2023-10-08
### Added
- add a `removeCanvas` option to exit method ([c474fbc](https://github.com/arianrhodsandlot/nostalgist/commit/c474fbc61fbc28ace9a18739d397338278d65d9f))
- add support for setting custom initial size ([21146fd](https://github.com/arianrhodsandlot/nostalgist/commit/21146fdf9c05b7a5c7ed6baefee54134a91457f5))

## [0.1.6] - 2023-10-08
### Fixed
- fix static property ([3b1170b](https://github.com/arianrhodsandlot/nostalgist/commit/3b1170b08e78386aeb98252d568410369f8d1de3))

## [0.1.5] - 2023-10-08
### Fixed
- fix core loading ([9790327](https://github.com/arianrhodsandlot/nostalgist/commit/97903270c39788b3d05b7f7d0700ccdf32503a9e))

[Unreleased]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.19.0...HEAD
[0.19.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.17.1...v0.18.0
[0.17.1]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.15.2...v0.16.0
[0.15.2]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.15.1...v0.15.2
[0.15.1]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.15.1...v0.15.1
[0.15.1]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.14.2...v0.15.0
[0.14.2]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.14.0...v0.14.0
[0.14.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/arianrhodsandlot/eslint-config/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.7...v0.2.0
[0.1.7]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.4...v0.1.5
