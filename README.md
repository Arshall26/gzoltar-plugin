# Visual Studio Code extension 

This is a Gzoltar Vscode plugin that performs fault-localization on a Java d4j project buggy version.

## Requirements

Before using GZoltar's Visual Studio Code extension, please check the requirements here :

https://github.com/GZoltar/gzoltar/tree/master/com.gzoltar.vscode

## Installation and setup

Please follow the steps of the video below :

[](https://www.youtube.com/watch?v=km0QMdGfblg&ab_channel=Gzoltarfeup)

```
git clone https://github.com/Arshall26/gzoltar-plugin.git
```

## Usage

After it has finished, a new window will appear showcasing the results of the fault detection analysis. The colors in the charts indicate the code's suspicion levels.

The video below details the steps to follow :

[](https://www.youtube.com/watch?v=txn2gmpojMY&ab_channel=Gzoltarfeup)

## Result 

After running gzoltar, the following files can be find under the `build/`
directory:

* `build/gzoltar.ser` - a serialized file with the coverage collected by GZoltar.
* `build/sfl/txt/tests.csv` - a list of all test cases (one per row) and its
  correspondent outcome (either `PASS` or `FAIL`), runtime in nanoseconds, and
  stacktrace (if it is a failing test case).
* `build/sfl/txt/spectra.csv` - a list of all lines of code identified by
  GZoltar (one per row) of all classes under test.
* `build/sfl/txt/matrix.txt` - a binary coverage matrix produced by GZoltar
  where each row represents the coverage of each individual test case and its
  outcome ("-" if the test case failed, "+" otherwise), and each column a line
  of code. 1 means that a test case covered a line of code, 0 otherwise.
* `build/sfl/txt/ochiai.ranking.csv` - the fault localization report, i.e.,
  the ranking of lines of code (one per row), produced by the spectrum-based
  fault localization formula `ochiai`.
* `build/sfl/txt/statistics.csv` - some statistics information about the ranking
  produced.
* `commands/listTestMethodsCommand.txt` - a text file that contains the command runned by the plugin in order to list all (JUnit/TestNG) unit test cases in a provided classpath.
* `commands/runtTestMethodsCommand.txt` - a text file that contains the command runned by the plugin in order to run test methods in isolation.
* `commands/faultLocalizationCommand.txt`- a text file that contains the command runned by the plugin in order to create a fault localization report based on previously collected data.


## Command line

With the help of the vscode plugin, It becomes very easy to run gzoltar with the command line since the extension registers for us the commands to launch :

1. `mvn package`
2. Copy/Paste the command in the `commands/listTestMethodsCommand.txt` file.
3. Copy/Paste the command in the `commands/runtTestMethodsCdmmand.txt` file.
4. Copy/Paste the command in the `commands/faultLocalizationCommand.txt` file.

In the video below, gzoltar runs by the command line :

[](https://www.youtube.com/watch?v=t-T8IfoTMEw&ab_channel=Gzoltarfeup)
