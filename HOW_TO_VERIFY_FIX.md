# How to Verify the Echo Chamber Fix

## Quick Start

1. **Run a new simulation** to generate fresh responses with the updated prompts
2. **Use the test scripts** to analyze the results

## Test Scripts

### 1. Check for Echo Patterns

```bash
npx tsx test-echo-fix.ts
```

**What it does:**

- Scans all responses for forbidden echo phrases
- Calculates echo rate percentage
- Shows which personas are echoing vs. bringing unique perspectives

**Good Results:**

- Echo Rate < 10%
- Most responses marked as "UNIQUE PERSPECTIVE"

### 2. Compare Response Diversity

```bash
npx tsx compare-responses.ts
```

**What it does:**

- Shows side-by-side comparison of personas responding to the same question
- Displays each persona's background (age, occupation, income, attitude, values)
- Shows their internal reasoning and public response
- Analyzes theme diversity

**Good Results:**

- 3+ unique themes across responses
- Each persona references their specific background
- Different concerns based on different life situations

### 3. Debug Full Session

```bash
npx tsx debug-full-session.ts
```

**What it does:**

- Shows complete session transcript
- Displays all persona details
- Shows chronological conversation flow

## What to Look For

### ✅ GOOD (Unique Perspectives)

```
Chang (35, Project Manager, $85k):
"As a project manager handling client data, encryption is non-negotiable.
I've seen breaches destroy companies. Without it, I'm out."

Aaliyah (32, Store Manager, $42k):
"I'm not tech-savvy, so I need this to just work. If it's complicated,
I won't use it. My main worry is keeping my personal info safe."

Mei (22, Student, $0):
"I'm broke and can find free alternatives. Unless this is super simple
and doesn't cost anything, I'm not interested."
```

**Why it's good:**

- Each references their specific job/situation
- Different concerns (security vs. simplicity vs. cost)
- Different reasoning based on their life stage
- No one is agreeing with others

### ❌ BAD (Echo Chamber)

```
Chang: "I need data encryption and basic functionality."

Aaliyah: "I agree with Chang. Data encryption and basic functionality
are essential for me too."

Mei: "I definitely need data encryption and basic functionality.
That's a great point."
```

**Why it's bad:**

- Using forbidden phrases ("I agree with", "That's a great point")
- Same concerns despite different backgrounds
- No unique perspective based on their specific life
- Validating each other instead of thinking independently

## Key Metrics

| Metric                     | Target | How to Check                                     |
| -------------------------- | ------ | ------------------------------------------------ |
| Echo Rate                  | < 10%  | `test-echo-fix.ts`                               |
| Unique Themes per Question | 3+     | `compare-responses.ts`                           |
| Personal References        | 80%+   | Look for "As a...", "With my...", "At my age..." |
| Disagreement Rate          | 30-40% | Count responses that challenge others            |

## If Results Are Still Poor

1. **Check persona generation**: Make sure personas have diverse backgrounds

   ```bash
   npx tsx debug-full-session.ts
   ```

   Look at the "PERSONAS" section - they should have:

   - Different ages (spread across 20s, 30s, 40s, 50s, 60s+)
   - Different income levels (low, middle, high)
   - Different attitudes (Skeptic, Believer, Traditionalist, etc.)
   - Different occupations and life situations

2. **Regenerate personas** if they're too similar:

   - Delete current personas
   - Generate new ones with better diversity

3. **Check LLM model**: Some models follow instructions better than others
   - GPT-4 tends to be better at maintaining character
   - Claude is good at nuanced perspectives
   - Cheaper models may struggle with complex persona maintenance

## Expected Improvement

**Before Fix:**

- 40-60% echo rate
- 1-2 unique themes per question
- Generic responses

**After Fix:**

- < 10% echo rate
- 3-5 unique themes per question
- Specific, persona-driven responses
