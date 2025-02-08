// custom-reporter.js
import { DefaultReporter } from 'vitest/reporters';

class CustomReporter extends DefaultReporter {
  onTestError(test, error) {
    this.logError(test, error);
  }

  logError(test, error) {
    console.error(`\nTest failed: ${test.name}`);
  }

  onFinished(files = []) {
    const failedTests = files.filter(file => file.result?.state === 'fail');
    if (failedTests.length > 0) {
      console.error('\nFailed tests:');
      failedTests.forEach(file => {
        file.result?.errors?.forEach(error => {
          this.logError(file, error);
        });
      });
    }
    super.onFinished(files);
  }
}

export default CustomReporter;