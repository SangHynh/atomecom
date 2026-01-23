/* Measures the execution time of a function. */
export const timeit = async (fn: Function, label?: string) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const taskName = label || fn.name || "Anonymous Task";
  console.log(`Execution ${taskName} ::: ${(end - start).toFixed(3)}ms`);
  return result;
};
