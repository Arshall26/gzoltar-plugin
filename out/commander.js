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
exports.GZoltarCommand = exports.GZoltarCommander = void 0;
const vscode = require("vscode");
const fse = require("fs-extra");
const path_1 = require("path");
const cmdBuilder_1 = require("./cmdLine/cmdBuilder");
const command_1 = require("./cmdLine/command");
const reportPanel_1 = require("./reportPanel");
const decorator_1 = require("./decoration/decorator");
const assert = require("assert");
class GZoltarCommander {
    constructor(extensionPath, container) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.reportOptions = {
            'Public Methods': true,
            'Static Constructors': true,
            'Deprecated Methods': true
        };
        this.extensionPath = extensionPath;
        this.container = container;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return [
                new GZoltarCommand('OPEN FOLDERS', vscode.TreeItemCollapsibleState.Expanded),
                new GZoltarCommand('REPORT OPTIONS', vscode.TreeItemCollapsibleState.Expanded)
            ];
        }
        if (element.label === 'OPEN FOLDERS') {
            return this.container.getFolders().map(f => {
                const state = f.getWebview() ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
                return new GZoltarCommand(path_1.basename(f.folderPath), state, f.folderPath);
            });
        }
        if (element.label === 'REPORT OPTIONS') {
            const lightPath = path_1.join(this.extensionPath, 'resources', 'light');
            const darkPath = path_1.join(this.extensionPath, 'resources', 'dark');
            return Object.keys(this.reportOptions).map(key => {
                const active = this.reportOptions[key];
                const cmd = new GZoltarCommand(key, vscode.TreeItemCollapsibleState.None);
                cmd.tooltip = `Include ${key} in the Report.`;
                cmd.command = { command: 'extension.setOption', title: '', arguments: [key] };
                cmd.iconPath = {
                    light: active ? path_1.join(lightPath, 'checked.svg') : path_1.join(lightPath, 'unchecked.svg'),
                    dark: active ? path_1.join(darkPath, 'checked.svg') : path_1.join(darkPath, 'unchecked.svg')
                };
                return cmd;
            });
        }
        if (element.path) {
            const folder = this.container.getFolder(element.path);
            if (folder.getWebview()) {
                return [
                    new GZoltarCommand('Sunburst', vscode.TreeItemCollapsibleState.None, undefined, { command: 'extension.setView', title: '', arguments: [element.path, 0] }),
                    new GZoltarCommand('Bubble Hierarchy', vscode.TreeItemCollapsibleState.None, undefined, { command: 'extension.setView', title: '', arguments: [element.path, 1] }),
                    new GZoltarCommand('Vertical Partition', vscode.TreeItemCollapsibleState.None, undefined, { command: 'extension.setView', title: '', arguments: [element.path, 2] })
                ];
            }
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    setOption(key) {
        this.reportOptions[key] = !this.reportOptions[key];
        this.refresh();
    }
    setView(path, index) {
        const folder = this.container.getFolder(path);
        const webview = folder.getWebview();
        webview === null || webview === void 0 ? void 0 : webview.update(index);
    }
    reset(key, toolspath) {
        return __awaiter(this, void 0, void 0, function* () {
            const folder = this.container.getFolder(key);
            folder.dispose();
            yield folder.resetConfig(toolspath);
            vscode.window.showInformationMessage('Reset Completed.');
        });
    }
    run(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sanity check whether Java is available
            let ret = yield this.execCmd('javac -version', 'Checking Java version', 'Checking whether Java is available on the command line.');
            if (ret) {
                console.log('bye');
                return;
            }
            // Setup
            vscode.window.showInformationMessage("Setting up all project's artifacts.");
            const folder = this.container.getFolder(key);
            console.log("FOLDER ICI --->");
            console.log(folder);
            this.statusBar.text = 'GZoltar: Setting up';
            this.statusBar.show();
            let commandRet = yield folder.runTests();
            if (commandRet.failed) {
                console.log(commandRet.stdout);
                console.error(commandRet.stderr);
                console.log('bye');
                return;
            }
            yield folder.cleanup();
            yield folder.copyToBuild();
            const configPath = folder.configPath;
            const includes = yield folder.getIncludes();
            const ret_dependencies = yield folder.getDependencies();
            let dependencies = '';
            if (ret_dependencies instanceof command_1.CommandRet) {
                if (ret_dependencies.failed) {
                    console.log(ret_dependencies.stdout);
                    console.error(ret_dependencies.stderr);
                    console.log('bye');
                    return;
                }
            }
            else {
                dependencies = ret_dependencies;
            }
            //
            var commandsDir = path_1.join(configPath, 'commands');
            if (!fse.existsSync(commandsDir)) {
                fse.mkdirSync(commandsDir);
            }
            //      
            assert.notStrictEqual(dependencies, '', "Failed to collect project's dependencies");
            const rankingPath = path_1.join(configPath, 'sfl', 'txt', 'ochiai.ranking.csv');
            const commandPath = path_1.join(configPath, 'commands');
            vscode.window.showInformationMessage("Setting all project's artifacts. OK");
            // Get list of test cases
            ret = yield this.execCmd(cmdBuilder_1.listFunction(configPath, dependencies, folder.testFolder), 'GZoltar: Collecting test cases', "Collecting project's test cases.");
            if (ret) {
                console.log('bye');
                return;
            }
            //
            fse.writeFileSync(path_1.join(commandPath, "listTestMethodCommand.txt"), cmdBuilder_1.listFunction(configPath, dependencies, folder.testFolder));
            // Run test cases
            ret = yield this.execCmd(cmdBuilder_1.runFunction(configPath, dependencies, includes), 'GZoltar: Running test cases', "Running project's test cases.");
            if (ret) {
                console.log('bye');
                return;
            }
            //
            fse.writeFileSync(path_1.join(commandPath, "runTestMethodCommand.txt"), cmdBuilder_1.runFunction(configPath, dependencies, includes));
            // Create fault localization report
            ret = yield this.execCmd(cmdBuilder_1.reportFunction(configPath, this.reportOptions['Public Methods'], this.reportOptions['Static Constructors'], this.reportOptions['Deprecated Methods']), 'GZoltar: Generating fault localization report', "Generating fault localization report.");
            if (ret) {
                console.log('bye');
                return;
            }
            //
            fse.writeFileSync(path_1.join(commandPath, "faultLocalizationCommand.txt"), cmdBuilder_1.reportFunction(configPath, this.reportOptions['Public Methods'], this.reportOptions['Static Constructors'], this.reportOptions['Deprecated Methods']));
            // Check whether GZoltar generated the expected ranking file
            if (!fse.existsSync(rankingPath)) {
                vscode.window.showErrorMessage(rankingPath + ' does not exist!');
                return;
            }
            const ranking = (yield fse.readFile(rankingPath)).toString();
            folder.setDecorator(decorator_1.Decorator.createDecorator(ranking, this.extensionPath));
            const panel = (yield reportPanel_1.ReportPanel.createPanel(configPath, folder.folderPath));
            panel.onDispose(() => {
                folder.resetWebview();
                this.refresh();
            });
            folder.setWebview(panel);
            this.refresh();
            vscode.window.showInformationMessage('GZoltar has finished');
        });
    }
    execCmd(cmd, statusBarText, windowText) {
        return __awaiter(this, void 0, void 0, function* () {
            this.statusBar.text = statusBarText;
            this.statusBar.show();
            vscode.window.showInformationMessage(windowText);
            const ret = yield command_1.Command.exec(cmd);
            console.log(ret.stdout);
            console.error(ret.stderr);
            if (ret.failed) {
                vscode.window.showErrorMessage(ret.stderr);
                return true;
            }
            vscode.window.showInformationMessage(windowText + ' OK.');
            this.statusBar.hide();
            return false;
        });
    }
}
exports.GZoltarCommander = GZoltarCommander;
class GZoltarCommand extends vscode.TreeItem {
    constructor(label, collapsibleState, path, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.path = path;
        this.command = command;
        this.children = [];
        this.contextValue = this.path ? 'folder' : '';
    }
}
exports.GZoltarCommand = GZoltarCommand;
//# sourceMappingURL=commander.js.map