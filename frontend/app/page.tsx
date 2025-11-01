'use client';

import { useState, useEffect } from "react";
import { CreateCampaign } from "@/components/CreateCampaign";
import { CampaignCard } from "@/components/CampaignCard";
import { viewFunctions } from "@/lib/aptos";

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [searchAddress, setSearchAddress] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  const handleAddCampaign = () => {
    // Refresh campaigns after creating
    if (showAllCampaigns) {
      loadAllCampaigns();
    }
  };

  const loadAllCampaigns = async () => {
    setLoading(true);
    try {
      const allCampaigns = await viewFunctions.getAllCampaigns();
      const total = await viewFunctions.getTotalCampaigns();
      setCampaigns(allCampaigns);
      setTotalCampaigns(total);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchAddress && !campaigns.includes(searchAddress)) {
      setCampaigns([...campaigns, searchAddress]);
      setSearchAddress("");
      setShowSearch(false);
    }
  };

  const handleShowAllCampaigns = async () => {
    const newState = !showAllCampaigns;
    setShowAllCampaigns(newState);
    
    if (newState) {
      await loadAllCampaigns();
    } else {
      setCampaigns([]);
      setTotalCampaigns(0);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center', paddingTop: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Decentralized Crowdfunding
        </h1>
        <p style={{
          color: '#9ca3af',
          fontSize: '1.125rem',
          maxWidth: '42rem',
          margin: '0 auto'
        }}>
          Fund projects transparently on Aptos blockchain with built-in escrow protection
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CreateCampaign onSuccess={handleAddCampaign} />
        
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1f2937',
            color: 'white',
            border: '1px solid #374151',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
        >
          <span>🔍</span>
          Search Campaign
        </button>

        <button
          onClick={handleShowAllCampaigns}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: showAllCampaigns ? '#059669' : '#1f2937',
            color: 'white',
            border: '1px solid ' + (showAllCampaigns ? '#10b981' : '#374151'),
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: showAllCampaigns ? '600' : 'normal',
            opacity: loading ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = showAllCampaigns ? '#047857' : '#374151';
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = showAllCampaigns ? '#059669' : '#1f2937';
          }}
        >
          <span>{loading ? '⏳' : '📋'}</span>
          {loading ? 'Loading...' : showAllCampaigns ? `Showing All (${totalCampaigns})` : 'All Active Campaigns'}
        </button>
      </div>

      {showSearch && (
        <div style={{ maxWidth: '42rem', margin: '0 auto 2rem' }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Find Campaign by Address
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="0x1234...abcd"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Add
              </button>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Enter the campaign creator's address to view their campaign
            </p>
          </div>
        </div>
      )}

      {campaigns.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{
            width: '96px',
            height: '96px',
            backgroundColor: '#1f2937',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem'
          }}>
            🔍
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#9ca3af' }}>
            No campaigns yet
          </h3>
          <p style={{ color: '#6b7280' }}>
            Create a campaign or click "All Active Campaigns" to discover projects
          </p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading campaigns...</p>
        </div>
      ) : (
        <>
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            Showing {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {campaigns.map((address) => (
              <CampaignCard key={address} address={address} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}