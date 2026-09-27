// QVAC Salary Counter-Offer Writer — core logic.
// Given the initial offer and what the user is asking for, writes a
// professional counter-offer message. Never invents a number not present
// in the user's own input — enforced deterministically by extracting every
// numeric token from the model's output and verifying it traces back to
// the offer or ask text.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length < 3) return true;
  if (text.length > 900) return true;
  const bad = [
    "i cannot", "i can't", "as an ai", "i'm not able", "i do not have",
    "i'm sorry", "i am sorry", "please provide more", "please try again",
    "i'd be happy to help", "could you provide", "can you provide",
  ];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function stripWrapping(text) {
  return text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .replace(/^counter[- ]?offer:\s*/i, "")
    .trim()
    .replace(/^["“]|["”]$/g, "")
    .trim();
}

// Extract numeric tokens (money amounts, percentages, plain numbers) and
// normalize each to its actual numeric value — "$95,000", "95000", and
// "95k" all resolve to 95000. Comparing resolved values (rather than raw
// digit substrings) avoids false negatives like "50000" being treated as
// grounded just because it happens to be a substring of "150000".
function extractNumberValues(text) {
  const matches = text.match(/\$?\d[\d,]*(\.\d+)?\s*[kK%]?/g) || [];
  return matches
    .map((m) => {
      const isK = /[kK]\s*$/.test(m.trim());
      const digits = m.replace(/[^0-9.]/g, "");
      const value = parseFloat(digits);
      if (!Number.isFinite(value)) return null;
      return isK ? value * 1000 : value;
    })
    .filter((v) => v !== null && v >= 10); // ignore stray single digits
}

function inventedNumbers(outputText, inputText) {
  const outputValues = extractNumberValues(outputText);
  const inputValues = extractNumberValues(inputText);
  return outputValues.some((v) => !inputValues.some((inV) => inV === v));
}

const FALLBACK = (offer, ask) =>
  `Thank you for the offer. I've reviewed it carefully, and based on my research and experience, I'd like to counter: ` +
  `the initial offer was "${offer}", and I'm asking for "${ask}". I believe this reflects the value I'd bring to the role, ` +
  `and I'm happy to discuss further to find something that works for both of us.`;

export async function generate(modelId, offer, ask) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You write professional, confident salary counter-offer messages. Given the initial offer and what the candidate is asking for, write a short message (3-5 sentences) that references the ACTUAL numbers given — never invent a number, percentage, or figure that wasn't provided. " +
          "Reply with ONLY the message, no preamble, no subject line, no signature.",
      },
      {
        role: "user",
        content: "Initial offer: $85,000 base salary\nWhat I'm asking for: $95,000 base, citing two competing offers in the same range",
      },
      {
        role: "assistant",
        content:
          "Thank you for the offer of $85,000 — I'm genuinely excited about this role. Based on my experience and two other offers I'm currently weighing in a similar range, I'd like to counter at $95,000 base. I'm confident this reflects the value I'd bring from day one, and I'm happy to discuss further to find a number that works for both of us.",
      },
      { role: "user", content: `Initial offer: ${offer}\nWhat I'm asking for: ${ask}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.6, maxTokens: 300 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = stripWrapping(text);

  const inputCombined = `${offer} ${ask}`;
  let message;
  let flagged = false;
  if (looksUnusable(text)) {
    message = FALLBACK(offer, ask);
  } else if (inventedNumbers(text, inputCombined)) {
    message = FALLBACK(offer, ask);
    flagged = true;
  } else {
    message = text;
  }

  return { message, flagged };
}
