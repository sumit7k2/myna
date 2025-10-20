import { buildFixtures, type Fixtures, type ScenarioConfig, type ScenarioName } from './generators';

let activeConfig: ScenarioConfig = { name: 'default', delayMs: 0 };
let currentFixtures: Fixtures = buildFixtures(activeConfig);

export function setScenario(name: ScenarioName, overrides?: Partial<ScenarioConfig>) {
  activeConfig = { name, delayMs: activeConfig.delayMs, ...overrides, flags: { ...activeConfig.flags, ...(overrides?.flags || {}) } } as ScenarioConfig;
  currentFixtures = buildFixtures(activeConfig);
}

export function getScenario(): ScenarioConfig {
  return activeConfig;
}

export function getFixtures(): Fixtures {
  return currentFixtures;
}

export function resetFixtures() {
  currentFixtures = buildFixtures(activeConfig);
}

export async function maybeDelay() {
  const ms = activeConfig.delayMs ?? 0;
  if (!ms) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
