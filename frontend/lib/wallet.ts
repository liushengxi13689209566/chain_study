import type { Eip1193Provider } from "ethers";

export type WalletInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export type WalletChoice = {
  info: WalletInfo;
  provider: Eip1193Provider;
};

type AnnouncedProvider = {
  info: WalletInfo;
  provider: Eip1193Provider;
};

let selectedProvider: Eip1193Provider | null = null;

export const setSelectedWalletProvider = (provider: Eip1193Provider | null) => {
  selectedProvider = provider;
};

export const getSelectedWalletProvider = () => selectedProvider;

export const discoverWallets = async (): Promise<WalletChoice[]> => {
  const wallets: WalletChoice[] = [];
  const providers = new Set<Eip1193Provider>();

  const onAnnounce = (event: Event) => {
    const detail = (event as CustomEvent<AnnouncedProvider>).detail;
    if (!detail?.provider || !detail.info || providers.has(detail.provider)) {
      return;
    }

    providers.add(detail.provider);
    wallets.push({ info: detail.info, provider: detail.provider });
  };

  window.addEventListener("eip6963:announceProvider", onAnnounce);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  window.removeEventListener("eip6963:announceProvider", onAnnounce);

  const injected = window.ethereum;
  const legacyProviders = injected?.providers?.length
    ? injected.providers
    : injected
      ? [injected]
      : [];

  for (const provider of legacyProviders) {
    if (providers.has(provider)) {
      continue;
    }

    const flags = provider as Eip1193Provider & {
      isMetaMask?: boolean;
      isOkxWallet?: boolean;
    };
    const name = flags.isOkxWallet
      ? "OKX Wallet"
      : flags.isMetaMask
        ? "MetaMask"
        : "Injected Wallet";
    providers.add(provider);
    wallets.push({
      info: {
        uuid: name,
        name,
        icon: "",
        rdns: "",
      },
      provider,
    });
  }

  return wallets;
};