class ModuleSummaryReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunStart() {
    process.stdout.write('\n🚀 Starting Test Suite run...\n');
  }

  onRunComplete(contexts, results) {
    const moduleResults = {};

    results.testResults.forEach((suiteResult) => {
      // Determine module name from path
      const pathParts = suiteResult.testFilePath.split(/[\/\\]/);
      const modulesIndex = pathParts.indexOf('modules');
      let moduleName = 'Other';

      if (modulesIndex !== -1 && modulesIndex + 1 < pathParts.length) {
        let name = pathParts[modulesIndex + 1];
        moduleName = name.charAt(0).toUpperCase() + name.slice(1);
      } else if (suiteResult.testFilePath.includes('shared')) {
        moduleName = 'Shared';
      }

      if (!moduleResults[moduleName]) {
        moduleResults[moduleName] = {
          passed: 0,
          failed: 0,
          total: 0,
          pending: 0,
          tests: [],
        };
      }

      // Aggregate stats
      moduleResults[moduleName].passed += suiteResult.numPassingTests;
      moduleResults[moduleName].failed += suiteResult.numFailingTests;
      moduleResults[moduleName].pending += suiteResult.numPendingTests;
      moduleResults[moduleName].total +=
        suiteResult.numPassingTests +
        suiteResult.numFailingTests +
        suiteResult.numPendingTests;

      // Collect specific test names
      suiteResult.testResults.forEach((test) => {
        moduleResults[moduleName].tests.push({
          title: test.fullName,
          status: test.status,
          duration: test.duration,
          ancestorTitles: test.ancestorTitles,
        });
      });
    });

    // PRINT SUMMARY
    process.stdout.write('\n\n');
    process.stdout.write('========================================\n');
    process.stdout.write('   📊 DETAILED MODULE TEST REPORT       \n');
    process.stdout.write('========================================\n\n');

    Object.keys(moduleResults)
      .sort()
      .forEach((moduleName) => {
        const stats = moduleResults[moduleName];
        const header = `📦 [Module: ${moduleName}]`;
        const summary = `Total: ${stats.total} | ✔ Pass: ${stats.passed} | ✖ Fail: ${stats.failed} | ○ Skip: ${stats.pending}`;

        process.stdout.write(`${header}\n`);
        process.stdout.write(`${summary}\n`);
        process.stdout.write('----------------------------------------\n');

        stats.tests.forEach((test) => {
          let icon = '✔';
          if (test.status === 'failed') icon = '✖';
          if (test.status === 'pending') icon = '○';

          // Simpler clean line: "  ✔ Test Name (time)"
          // process.stdout.write(`  ${icon} ${test.title} (${test.duration}ms)\n`);

          // Or if we want indented hierarchy roughly based on titles:
          // fullName usually includes "Describe > Test Name"
          process.stdout.write(`  ${icon} ${test.title} \n`);
        });
        process.stdout.write('\n');
      });

    process.stdout.write('========================================\n');
    if (results.numFailedTests > 0) {
      process.stdout.write('🆘 FINAL STATUS: FAILURE\n');
    } else {
      process.stdout.write('✅ FINAL STATUS: SUCCESS\n');
    }
    process.stdout.write('========================================\n\n');
  }
}

export default ModuleSummaryReporter;
