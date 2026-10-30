export const EXAMPLE_REGISTRY_SCHEMA_VERSION = 1;
export const EXAMPLE_STATES = Object.freeze(["planned", "in-review", "released", "retired"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateExampleRegistry(registry) {
  const errors = [];
  if (registry?.schemaVersion !== EXAMPLE_REGISTRY_SCHEMA_VERSION) errors.push({ code: "EXAMPLE_SCHEMA", message: "Unsupported example registry schema." });
  if (!Array.isArray(registry?.examples)) errors.push({ code: "EXAMPLE_LIST", message: "Examples must be an array." });
  const ids = new Set();
  for (const example of registry?.examples ?? []) {
    if (!example || typeof example !== "object" || Array.isArray(example)) {
      errors.push({ code: "EXAMPLE_OBJECT", message: "Each example registry entry must be an object." });
      continue;
    }
    if (!hasText(example.id) || ids.has(example.id)) errors.push({ code: "EXAMPLE_ID", message: "Example IDs must be unique and non-empty." });
    ids.add(example.id);
    for (const field of ["title", "status", "objective", "acceptanceTest", "safetyNote"]) {
      if (!hasText(example[field])) errors.push({ code: "EXAMPLE_FIELD", exampleId: example.id, message: `${field} is required.` });
    }
    if (!EXAMPLE_STATES.includes(example.status)) errors.push({ code: "EXAMPLE_STATUS", exampleId: example.id, message: "Example status is invalid." });
    if (example.status === "released") {
      if (!hasText(example.projectFile) || !hasText(example.testId)) {
        errors.push({ code: "RELEASE_EVIDENCE", exampleId: example.id, message: "Released examples require a native project file and automated test ID." });
      }
      if (example.verification?.status !== "passed" || !hasText(example.verification?.workflow) || !/^https:\/\/github\.com\/.+\/actions\/runs\/\d+$/.test(example.verification?.runUrl ?? "")) {
        errors.push({ code: "RELEASE_RESULT", exampleId: example.id, message: "Released examples require a passing CI workflow link and status." });
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export function getExampleCoverage(registry) {
  const examples = Array.isArray(registry?.examples) ? registry.examples : [];
  const released = examples.filter((example) => example.status === "released").length;
  return { total: examples.length, released, target: 200, remaining: Math.max(0, 200 - released) };
}

