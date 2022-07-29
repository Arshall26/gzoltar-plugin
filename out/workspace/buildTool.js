/**
 * Copyright (C) 2020 GZoltar contributors.
 *
 * This file is part of GZoltar.
 *
 * GZoltar is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * GZoltar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with GZoltar. If
 * not, see <https://www.gnu.org/licenses/>.
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gradle = exports.Maven = void 0;
const fse = require("fs-extra");
const path_1 = require("path");
const command_1 = require("../cmdLine/command");
class Maven {
    getSourceFolder() {
        return '/target/classes';
    }
    getTestFolder() {
        return '/target/test-classes';
    }
    getDependencies(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield command_1.Command.exec(`(cd ${projectPath} && mvn dependency:build-classpath -Dmdep.outputFile="cp.txt")`);
            if (ret.failed) {
                return ret;
            }
            const dep = (yield fse.readFile(path_1.join(projectPath, 'cp.txt'))).toString();
            return dep.replace('\n', ':');
        });
    }
    runTests(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield command_1.Command.exec(`(cd ${projectPath} && mvn test -Dmaven.test.failure.ignore=true -Dmaven.test.error.ignore=true)`);
            return ret;
        });
    }
}
exports.Maven = Maven;
class Gradle {
    constructor() {
        this.REGEX = /(?:\\\-\-\-|\+\-\-\-)(.+)/;
    }
    getSourceFolder() {
        return '/build/classes/java/main';
    }
    getTestFolder() {
        return '/build/classes/java/test';
    }
    getDependencies(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield command_1.Command.exec(`(cd ${projectPath} && gradle -q dependencies --configuration testRuntimeClasspath)`);
            if (ret.failed) {
                return ret;
            }
            const split = ret.stdout.split(this.REGEX);
            return split
                .filter((_, idx) => idx % 2 !== 0)
                .map(s => `"${s.trim()}"`)
                .join(':');
        });
    }
    runTests(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield command_1.Command.exec(`(cd ${projectPath} && gradle test)`);
            return ret;
        });
    }
}
exports.Gradle = Gradle;
//# sourceMappingURL=buildTool.js.map