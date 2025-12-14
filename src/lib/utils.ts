import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function pMap<T, R>(
  array: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results = new Array<R>(array.length);
  const iterator = array.entries();

  const worker = async () => {
    for (const [index, item] of iterator) {
      results[index] = await mapper(item, index);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, array.length) }, worker)
  );

  return results;
}

/**
 * Robustly parses JSON from LLM output, handling markdown, comments, and loose syntax.
 */
export function parseRelaxedJSON(text: string): any {
  try {
    // 1. Strip markdown code blocks
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. Find the first '{' and last '}' to isolate the JSON object
    const firstOpen = clean.indexOf('{');
    const lastClose = clean.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      clean = clean.substring(firstOpen, lastClose + 1);
    }

    // 3. Try standard JSON parse first
    return JSON.parse(clean);
  } catch (e) {
    // 4. Fallback: Relaxed parsing (Object Literal)
    try {
      // Remove comments (// ...)
      let clean = text.replace(/\/\/.*$/gm, '');
      // Remove markdown again just in case
      clean = clean.replace(/```json/g, '').replace(/```/g, '').trim();

      const firstOpen = clean.indexOf('{');
      const lastClose = clean.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1) {
        clean = clean.substring(firstOpen, lastClose + 1);
      }

      // Use Function constructor to parse JS object literal
      // This handles unquoted keys, trailing commas, etc.
      return new Function('return ' + clean)();
    } catch (e2) {
      throw new Error(`Failed to parse JSON: ${(e2 as Error).message}`);
    }
  }
}
