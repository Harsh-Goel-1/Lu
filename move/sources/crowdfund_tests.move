// Comprehensive tests for crowdfunding smart contract
// tests/crowdfund_tests.move

#[test_only]
module crowdfund_admin::crowdfund_tests {
    use std::signer;
    use std::string;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use crowdfund_admin::crowdfund;

    // Test helper to set up AptosCoin for testing
    fun setup_test(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Create accounts
        let creator_addr = signer::address_of(creator);
        let backer1_addr = signer::address_of(backer1);
        let backer2_addr = signer::address_of(backer2);

        account::create_account_for_test(creator_addr);
        account::create_account_for_test(backer1_addr);
        account::create_account_for_test(backer2_addr);

        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        // Register and mint coins for creator and backers
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(backer1);
        coin::register<AptosCoin>(backer2);

        let creator_coins = coin::mint(1000000, &mint_cap);
        let backer1_coins = coin::mint(500000, &mint_cap);
        let backer2_coins = coin::mint(500000, &mint_cap);

        coin::deposit(creator_addr, creator_coins);
        coin::deposit(backer1_addr, backer1_coins);
        coin::deposit(backer2_addr, backer2_coins);

        // Cleanup
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, creator = @0x123)]
    fun test_create_campaign_success(
        aptos_framework: &signer,
        creator: &signer,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(creator));

        let goal = 1000000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign-id");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        assert!(crowdfund::campaign_exists(creator_addr), 1);

        let (campaign_creator, campaign_goal, total_raised, campaign_deadline, _, claimed, refunded, escrow) = 
            crowdfund::get_campaign_info(creator_addr);

        assert!(campaign_creator == creator_addr, 2);
        assert!(campaign_goal == goal, 3);
        assert!(total_raised == 0, 4);
        assert!(campaign_deadline == deadline, 5);
        assert!(!claimed, 6);
        assert!(refunded == 0, 7);
        assert!(escrow == 0, 8);
    }

    #[test(aptos_framework = @0x1, creator = @0x123)]
    #[expected_failure(abort_code = 9)] // ERROR_CAMPAIGN_ALREADY_EXISTS
    fun test_create_campaign_duplicate_fails(
        aptos_framework: &signer,
        creator: &signer,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(creator));

        let goal = 1000000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign-id");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);
        crowdfund::create_campaign(creator, goal, deadline, metadata); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123)]
    #[expected_failure(abort_code = 11)] // ERROR_INVALID_AMOUNT
    fun test_create_campaign_zero_goal_fails(
        aptos_framework: &signer,
        creator: &signer,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(creator));

        let goal = 0; // Invalid
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign-id");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_pledge_success(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        let backer1_addr = signer::address_of(backer1);
        let pledge_amount = 50000;

        // Backer1 pledges
        crowdfund::pledge(backer1, creator_addr, pledge_amount);

        // Check campaign state
        let (_, _, total_raised, _, _, _, _, escrow) = crowdfund::get_campaign_info(creator_addr);
        assert!(total_raised == pledge_amount, 1);
        assert!(escrow == pledge_amount, 2);

        // Check backer's pledge
        let (backer_pledge, refunded) = crowdfund::get_backer_pledge(creator_addr, backer1_addr);
        assert!(backer_pledge == pledge_amount, 3);
        assert!(!refunded, 4);

        // Check backer's balance decreased
        let backer_balance = coin::balance<AptosCoin>(backer1_addr);
        assert!(backer_balance == 450000, 5);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_multiple_pledges_same_backer(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 200000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        let backer1_addr = signer::address_of(backer1);

        // First pledge
        crowdfund::pledge(backer1, creator_addr, 30000);

        // Second pledge from same backer
        crowdfund::pledge(backer1, creator_addr, 20000);

        // Check total is accumulated
        let (backer_pledge, refunded) = crowdfund::get_backer_pledge(creator_addr, backer1_addr);
        assert!(backer_pledge == 50000, 1);
        assert!(!refunded, 2);

        let (_, _, total_raised, _, _, _, _, _) = crowdfund::get_campaign_info(creator_addr);
        assert!(total_raised == 50000, 3);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_multiple_backers(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 150000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);

        // Multiple backers pledge
        crowdfund::pledge(backer1, creator_addr, 60000);
        crowdfund::pledge(backer2, creator_addr, 70000);

        let (_, _, total_raised, _, _, _, _, escrow) = crowdfund::get_campaign_info(creator_addr);
        assert!(total_raised == 130000, 1);
        assert!(escrow == 130000, 2);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 1)] // ERROR_CAMPAIGN_ENDED
    fun test_pledge_after_deadline_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        // Move time past deadline
        timestamp::update_global_time_for_test_secs(1001);

        let creator_addr = signer::address_of(creator);
        crowdfund::pledge(backer1, creator_addr, 50000); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_claim_funds_success(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        let creator_addr = signer::address_of(creator);
        let initial_creator_balance = coin::balance<AptosCoin>(creator_addr);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        // Backers pledge enough to meet goal
        crowdfund::pledge(backer1, creator_addr, 60000);
        crowdfund::pledge(backer2, creator_addr, 50000);

        // Move past deadline
        timestamp::update_global_time_for_test_secs(1001);

        // Creator claims funds
        crowdfund::claim_funds(creator);

        // Check funds transferred to creator
        let creator_balance = coin::balance<AptosCoin>(creator_addr);
        assert!(creator_balance == initial_creator_balance + 110000, 1);

        // Check campaign marked as claimed
        let (_, _, _, _, _, claimed, _, escrow) = crowdfund::get_campaign_info(creator_addr);
        assert!(claimed, 2);
        assert!(escrow == 0, 3); // Escrow should be empty
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 3)] // ERROR_CAMPAIGN_NOT_OVER
    fun test_claim_funds_before_deadline_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        crowdfund::pledge(backer1, creator_addr, 100000);

        // Try to claim before deadline
        crowdfund::claim_funds(creator); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 2)] // ERROR_GOAL_NOT_REACHED
    fun test_claim_funds_goal_not_reached_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        crowdfund::pledge(backer1, creator_addr, 50000); // Not enough

        timestamp::update_global_time_for_test_secs(1001);

        crowdfund::claim_funds(creator); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 4)] // ERROR_ALREADY_CLAIMED
    fun test_claim_funds_twice_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        crowdfund::pledge(backer1, creator_addr, 100000);

        timestamp::update_global_time_for_test_secs(1001);

        crowdfund::claim_funds(creator);
        crowdfund::claim_funds(creator); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_refund_success(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        let backer1_addr = signer::address_of(backer1);
        let pledge_amount = 40000;

        // Backer pledges
        crowdfund::pledge(backer1, creator_addr, pledge_amount);

        let backer_balance_after_pledge = coin::balance<AptosCoin>(backer1_addr);

        // Move past deadline (goal not reached)
        timestamp::update_global_time_for_test_secs(1001);

        // Backer gets refund
        crowdfund::get_refund(backer1, creator_addr);

        // Check refund received
        let backer_balance_after_refund = coin::balance<AptosCoin>(backer1_addr);
        assert!(backer_balance_after_refund == backer_balance_after_pledge + pledge_amount, 1);

        // Check pledge marked as refunded
        let (backer_pledge, refunded) = crowdfund::get_backer_pledge(creator_addr, backer1_addr);
        assert!(backer_pledge == pledge_amount, 2);
        assert!(refunded, 3);

        // Check campaign state
        let (_, _, _, _, _, _, total_refunded, escrow) = crowdfund::get_campaign_info(creator_addr);
        assert!(total_refunded == pledge_amount, 4);
        assert!(escrow == 0, 5);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_multiple_refunds(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 200000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);

        // Both backers pledge
        crowdfund::pledge(backer1, creator_addr, 50000);
        crowdfund::pledge(backer2, creator_addr, 60000);

        timestamp::update_global_time_for_test_secs(1001);

        // Both get refunds
        crowdfund::get_refund(backer1, creator_addr);
        crowdfund::get_refund(backer2, creator_addr);

        // Check total refunded
        let (_, _, _, _, _, _, total_refunded, escrow) = crowdfund::get_campaign_info(creator_addr);
        assert!(total_refunded == 110000, 1);
        assert!(escrow == 0, 2);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 12)] // ERROR_CAMPAIGN_SUCCESSFUL
    fun test_refund_successful_campaign_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        crowdfund::pledge(backer1, creator_addr, 100000); // Goal reached

        timestamp::update_global_time_for_test_secs(1001);

        crowdfund::get_refund(backer1, creator_addr); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 8)] // ERROR_ALREADY_REFUNDED
    fun test_refund_twice_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);
        crowdfund::pledge(backer1, creator_addr, 40000);

        timestamp::update_global_time_for_test_secs(1001);

        crowdfund::get_refund(backer1, creator_addr);
        crowdfund::get_refund(backer1, creator_addr); // Should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    #[expected_failure(abort_code = 6)] // ERROR_NO_PLEDGE
    fun test_refund_no_pledge_fails(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);

        timestamp::update_global_time_for_test_secs(1001);

        crowdfund::get_refund(backer1, creator_addr); // Never pledged, should fail
    }

    #[test(aptos_framework = @0x1, creator = @0x123)]
    fun test_view_functions(
        aptos_framework: &signer,
        creator: &signer,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(creator));

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);

        // Test campaign_exists
        assert!(crowdfund::campaign_exists(creator_addr), 1);

        // Test is_campaign_active
        assert!(crowdfund::is_campaign_active(creator_addr), 2);

        // Move past deadline
        timestamp::update_global_time_for_test_secs(1001);
        assert!(!crowdfund::is_campaign_active(creator_addr), 3);
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_progress_percentage(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);

        // 0% progress
        let progress = crowdfund::get_progress_percentage(creator_addr);
        assert!(progress == 0, 1);

        // 50% progress
        crowdfund::pledge(backer1, creator_addr, 50000);
        progress = crowdfund::get_progress_percentage(creator_addr);
        assert!(progress == 5000, 2); // 5000 = 50.00%

        // 125% progress (over-funded)
        crowdfund::pledge(backer2, creator_addr, 75000);
        progress = crowdfund::get_progress_percentage(creator_addr);
        assert!(progress == 12500, 3); // 12500 = 125.00%
    }

    #[test(aptos_framework = @0x1, creator = @0x123, backer1 = @0x456, backer2 = @0x789)]
    fun test_is_campaign_successful(
        aptos_framework: &signer,
        creator: &signer,
        backer1: &signer,
        backer2: &signer,
    ) {
        setup_test(aptos_framework, creator, backer1, backer2);

        let goal = 100000;
        let deadline = 1000;
        let metadata = string::utf8(b"test-campaign");

        timestamp::update_global_time_for_test_secs(10);

        crowdfund::create_campaign(creator, goal, deadline, metadata);

        let creator_addr = signer::address_of(creator);

        // Not successful yet
        assert!(!crowdfund::is_campaign_successful(creator_addr), 1);

        // Reach goal
        crowdfund::pledge(backer1, creator_addr, 100000);
        assert!(crowdfund::is_campaign_successful(creator_addr), 2);
    }
}