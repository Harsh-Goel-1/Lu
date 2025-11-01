'use client';

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS, MODULE_NAME } from "@/lib/constants";
import { convertAptToOctas } from "@/lib/aptos";

export function CreateCampaign({ onSuccess }: { onSuccess?: () => void }) {
  const { signAndSubmitTransaction, connected, account } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    duration: "7",
    title: "",
    description: "",
  });

  const handleAiSuggest = async () => {
    if (!formData.title) {
      alert("Please enter a campaign title first");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/suggest-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, goal: formData.goal || "100" })
      });
      const data = await response.json();
      if (data.description) {
        setFormData({ ...formData, description: data.description });
      } else {
        alert("Failed to generate suggestion");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      alert("Failed to generate suggestion");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !account) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    try {
      const goalInOctas = convertAptToOctas(parseFloat(formData.goal));
      const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60;
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + durationInSeconds;

      const metadata = JSON.stringify({
        title: formData.title,
        description: formData.description,
      });

      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_campaign`,
          functionArguments: [goalInOctas, deadlineTimestamp, metadata, MODULE_ADDRESS],
        },
      });

      console.log("Campaign created:", response);
      alert("Campaign created successfully!");
      setIsOpen(false);
      setFormData({ goal: "", duration: "7", title: "", description: "" });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      alert(`Failed to create campaign: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>➕</span>
        Create Campaign
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '32rem',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
          Create New Campaign
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'white' }}>
              Campaign Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Save the Ocean"
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
                Description
              </label>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: aiLoading ? '#374151' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: aiLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!aiLoading) e.currentTarget.style.backgroundColor = '#6d28d9';
                }}
                onMouseOut={(e) => {
                  if (!aiLoading) e.currentTarget.style.backgroundColor = '#7c3aed';
                }}
              >
                {aiLoading ? '⏳ Generating...' : '✨ AI Suggest'}
              </button>
            </div>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Help us clean the ocean..."
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'white' }}>
              Funding Goal (APT)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="100"
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'white' }}>
              Campaign Duration (days)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                backgroundColor: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#374151' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}