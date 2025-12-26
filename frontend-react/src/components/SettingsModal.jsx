import React from 'react';
import { X, Eye, EyeOff, Volume2, VolumeX, Sparkles, Zap, RotateCcw, CreditCard } from 'lucide-react';
import { useSettings } from '../hooks/useSettings.jsx';

/**
 * Settings Modal Component
 * Allows users to configure game preferences in a windowed popup
 */
const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  if (!isOpen) return null;

  const SettingToggle = ({ 
    icon: Icon, 
    title, 
    description, 
    settingKey, 
    value,
    iconColor = "text-blue-600",
    accentColor = "bg-blue-600"
  }) => (
    <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className={`${iconColor} bg-slate-50 p-2.5 rounded-xl`}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900 mb-0.5">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>
        
        <button
          onClick={() => updateSetting(settingKey, !value)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
            value ? accentColor : 'bg-slate-200'
          }`}
          role="switch"
          aria-checked={value}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-50 rounded-3xl shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Game Settings</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customize your experience</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-bold px-3 py-2 rounded-lg hover:bg-red-50"
              title="Reset to defaults"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline text-sm">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Privacy & Display */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800">Privacy & Display</h3>
            </div>
            
            <div className="grid sm:grid-cols-1 gap-4">
              <SettingToggle
                icon={Eye}
                title="Show Bank Values"
                description="Display the total money value in opponents' banks."
                settingKey="showBankValues"
                value={settings.showBankValues}
                iconColor="text-emerald-600"
                accentColor="bg-emerald-600"
              />
              
              <SettingToggle
                icon={CreditCard}
                title="Show Bank Cards"
                description="Display individual cards in opponents' banks."
                settingKey="showBankCards"
                value={settings.showBankCards}
                iconColor="text-green-600"
                accentColor="bg-green-600"
              />
            </div>
          </div>

          {/* Audio & Visual */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-purple-600 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800">Audio & Visual</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <SettingToggle
                icon={settings.soundEnabled ? Volume2 : VolumeX}
                title="Sound Effects"
                description="Enable game sounds."
                settingKey="soundEnabled"
                value={settings.soundEnabled}
                iconColor="text-purple-600"
                accentColor="bg-purple-600"
              />
              
              <SettingToggle
                icon={Sparkles}
                title="Animations"
                description="Enable smooth transitions."
                settingKey="animationsEnabled"
                value={settings.animationsEnabled}
                iconColor="text-pink-600"
                accentColor="bg-pink-600"
              />
            </div>
          </div>

          {/* Gameplay */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-orange-600 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800">Gameplay</h3>
            </div>
            
            <SettingToggle
              icon={Zap}
              title="Auto End Turn"
              description="Automatically end your turn when you have no moves left."
              settingKey="autoEndTurn"
              value={settings.autoEndTurn}
              iconColor="text-orange-600"
              accentColor="bg-orange-600"
            />
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-black mb-1">Settings are saved automatically</h3>
                <p className="text-xs text-blue-50 leading-relaxed opacity-90">
                  Your preferences are stored locally and will persist across sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-200 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

