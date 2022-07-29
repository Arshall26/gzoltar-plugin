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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path_1 = require("path");
const container_1 = require("./workspace/container");
const commander_1 = require("./commander");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            throw new Error('Unable to locate workspace, extension has been activated incorrectly.');
        }
        const toolsPath = path_1.join(context.extensionPath, 'tools');
        const folders = vscode.workspace.workspaceFolders.map(wf => wf.uri.fsPath);
        const container = new container_1.FolderContainer(toolsPath, folders);
        const commander = new commander_1.GZoltarCommander(context.extensionPath, container);
        context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders((ev) => __awaiter(this, void 0, void 0, function* () {
            const addedFolders = ev.added.map(wf => wf.uri.fsPath);
            const removedFolders = ev.removed.map(wf => wf.uri.fsPath);
            yield container.updateFolders(addedFolders, removedFolders);
            commander.refresh();
        })));
        vscode.window.registerTreeDataProvider('gzoltar', commander);
        vscode.commands.registerCommand('gzoltar.refresh', () => commander.refresh());
        vscode.commands.registerCommand('extension.setOption', (arg) => commander.setOption(arg));
        vscode.commands.registerCommand('extension.setView', (path, index) => commander.setView(path, index));
        vscode.commands.registerCommand('gzoltar.reset', (cmd) => __awaiter(this, void 0, void 0, function* () { return yield commander.reset(cmd.path, toolsPath); }));
        vscode.commands.registerCommand('gzoltar.run', (cmd) => __awaiter(this, void 0, void 0, function* () { return yield commander.run(cmd.path); }));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map