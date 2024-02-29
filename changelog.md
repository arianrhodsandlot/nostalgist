# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- add support for cancelling a launch via an `AbortController`
- add `beforeLaunch` and `onLaunch` parameters to allow us to hook into the launching process

## [0.8.1](https://github.com/arianrhodsandlot/nostalgist/compare/v0.8.0...v0.8.1) - 2024-02-24

### Fixed

- fix passing a custom canvas element not working properly

## [0.8.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.7.0...v0.8.0) - 2024-02-07
### Changed
- update default retroarch-emscripten-build version to v1.17.0
- disable some default inputs in RetroArch
- when some of the passed config items are objects, like `retroarchConfig`, they will be merged with the default items instead of overwriting the default items entirely

### Fixed
- fix export name when using ESM build of retroarch

## [0.7.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.6.0...v0.7.0) - 2024-01-28

### Added
- add support for shaders

### Fixed
- fix BIOS files not written to the system directory

## [0.6.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.5.1...v0.6.0) - 2024-01-13

### Added

- add a new screenshot method ([fa8fd06](https://github.com/arianrhodsandlot/nostalgist/commit/fa8fd06d1aaad6c2a35df4fc1051c43f3471f7b4))
- treat data url and blob url as absolute ([ce4aed6](https://github.com/arianrhodsandlot/nostalgist/commit/ce4aed6991f0127049884d9fd21a8c6b79a8d52d))



## [0.5.1](https://github.com/arianrhodsandlot/nostalgist/compare/v0.5.0...v0.5.1) - 2023-11-07


### Fixed

- fix canvas size ([eb2d985](https://github.com/arianrhodsandlot/nostalgist/commit/eb2d9858e5d7c569060a46153e88dd659896a5ab))



## [0.5.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.4.2...v0.5.0) - 2023-11-06


### Added

- add support for RetroArch nightly ESM builds, fix [#10](https://github.com/arianrhodsandlot/nostalgist/issues/10) ([3cfeaa6](https://github.com/arianrhodsandlot/nostalgist/commit/3cfeaa6a3ee2f5f64b0268bb696768116ed03fd7))



## [0.4.2](https://github.com/arianrhodsandlot/nostalgist/compare/v0.4.1...v0.4.2) - 2023-10-16


### Fixed

- fix a possible failure when writing config files ([ee924cf](https://github.com/arianrhodsandlot/nostalgist/commit/ee924cf291890b832a27f589dde6c3f0aa697432))



## [0.4.1](https://github.com/arianrhodsandlot/nostalgist/compare/v0.4.0...v0.4.1) - 2023-10-15


### Fixed

- fix bios not working properly ([94824b5](https://github.com/arianrhodsandlot/nostalgist/commit/94824b56232806bfb9ede4cc15acacb2057371f1))
- fix error while exiting and styles are not updated ([546f24a](https://github.com/arianrhodsandlot/nostalgist/commit/546f24a24f5d8d4182247f4e200abf4cb3f87cd1))
- fix misc small issues ([a0a9546](https://github.com/arianrhodsandlot/nostalgist/commit/a0a95465aa0b52235e66ceca20736391ea686467))


### Added

- add a new option `emscriptenModule` ([ee2bbd5](https://github.com/arianrhodsandlot/nostalgist/commit/ee2bbd522fc91dc59fda19336e12b8f80eb97208))
- add some new methods about pressing button programmatically ([46a9426](https://github.com/arianrhodsandlot/nostalgist/commit/46a94260bab76f42bed4e6749a5c83e4895f86ab))
- expose vendors ([04ccafd](https://github.com/arianrhodsandlot/nostalgist/commit/04ccafd167fd9954d8ba6de0b9cd1fff7d97a529))



## [0.4.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.3.1...v0.4.0) - 2023-10-15


### Fixed

- fix bios not working properly ([adb9637](https://github.com/arianrhodsandlot/nostalgist/commit/adb9637ae0e7ab589cd0d2901c1fc2a2ab576ed1))
- fix misc small issues ([43dba6f](https://github.com/arianrhodsandlot/nostalgist/commit/43dba6f7c6229e9357456cd2683e6d1f843d2a63))


### Added

- add a new option `emscriptenModule` ([24885e6](https://github.com/arianrhodsandlot/nostalgist/commit/24885e65a544490369cfb83c3ab99836d9733cd8))
- add some new methods about pressing button programmatically ([d46e453](https://github.com/arianrhodsandlot/nostalgist/commit/d46e4537fba11bf65065a72f0f3150d1ceb1684a))
- expose vendors ([71bb325](https://github.com/arianrhodsandlot/nostalgist/commit/71bb325f89465e6d102bc910441826443e459c34))



## [0.3.1](https://github.com/arianrhodsandlot/nostalgist/compare/v0.3.0...v0.3.1) - 2023-10-12


### Fixed

- update default styles ([6cc7b08](https://github.com/arianrhodsandlot/nostalgist/commit/6cc7b0802565ce7dda17be2334dca5292a7dfc63))



## [0.3.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.2.0...v0.3.0) - 2023-10-12


### Added

- implement the option `retroarchCoreConfig` ([6ed2e7c](https://github.com/arianrhodsandlot/nostalgist/commit/6ed2e7c78d48c0d3854d6af485bd190ad6bb24eb))
- shortcut methods now support `File` and `{ fileName, fileContent }` as parameter ([4da61ac](https://github.com/arianrhodsandlot/nostalgist/commit/4da61ac31225c519978e632886e22f63fa81f3c4))



## [0.2.0](https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.7...v0.2.0) - 2023-10-11


### Added

- add a new option `respondToGlobalEvents` ([e541a96](https://github.com/arianrhodsandlot/nostalgist/commit/e541a96de10257fcad10de5d310bdf0fed783842))
- add support for setting style, update default style ([afca83b](https://github.com/arianrhodsandlot/nostalgist/commit/afca83bbcc9f9121463f84ec5940ed8280fbab1d))



## [0.1.7](https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.6...v0.1.7) - 2023-10-08


### Added

- add a `removeCanvas` option to exit method ([c474fbc](https://github.com/arianrhodsandlot/nostalgist/commit/c474fbc61fbc28ace9a18739d397338278d65d9f))
- add support for setting custom initial size ([21146fd](https://github.com/arianrhodsandlot/nostalgist/commit/21146fdf9c05b7a5c7ed6baefee54134a91457f5))



## [0.1.6](https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.5...v0.1.6) - 2023-10-08


### Fixed

- fix static property ([3b1170b](https://github.com/arianrhodsandlot/nostalgist/commit/3b1170b08e78386aeb98252d568410369f8d1de3))



## [0.1.5](https://github.com/arianrhodsandlot/nostalgist/compare/v0.1.4...v0.1.5) - 2023-10-08


### Fixed

- fix core loading ([9790327](https://github.com/arianrhodsandlot/nostalgist/commit/97903270c39788b3d05b7f7d0700ccdf32503a9e))
