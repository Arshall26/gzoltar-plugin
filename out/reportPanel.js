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
exports.ReportPanel = void 0;
const vscode = require("vscode");
const fse = require("fs-extra");
const path_1 = require("path");
class ReportPanel {
    constructor(panel, configPath, workspacePath, views) {
        this.disposables = [];
        this.panel = panel;
        this.configPath = configPath;
        this.workspacePath = workspacePath;
        this.views = views;
        this.update(0);
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        const lstnr = this.panel.webview.onDidReceiveMessage((message) => this.openDoc(message.label));
        this.disposables.push(lstnr);
    }
    update(index) {
        this.panel.webview.html = this.views[index];
        this.panel.reveal();
    }
    onDispose(listener) {
        this.disposeListener = listener;
    }
    dispose() {
        var _a;
        this.panel.dispose();
        (_a = this.disposeListener) === null || _a === void 0 ? void 0 : _a.call(this);
        this.disposables.forEach(d => d === null || d === void 0 ? void 0 : d.dispose());
        this.disposables = [];
    }
    openDoc(label) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[gz] label: " + label); // mypackage$App$Foo#mid(int,int,int):13
            let packageName = label.substring(0, label.indexOf('$'));
            packageName = packageName.replace(/\./g, path_1.sep);
            console.log(packageName);
            let className = label.substring(label.indexOf('$') + 1, label.indexOf('#'));
            if (className.indexOf('$') != -1) {
                className = className.substring(0, className.indexOf('$'));
            }
            console.log(className);
            let methodName = label.substring(label.indexOf('#') + 1, label.indexOf(':'));
            console.log(methodName);
            let lineNumber = parseInt(label.substring(label.indexOf(':') + 1));
            console.log(lineNumber);
            // FIXME the following line only works for Maven-based projects
            const javaFile = path_1.join(this.workspacePath, 'src', 'main', 'java', packageName, className + '.java');
            console.log(javaFile);
            vscode.window.showTextDocument(vscode.Uri.file(javaFile), { viewColumn: vscode.ViewColumn.One }).then(textEditor => {
                const line = lineNumber - 1;
                // TODO replace the hardcoded column number (i.e., 1000) with the real length of line of code
                const column = 1000;
                const selection = new vscode.Selection(new vscode.Position(line, column), new vscode.Position(line, column));
                textEditor.selection = selection;
            });
        });
    }
    static createPanel(configPath, workspacePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const panel = vscode.window.createWebviewPanel(ReportPanel.viewType, 'GZoltar Reports', vscode.ViewColumn.Beside, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path_1.join(configPath, 'sfl'))]
            });
            const viewPath = path_1.join(configPath, 'sfl', 'html', 'ochiai');
            const scriptPathOnDisk = vscode.Uri.file(path_1.join(viewPath, "gzoltar.js"));
            const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);
            const views = yield Promise.all(['sunburst.html', 'bubblehierarchy.html', 'verticalpartition.html']
                .map(s => this.setScript(path_1.join(viewPath, s), scriptUri.toString())));
            return new ReportPanel(panel, configPath, workspacePath, views);
        });
    }
    static setScript(filename, script) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = (yield fse.readFile(filename)).toString();
            const newHtml = file.replace('<script type="text/javascript" src="gzoltar.js"></script>', `<script type="text/javascript" src="${script}"></script>`);
            return newHtml;
        });
    }
}
exports.ReportPanel = ReportPanel;
ReportPanel.viewType = 'report';
ReportPanel.fileReg = /(.+)\$(.+)\#(.+)\:(.+)/;
ReportPanel.classReg = /SourceFile: "(.+)"/;
//# sourceMappingURL=reportPanel.js.map