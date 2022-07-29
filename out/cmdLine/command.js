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
exports.CommandRet = exports.Command = void 0;
const exec = require('util').promisify(require('child_process').exec);
class Command {
    constructor() {
        this.commands = [];
        this.cpSep = process.platform === 'win32' ? ';' : ':';
    }
    newCmd() {
        this.commands.push('&&');
        return this;
    }
    cd(dest) {
        this.commands.push(`cd ${dest}`);
        return this;
    }
    java() {
        this.commands.push('java');
        return this;
    }
    javap(classFile) {
        this.commands.push(`javap -verbose ${classFile}`);
        return this;
    }
    javaagent(agentJar) {
        this.commands.push(`-javaagent:${agentJar}`);
        return this;
    }
    cp(...args) {
        this.commands.push(`-cp ${args.join(this.cpSep)}`);
        return this;
    }
    main(mainArgs) {
        this.commands.push(mainArgs);
        return this;
    }
    toString() {
        return `(${this.commands.join(' ')})`;
    }
    static exec(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            let failed = false;
            let stdout_str = "";
            let stderr_str = "";
            try {
                const { stdout, stderr } = yield exec(cmd);
                stdout_str = `${stdout}`;
                stderr_str = `${stderr}`;
            }
            catch (error) {
                failed = true;
                stderr_str = `${error}`;
            }
            return new CommandRet(failed, stdout_str, stderr_str);
        });
    }
}
exports.Command = Command;
class CommandRet {
    constructor(failed, stdout, stderr) {
        this.failed = failed;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}
exports.CommandRet = CommandRet;
//# sourceMappingURL=command.js.map