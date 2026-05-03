export async function runInitStep(label, task, warnings, { critical = false } = {}) {
  try {
    return await task();
  } catch (error) {
    const message = error?.message || "Unknown error.";
    if (critical) {
      throw new Error(`${label}: ${message}`);
    }
    warnings.push(`${label}: ${message}`);
    return null;
  }
}

