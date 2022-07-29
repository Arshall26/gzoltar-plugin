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
exports.Folder = void 0;
const fse = require("fs-extra");
const path_1 = require("path");
class Folder {
    constructor(path, buildTool, configFolder) {
        this.path = path;
        this.buildTool = buildTool;
        this.configFolder = configFolder;
    }
    get folderPath() {
        return this.path;
    }
    get configPath() {
        return this.configFolder;
    }
    get sourceFolder() {
        return path_1.join(this.path, this.buildTool.getSourceFolder());
    }
    get testFolder() {
        return path_1.join(this.path, this.buildTool.getTestFolder());
    }
    getWebview() {
        return this.webview;
    }
    setWebview(newWebview) {
        var _a;
        (_a = this.webview) === null || _a === void 0 ? void 0 : _a.dispose();
        this.webview = newWebview;
    }
    resetWebview() {
        this.webview = undefined;
    }
    setDecorator(newDecorator) {
        var _a;
        (_a = this.decorator) === null || _a === void 0 ? void 0 : _a.dispose();
        this.decorator = newDecorator;
    }
    dispose() {
        var _a, _b;
        (_a = this.webview) === null || _a === void 0 ? void 0 : _a.dispose();
        this.webview = undefined;
        (_b = this.decorator) === null || _b === void 0 ? void 0 : _b.dispose();
        this.decorator = undefined;
    }
    resetConfig(toolsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fse.emptyDir(this.configFolder);
            yield fse.copy(toolsPath, this.configFolder, { overwrite: false });
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                fse.emptyDir(path_1.join(this.configFolder, 'build')),
                fse.emptyDir(path_1.join(this.configFolder, 'sfl')),
                fse.remove(path_1.join(this.configFolder, 'tests.txt')),
                fse.remove(path_1.join(this.configFolder, 'gzoltar.ser'))
            ]);
        });
    }
    copyToBuild() {
        return __awaiter(this, void 0, void 0, function* () {
            const buildPath = path_1.join(this.configFolder, 'build');
            const options = { overwrite: false, errorOnExist: false };
            yield fse.copy(this.sourceFolder, buildPath, options);
            yield fse.copy(this.testFolder, buildPath, options);
            const mainRes = path_1.join('src', 'main', 'resources');
            const testRes = path_1.join('src', 'test', 'resources');
            if ((yield fse.pathExists(path_1.join(this.path, mainRes)))) {
                yield fse.copy(path_1.join(this.path, mainRes), path_1.join(this.configFolder, mainRes), options);
            }
            if ((yield fse.pathExists(path_1.join(this.path, testRes)))) {
                yield fse.copy(path_1.join(this.path, testRes), path_1.join(this.configFolder, testRes), options);
            }
        });
    }
    getDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.buildTool.getDependencies(this.path);
        });
    }
    runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.buildTool.runTests(this.path);
        });
    }
    getIncludes() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getFiles(this.sourceFolder, ''))
                .map(f => f.replace(/.class/g, ''))
                .join(':');
        });
    }
    getFiles(dir, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield fse.readdir(dir);
            let filelist = Array();
            for (const file of result) {
                if ((yield fse.stat(dir + '/' + file)).isDirectory()) {
                    const subFiles = yield this.getFiles(`${dir}/${file}`, `${prefix + file}.`);
                    filelist = filelist.concat(subFiles);
                }
                else {
                    filelist.push(prefix + file);
                }
            }
            return filelist;
        });
    }
}
exports.Folder = Folder;
//# sourceMappingURL=folder.js.map