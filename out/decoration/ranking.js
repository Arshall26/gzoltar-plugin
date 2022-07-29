"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingLine = exports.RankingGroup = void 0;
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
const path_1 = require("path");
class RankingGroup {
    constructor() {
        this.low = [];
        this.medium = [];
        this.high = [];
        this.veryHigh = [];
        this.lines = [];
    }
}
exports.RankingGroup = RankingGroup;
class RankingLine {
    constructor(ranking) {
        const split = ranking.match(RankingLine.REGEX);
        if (split === null) {
            throw new Error('Inaccessible point.');
        }
        this.line = +split[split.length - 2] - 1;
        this.suspiciousness = +split[split.length - 1];
        this.name = split.length === 6
            ? path_1.join(split[1].replace(/\./g, path_1.sep), split[2])
            : split[1];
    }
    getName() {
        return this.name;
    }
    getLine() {
        return this.line;
    }
    getSuspiciousness() {
        return this.suspiciousness;
    }
}
exports.RankingLine = RankingLine;
RankingLine.REGEX = /(.+)?\$(.+)\#(.+)\:(.+)\;(.+)/;
//# sourceMappingURL=ranking.js.map