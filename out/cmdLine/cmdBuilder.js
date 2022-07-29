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
exports.disassemble = exports.reportFunction = exports.runFunction = exports.listFunction = void 0;
const command_1 = require("./command");
function listFunction(destPath, dependencies, testFolder) {
    return new command_1.Command()
        .cd(destPath)
        .newCmd()
        .java()
        .cp('"build/"', dependencies, '"hamcrest-core.jar"', '"gzoltarcli.jar"')
        .main(`com.gzoltar.cli.Main listTestMethods ${testFolder}`)
        .toString();
}
exports.listFunction = listFunction;
function runFunction(destPath, dependencies, includes) {
    return new command_1.Command()
        .cd(destPath)
        .newCmd()
        .java()
        .javaagent(`gzoltaragent.jar=includes="${includes}"`)
        .cp('"build/"', dependencies, '"junit.jar"', '"hamcrest-core.jar"', '"gzoltarcli.jar"')
        .main(`com.gzoltar.cli.Main runTestMethods --testMethods "tests.txt" --collectCoverage`)
        .toString();
}
exports.runFunction = runFunction;
function reportFunction(destPath, publMethods, staticConstr, deprMethods) {
    let additionalArgs = '';
    if (publMethods) {
        additionalArgs = additionalArgs + ' --inclPublicMethods';
    }
    if (staticConstr) {
        additionalArgs = additionalArgs + ' --inclStaticConstructors';
    }
    if (deprMethods) {
        additionalArgs = additionalArgs + ' --inclDeprecatedMethods';
    }
    return new command_1.Command()
        .cd(destPath)
        .newCmd()
        .java()
        .cp('"."', '"gzoltarcli.jar"')
        .main(`com.gzoltar.cli.Main faultLocalizationReport --buildLocation "build/" --dataFile gzoltar.ser --granularity "line" --family "sfl" --formula "ochiai" --outputDirectory . --formatter "txt:html"` + additionalArgs)
        .toString();
}
exports.reportFunction = reportFunction;
function disassemble(destPath, classFile) {
    return new command_1.Command()
        .cd(destPath)
        .newCmd()
        .javap(classFile)
        .toString();
}
exports.disassemble = disassemble;
//# sourceMappingURL=cmdBuilder.js.map