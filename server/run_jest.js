import { execSync } from 'child_process';

try {
  const output = execSync('npx jest src/modules/auth/_test/integration/auth.integration.spec.ts --no-cache', { stdio: 'pipe' });
  console.log(output.toString());
} catch (error) {
  console.log('Error output:');
  console.log(error.stdout?.toString());
  console.log(error.stderr?.toString());
}
