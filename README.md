# QVAC Salary Counter-Offer Writer

Enter the offer you received and what you're asking for, get a professional counter-offer message grounded in those actual numbers — generated on-device. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32028

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

Every number in the generated message is checked against the numbers you actually provided — if the model invents a figure that wasn't given, the app falls back to a safe message instead of shipping a fabricated number.

## Example

**Input:** offer `$78,000 base salary with standard benefits`, ask `$88,000 base, citing 4 years of relevant experience and a competing offer at $85,000`

**Output:**
```
Considering my relevant experience and the current market, I believe my skills and qualifications warrant a salary closer to $88,000. With four years of experience in the field, I'm confident I can make significant contributions to the team. I've also received interest from other companies in the same range, which I believe reflects the current market demand. I'm open to discussing further to find a number that works for both of us.
```

## License

MIT
