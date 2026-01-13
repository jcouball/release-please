// Copyright 2025 Google LLC
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

import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Version} from '../src/version';
import {RubyVersionFormat} from '../src/version-format';

describe('RubyVersionFormat', () => {
  const format = new RubyVersionFormat();

  describe('parse', () => {
    it('parses basic version', () => {
      const version = format.parse('1.2.3');
      expect(version).to.not.be.undefined;
      expect(version?.major).to.equal(1);
      expect(version?.minor).to.equal(2);
      expect(version?.patch).to.equal(3);
    });

    it('parses ruby-style dot-separated prerelease', () => {
      const version = format.parse('1.2.3.alpha.1');
      expect(version).to.not.be.undefined;
      expect(version?.major).to.equal(1);
      expect(version?.minor).to.equal(2);
      expect(version?.patch).to.equal(3);
      expect(version?.preRelease).to.equal('alpha.1');
    });

    it('also parses hyphen-separated prerelease for compatibility', () => {
      const version = format.parse('1.2.3-beta.2');
      expect(version).to.not.be.undefined;
      expect(version?.preRelease).to.equal('beta.2');
    });

    it('does not support build metadata (includes it in prerelease)', () => {
      // Ruby versions don't have build metadata, so +build is treated as part of prerelease
      const version = format.parse('1.2.3.rc.1+build.123');
      expect(version).to.not.be.undefined;
      expect(version?.preRelease).to.equal('rc.1+build.123');
      expect(version?.build).to.be.undefined;
    });

    it('returns undefined for invalid input', () => {
      const version = format.parse('not-a-version');
      expect(version).to.be.undefined;
    });
  });

  describe('format', () => {
    it('formats basic version', () => {
      const version = new Version(1, 2, 3);
      expect(format.format(version)).to.equal('1.2.3');
    });

    it('formats version with prerelease using dot', () => {
      const version = new Version(1, 2, 3, 'alpha.1');
      expect(format.format(version)).to.equal('1.2.3.alpha.1');
    });

    it('ignores build metadata (not valid for Ruby)', () => {
      // Ruby versions don't support build metadata, so it's dropped
      const version = new Version(1, 2, 3, undefined, 'build.123');
      expect(format.format(version)).to.equal('1.2.3');
    });

    it('formats version with prerelease, ignores build', () => {
      const version = new Version(1, 2, 3, 'rc.1', 'build.456');
      expect(format.format(version)).to.equal('1.2.3.rc.1');
    });
  });
});
