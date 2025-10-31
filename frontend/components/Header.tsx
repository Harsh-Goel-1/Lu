'use client';

import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";

const PETRA_WALLET_NAME = "Petra" as WalletName;

export function Header() {
  const { connected, account, connect, disconnect, wallet } = useWallet();

  const handleWalletAction = async () => {
    if (connected) {
      await connect(wallet?.name || PETRA_WALLET_NAME);
    } else {
      await connect(wallet?.name || PETRA_WALLET_NAME);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid #1f2937',
      backgroundColor: 'rgba(17, 24, 39, 0.5)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🚀
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
              Aptos Crowdfund
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
              Decentralized Funding
            </p>
          </div>
        </div>

        <button
          onClick={handleWalletAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <span>💳</span>
          {connected ? (
            <span style={{ fontFamily: 'monospace' }}>
              {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
            </span>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      </div>
    </header>
  );
}