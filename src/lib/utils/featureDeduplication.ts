/**
 * Feature Deduplication Utility
 * Applies consistent deduplication logic across all goals and sections
 */

export function normalizeFeature(feature: string): string {
  return feature
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DeduplicatedFeature {
  name: string;
  count: number;
  variants: string[];
}

/**
 * Deduplicate features by grouping similar ones together
 * Uses 50% word overlap threshold for matching
 */
export function deduplicateFeatures(
  features: Record<string, number>
): DeduplicatedFeature[] {
  const groups: Map<string, DeduplicatedFeature> = new Map();

  // Sort by count descending to keep the most popular variant as the name
  const sortedFeatures = Object.entries(features).sort(([, a], [, b]) => b - a);

  sortedFeatures.forEach(([feature, count]) => {
    const normalized = normalizeFeature(feature);
    const words = normalized.split(" ").filter((w) => w.length > 2);

    // Skip if too short or looks like gibberish
    if (words.length === 0 || feature.length < 3 || feature.length > 100)
      return;

    // Find existing group with similar words
    let foundGroup = false;
    for (const [key, group] of groups) {
      const keyWords = key.split(" ").filter((w) => w.length > 2);

      // Calculate similarity score
      const commonWords = words.filter((w) =>
        keyWords.some(
          (kw) =>
            kw === w ||
            kw.includes(w) ||
            w.includes(kw) ||
            (kw.length > 4 &&
              w.length > 4 &&
              kw.substring(0, 4) === w.substring(0, 4))
        )
      );

      // Need at least 50% word overlap or 2+ common words
      const similarityThreshold = Math.max(
        2,
        Math.min(words.length, keyWords.length) * 0.5
      );

      if (commonWords.length >= similarityThreshold) {
        group.count += count;
        if (!group.variants.includes(feature)) {
          group.variants.push(feature);
        }
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.set(normalized, { name: feature, count, variants: [feature] });
    }
  });

  return Array.from(groups.values())
    .sort((a, b) => b.count - a.count)
    .filter((g) => g.name.length >= 3 && g.name.length < 100);
}

/**
 * Deduplicate an array of strings (for simple lists)
 */
export function deduplicateStringArray(items: string[]): string[] {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });

  const deduplicated = deduplicateFeatures(counts);
  return deduplicated.map((d) => d.name);
}
