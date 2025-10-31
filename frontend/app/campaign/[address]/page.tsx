'use client';

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { viewFunctions, convertOctasToApt, convertAptToOctas, CampaignInfo } from "@/lib/aptos";
import { MODULE_ADDRESS, MODULE_NAME } from "@/lib/constants";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CampaignDetailsPage() {
  const params = useParams();
  const address = params.address as string;
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [userPledge, setUserPledge] = useState({ amount: "0", refunded: false });
  const [progress, setProgress] = useState(0);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaignData();
  }, [address, account]);

  const loadCampaignData = async () => {
    try {
      const info = await viewFunctions.getCampaignInfo(address);
      if (info) {
        setCampaign(info);
        const prog = await viewFunctions.getProgressPercentage(address);
        setProgress(prog);
      }

      if (account?.address) {
        const pledge = await viewFunctions.getBackerPledge(address, account.address);
        if (pledge) {
          setUserPledge(pledge);
        }
      }
    } catch (error) {
      console.error("Error loading campaign:", error);
    }
  };

  const handlePledge = async () => {
    if (!connected || !pledgeAmount) return;
    setLoading(true);
    try {
      const amountInOctas = convertAptToOctas(parseFloat(pledgeAmount));
      await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::pledge`,
          functionArguments: [address, amountInOctas],
        },
      });
      alert("Pledge successful!");
      setPledgeAmount("");
      await loadCampaignData();
    } catch (error: any) {
      alert(`Pledge failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFunds = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::claim_funds`,
          functionArguments: [],
        },
      });
      alert("Funds claimed successfully!");
      await loadCampaignData();
    } catch (error: any) {
      alert(`Claim failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_refund`,
          functionArguments: [address],
        },
      });
      alert("Refund processed!");
      await loadCampaignData();
    } catch (error: any) {
      alert(`Refund failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) {
    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{ height: '2rem', backgroundColor: '#1f2937', borderRadius: '8px', width: '50%', marginBottom: '2rem' }}></div>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ height: '1.5rem', backgroundColor: '#1f2937', borderRadius: '8px', width: '75%', marginBottom: '1rem' }}></div>
            <div style={{ height: '1rem', backgroundColor: '#1f2937', borderRadius: '8px', width: '100%', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '1rem', backgroundColor: '#1f2937', borderRadius: '8px', width: '83.333333%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const metadata = JSON.parse(campaign.metadataId);
  const goalApt = convertOctasToApt(campaign.goal);
  const raisedApt = convertOctasToApt(campaign.totalRaised);
  const userPledgeApt = convertOctasToApt(userPledge.amount);
  const deadlineDate = new Date(Number(campaign.deadlineTimestamp) * 1000);
  const isActive = deadlineDate.getTime() > Date.now() && !campaign.fundsClaimed;
  const isSuccessful = raisedApt >= goalApt;
  const isCreator = account?.address === campaign.creator;
  const canClaim = isCreator && !isActive && isSuccessful && !campaign.fundsClaimed;
  const canRefund = !isActive && !isSuccessful && userPledgeApt > 0 && !userPledge.refunded;

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <Link href="/" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        color: '#9ca3af', 
        marginBottom: '1.5rem',
        textDecoration: 'none'
      }}>
        <span>←</span>
        Back to Campaigns
      </Link>

      <div style={{ 
        backgroundColor: '#111827', 
        border: '1px solid #1f2937', 
        borderRadius: '12px', 
        padding: '2rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
              {metadata.title}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              by{" "}
              <span style={{ fontFamily: 'monospace' }}>
                {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
              </span>
            </p>
          </div>
          {isActive && (
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              backgroundColor: 'rgba(34, 197, 94, 0.2)', 
              color: '#22c55e', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              borderRadius: '9999px' 
            }}>
              Active
            </span>
          )}
          {!isActive && isSuccessful && (
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              backgroundColor: 'rgba(59, 130, 246, 0.2)', 
              color: '#3b82f6', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              borderRadius: '9999px' 
            }}>
              Successful
            </span>
          )}
          {!isActive && !isSuccessful && (
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              borderRadius: '9999px' 
            }}>
              Failed
            </span>
          )}
        </div>

        <p style={{ color: '#d1d5db', marginBottom: '2rem', lineHeight: '1.625' }}>
          {metadata.description}
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <span style={{ color: '#9ca3af' }}>Funding Progress</span>
            <span style={{ fontWeight: '600', fontSize: '1.125rem', color: 'white' }}>{progress.toFixed(1)}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#1f2937', 
            borderRadius: '9999px', 
            height: '0.75rem', 
            overflow: 'hidden' 
          }}>
            <div
              style={{ 
                background: 'linear-gradient(90deg, #3b82f6 0%, #7c3aed 100%)', 
                height: '100%', 
                transition: 'width 0.5s',
                width: `${Math.min(progress, 100)}%`
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: 'rgba(59, 130, 246, 0.2)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🎯
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Goal</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                {goalApt.toFixed(2)} APT
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: 'rgba(34, 197, 94, 0.2)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📈
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Raised</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                {raisedApt.toFixed(2)} APT
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: 'rgba(234, 179, 8, 0.2)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              ⏰
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Deadline</p>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', margin: 0 }}>
                {deadlineDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: 'rgba(168, 85, 247, 0.2)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💰
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Your Pledge</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                {userPledgeApt.toFixed(2)} APT
              </p>
            </div>
          </div>
        </div>

        {isActive && (
          <div style={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.5)', 
            border: '1px solid #374151', 
            borderRadius: '8px', 
            padding: '1.5rem' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'white' }}>
              Make a Pledge
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
                placeholder="Amount in APT"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handlePledge}
                disabled={loading || !connected || !pledgeAmount}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading || !connected || !pledgeAmount ? '#374151' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading || !connected || !pledgeAmount ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (!loading && connected && pledgeAmount) {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading && connected && pledgeAmount) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {loading ? "Processing..." : "Pledge"}
              </button>
            </div>
          </div>
        )}

        {canClaim && (
          <button
            onClick={handleClaimFunds}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#374151' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#15803d';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#16a34a';
            }}
          >
            {loading ? "Processing..." : "Claim Funds"}
          </button>
        )}

        {canRefund && (
          <button
            onClick={handleRefund}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#374151' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#dc2626';
            }}
          >
            {loading ? "Processing..." : "Get Refund"}
          </button>
        )}
      </div>
    </div>
  );
}