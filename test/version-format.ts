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

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {SemverVersionFormat} from '../src/version-format';
import {Version} from '../src/version';

describe('VersionFormat', () => {
  describe('SemverVersionFormat', () => {
    const format = new SemverVersionFormat();

    describe('parse', () => {
      it('parses basic semver', () => {
        const version = format.parse('1.2.3');
        expect(version).to.not.be.undefined;
        expect(version?.major).to.equal(1);
        expect(version?.minor).to.equal(2);
        expect(version?.patch).to.equal(3);
        expect(version?.preRelease).to.be.undefined;
        expect(version?.build).to.be.undefined;
      });

      it('parses semver with hyphen-separated prerelease', () => {
        const version = format.parse('1.2.3-alpha.1');
        expect(version).to.not.be.undefined;
        expect(version?.major).to.equal(1);
        expect(version?.minor).to.equal(2);
        expect(version?.patch).to.equal(3);
        expect(version?.preRelease).to.equal('alpha.1');
      });

      it('parses semver with build metadata', () => {
        const version = format.parse('1.2.3+build.123');
        expect(version).to.not.be.undefined;
        expect(version?.build).to.equal('build.123');
      });

      it('parses semver with prerelease and build', () => {
        const version = format.parse('1.2.3-beta.2+build.456');
        expect(version).to.not.be.undefined;
        expect(version?.preRelease).to.equal('beta.2');
        expect(version?.build).to.equal('build.456');
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

      it('formats version with prerelease using hyphen', () => {
        const version = new Version(1, 2, 3, 'alpha.1');
        expect(format.format(version)).to.equal('1.2.3-alpha.1');
      });

      it('formats version with build metadata', () => {
        const version = new Version(1, 2, 3, undefined, 'build.123');
        expect(format.format(version)).to.equal('1.2.3+build.123');
      });

      it('formats version with prerelease and build', () => {
        const version = new Version(1, 2, 3, 'beta.2', 'build.456');
        expect(format.format(version)).to.equal('1.2.3-beta.2+build.456');
      });
    });
  });
});
