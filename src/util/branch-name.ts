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

import {Version} from '../version';
import {VersionFormat} from '../version-format';
import {logger as defaultLogger, Logger} from './logger';

// cannot import from '..' - transpiled code references to RELEASE_PLEASE
// at the script level are undefined, they are only defined inside function
// or instance methods/properties.

// import {RELEASE_PLEASE} from '../constants';
const RELEASE_PLEASE = 'release-please';

type BranchNameType = typeof BranchName;

function getAllResourceNames(): BranchNameType[] {
  return [
    AutoreleaseBranchName,
    ComponentBranchName,
    GroupBranchName,
    DefaultBranchName,
    V12ComponentBranchName,
    V12DefaultBranchName,
  ];
}

export class BranchName {
  component?: string;
  targetBranch?: string;
  version?: Version;
  versionFormat?: VersionFormat;

  /**
   * Check if a branch name matches any release-please branch pattern.
   * This is a structural check only - it doesn't parse the version.
   * Use this when you need to identify release-please branches without
   * knowing the version format.
   */
  static isReleasePleaseBranch(branchName: string): boolean {
    return getAllResourceNames().some(clazz => clazz.matches(branchName));
  }

  static parse(
    branchName: string,
    logger: Logger = defaultLogger,
    versionFormat: VersionFormat
  ): BranchName | undefined {
    try {
      const branchNameClass = getAllResourceNames().find(clazz => {
        return clazz.matches(branchName);
      });
      if (!branchNameClass) {
        return undefined;
      }
      const parsed = new branchNameClass(branchName, versionFormat);
      // For versioned branch names (AutoreleaseBranchName), version must be valid
      if (branchNameClass === AutoreleaseBranchName && !parsed.version) {
        return undefined;
      }
      return parsed;
    } catch (e) {
      logger.warn(`Error parsing branch name: ${branchName}`, e);
      return undefined;
    }
  }
  static ofComponentVersion(
    branchPrefix: string,
    version: Version,
    versionFormat: VersionFormat
  ): BranchName {
    const versionString = versionFormat.format(version);
    const branchName = new AutoreleaseBranchName(
      `release-${branchPrefix}-v${versionString}`,
      versionFormat
    );
    return branchName;
  }
  static ofVersion(version: Version, versionFormat: VersionFormat): BranchName {
    const versionString = versionFormat.format(version);
    const branchName = new AutoreleaseBranchName(
      `release-v${versionString}`,
      versionFormat
    );
    return branchName;
  }
  static ofTargetBranch(targetBranch: string): BranchName {
    return new DefaultBranchName(
      `${RELEASE_PLEASE}--branches--${targetBranch}`
    );
  }
  static ofComponentTargetBranch(
    component: string,
    targetBranch: string
  ): BranchName {
    return new ComponentBranchName(
      `${RELEASE_PLEASE}--branches--${targetBranch}--components--${component}`
    );
  }
  static ofGroupTargetBranch(group: string, targetBranch: string): BranchName {
    return new GroupBranchName(
      `${RELEASE_PLEASE}--branches--${targetBranch}--groups--${safeBranchName(
        group
      )}`
    );
  }
  constructor(
    _branchName: string,
    _versionFormat?: VersionFormat
  ) {
    this.versionFormat = _versionFormat;
  }

  static matches(_branchName: string): boolean {
    return false;
  }
  getTargetBranch(): string | undefined {
    return this.targetBranch;
  }
  getComponent(): string | undefined {
    return this.component;
  }
  getVersion(): Version | undefined {
    return this.version;
  }
  toString(): string {
    return '';
  }
}

/**
 * This is the legacy branch pattern used by releasetool
 *
 * @see https://github.com/googleapis/releasetool
 */
const AUTORELEASE_PATTERN =
  /^release-?(?<component>[\w-.]*)?-v(?<version>[0-9].*)$/;
const RELEASE_PLEASE_BRANCH_PREFIX = 'release-please--branches';
class AutoreleaseBranchName extends BranchName {
  static matches(branchName: string): boolean {
    if (branchName.startsWith(RELEASE_PLEASE_BRANCH_PREFIX)) {
      return false;
    }
    return !!branchName.match(AUTORELEASE_PATTERN);
  }
  constructor(branchName: string, versionFormat?: VersionFormat) {
    super(branchName, versionFormat);
    const match = branchName.match(AUTORELEASE_PATTERN);
    if (match?.groups && versionFormat) {
      this.component = match.groups['component'];
      this.version = versionFormat.parse(match.groups['version']);
    }
  }
  toString(): string {
    const versionString = this.version && this.versionFormat
      ? this.versionFormat.format(this.version)
      : this.version?.toString();
    if (this.component) {
      return `release-${this.component}-v${versionString}`;
    }
    return `release-v${versionString}`;
  }
}

/**
 * This is a parsable branch pattern used by release-please v12.
 * It has potential issues due to git treating `/` like directories.
 * This should be removed at some point in the future.
 *
 * @see https://github.com/googleapis/release-please/issues/1024
 */
const V12_DEFAULT_PATTERN = `^${RELEASE_PLEASE}/branches/(?<branch>[^/]+)$`;
class V12DefaultBranchName extends BranchName {
  static matches(branchName: string): boolean {
    return !!branchName.match(V12_DEFAULT_PATTERN);
  }
  constructor(branchName: string) {
    super(branchName);
    const match = branchName.match(V12_DEFAULT_PATTERN);
    if (match?.groups) {
      this.targetBranch = match.groups['branch'];
    }
  }
  toString(): string {
    return `${RELEASE_PLEASE}/branches/${this.targetBranch}`;
  }
}

/**
 * This is a parsable branch pattern used by release-please v12.
 * It has potential issues due to git treating `/` like directories.
 * This should be removed at some point in the future.
 *
 * @see https://github.com/googleapis/release-please/issues/1024
 */
const V12_COMPONENT_PATTERN = `^${RELEASE_PLEASE}/branches/(?<branch>[^/]+)/components/(?<component>.+)$`;
class V12ComponentBranchName extends BranchName {
  static matches(branchName: string): boolean {
    return !!branchName.match(V12_COMPONENT_PATTERN);
  }
  constructor(branchName: string) {
    super(branchName);
    const match = branchName.match(V12_COMPONENT_PATTERN);
    if (match?.groups) {
      this.targetBranch = match.groups['branch'];
      this.component = match.groups['component'];
    }
  }
  toString(): string {
    return `${RELEASE_PLEASE}/branches/${this.targetBranch}/components/${this.component}`;
  }
}

const DEFAULT_PATTERN = `^${RELEASE_PLEASE}--branches--(?<branch>.+)$`;
class DefaultBranchName extends BranchName {
  static matches(branchName: string): boolean {
    return !!branchName.match(DEFAULT_PATTERN);
  }
  constructor(branchName: string) {
    super(branchName);
    const match = branchName.match(DEFAULT_PATTERN);
    if (match?.groups) {
      this.targetBranch = match.groups['branch'];
    }
  }
  toString(): string {
    return `${RELEASE_PLEASE}--branches--${this.targetBranch}`;
  }
}

const COMPONENT_PATTERN = `^${RELEASE_PLEASE}--branches--(?<branch>.+)--components--(?<component>.+)$`;
class ComponentBranchName extends BranchName {
  static matches(branchName: string): boolean {
    return !!branchName.match(COMPONENT_PATTERN);
  }
  constructor(branchName: string) {
    super(branchName);
    const match = branchName.match(COMPONENT_PATTERN);
    if (match?.groups) {
      this.targetBranch = match.groups['branch'];
      this.component = match.groups['component'];
    }
  }
  toString(): string {
    return `${RELEASE_PLEASE}--branches--${this.targetBranch}--components--${this.component}`;
  }
}

const GROUP_PATTERN = `^${RELEASE_PLEASE}--branches--(?<branch>.+)--groups--(?<group>.+)$`;
class GroupBranchName extends BranchName {
  static matches(branchName: string): boolean {
    return !!branchName.match(GROUP_PATTERN);
  }
  constructor(branchName: string) {
    super(branchName);
    const match = branchName.match(GROUP_PATTERN);
    if (match?.groups) {
      this.targetBranch = match.groups['branch'];
      this.component = match.groups['group'];
    }
  }
  toString(): string {
    return `${RELEASE_PLEASE}--branches--${this.targetBranch}--groups--${this.component}`;
  }
}

function safeBranchName(branchName: string): string {
  // convert disallowed characters in branch names, replacing them with '-'.
  // replace multiple consecutive '-' with a single '-' to avoid interfering with
  // our regexes for parsing the branch names
  return branchName.replace(/[^\w\d]/g, '-').replace(/-+/g, '-');
}
