// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Version} from './version';

/**
 * A VersionFormat is responsible for parsing and formatting version strings
 * according to ecosystem-specific conventions.
 *
 * Different ecosystems have different version string formats:
 * - Most use SemVer: 1.2.3-alpha.1+build
 * - Ruby uses dots: 1.2.3.alpha.1
 *
 * This interface allows version parsing to be decoupled from Strategy classes,
 * solving the chicken-and-egg problem where we need to parse versions before
 * we have a full Strategy context.
 */
export interface VersionFormat {
  /**
   * Parse a version string into a Version object.
   *
   * @param versionString The version string to parse
   * @returns The parsed Version, or undefined if parsing fails
   */
  parse(versionString: string): Version | undefined;

  /**
   * Format a Version object as a string in this format.
   *
   * @param version The Version to format
   * @returns The formatted version string
   */
  format(version: Version): string;
}

/**
 * Standard SemVer version format.
 * Parses and formats versions like: 1.2.3-alpha.1+build
 */
export class SemverVersionFormat implements VersionFormat {
  private static readonly REGEX =
    /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(-(?<preRelease>[^+]+))?(\+(?<build>.*))?/;

  parse(versionString: string): Version | undefined {
    const match = versionString.match(SemverVersionFormat.REGEX);
    if (!match?.groups) {
      return undefined;
    }
    return new Version(
      Number(match.groups.major),
      Number(match.groups.minor),
      Number(match.groups.patch),
      match.groups.preRelease,
      match.groups.build
    );
  }

  format(version: Version): string {
    const preReleasePart = version.preRelease ? `-${version.preRelease}` : '';
    const buildPart = version.build ? `+${version.build}` : '';
    return `${version.major}.${version.minor}.${version.patch}${preReleasePart}${buildPart}`;
  }
}

/**
 * Ruby-style version format.
 * Parses and formats versions like: 1.2.3.alpha.1
 * Ruby uses dots instead of hyphens for pre-release identifiers.
 * Ruby gem versions do not support build metadata (+build).
 */
export class RubyVersionFormat implements VersionFormat {
  /**
   * Pattern source for matching Ruby version strings.
   * Use this when composing larger regexes in updaters.
   * Wrapped in a capture group for compatibility with string replacement.
   */
  static readonly SOURCE = '((\\d+)\\.(\\d+)\\.(\\d+)([.-]\\w+.*)?)';

  private static readonly REGEX =
    /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:[.-](?<preRelease>.+))?/;

  parse(versionString: string): Version | undefined {
    const match = versionString.match(RubyVersionFormat.REGEX);
    if (!match?.groups) {
      return undefined;
    }
    return new Version(
      Number(match.groups.major),
      Number(match.groups.minor),
      Number(match.groups.patch),
      match.groups.preRelease
    );
  }

  format(version: Version): string {
    const preReleasePart = version.preRelease ? `.${version.preRelease}` : '';
    return `${version.major}.${version.minor}.${version.patch}${preReleasePart}`;
  }
}

