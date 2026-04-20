import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Info, X } from 'lucide-react';

/**
 * DemoMode Component
 * Shows predefined transaction scenarios for easy hackathon demo
 */
export default function DemoMode({ onScenarioSelect, isOpen, onClose }) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    {
      id: 'normal',
      title: 'Normal Transaction',
      emoji: '✅',
      color: 'green',
      description: 'Typical transaction within user profile',
      details: [
        '✓ Amount: $75 (within typical range)',
        '✓ Location: New York (primary location)',
        '✓ Time: 2:00 PM (business hours)',
        '✓ Device: Known device',
        '✓ Category: Shopping',
      ],
    },
    {
      id: 'suspicious',
      title: 'Suspicious Transaction',
      emoji: '🟡',
      color: 'amber',
      description: 'Requires verification - unusual patterns detected',
      details: [
        '⚠️ Amount: $250 (3.3x average)',
        '⚠️ Location: Tokyo (NEW location)',
        '⚠️ Time: 3:00 AM (unusual)',
        '⚠️ Device: Unknown device',
        '⚠️ Needs challenge verification',
      ],
    },
    {
      id: 'fraud',
      title: 'Likely Fraud',
      emoji: '🚩',
      color: 'red',
      description: 'Multiple fraud indicators - transaction declined',
      details: [
        '🚩 Amount: $2,000 (26.7x average)',
        '🚩 Location: Dubai (international)',
        '🚩 Time: 4:00 AM (night)',
        '🚩 Device: Unknown device',
        '🚩 Category: Transfer (high-risk)',
      ],
    },
  ];

  const handleScenarioClicked = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleConfirm = (scenario) => {
    onScenarioSelect(scenario);
    setSelectedScenario(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-clay p-6 border-b border-clay-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-clay-900">🎬 Demo Scenarios</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-clay-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedScenario ? (
            <>
              <p className="text-clay-600 mb-6">
                Select a predefined scenario to test fraud detection in real-time. Perfect for demo presentations!
              </p>

              {/* Scenario Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioClicked(scenario)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      scenario.color === 'green'
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : scenario.color === 'amber'
                        ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                        : 'border-red-300 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <div className="text-3xl mb-2">{scenario.emoji}</div>
                    <h3 className="font-bold text-clay-900 mb-1">{scenario.title}</h3>
                    <p className="text-sm text-clay-600">{scenario.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-clay-700">
                      <Play className="w-3 h-3" />
                      Click to view
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Scenario Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-6xl">{selectedScenario.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-clay-900">{selectedScenario.title}</h3>
                    <p className="text-clay-600">{selectedScenario.description}</p>
                  </div>
                </div>

                {/* Details List */}
                <div className="bg-clay-50 rounded-lg p-4 space-y-3">
                  {selectedScenario.details.map((detail, i) => (
                    <div key={i} className="text-sm text-clay-700 flex items-start gap-2">
                      <span className="text-base mt-0.5 flex-shrink-0">{detail.substring(0, 1)}</span>
                      <span>{detail.substring(1)}</span>
                    </div>
                  ))}
                </div>

                {/* Information Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>What happens next:</strong>
                    {selectedScenario.id === 'normal' && (
                      <p className="mt-1">The transaction will be APPROVED automatically with a low risk score.</p>
                    )}
                    {selectedScenario.id === 'suspicious' && (
                      <p className="mt-1">The transaction will require CHALLENGE verification due to multiple unusual patterns.</p>
                    )}
                    {selectedScenario.id === 'fraud' && (
                      <p className="mt-1">The transaction will be DECLINED due to severe fraud indicators.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="flex-1 py-3 px-4 bg-clay-100 text-clay-900 font-bold rounded-lg hover:bg-clay-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleConfirm(selectedScenario)}
                    className={`flex-1 py-3 px-4 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      selectedScenario.color === 'green'
                        ? 'bg-gradient-trust-high hover:shadow-lg'
                        : selectedScenario.color === 'amber'
                        ? 'bg-gradient-trust-medium hover:shadow-lg'
                        : 'bg-gradient-trust-low hover:shadow-lg'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Run Scenario
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
