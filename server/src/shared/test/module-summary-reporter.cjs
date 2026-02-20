class ModuleSummaryReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunStart() {
    // console.log('\n🚀 Starting Test Suite run with Custom Reporter...\n');
  }

  onRunComplete(contexts, results) {
    const moduleResults = {};

    results.testResults.forEach((suiteResult) => {
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

      moduleResults[moduleName].passed += suiteResult.numPassingTests;
      moduleResults[moduleName].failed += suiteResult.numFailingTests;
      moduleResults[moduleName].pending += suiteResult.numPendingTests;
      moduleResults[moduleName].total +=
        suiteResult.numPassingTests +
        suiteResult.numFailingTests +
        suiteResult.numPendingTests;

      suiteResult.testResults.forEach((test) => {
        moduleResults[moduleName].tests.push({
          title: test.fullName,
          status: test.status,
          duration: test.duration,
        });
      });
    });

    console.log('\n');
    console.log('========================================');
    console.log('   📊 DETAILED MODULE TEST REPORT       ');
    console.log('========================================');

    Object.keys(moduleResults)
      .sort()
      .forEach((moduleName) => {
        const stats = moduleResults[moduleName];
        console.log(`\n📦 [Module: ${moduleName.toUpperCase()}]`);
        console.log(
          `SUMMARY: Total: ${stats.total} | ✔ Pass: ${stats.passed} | ✖ Fail: ${stats.failed}`,
        );
        console.log('----------------------------------------');

        stats.tests.forEach((test) => {
          let icon = '✔';
          if (test.status === 'failed') icon = '✖';
          if (test.status === 'pending') icon = '○';
          console.log(`  ${icon} ${test.title} (${test.duration}ms)`);
        });
      });

    console.log('\n========================================');
    if (results.numFailedTests > 0) {
      console.log('❌ FINAL STATUS: FAILURE');
    } else {
      console.log('✅ FINAL STATUS: SUCCESS');
    }
    console.log('========================================\n');
  }
}

module.exports = ModuleSummaryReporter;
