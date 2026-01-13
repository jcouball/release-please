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
import {BranchName} from '../../src/util/branch-name';
import {Version} from '../../src/version';
import {RubyVersionFormat} from '../../src/version-format';

describe('BranchName - Ruby', () => {
  describe('parse', () => {
    it('parses a Ruby-style versioned branch name', () => {
      const name = 'release-v1.2.3.alpha';
      const branchName = BranchName.parse(name, undefined, new RubyVersionFormat());
      expect(branchName).to.not.be.undefined;
      expect(branchName?.getVersion()?.toString()).to.eql('1.2.3-alpha');
    });
  });

  describe('ofVersion', () => {
    it('builds Ruby-style versioned branch name with proper dot separator', () => {
      const version = new Version(1, 2, 3, 'alpha.1');
      const branchName = BranchName.ofVersion(version, new RubyVersionFormat());
      expect(branchName.toString()).to.eql('release-v1.2.3.alpha.1');
    });
  });
});
