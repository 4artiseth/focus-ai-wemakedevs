export const GOAL_QUESTIONS = {
  IDEA_VALIDATION: [
    // Problem Reality Check
    "Be honest: When was the last time you ACTUALLY struggled with {problem}? Give me a specific example with details - when, where, what happened.",

    // Problem Intensity Score
    "On a scale of 0-10, how INTENSE is {problem} for you? 0 = not a problem at all, 10 = crisis-level urgent. Give me a number and explain.",

    // Problem Frequency
    "How OFTEN do you face {problem}? Daily? Weekly? Monthly? Only in specific situations? Be specific.",

    // Concept Appeal (First Reaction)
    "Here's the concept: {productName} - {coreFeatures}. What is your FIRST, GUT reaction? Love it? Hate it? Confused? Skeptical? Excited?",

    // Concept Clarity
    "On a scale of 0-10, how CLEAR is it what {productName} does and who it's for? 0 = totally confused, 10 = crystal clear. Give me a number.",

    // Current Solution Comparison
    "What do you use TODAY to solve {problem}? How does {productName} ({coreFeatures}) compare - is it 10x better, or just 'different'?",

    // Adoption Likelihood
    "On a scale of 0-10, how LIKELY are you to actually try {productName} ({coreFeatures})? 0 = never, 10 = signing up today. Give me a number.",

    // Adoption Barriers
    "What is the ONE thing holding you back from using {productName} ({coreFeatures}) right now? Price? Trust? Complexity? Something else?",

    // Must-Have Feature
    "Looking at {coreFeatures}, what is the ONE feature that would make you sign up TODAY? What's the deal-maker?",
  ],
  POSITIONING: [
    // Perceptual Map Question 1: Price Axis
    "On a scale of 1-10, where does {productName} ({coreFeatures}) sit on PRICE? 1 = Budget/Cheap, 10 = Premium/Expensive. Give me a number.",

    // Perceptual Map Question 2: Complexity Axis
    "On a scale of 1-10, where does {productName} ({coreFeatures}) sit on COMPLEXITY? 1 = Simple/Easy, 10 = Advanced/Complex. Give me a number.",

    // Competitive Positioning
    "Looking at {competitors}, which one is {productName} MOST similar to? And what's the ONE thing that makes us different from them?",

    // Word Ownership
    "What is the ONE WORD {productName} should own in people's minds? 'Fast'? 'Reliable'? 'Smart'? 'Simple'? Pick ONE word.",

    // Laddering (Emotional Benefit)
    "Why does {coreFeatures} matter to you? Don't tell me what it does - tell me what it means for YOUR life. What does using this say about you?",

    // Brand Archetype
    "If {productName} was a person, would they be: THE HERO (saves the day), THE SAGE (gives wisdom), THE REBEL (breaks rules), or THE FRIEND (supports you)? Pick one and explain.",

    // Positioning Statement
    "Complete this: '{productName} is the ONLY {category} that [blank]. Unlike {competitors}, we [blank].' Fill in the blanks.",

    // Tagline Preference
    "If you had to describe {productName} in 5 words or less for a billboard, what would you say?",
  ],
  PRICING: [
    // Van Westendorp Question 1: Too Cheap
    "At what price would {productName} ({coreFeatures}) feel SO CHEAP that you'd question the quality or think it's fake? Give me a specific number.",

    // Van Westendorp Question 2: Bargain (Good Value)
    "At what price would {productName} ({coreFeatures}) feel like a GREAT DEAL - a bargain you'd jump on immediately? Give me a specific number.",

    // Van Westendorp Question 3: Expensive (Starting to hesitate)
    "At what price would {productName} ({coreFeatures}) start to feel EXPENSIVE - you'd have to think twice, but might still buy? Give me a specific number.",

    // Van Westendorp Question 4: Too Expensive
    "At what price would {productName} ({coreFeatures}) be TOO EXPENSIVE - you would absolutely NOT buy it, no matter what? Give me a specific number.",

    // Gabor-Granger Price Ladder (asked at multiple price points)
    "If {productName} ({coreFeatures}) costs {priceTest}, would you buy it? Yes or no, and explain why.",

    // Final willingness check
    "Final question: Considering everything we discussed, what is the MAXIMUM amount you would actually pay for {productName} ({coreFeatures}) before walking away?",
  ],
  FEATURE_PRIORITIZATION: [
    // Kano Classification Question 1: Must-Haves
    "Look at these features: {coreFeatures}. Which features are BASIC EXPECTATIONS - if they're missing, the product is broken and you won't use it? List them.",

    // Kano Classification Question 2: Performance Features
    "From the same list ({coreFeatures}), which features are PERFORMANCE DRIVERS - the better they are, the more you'd pay? List them.",

    // Kano Classification Question 3: Delighters
    "From this list ({coreFeatures}), which features are NICE SURPRISES - you don't expect them, but they'd make you smile? List them.",

    // Lifeboat Game (Forces hard trade-offs)
    "THE LIFEBOAT GAME: The ship is sinking. You can only save 3 features from {coreFeatures}. The rest die forever. Which 3 do you save and why?",

    // Deal Breaker Test
    "If we removed {featureToTest} from {productName} but kept the same price, would you still buy it or would you cancel? Be honest.",

    // Bundle Choice (Trade-off analysis)
    "Choose ONE bundle: Bundle A has {bundleA}, Bundle B has {bundleB}, Bundle C has {bundleC}. Which do you pick and why?",

    // Final MVP Recommendation
    "If we could only launch with 3 features from {coreFeatures} to start, which 3 should we build first? What can wait for version 2?",
  ],
};
