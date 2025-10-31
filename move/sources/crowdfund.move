// Crowdfunding Smart Contract with Proper Escrow
// sources/crowdfund.move

module crowdfund_admin::crowdfund {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // === Errors ===
    const ERROR_CAMPAIGN_ENDED: u64 = 1;
    const ERROR_GOAL_NOT_REACHED: u64 = 2;
    const ERROR_CAMPAIGN_NOT_OVER: u64 = 3;
    const ERROR_ALREADY_CLAIMED: u64 = 4;
    const ERROR_NOT_CREATOR: u64 = 5;
    const ERROR_NO_PLEDGE: u64 = 6;
    const ERROR_REFUND_NOT_DUE: u64 = 7;
    const ERROR_ALREADY_REFUNDED: u64 = 8;
    const ERROR_CAMPAIGN_ALREADY_EXISTS: u64 = 9;
    const ERROR_CAMPAIGN_NOT_FOUND: u64 = 10;
    const ERROR_INVALID_AMOUNT: u64 = 11;
    const ERROR_CAMPAIGN_SUCCESSFUL: u64 = 12;

    // === Data Structures ===

    /// Individual backer's pledge information
    struct Pledge has store, drop, copy {
        amount: u64,
        refunded: bool,
    }

    /// Main campaign struct with proper escrow
    struct Campaign has key {
        creator: address,
        goal: u64,
        total_raised: u64,
        deadline_timestamp: u64,
        off_chain_metadata_id: String,
        // Using Table for O(1) lookup instead of vector
        backers: Table<address, Pledge>,
        funds_claimed: bool,
        total_refunded: u64,
        // CRITICAL: Escrow to hold actual funds
        escrow: Coin<AptosCoin>,
    }

    // === Events ===

    #[event]
    struct CampaignCreatedEvent has drop, store {
        campaign_id: address,
        creator: address,
        goal: u64,
        deadline: u64,
        metadata_id: String,
    }

    #[event]
    struct PledgeMadeEvent has drop, store {
        campaign_id: address,
        backer: address,
        amount: u64,
        total_pledged_by_backer: u64,
        new_total_raised: u64,
    }

    #[event]
    struct RefundProcessedEvent has drop, store {
        campaign_id: address,
        backer: address,
        amount: u64,
    }

    #[event]
    struct FundsClaimedEvent has drop, store {
        campaign_id: address,
        creator: address,
        total_raised: u64,
    }

    // === Entry Functions ===

    /// Create a new crowdfunding campaign
    public entry fun create_campaign(
        creator_signer: &signer,
        goal: u64,
        deadline_timestamp: u64,
        metadata_id: String
    ) {
        let creator_addr = signer::address_of(creator_signer);

        // Ensure campaign doesn't already exist
        assert!(!exists<Campaign>(creator_addr), ERROR_CAMPAIGN_ALREADY_EXISTS);

        // Validate inputs
        assert!(goal > 0, ERROR_INVALID_AMOUNT);
        assert!(deadline_timestamp > timestamp::now_seconds(), ERROR_CAMPAIGN_ENDED);

        // Create empty escrow coin
        let escrow = coin::zero<AptosCoin>();

        // Create and store the Campaign resource
        move_to(creator_signer, Campaign {
            creator: creator_addr,
            goal,
            total_raised: 0,
            deadline_timestamp,
            off_chain_metadata_id: metadata_id,
            backers: table::new(),
            funds_claimed: false,
            total_refunded: 0,
            escrow,
        });

        // Emit creation event
        event::emit(CampaignCreatedEvent {
            campaign_id: creator_addr,
            creator: creator_addr,
            goal,
            deadline: deadline_timestamp,
            metadata_id,
        });
    }

    /// Pledge funds to a campaign (supports multiple pledges from same backer)
    public entry fun pledge(
        backer_signer: &signer,
        campaign_creator_addr: address,
        amount: u64
    ) acquires Campaign {
        let backer_addr = signer::address_of(backer_signer);

        // Validate amount
        assert!(amount > 0, ERROR_INVALID_AMOUNT);

        // Get campaign
        assert!(exists<Campaign>(campaign_creator_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global_mut<Campaign>(campaign_creator_addr);

        // Check if campaign is still active
        assert!(timestamp::now_seconds() < campaign.deadline_timestamp, ERROR_CAMPAIGN_ENDED);

        // Withdraw coins from backer
        let pledge_coins = coin::withdraw<AptosCoin>(backer_signer, amount);

        // Merge into escrow
        coin::merge(&mut campaign.escrow, pledge_coins);

        // Update total raised
        campaign.total_raised = campaign.total_raised + amount;

        // Update or create backer's pledge
        let total_pledged_by_backer = amount;
        if (table::contains(&campaign.backers, backer_addr)) {
            let existing_pledge = table::borrow_mut(&mut campaign.backers, backer_addr);
            existing_pledge.amount = existing_pledge.amount + amount;
            total_pledged_by_backer = existing_pledge.amount;
        } else {
            table::add(&mut campaign.backers, backer_addr, Pledge {
                amount,
                refunded: false,
            });
        };

        // Emit pledge event
        event::emit(PledgeMadeEvent {
            campaign_id: campaign_creator_addr,
            backer: backer_addr,
            amount,
            total_pledged_by_backer,
            new_total_raised: campaign.total_raised,
        });
    }

    /// Creator claims funds after successful campaign
    public entry fun claim_funds(
        creator_signer: &signer,
    ) acquires Campaign {
        let creator_addr = signer::address_of(creator_signer);

        // Get campaign
        assert!(exists<Campaign>(creator_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global_mut<Campaign>(creator_addr);

        // Verify creator
        assert!(campaign.creator == creator_addr, ERROR_NOT_CREATOR);

        // Check deadline passed
        assert!(timestamp::now_seconds() >= campaign.deadline_timestamp, ERROR_CAMPAIGN_NOT_OVER);

        // Check goal reached
        assert!(campaign.total_raised >= campaign.goal, ERROR_GOAL_NOT_REACHED);

        // Check not already claimed
        assert!(!campaign.funds_claimed, ERROR_ALREADY_CLAIMED);

        // Mark as claimed
        campaign.funds_claimed = true;

        let claim_amount = campaign.total_raised;

        // Extract all funds from escrow and deposit to creator
        let funds = coin::extract_all(&mut campaign.escrow);
        coin::deposit(creator_addr, funds);

        // Emit claim event
        event::emit(FundsClaimedEvent {
            campaign_id: creator_addr,
            creator: creator_addr,
            total_raised: claim_amount,
        });
    }

    /// Backer claims refund after failed campaign
    public entry fun get_refund(
        backer_signer: &signer,
        campaign_creator_addr: address,
    ) acquires Campaign {
        let backer_addr = signer::address_of(backer_signer);

        // Get campaign
        assert!(exists<Campaign>(campaign_creator_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global_mut<Campaign>(campaign_creator_addr);

        // Check deadline passed
        assert!(timestamp::now_seconds() >= campaign.deadline_timestamp, ERROR_CAMPAIGN_NOT_OVER);

        // Check campaign failed (goal not reached)
        assert!(campaign.total_raised < campaign.goal, ERROR_CAMPAIGN_SUCCESSFUL);

        // Check backer has a pledge
        assert!(table::contains(&campaign.backers, backer_addr), ERROR_NO_PLEDGE);

        let pledge = table::borrow_mut(&mut campaign.backers, backer_addr);

        // Check not already refunded
        assert!(!pledge.refunded, ERROR_ALREADY_REFUNDED);

        let refund_amount = pledge.amount;

        // Mark as refunded
        pledge.refunded = true;
        campaign.total_refunded = campaign.total_refunded + refund_amount;

        // Extract refund from escrow and send to backer
        let refund_coins = coin::extract(&mut campaign.escrow, refund_amount);
        coin::deposit(backer_addr, refund_coins);

        // Emit refund event
        event::emit(RefundProcessedEvent {
            campaign_id: campaign_creator_addr,
            backer: backer_addr,
            amount: refund_amount,
        });
    }

    // === View Functions (for frontend integration) ===

    #[view]
    /// Get basic campaign information
    public fun get_campaign_info(campaign_addr: address): (address, u64, u64, u64, String, bool, u64, u64) acquires Campaign {
        assert!(exists<Campaign>(campaign_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global<Campaign>(campaign_addr);
        (
            campaign.creator,
            campaign.goal,
            campaign.total_raised,
            campaign.deadline_timestamp,
            campaign.off_chain_metadata_id,
            campaign.funds_claimed,
            campaign.total_refunded,
            coin::value(&campaign.escrow)
        )
    }

    #[view]
    /// Get backer's pledge amount
    public fun get_backer_pledge(campaign_addr: address, backer: address): (u64, bool) acquires Campaign {
        assert!(exists<Campaign>(campaign_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global<Campaign>(campaign_addr);
        
        if (table::contains(&campaign.backers, backer)) {
            let pledge = table::borrow(&campaign.backers, backer);
            (pledge.amount, pledge.refunded)
        } else {
            (0, false)
        }
    }

    #[view]
    /// Check if campaign exists
    public fun campaign_exists(campaign_addr: address): bool {
        exists<Campaign>(campaign_addr)
    }

    #[view]
    /// Check if campaign is active (not ended and not claimed)
    public fun is_campaign_active(campaign_addr: address): bool acquires Campaign {
        if (!exists<Campaign>(campaign_addr)) {
            return false
        };
        let campaign = borrow_global<Campaign>(campaign_addr);
        timestamp::now_seconds() < campaign.deadline_timestamp && !campaign.funds_claimed
    }

    #[view]
    /// Check if campaign was successful
    public fun is_campaign_successful(campaign_addr: address): bool acquires Campaign {
        assert!(exists<Campaign>(campaign_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global<Campaign>(campaign_addr);
        campaign.total_raised >= campaign.goal
    }

    #[view]
    /// Get campaign progress percentage (returns value * 100, e.g., 7550 = 75.50%)
    public fun get_progress_percentage(campaign_addr: address): u64 acquires Campaign {
        assert!(exists<Campaign>(campaign_addr), ERROR_CAMPAIGN_NOT_FOUND);
        let campaign = borrow_global<Campaign>(campaign_addr);
        if (campaign.goal == 0) {
            return 0
        };
        (campaign.total_raised * 10000) / campaign.goal
    }

    // === Test-only Functions ===
    #[test_only]
    use aptos_framework::account;

    #[test_only]
    public fun init_for_test(creator: &signer) {
        account::create_account_for_test(signer::address_of(creator));
    }
}