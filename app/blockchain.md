Agora preciso fazer a parte da blockchain.

Material de apoio: 
https://developers.circle.com/stablecoins/quickstart-transfer-10-usdc-on-solana
https://solana.com/pt/docs/core/programs

Use a cicle pra usdc

Preciso que me ajude a criar esse fluxo, gere o plano antes de executar:

1. Backend cria campanha off-chain
2. Gera campaignId
3. Sponsor assina transação com wallet Privy
4. USDC sai da wallet do sponsor
5. USDC vai para uma vault/PDA da campanha
6. Programa Solana salva:
   - campaignId
   - sponsorWallet
   - budgetTotal
   - budgetAvailable
   - budgetSpent = 0
   - status = active
7. Backend salva txHash e marca campaign como funded_onchain