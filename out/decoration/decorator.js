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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decorator = void 0;
const vscode = require("vscode");
const path_1 = require("path");
const ranking_1 = require("./ranking");
class Decorator {
    constructor(rankings, extensionPath) {
        this.rankings = rankings;
        this.extensionPath = extensionPath;
        this.listener = vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                this.setDecorations(editor);
            }
        });
        this.lowDecor = this.createDecoration(path_1.join(this.extensionPath, 'media', 'icons', 'green.svg'));
        this.mediumDecor = this.createDecoration(path_1.join(this.extensionPath, 'media', 'icons', 'yellow.svg'));
        this.highDecor = this.createDecoration(path_1.join(this.extensionPath, 'media', 'icons', 'orange.svg'));
        this.veryHighDecor = this.createDecoration(path_1.join(this.extensionPath, 'media', 'icons', 'red.svg'));
    }
    createDecoration(path) {
        return vscode.window.createTextEditorDecorationType({
            gutterIconPath: path,
            gutterIconSize: '100%'
        });
    }
    setDecorations(editor) {
        const document = editor.document;
        const keys = Object
            .keys(this.rankings)
            .filter(key => {
            const splitKey = key.split(path_1.sep);
            return document.fileName.includes(key) ||
                document.getText().includes(`class ${splitKey[splitKey.length - 1]}`);
        });
        const low = [], medium = [], high = [], veryHigh = [];
        for (let idx = 0; idx < keys.length; idx++) {
            const group = this.rankings[keys[idx]];
            low.push(...group.low);
            medium.push(...group.medium);
            high.push(...group.high);
            veryHigh.push(...group.veryHigh);
        }
        editor.setDecorations(this.lowDecor, low.map(l => ({ 'range': document.lineAt(l.getLine()).range })));
        editor.setDecorations(this.mediumDecor, medium.map(l => ({ 'range': document.lineAt(l.getLine()).range })));
        editor.setDecorations(this.highDecor, high.map(l => ({ 'range': document.lineAt(l.getLine()).range })));
        editor.setDecorations(this.veryHighDecor, veryHigh.map(l => ({ 'range': document.lineAt(l.getLine()).range })));
    }
    dispose() {
        this.listener.dispose();
    }
    static createDecorator(rankingFile, extensionPath) {
        let maxProbability = 0.0;
        const ranking = rankingFile
            .split('\n')
            .slice(1)
            .filter(r => ranking_1.RankingLine.REGEX.test(r))
            .map(r => new ranking_1.RankingLine(r))
            .reduce((prev, curr, _currIdx, _arr) => {
            const key = curr.getName();
            const susp = curr.getSuspiciousness();
            (prev[key] = prev[key] || new ranking_1.RankingGroup()).lines.push(curr);
            maxProbability = susp > maxProbability ? susp : maxProbability;
            return prev;
        }, {});
        for (const key in ranking) {
            Decorator.splitProbability(ranking[key], maxProbability);
        }
        return new Decorator(ranking, extensionPath);
    }
    static splitProbability(group, maxProbability) {
        if (maxProbability === 0) {
            group.low.push(...group.lines);
            return;
        }
        group.lines.forEach((line) => {
            const div = line.getSuspiciousness() / maxProbability;
            if (div < 0.40) {
                group.low.push(line);
            }
            else if (div < 0.60) {
                group.medium.push(line);
            }
            else if (div < 0.85) {
                group.high.push(line);
            }
            else {
                group.veryHigh.push(line);
            }
        });
    }
}
exports.Decorator = Decorator;
//# sourceMappingURL=decorator.js.map