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

const TAG_PATTERN =
  /^((?<component>.*)(?<separator>[^a-zA-Z0-9]))?(?<v>v)?(?<version>\d+\.\d+\.\d+.*)$/;
const DEFAULT_SEPARATOR = '-';

export class TagName {
  component?: string;
  version: Version;
  separator: string;
  includeV: boolean;

  constructor(
    version: Version,
    component?: string,
    separator: string = DEFAULT_SEPARATOR,
    includeV = true
  ) {
    this.version = version;
    this.component = component;
    this.separator = separator;
    this.includeV = includeV;
  }

  /**
   * Extract just the component from a tag name without parsing the version.
   * This is useful when you need to determine which strategy to use before
   * parsing the full tag.
   */
  static extractComponent(tagName: string): string | undefined {
    const match = tagName.match(TAG_PATTERN);
    return match?.groups?.component;
  }

  static parse(
    tagName: string,
    versionFormat: VersionFormat
  ): TagName | undefined {
    const match = tagName.match(TAG_PATTERN);
    if (match?.groups) {
      const versionString = match.groups.version;
      const version = versionFormat.parse(versionString);
      if (!version) {
        return undefined;
      }
      return new TagName(
        version,
        match.groups.component,
        match.groups.separator,
        !!match.groups.v
      );
    }
    return;
  }

  toString(): string {
    if (this.component) {
      return `${this.component}${this.separator}${
        this.includeV ? 'v' : ''
      }${this.version.toString()}`;
    }
    return `${this.includeV ? 'v' : ''}${this.version.toString()}`;
  }
}
