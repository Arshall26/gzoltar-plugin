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
exports.FolderContainer = void 0;
const fse = require("fs-extra");
const path_1 = require("path");
const folder_1 = require("./folder");
const buildTool_1 = require("./buildTool");
class FolderContainer {
    constructor(toolsPath, folders) {
        this.toolsPath = toolsPath;
        this.folders = {};
        this.addFolders(folders);
    }
    getFolder(key) {
        return this.folders[key];
    }
    getFolders() {
        return Object.values(this.folders);
    }
    updateFolders(addedFolders, removedFolders) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeFolders(removedFolders);
            yield this.addFolders(addedFolders);
        });
    }
    addFolders(addedFolders) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(addedFolders.map(w => this.createFolder(w)));
        });
    }
    removeFolders(removedWorkspaces) {
        removedWorkspaces.forEach(w => {
            this.folders[w].dispose();
            delete this.folders[w];
        });
    }
    createFolder(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const configFolderPath = path_1.join(path, FolderContainer.CONFIG_FOLDER);
            const tool = this.getBuildTool(path);
            if (!tool) {
                return;
            }
            if (!(yield fse.pathExists(configFolderPath))) {
                yield fse.copy(this.toolsPath, configFolderPath, { overwrite: false });
            }
            this.folders[path] = new folder_1.Folder(path, tool, configFolderPath);
        });
    }
    getBuildTool(folder) {
        if (fse.pathExistsSync(path_1.join(folder, 'pom.xml'))) {
            return new buildTool_1.Maven();
        }
        if (fse.pathExistsSync(path_1.join(folder, 'build.gradle'))) {
            return new buildTool_1.Gradle();
        }
    }
}
exports.FolderContainer = FolderContainer;
FolderContainer.CONFIG_FOLDER = '.gzoltar/';
//# sourceMappingURL=container.js.map