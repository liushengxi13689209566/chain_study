"use client";

import Image from "next/image";
import Link from "next/link";
import BiliBili from "@/public/assets/bilibili.png";
import Github from "@/public/assets/github.png";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { getResolvedRuntimeConfig } from "@/lib/runtime-config";
import {
  discoverWallets,
  setSelectedWalletProvider,
  type WalletChoice,
} from "@/lib/wallet";

type NavbarProps = {
  accounts: string[];
  setAccounts: Dispatch<SetStateAction<string[]>>;
};

export default function Navbar({ accounts, setAccounts }: NavbarProps) {
  const [walletChoices, setWalletChoices] = useState<WalletChoice[]>([]);
  const [isChoosingWallet, setIsChoosingWallet] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const isConnected = Boolean(accounts[0]);

  const connectWallet = async (wallet: WalletChoice) => {
    setConnectionError(null);
    try {
      setSelectedWalletProvider(wallet.provider);
      const { chainId, rpcUrl } = getResolvedRuntimeConfig();
      const chainIdHex = `0x${chainId.toString(16)}`;

      try {
        await wallet.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError) {
        if (
          typeof switchError === "object" &&
          switchError !== null &&
          "code" in switchError &&
          switchError.code === 4902
        ) {
          await wallet.provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: "Anvil Local",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: [rpcUrl],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      const nextAccounts = await wallet.provider.request({
          method: "eth_requestAccounts",
        });
        setAccounts(nextAccounts as string[]);
      setIsChoosingWallet(false);
    } catch (error) {
      setSelectedWalletProvider(null);
      setConnectionError(
        error instanceof Error ? error.message : "连接钱包失败，请检查钱包弹窗。"
      );
    }
  };

  const connectAccount = async () => {
    setConnectionError(null);
    try {
      const wallets = await discoverWallets();
      if (wallets.length === 0) {
        setConnectionError("未检测到钱包，请安装或启用浏览器钱包扩展。");
      } else if (wallets.length === 1) {
        await connectWallet(wallets[0]);
      } else {
        setWalletChoices(wallets);
        setIsChoosingWallet(true);
      }
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : "无法读取可用钱包。"
      );
    }
  };

  return (
    <div className="flex justify-between items-center text-2xl px-8 py-6 font-wq text-white">
      <div className="flex">
        <Link
          href="https://space.bilibili.com/3493288753498847"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center space-x-2">
            <Image src={BiliBili} alt="@lllu_23" width={36} height={36} />
            <span className="text-3xl px-4">@lllu_23</span>
          </div>
        </Link>

        <Link
          href="https://github.com/Luboy23"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center space-x-2">
            <Image src={Github} alt="@lllu_23" width={36} height={36} />
            <span className="text-3xl px-4">@源代码仓库</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-6 text-2xl">
        <Link
          href="mailto:lllu238744@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          联系作者
        </Link>

        {isConnected ? (
          <p className="bg-pink-600 px-6 py-2 rounded-md">已连接</p>
        ) : (
          <button
            onClick={connectAccount}
            className="bg-pink-600 px-6 py-2 rounded-md shadow-lg hover:bg-pink-700 transition duration-300"
          >
            连接钱包
          </button>
        )}
        {connectionError && (
          <p role="alert" className="absolute right-8 top-20 max-w-sm text-sm text-red-200">
            {connectionError}
          </p>
        )}
      </div>
      {isChoosingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            aria-labelledby="wallet-picker-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-md bg-white p-6 text-gray-900 shadow-xl"
            role="dialog"
          >
            <h2 id="wallet-picker-title" className="mb-4 text-xl font-semibold">
              选择钱包
            </h2>
            <div className="flex flex-col gap-2">
              {walletChoices.map((wallet) => (
                <button
                  key={wallet.info.uuid}
                  className="rounded border border-gray-300 px-4 py-3 text-left hover:bg-pink-50"
                  onClick={() => void connectWallet(wallet)}
                  type="button"
                >
                  {wallet.info.name}
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsChoosingWallet(false)}
              type="button"
            >
              取消
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
