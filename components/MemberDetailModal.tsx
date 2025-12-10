import React from 'react';
import { X, Phone, Calendar, User, CreditCard, Shield, Briefcase, UserCog, MessageCircle } from 'lucide-react';
import { Member, Gender } from '../types';

interface MemberDetailModalProps {
  member: Member;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  const getWhatsAppUrl = (phone: string) => {
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Photo */}
        <div className="relative h-32 bg-brand-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-16 left-8 p-1 bg-white rounded-full shadow-md">
            <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden border-4 border-white">
              {member.photoUrl ? (
                <img src={member.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-3xl font-bold">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800">{member.firstName} {member.lastName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium border border-brand-200">
                {member.role}
              </span>
              <span className="text-slate-500 text-sm flex items-center gap-1">
                • <CreditCard size={14} /> {member.cardNumber}
              </span>
              {member.profession && (
                <span className="text-slate-600 text-sm flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                   <Briefcase size={12} /> {member.profession}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Informations Personnelles</h3>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Genre</p>
                  <p className="font-medium text-slate-800">{member.gender}</p>
                </div>
              </div>

              {member.phone && (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Téléphone</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{member.phone}</p>
                      <a 
                        href={getWhatsAppUrl(member.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                        title="Envoyer un message WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {member.profession && (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Profession</p>
                    <p className="font-medium text-slate-800">{member.profession}</p>
                  </div>
                </div>
              )}

              {member.gender === Gender.ENFANT && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600/80">Tuteur Responsable</p>
                      <p className="font-bold text-amber-800">{member.guardianName}</p>
                    </div>
                  </div>
                  {member.guardianPhone && (
                     <div className="ml-12 flex items-center gap-2 text-sm text-amber-700">
                       <Phone size={14} />
                       <span>{member.guardianPhone}</span>
                       <a 
                        href={getWhatsAppUrl(member.guardianPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 ml-1"
                        title="WhatsApp Tuteur"
                      >
                        <MessageCircle size={14} />
                      </a>
                     </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Statut Dahira</h3>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date d'adhésion</p>
                  <p className="font-medium text-slate-800">
                    {new Date(member.joinDate).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cotisation Annuelle</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {member.annualFee.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserCog size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fonction Dahira</p>
                  <p className="font-medium text-slate-800">
                    {member.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};