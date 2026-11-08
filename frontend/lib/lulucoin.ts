import {
  BrowserProvider,
  Contract,
  ZeroAddress,
  formatUnits,
  parseUnits,
  type Eip1193Provider,
  type InterfaceAbi,
} from "ethers";
import LuLuCoin from "../LuLuCoin.json";
import {
  getResolvedRuntimeConfig,
  loadRuntimeContractConfig,
} from "./runtime-config";
import { getSelectedWalletProvider } from "./wallet";

const getContract = async () => {
  await loadRuntimeContractConfig();

  const ethereum = getSelectedWalletProvider();
  if (!ethereum) {
    throw new Error("Ethereum provider not found.");
  }

  const { luluCoinAddress, chainId } = getResolvedRuntimeConfig();
  if (luluCoinAddress === ZeroAddress) {
    throw new Error("LuLuCoin contract address is not configured.");
  }

  const provider = new BrowserProvider(ethereum as Eip1193Provider);
  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(chainId)) {
    throw new Error(`Wrong network: switch your wallet to chain ID ${chainId}.`);
  }

  const signer = await provider.getSigner();
  const contract = new Contract(luluCoinAddress, LuLuCoin.abi as InterfaceAbi, signer);
  return { contract, signer };
};

export const mintLuLuCoin = async (recipient: string, amount: number) => {
  const { contract, signer } = await getContract();
  const [signerAddress, ownerAddress] = await Promise.all([
    signer.getAddress(),
    contract.owner(),
  ]);
  if (signerAddress.toLowerCase() !== String(ownerAddress).toLowerCase()) {
    throw new Error("Only the LuLuCoin contract owner can mint tokens.");
  }

  const parsedAmount = parseUnits(amount.toString(), 18);
  const response = await contract.mint(recipient, parsedAmount);
  return response.wait();
};

export const fetchLuLuCoinBalance = async (account: string) => {
  const { contract } = await getContract();
  const userBalance = await contract.balanceOf(account);
  return parseFloat(formatUnits(userBalance, 18)).toFixed(2);
};
