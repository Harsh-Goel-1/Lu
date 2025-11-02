# Lu - Decentralized Crowdfunding on Aptos

> **Transparent, secure, and efficient crowdfunding powered by Aptos blockchain with built-in escrow protection.**

[![Aptos](https://img.shields.io/badge/Aptos-Blockchain-blue)](https://aptoslabs.com/)
[![Move](https://img.shields.io/badge/Move-Smart%20Contract-green)](https://move-language.github.io/move/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📹 Demo
### **1. Creating campaign with AI assist and backing campaigns**

https://github.com/user-attachments/assets/db90dede-da3e-43b3-9dbc-9452634426f1


### **2. Refund/Claim when campaign fail/succeed**

https://github.com/user-attachments/assets/4fc72aa1-4b51-4219-82cd-9c9b45beadc9


---

## 🚀 Why Aptos for Crowdfunding?

### **Ultra-Low Gas Fees**
Aptos blockchain offers significantly lower transaction costs compared to Ethereum and other chains:
- **Creating a campaign**: ~$0.002 USD
- **Making a pledge**: ~$0.001 USD
- **Claiming funds/Refunds**: ~$0.001 USD

This means **more of your money goes to the actual cause**, not transaction fees!

### **Lightning Fast Transactions**
- Sub-second finality (~0.4s)
- High throughput (100K+ TPS)
- Instant confirmation for backers

### **Secure Move Language**
Move's resource-oriented programming prevents common vulnerabilities:
- ✅ No reentrancy attacks
- ✅ Built-in access control
- ✅ Formal verification support
- ✅ Type-safe asset handling

---

## 🎯 How It Works

### **For Campaign Creators**
1. **Create Campaign** - Set your funding goal and deadline
2. **Share** - Campaign automatically added to global registry
3. **Wait for Funding** - Backers pledge to your campaign
4. **Claim Funds** - If goal reached after deadline, claim all funds

### **For Backers**
1. **Browse Campaigns** - Discover campaigns via "All Active Campaigns"
2. **Pledge** - Support projects with any amount of APT
3. **Protected Funds** - Your pledge locked in secure escrow
4. **Automatic Refund** - Get full refund if campaign fails

### **Smart Contract Escrow**
```
Pledge → Escrow (Smart Contract) → Success: Creator Claims
                                  → Failed: Backers Refund
```

All funds are held securely on-chain. No intermediaries, no fraud risk.

---

## ✨ Key Features

- 🔒 **Secure Escrow** - Funds locked in smart contract until goal reached
- 🌐 **Global Registry** - All campaigns discoverable on-chain
- 💰 **Full Refunds** - Automatic refunds if campaign fails
- 🤖 **AI Descriptions** - AI-powered campaign description generator
- 📊 **Real-time Progress** - Live funding progress tracking
- 🎨 **Modern UI** - Beautiful dark-themed interface
- 🔗 **Wallet Integration** - Petra & Martian wallet support
- ⚡ **Instant Updates** - Real-time blockchain data

---

## 🛠️ Tech Stack

### **Blockchain**
- **Aptos** - Layer 1 blockchain
- **Move** - Smart contract language
- **Aptos SDK** - Blockchain interaction

### **Frontend**
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Aptos Wallet Adapter** - Wallet integration

### **Smart Contract**
- **Resource-based storage** - Campaign data stored on-chain
- **Event emission** - Transaction history tracking
- **View functions** - Gas-free data queries

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+
- Aptos CLI
- Petra or Martian wallet

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/Harsh-Goel-1/Lu.git
cd Lu

# Install dependencies
cd frontend
npm install

# Configure contract address
# Edit frontend/lib/constants.ts with your deployed contract address

# Run development server
npm run dev
```

Visit `http://localhost:3000` 🚀

**Detailed setup instructions available in [`frontend/README.md`](frontend/README.md)**

---

## 📁 Project Structure

```
Lu/
├── move/                      # Smart Contract
│   ├── sources/
│   │   └── crowdfund.move    # Main contract with registry
│   ├── Move.toml             # Move configuration
│   └── README.md             # Contract documentation
│
├── frontend/                  # Next.js Frontend
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities & constants
│   ├── hooks/                # Custom React hooks
│   └── README.md            # Frontend setup guide
│
└── README.md                 # This file
```

---

## 🎮 Usage

### **Creating a Campaign**

1. Connect your wallet
2. Click "Create Campaign"
3. Fill in details:
   - Campaign title
   - Description (or use AI Suggest)
   - Funding goal in APT
   - Duration
4. Sign transaction
5. Your campaign is live!

### **Pledging to a Campaign**

1. Browse active campaigns
2. Click on a campaign card
3. Enter pledge amount
4. Confirm transaction
5. Track your contribution

### **Claiming Funds (Creator)**

1. Wait for deadline to pass
2. Ensure goal was reached
3. Click "Claim Funds"
4. Receive funds in your wallet

### **Getting Refunds (Backer)**

1. Check if campaign failed
2. Click "Get Refund"
3. Receive full refund automatically

---

## 🔐 Security Features

### **Smart Contract Security**
- ✅ **Reentrancy Protection** - State updates before transfers
- ✅ **Access Control** - Creator-only claim functions
- ✅ **Double-Action Prevention** - Can't claim/refund twice
- ✅ **Escrow Safety** - Funds locked until conditions met
- ✅ **Timestamp Validation** - Deadline enforcement

### **Tested Scenarios**
- ✅ Successful campaigns (goal reached)
- ✅ Failed campaigns (goal not reached)
- ✅ Multiple pledges from same backer
- ✅ Edge cases and error handling

---

## 📊 Smart Contract Functions

### **Entry Functions**
```move
// Create a campaign
create_campaign(goal, deadline, metadata)

// Pledge to a campaign
pledge(campaign_address, amount)

// Claim funds (creator only)
claim_funds()

// Get refund (if campaign failed)
get_refund(campaign_address)
```

### **View Functions**
```move
// Get all campaigns
get_all_campaigns() → address[]

// Get campaign details
get_campaign_info(address) → CampaignInfo

// Check campaign status
is_campaign_active(address) → bool
is_campaign_successful(address) → bool
```

---

## 🌟 Why Choose Lu?

| Feature | Traditional Platforms | Lu (Aptos) |
|---------|----------------------|------------|
| Platform Fees | 5-10% | ~0% (only gas) |
| Transaction Fees | 2-3% | <$0.01 |
| Fund Security | Platform holds funds | Smart contract escrow |
| Transparency | Limited | Fully on-chain |
| Refund Process | Manual, slow | Automatic, instant |
| Censorship Risk | Platform controlled | Decentralized |


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Rise In** - For sponsoring the aptos track
- **Amazon Web Services** - For providing free access to AWS Lambda and Bedrock and much more
- - **Aptos Labs** - For the amazing blockchain infrastructure
- **Move Language** - For secure smart contract development
- **Community** - For feedback and support

---

## 🚧 Roadmap

- [ ] Multi-chain support
- [ ] Milestone-based funding
- [ ] Campaign categories and tags
- [ ] Social features (comments, updates)
- [ ] Mobile app (iOS/Android)
- [ ] Analytics dashboard
- [ ] NFT rewards for backers

---

<div align="center">

**Made with ❤️ using Aptos & Move**

⭐ Star us on GitHub if you find this project useful!

[Report Bug](https://github.com/Harsh-Goel-1/Lu/issues) · [Request Feature](https://github.com/Harsh-Goel-1/Lu/issues) · [Documentation](docs/)

</div>
