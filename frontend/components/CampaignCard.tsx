'use client';

import { useEffect, useState } from "react";
import { viewFunctions, convertOctasToApt, CampaignInfo } from "@/lib/aptos";
import Link from "next/link";

interface CampaignCardProps {
  address: string;
}

export function CampaignCard({ address }: CampaignCardProps) {
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [address]);

  const loadCampaign = async () => {
    try {
      const info = await viewFunctions.getCampaignInfo(address);
      if (info) {
        setCampaign(info);
        const prog = await viewFunctions.getProgressPercentage(address);
        setProgress(prog);
      }
    } catch (error) {
      console.error("Error loading campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{ height: '1.5rem', backgroundColor: '#1f2937', borderRadius: '4px', marginBottom: '1rem', width: '75%' }}></div>
        <div style={{ height: '1rem', backgroundColor: '#1f2937', borderRadius: '4px', marginBottom: '1.5rem', width: '50%' }}></div>
        <div style={{ height: '0.5rem', backgroundColor: '#1f2937', borderRadius: '4px', marginBottom: '1rem' }}></div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ height: '1rem', backgroundColor: '#1f2937', borderRadius: '4px', width: '33%' }}></div>
          <div style={{ height: '1rem', backgroundColor: '#1f2937', borderRadius: '4px', width: '33%' }}></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        <p>❌ Campaign not found</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#9ca3af' }}>
          Address: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>
    );
  }

  const metadata = JSON.parse(campaign.metadataId);
  const goalApt = convertOctasToApt(campaign.goal);
  const raisedApt = convertOctasToApt(campaign.totalRaised);
  const deadlineDate = new Date(Number(campaign.deadlineTimestamp) * 1000);
  const isActive = deadlineDate.getTime() > Date.now() && !campaign.fundsClaimed;
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Link href={`/campaign/${address}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '12px',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          height: '100%'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#1f2937';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: 'white',
              transition: 'color 0.3s'
            }}>
              {metadata.title}
            </h3>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {metadata.description}
            </p>
          </div>
          {isActive && (
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e',
              fontSize: '0.75rem',
              fontWeight: '500',
              borderRadius: '9999px',
              marginLeft: '0.5rem',
              whiteSpace: 'nowrap'
            }}>
              Active
            </span>
          )}
          {!isActive && Number(campaign.totalRaised) >= Number(campaign.goal) && (
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              fontSize: '0.75rem',
              fontWeight: '500',
              borderRadius: '9999px',
              marginLeft: '0.5rem',
              whiteSpace: 'nowrap'
            }}>
              Successful
            </span>
          )}
          {!isActive && Number(campaign.totalRaised) < Number(campaign.goal) && (
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: '500',
              borderRadius: '9999px',
              marginLeft: '0.5rem',
              whiteSpace: 'nowrap'
            }}>
              Failed
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#9ca3af' }}>Progress</span>
            <span style={{ fontWeight: '600', color: 'white' }}>{progress.toFixed(1)}%</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#1f2937',
            borderRadius: '9999px',
            height: '0.5rem',
            overflow: 'hidden'
          }}>
            <div
              style={{
                background: 'linear-gradient(90deg, #3b82f6 0%, #7c3aed 100%)',
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>🎯</span>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Goal</p>
              <p style={{ fontWeight: '600', color: 'white' }}>{goalApt.toFixed(2)} APT</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📈</span>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Raised</p>
              <p style={{ fontWeight: '600', color: 'white' }}>{raisedApt.toFixed(2)} APT</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>⏰</span>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Days Left</p>
              <p style={{ fontWeight: '600', color: 'white' }}>{isActive ? daysLeft : 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}