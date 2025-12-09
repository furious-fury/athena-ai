import { ethers } from 'ethers';
// ABI for the AgentModule (minimal)
const MODULE_ABI = [
    "function executeModuleCall(address safe, address to, uint256 value, bytes calldata data) external"
];
// ABI for a hypothentical Polymarket Router (just for encoding data)
const ROUTER_ABI = [
    "function buyingSomething(uint256 amount)" // Dummy function
];
export async function executeAgentTrade(rpcUrl, agentPrivateKey, moduleAddress, safeAddress, polymarketRouterAddress) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const agentWallet = new ethers.Wallet(agentPrivateKey, provider);
    const module = new ethers.Contract(moduleAddress, MODULE_ABI, agentWallet);
    // 1. Compose Polymarket Calldata
    // In reality, use @polymarket/clob-client to get call data or encode 'fillOrder'
    // Here we strictly demonstrate the piping.
    const routerInterface = new ethers.utils.Interface(ROUTER_ABI);
    const tradeCalldata = routerInterface.encodeFunctionData("buyingSomething", [12345]);
    console.log(`[Agent] Composed Trade Calldata: ${tradeCalldata}`);
    console.log(`[Agent] Sending transaction to Module: ${moduleAddress}`);
    // 2. Execute via Module
    // The Agent (msg.sender) calls the Module directly. 
    // The Module calls the Safe. The Safe calls the Router.
    const tx = await module.executeModuleCall(safeAddress, polymarketRouterAddress, 0, // Value (ETH)
    tradeCalldata);
    console.log(`[Agent] Transaction sent: ${tx.hash}. Waiting...`);
    const receipt = await tx.wait();
    // Check events?
    const executedEvent = receipt.events?.find((e) => e.event === 'ModuleExecuted');
    if (executedEvent) {
        console.log(`[Agent] Success! Emitted ModuleExecuted.`);
    }
    return receipt;
}
//# sourceMappingURL=agentExecutor.js.map