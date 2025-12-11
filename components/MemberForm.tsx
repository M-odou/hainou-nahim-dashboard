import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, AlertCircle, Calendar } from 'lucide-react';
import { Gender, Role, Member } from '../types';

interface MemberFormProps {
  existingMember?: Member | null;
  onSave: (member: Member) => void;
  onCancel: () => void;
  existingCardNumbers: string[];
}

export const MemberForm: React.FC<MemberFormProps> = ({ existingMember, onSave, onCancel, existingCardNumbers }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    role: Role.MEMBRE,
    gender: Gender.HOMME,
    annualFee: 5000,
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingMember) {
      setFormData({
        ...existingMember,
        joinDate: existingMember.joinDate.split('T')[0] // Format for input date
      });
    }
  }, [existingMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.firstName || !formData.lastName || !formData.cardNumber) {
      setError("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    // Phone validation (Simple check for digits and length) - Optional for child if not provided, but usually child has no phone
    // We enforce phone for Adult, or Guardian Phone for Child
    if (formData.gender !== Gender.ENFANT && !formData.phone) {
       setError("Le numéro de téléphone est obligatoire pour les adultes.");
       return;
    }

    if (formData.gender === Gender.ENFANT && (!formData.guardianName || !formData.guardianPhone)) {
       setError("Le nom et le téléphone du tuteur sont obligatoires pour un enfant.");
       return;
    }

    const phoneRegex = /^[0-9+ ]{8,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError("Numéro de téléphone membre invalide.");
      return;
    }
    if (formData.guardianPhone && !phoneRegex.test(formData.guardianPhone)) {
        setError("Numéro de téléphone du tuteur invalide.");
        return;
    }

    // Unique Card Number Validation
    if (!existingMember && existingCardNumbers.includes(formData.cardNumber)) {
      setError(`Le numéro de carte ${formData.cardNumber} existe déjà.`);
      return;
    }
    
    // If editing, check if changed card number conflicts
    if (existingMember && existingMember.cardNumber !== formData.cardNumber && existingCardNumbers.includes(formData.cardNumber)) {
        setError(`Le numéro de carte ${formData.cardNumber} existe déjà.`);
        return;
    }

    // Construct final object
    const finalMember: Member = {
      id: existingMember?.id || crypto.randomUUID(),
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      phone: formData.phone || '', // Allow empty for child if guardian present
      role: formData.role as Role,
      gender: formData.gender as Gender,
      annualFee: Number(formData.annualFee),
      cardNumber: formData.cardNumber!,
      photoUrl: formData.photoUrl,
      joinDate: formData.joinDate!,
      profession: formData.profession,
      guardianName: formData.gender === Gender.ENFANT ? formData.guardianName : undefined,
      guardianPhone: formData.gender === Gender.ENFANT ? formData.guardianPhone : undefined
    };

    onSave(finalMember);
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300 placeholder-slate-400";
  const selectClass = "w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300 cursor-pointer appearance-none";
  const labelClass = "block text-sm font-medium text-slate-600 mb-1.5 ml-1";

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-brand-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">
          {existingMember ? 'Modifier le membre' : 'Nouveau Membre'}
        </h2>
        <button onClick={onCancel} className="text-brand-100 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100 animate-in shake">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Photo Upload Section */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div 
            className="w-32 h-32 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all duration-300 relative group shadow-inner"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="text-center p-2 transition-transform duration-300 group-hover:scale-105">
                <Upload className="mx-auto text-slate-400 mb-1 group-hover:text-brand-500" size={20} />
                <span className="text-xs text-slate-400 group-hover:text-brand-600">Ajouter Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
               <span className="text-white text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Modifier</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="space-y-5 min-w-0">
             <div>
              <label className={labelClass}>Prénom *</label>
              <input
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Moussa"
              />
            </div>
            <div>
              <label className={labelClass}>Nom *</label>
              <input
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Diop"
              />
            </div>
             <div>
              <label className={labelClass}>Genre *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={selectClass}
              >
                {Object.values(Gender).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            {/* Conditional Guardian Fields */}
            {formData.gender === Gender.ENFANT && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Information Tuteur</h4>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1.5 ml-1">Nom du Tuteur *</label>
                  <input
                    name="guardianName"
                    value={formData.guardianName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-amber-200 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all duration-300 placeholder:text-amber-300"
                    placeholder="Parent ou responsable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-1.5 ml-1">Téléphone du Tuteur *</label>
                  <input
                    name="guardianPhone"
                    type="tel"
                    value={formData.guardianPhone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-amber-200 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all duration-300 placeholder:text-amber-300"
                    placeholder="77 000 00 00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dahira & Professional Info */}
          <div className="space-y-5 min-w-0">
            <div>
              <label className={labelClass}>
                {formData.gender === Gender.ENFANT ? 'Téléphone (optionnel)' : 'Téléphone *'}
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="77 000 00 00"
              />
            </div>

            <div>
              <label className={labelClass}>Profession / Métier</label>
              <input
                name="profession"
                value={formData.profession || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: Enseignant, Commerçant..."
              />
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            <div>
              <label className={labelClass}>N° Carte Membre (Unique) *</label>
              <input
                name="cardNumber"
                value={formData.cardNumber || ''}
                onChange={handleChange}
                className={`${inputClass} font-mono ${error && error.includes('carte') ? 'border-red-400 bg-red-50 text-red-900 focus:ring-red-200 focus:border-red-500' : ''}`}
                placeholder="Ex: DHR-001"
              />
            </div>
            
            <div>
              <label className={labelClass}>Fonction au Dahira *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={selectClass}
              >
                {Object.values(Role).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="min-w-0">
                <label className={labelClass}>Cotisation (FCFA)</label>
                <input
                  name="annualFee"
                  type="number"
                  value={formData.annualFee || 0}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="min-w-0">
                <label className={labelClass}>Date d'adhésion</label>
                <div className="relative w-full">
                  <input
                    name="joinDate"
                    type="date"
                    value={formData.joinDate || ''}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                    title="Sélectionner ou saisir une date"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-600 pointer-events-none" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-8 py-3 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-lg shadow-brand-600/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Save size={18} />
            {existingMember ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};