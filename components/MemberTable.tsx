import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit2, Phone, Baby, User, Eye, Download, MessageCircle } from 'lucide-react';
import { Member, Gender, Role } from '../types';

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onView: (member: Member) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    
    const matchesGender = filterGender === 'all' || member.gender === filterGender;
    const matchesRole = filterRole === 'all' || member.role === filterRole;

    return matchesSearch && matchesGender && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le membre ${name} ?`)) {
      onDelete(id);
    }
  };

  const handleExport = () => {
    const headers = [
      "ID Carte",
      "Prénom",
      "Nom",
      "Genre",
      "Rôle",
      "Téléphone",
      "Profession",
      "Cotisation",
      "Date d'adhésion",
      "Tuteur (Nom)",
      "Tuteur (Tél)"
    ];

    const rows = filteredMembers.map(m => [
      m.cardNumber,
      m.firstName,
      m.lastName,
      m.gender,
      m.role,
      m.phone,
      m.profession || '-',
      m.annualFee,
      m.joinDate,
      m.guardianName || '-',
      m.guardianPhone || '-'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `membres_hainou_nahim_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher (Nom, Tél, N° Carte)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all duration-300"
          />
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto items-center">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-600 focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="all">Tous Genres</option>
              {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-600 focus:bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none cursor-pointer transition-all"
            >
              <option value="all">Toutes Fonctions</option>
              {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm ml-2"
            title="Exporter en CSV"
          >
            <Download size={16} />
            <span className="hidden md:inline text-sm font-medium">Exporter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Membre</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle & Statut</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Cotisation</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-brand-200 transition-all">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                          <p className="text-xs text-slate-400 font-mono">{member.cardNumber}</p>
                          {member.guardianName && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                              <Baby size={10} /> Tuteur: {member.guardianName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {member.phone}
                      </div>
                      <p className="text-xs text-slate-400 pl-6 mt-0.5">Depuis {new Date(member.joinDate).toLocaleDateString('fr-FR')}</p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${member.role === Role.MEMBRE ? 'bg-slate-100 text-slate-600' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
                          {member.role}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <User size={12} /> {member.gender}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-slate-700">{member.annualFee.toLocaleString('fr-FR')} FCFA</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                         <button 
                          onClick={() => onView(member)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Voir Détails"
                        >
                          <Eye size={16} />
                        </button>
                        {(member.phone || member.guardianPhone) && (
                          <a 
                            href={`https://wa.me/${(member.guardianPhone || member.phone).replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Contacter sur WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => onEdit(member)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" 
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Aucun membre trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Page {currentPage} sur {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};