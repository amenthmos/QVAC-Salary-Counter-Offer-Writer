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

## License

MIT
