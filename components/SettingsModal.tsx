
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onUpdateUsername: (name: string) => void;
  isAdminUnlocked: boolean;
  isAdminEnabled: boolean;
  onToggleAdmin: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  username, 
  onUpdateUsername,
  isAdminUnlocked,
  isAdminEnabled,
  onToggleAdmin
}) => {
  if (!isOpen) return null;

  const [tempName, setTempName] = useState(username);

  const handleSave = () => {
    onUpdateUsername(tempName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="w-full max-w-sm bg-slate-900 border border-yellow-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-white/10 flex justify-between items-center">
           <h2 className="font-display text-xl text-yellow-400 uppercase tracking-widest flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11V9.825c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             Cài Đặt
           </h2>
           <button onClick={onClose} className="text-slate-400 hover:text-white px-2">✕</button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Username Change */}
             <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Tên người chơi</label>
                <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={15}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white font-sans text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                />
             </div>

             {/* Hidden Toggle (Only if unlocked) */}
             {isAdminUnlocked && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex items-center justify-between animate-fade-in-up">
                    <div className="flex flex-col">
                        <span className="text-red-400 font-bold text-sm uppercase flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                             </svg>
                             Hệ thống VIP
                        </span>
                        <span className="text-[10px] text-red-300/70">Kích hoạt công cụ dự đoán.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isAdminEnabled}
                            onChange={(e) => onToggleAdmin(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>
             )}

             {/* Save Button */}
             <button
                onClick={handleSave}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
             >
                LƯU THAY ĐỔI
             </button>
        </div>
      </div>
    </div>
  );
};
