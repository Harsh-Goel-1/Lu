# Aptos Crowdfund Frontend

Modern dark-themed Next.js frontend for the Aptos Crowdfunding smart contract.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Petra or Martian wallet extension
- Deployed Aptos crowdfund smart contract

### Installation

```bash
# Install dependencies
npm install

# Update contract address in lib/constants.ts
# Set MODULE_ADDRESS to your deployed contract address

# Run development server
npm run dev
```

Visit http://localhost:3000

## 📁 File Structure

```
frontend/
├── app/
│   ├── campaign/[address]/
│   │   └── page.tsx          # Campaign detail page
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── WalletProvider.tsx     # Wallet connection provider
│   ├── Header.tsx             # App header with wallet button
│   ├── CreateCampaign.tsx     # Campaign creation modal
│   └── CampaignCard.tsx       # Campaign preview card
├── lib/
│   ├── constants.ts           # Contract address & config
│   └── aptos.ts               # Aptos SDK utilities
└── hooks/
    └── useCampaign.ts         # Campaign data hook
```

## 🔧 Configuration

### lib/constants.ts

```typescript
export const MODULE_ADDRESS = "YOUR_MODULE_ADDRESS";
export const MODULE_NAME = "crowdfund";
export const NETWORK = "testnet"; // or "mainnet"
```

## 📦 Key Dependencies

- **Next.js 14** - React framework
- **@aptos-labs/ts-sdk** - Aptos blockchain SDK
- **@aptos-labs/wallet-adapter-react** - Wallet integration
- **Tailwind CSS** - Styling
- **lucide-react** - Icons

## 🎨 Features

### For Campaign Creators
- ✅ Create campaigns with goal and deadline
- ✅ Claim funds after successful campaigns
- ✅ View campaign statistics

### For Backers
- ✅ Browse active campaigns
- ✅ Pledge to campaigns
- ✅ Get refunds from failed campaigns
- ✅ Track personal contributions

### UI Features
- 🌑 Dark theme design
- 📱 Fully responsive
- 🔄 Real-time blockchain data
- 🎯 Progress visualization
- 🔔 Transaction notifications

## 🔌 API Integration

### View Functions

```typescript
// Get campaign information
const info = await viewFunctions.getCampaignInfo(address);

// Get backer's pledge
const pledge = await viewFunctions.getBackerPledge(campaignAddr, backerAddr);

// Check campaign status
const isActive = await viewFunctions.isCampaignActive(address);
const isSuccessful = await viewFunctions.isCampaignSuccessful(address);
```

### Entry Functions

```typescript
// Create campaign
await signAndSubmitTransaction({
  data: {
    function: `${MODULE_ADDRESS}::crowdfund::create_campaign`,
    functionArguments: [goalInOctas, deadlineTimestamp, metadata]
  }
});

// Make pledge
await signAndSubmitTransaction({
  data: {
    function: `${MODULE_ADDRESS}::crowdfund::pledge`,
    functionArguments: [campaignAddr, amountInOctas]
  }
});

// Claim funds (creator only)
await signAndSubmitTransaction({
  data: {
    function: `${MODULE_ADDRESS}::crowdfund::claim_funds`,
    functionArguments: []
  }
});

// Get refund (failed campaigns)
await signAndSubmitTransaction({
  data: {
    function: `${MODULE_ADDRESS}::crowdfund::get_refund`,
    functionArguments: [campaignAddr]
  }
});
```

## 🧪 Testing

### Local Testing
1. Connect Petra wallet to Testnet
2. Get testnet APT from faucet
3. Create a test campaign
4. Use different wallet to pledge
5. Test claim/refund after deadline

### Testnet Faucet
https://aptoslabs.com/testnet-faucet

## 🐛 Common Issues

### Wallet Won't Connect
- Ensure wallet extension is installed
- Check wallet is on correct network (Testnet)
- Try refreshing the page

### Transaction Fails
- Verify sufficient APT for gas fees
- Check MODULE_ADDRESS is correct
- Ensure campaign exists and is active

### Data Not Loading
- Verify contract is deployed
- Check browser console for errors
- Confirm network connectivity

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
No environment variables needed - all config in `lib/constants.ts`

## 📚 Resources

- [Aptos Documentation](https://aptos.dev)
- [Aptos TypeScript SDK](https://github.com/aptos-labs/aptos-ts-sdk)
- [Petra Wallet](https://petra.app)
- [Next.js Docs](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License