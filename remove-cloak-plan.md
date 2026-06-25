# Plan: Remove Cloak integration and create campaigns in direct public mode

Goal: eliminate the entire privacy flow built on `@cloak.dev/sdk` and make campaign creation/funding work purely in "public_direct" mode (direct USDC transfer from the sponsor wallet to the campaign vault).

---

## 1. Removal scope

### 1.1 Files to delete entirely
- `lib/cloak-config.ts` — SDK initialization wrapper (mainnet/devnet), relay URLs, helpers `getCloakSdk` / `getCloakRelayUrl`.
- `lib/cloak-flow.ts` — orchestration of `shieldUsdcBalance()`, `runPrivateCampaignFunding()`, `runResumePrivateCampaignFunding()`.
- `lib/shielded-balance.ts` — persistence of Cloak UTXOs in `localStorage`.
- `lib/eph-storage.ts` — ephemeral keypair generation/encryption via wallet signature.
- `cloak.md` — root-level documentation justifying the use of Cloak.

### 1.2 `package.json` dependencies to remove
- `@cloak.dev/sdk`
- `@cloak.dev/sdk-devnet`

Keep: `@solana/web3.js`, `@solana/spl-token`, `@solana/kora`. **Kora stays** — it will sponsor the gas for campaign creation and funding against the normal (non-Cloak) program, so the sponsor wallet does not need to hold SOL.

### 1.3 Build config
- `next.config.ts:20` — remove the `buffer@6+` alias (`readBigInt64LE` / `readBigUInt64LE`) and the "Required by @cloak.dev/sdk" comment. Confirm no other consumer depends on that alias before deleting.

---

## 2. Types and data model

### 2.1 `lib/campaign-types.ts`
- Remove the `CampaignPrivacyMode` type (`"private_cloak" | "public_direct"`).
- Remove the `privacyMode` field from `CampaignFormData` (and the `"private_cloak"` defaults).
- Anywhere code reads `privacyMode`, collapse it to the direct path.

### 2.2 `lib/api/campaigns.ts` and `lib/app-campaign-data.ts`
Remove (from the `ApiCampaignRecord` type and the mappings):
- `cloakEnabled`
- `privacyMode`
- `privacyFundingStatus` (all states: `not_started` → `setup_pending` → `deposit_pending` → `deposit_confirmed` → `withdraw_pending` → `withdraw_confirmed` → `finalization_pending` → `funded` / `failed`)
- `cloakDepositTxHash`
- `cloakWithdrawTxHash`
- `cloakViewingKeyRegisteredAt`
- `cloakLastError`

Replace with a single direct-funding status (e.g. `fundingStatus: "pending" | "funded" | "failed"` and `fundingTxHash`). **Align with the backend** before touching this — these fields come from the API today; the contract change has to be coordinated.

---

## 3. Campaign creation UI

### 3.1 `components/app/new-campaign-screen.tsx`
- Remove the privacy-selection radio buttons ("private_cloak" with the Shield icon / "public_direct" with the Wallet icon).
- Remove any explanatory copy, faucet links, or copy specific to privacy.
- The `createCampaign()` call should send only the fields used by the direct flow.

### 3.2 `components/app/usdc-balance-pill.tsx`
- Remove the reference to `DEVNET_CLOAK_FAUCET_URL` (use a standard USDC devnet faucet if still needed).

---

## 4. Funding flow

### 4.1 `components/app/app-campaign-detail-screen.tsx`
Rewrite the funding overlay:
- Drop imports: `runPrivateCampaignFunding`, `runResumePrivateCampaignFunding`, `hasPendingPrivateCampaignFunding`, `canUsePreShieldedBalance`.
- Drop the 10-step private state machine (prepare → register → shield → withdraw → fund → finalize).
- Implement a direct 4-step flow, with Kora sponsoring the SOL fee on every transaction:
  1. **Prepare** — validate the sponsor's USDC balance and the vault address; build the SPL transfer instruction(s) against the normal program.
  2. **Approve** — request a Kora-signed transaction (fee payer = Kora) and have the sponsor sign it through Privy.
  3. **Submit** — send the Kora-bundled transaction to the Solana RPC.
  4. **Confirm** — wait for confirmation and call the backend `finalize` endpoint (or equivalent) to mark the campaign as `funded`.

### 4.2 Failure recovery
- Without an ephemeral wallet there is no complex "resume" path. Just allow retrying the transfer if the previous transaction failed.
- Remove any `localStorage` reads/writes tied to UTXOs or ephemeral keys.

---

## 5. Internationalization (`lib/i18n/app.ts`)

Remove (around lines 209–289 and 56):
- Overlay steps: "Configurar privacidade", "Mover para privado", "Enviar de forma privada", "Financiar campanha".
- Phase messages: register / shield / withdraw / finalize.
- Cloak-specific error messages ("Sua carteira precisa suportar assinatura" in the Cloak context).
- Cloak devnet faucet help text.

Add new strings for the direct flow: "Preparing transfer", "Approving in wallet", "Submitting", "Confirming", plus generic RPC error messages.

---

## 6. Kora keeps sponsoring gas

Kora stays. In the Cloak flow it sponsored the fee on the final Kora-bundled transfer; in the new direct flow it sponsors gas across **every** on-chain interaction with the normal program — campaign creation and campaign funding — so the sponsor wallet never needs SOL, only USDC.

Action items:
- Keep `@solana/kora` in `package.json`.
- Reuse the existing Kora client setup from `lib/cloak-flow.ts` (Kora endpoint, fee-payer logic) and move it into a dedicated `lib/kora.ts` (or similar) before deleting `lib/cloak-flow.ts`, so the direct flow inherits the same transport.
- Make sure both `createCampaign` and the new funding flow build transactions with Kora as the fee payer and submit them through the Kora relayer.

---

## 7. Suggested execution order

1. **Backend first:** align the API contract to deprecate the `cloak*` / `privacyFundingStatus` fields and expose a single `fundingStatus` / `fundingTxHash`. Without that, the frontend breaks.
2. **Frontend types:** update `lib/api/campaigns.ts`, `lib/app-campaign-data.ts`, `lib/campaign-types.ts`.
3. **Creation UI:** simplify `new-campaign-screen.tsx` (remove the privacy radio).
4. **Funding UI:** rewrite `app-campaign-detail-screen.tsx` for the direct 4-step flow.
5. **i18n:** update strings.
6. **Delete Cloak files:** `lib/cloak-config.ts`, `lib/cloak-flow.ts`, `lib/shielded-balance.ts`, `lib/eph-storage.ts`, `cloak.md`.
7. **Clean up build:** remove deps from `package.json` (`npm uninstall @cloak.dev/sdk @cloak.dev/sdk-devnet`), review `next.config.ts`.
8. **Root `CLAUDE.md`** (`/Users/joaorubensbelluzzoneto/Documents/bido/CLAUDE.md`): remove the entire "SDK Project Context" section (Program ID, circuit URL, UTXO API, viewing-key guardrails, refs to `/llms.txt`, `/sdk/*`).
9. **Manual smoke test:**
   - Create a new campaign from scratch.
   - Fund it with devnet USDC from a real Privy wallet.
   - Confirm that the vault receives the balance and the campaign moves to `funded` with no missing-import errors.
10. **Build & typecheck:** run `npm run build` to make sure nothing still references the removed SDK.

---

## 8. Risks and validations

- **Existing production campaigns** with `privacyMode === "private_cloak"` stuck in any intermediate state (`setup_pending`, `deposit_pending`, etc.) will be orphaned. Define a migration before deploy: cancel/refund those campaigns, or keep a read-only legacy path while the code removal progresses.
- **Sponsor privacy:** the argument in `cloak.md` (preventing on-chain indexing of the sponsor↔campaign link) goes away. Confirm with product that this property is acceptable to drop.
- **Devnet faucet:** without the Cloak faucet, provide alternative instructions for devs to obtain devnet USDC.
- **Buffer polyfill:** after removing the `next.config.ts` alias, run the build in a clean environment to make sure no other package was indirectly relying on it.
