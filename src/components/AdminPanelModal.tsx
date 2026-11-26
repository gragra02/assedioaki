import React, { useState, useMemo } from 'react';
import { Report, ReportComment, User, AccessLog } from '../types';
import { 
  getAdminConfig, changeAdminPassword, getRegisteredUsers, deleteUserById, toggleUserBlockStatus 
} from '../lib/adminAuth';
import { 
  getAccessLogs, exportAccessLogsToCSV, clearAccessLogs, getSystemTimeZone, getClientIp, addAccessLog 
} from '../lib/accessLogs';
import { 
  ShieldAlert, ShieldCheck, Lock, Trash2, FileText, Download, Printer, 
  Users, MessageSquare, AlertTriangle, Search, CheckCircle2, X, RefreshCw, KeyRound, Globe, Clock, Ban
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onDeleteReport: (reportId: string) => void;
  onDeleteComment: (reportId: string, commentId: string) => void;
  currentUser: User | null;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  reports,
  onDeleteReport,
  onDeleteComment,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'reports' | 'comments' | 'users' | 'logs'>('reports');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter states
  const [reportSearch, setReportSearch] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Confirmation modal state for deletion / blocking
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'report' | 'comment' | 'user' | 'logs' | 'block';
    targetId: string;
    extraId?: string;
    title: string;
    details: string;
  }>({
    isOpen: false,
    type: 'report',
    targetId: '',
    title: '',
    details: ''
  });

  // Local state for users and logs
  const [usersList, setUsersList] = useState<User[]>(() => getRegisteredUsers());
  const [logsList, setLogsList] = useState<AccessLog[]>(() => getAccessLogs());
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Refresh lists
  const refreshUsers = () => setUsersList(getRegisteredUsers());
  const refreshLogs = () => setLogsList(getAccessLogs());

  // Collect all comments across all reports
  const allComments = useMemo(() => {
    const list: Array<{ report: Report; comment: ReportComment }> = [];
    reports.forEach(r => {
      if (r.comments && r.comments.length > 0) {
        r.comments.forEach(c => {
          list.push({ report: r, comment: c });
        });
      }
    });
    return list.sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    if (!reportSearch.trim()) return reports;
    const query = reportSearch.toLowerCase();
    return reports.filter(r => 
      r.id.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query) ||
      r.city.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    );
  }, [reports, reportSearch]);

  // Filtered comments
  const filteredComments = useMemo(() => {
    if (!commentSearch.trim()) return allComments;
    const query = commentSearch.toLowerCase();
    return allComments.filter(item => 
      item.comment.content.toLowerCase().includes(query) ||
      item.comment.authorName.toLowerCase().includes(query) ||
      (item.comment.ip && item.comment.ip.toLowerCase().includes(query)) ||
      item.report.id.toLowerCase().includes(query) ||
      item.report.title.toLowerCase().includes(query)
    );
  }, [allComments, commentSearch]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const query = userSearch.toLowerCase();
    return usersList.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.role && u.role.toLowerCase().includes(query))
    );
  }, [usersList, userSearch]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!logSearch.trim()) return logsList;
    const query = logSearch.toLowerCase();
    return logsList.filter(l => 
      l.action.toLowerCase().includes(query) ||
      l.userName.toLowerCase().includes(query) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(query)) ||
      l.ip.includes(query) ||
      l.timeZone.toLowerCase().includes(query) ||
      l.location.toLowerCase().includes(query)
    );
  }, [logsList, logSearch]);

  if (!isOpen) return null;

  // Handle password change
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'A nova senha e a confirmação não conferem.' });
      return;
    }

    const result = changeAdminPassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordFeedback({ type: 'success', message: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      refreshLogs();
    } else {
      setPasswordFeedback({ type: 'error', message: result.message });
    }
  };

  // Execute deletion after confirmation
  const handleExecuteDeletion = () => {
    const { type, targetId, extraId } = confirmModal;

    if (type === 'report') {
      const rep = reports.find(r => r.id === targetId);
      onDeleteReport(targetId);
      addAccessLog(`Exclusão de Postagem / Denúncia: ${targetId} (${rep?.title || ''})`, currentUser?.name || 'Administrador', currentUser?.email, 'admin');
      refreshLogs();
    } else if (type === 'comment' && extraId) {
      onDeleteComment(targetId, extraId);
      addAccessLog(`Exclusão de Comentário na Denúncia: ${targetId}`, currentUser?.name || 'Administrador', currentUser?.email, 'admin');
      refreshLogs();
    } else if (type === 'user') {
      deleteUserById(targetId);
      refreshUsers();
      refreshLogs();
    } else if (type === 'block') {
      toggleUserBlockStatus(targetId);
      refreshUsers();
      refreshLogs();
    } else if (type === 'logs') {
      clearAccessLogs();
      refreshLogs();
    }

    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const currentTimeZone = getSystemTimeZone();
  const currentIp = getClientIp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white font-heading">
                  Painel de Gestão e Administração
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Acesso Restrito SC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerenciamento de postagens, comentários, usuárias e emissão de logs de acesso com IP e Time Zone.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Fechar Painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Postagens ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comentários ({allComments.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); refreshUsers(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuárias/os ({usersList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('logs'); refreshLogs(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Logs de Acesso ({logsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'password'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Alterar Senha do Admin</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50">

          {/* TAB 1: GERENCIAR POSTAGENS (DENÚNCIAS) */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Exclusão e Moderação de Postagens</h3>
                  <p className="text-xs text-slate-500">Exclua postagens indevidas, duplicadas ou que violem os termos de uso seguro.</p>
                </div>
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por protocolo, título ou cidade..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  Nenhuma postagem encontrada para a busca informada.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredReports.map((rep) => (
                    <div 
                      key={rep.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5 hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-extrabold text-purple-900 text-xs bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {rep.id}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            (rep.riskLevel === 'grave' || rep.riskLevel === 'urgente' || rep.riskLevel === 'alto') ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            (rep.riskLevel === 'moderado' || rep.riskLevel === 'medio') ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            Gravidade: {rep.riskLevel}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rep.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {rep.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>📍 {rep.address}, {rep.city}</span>
                          <span>💬 {rep.comments ? rep.comments.length : 0} comentários</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Registrado: {new Date(rep.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            type: 'report',
                            targetId: rep.id,
                            title: `Excluir Denúncia ${rep.id}?`,
                            details: `Você está prestes a remover permanentemente a denúncia "${rep.title}". Todos os dados e comentários serão apagados do sistema.`
                          })}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Postagem</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GERENCIAR COMENTÁRIOS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Moderação e Exclusão de Comentários</h3>
                  <p className="text-xs text-slate-500">Exclua mensagens de ódio, identificações indevidas ou comentários ofensivos.</p>
                </div>
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar comentário ou autor..."
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {filteredComments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  Nenhum comentário registrado no sistema.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredComments.map(({ report, comment }) => (
                    <div 
                      key={comment.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{comment.authorName}</span>
                          {comment.isAnonymous && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                              🔒 Anônimo
                            </span>
                          )}
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-bold">
                            Denúncia #{report.id.replace(/^ASK-\d{4}-/, '')}: {report.title}
                          </span>
                          {/* IP Coletado de Auditoria */}
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                            <Globe className="w-3 h-3 text-rose-600" />
                            IP: {comment.ip || '177.136.241.102'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{comment.content}"
                        </p>
                      </div>

                      <button
                        onClick={() => setConfirmModal({
                          isOpen: true,
                          type: 'comment',
                          targetId: report.id,
                          extraId: comment.id,
                          title: `Excluir Comentário de ${comment.authorName}?`,
                          details: `O comentário "${comment.content.slice(0, 40)}..." será excluído permanentemente desta postagem.`
                        })}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-end sm:self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Comentário</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GERENCIAR USUÁRIOS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Gestão e Exclusão de Usuárias/os</h3>
                  <p className="text-xs text-slate-500">Visualize contas ativas no sistema e efetue exclusão conforme diretrizes da LGPD.</p>
                </div>
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar usuária/o por nome ou e-mail..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Nome / Identificação</th>
                        <th className="p-3.5">E-mail</th>
                        <th className="p-3.5">Perfil / Papel</th>
                        <th className="p-3.5">Autenticação</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-600">{u.email}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {u.role === 'admin' ? 'Administrador' : 'Usuária'}
                            </span>
                          </td>
                          <td className="p-3.5 capitalize text-slate-600">{u.authProvider}</td>
                          <td className="p-3.5">
                            {u.status === 'bloqueado' ? (
                              <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-extrabold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Bloqueada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativa
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {u.id !== 'usr-admin-1' && u.id !== 'usr-admin-master' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {u.status === 'bloqueado' ? (
                                  <button
                                    onClick={() => {
                                      toggleUserBlockStatus(u.id);
                                      refreshUsers();
                                      refreshLogs();
                                    }}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                    title="Desbloquear acesso desta usuária"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Desbloquear</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setConfirmModal({
                                      isOpen: true,
                                      type: 'block',
                                      targetId: u.id,
                                      title: `Bloquear Usuária(o) ${u.name}?`,
                                      details: `A conta com e-mail "${u.email}" será bloqueada imediatamente e não poderá efetuar login nem registrar denúncias na plataforma.`
                                    })}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-300 hover:border-amber-600 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                    title="Bloquear acesso desta usuária"
                                  >
                                    <Ban className="w-3 h-3" />
                                    <span>Bloquear Usuária</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => setConfirmModal({
                                    isOpen: true,
                                    type: 'user',
                                    targetId: u.id,
                                    title: `Excluir Usuária/o ${u.name}?`,
                                    details: `A conta com e-mail "${u.email}" será permanentemente removida do banco de dados.`
                                  })}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                  title="Excluir usuária"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Excluir</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Conta Principal</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGS DE ACESSO & EMISSÃO DE RELATÓRIO COM IP E TIME ZONE */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Header Box with IP and Time Zone metrics */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Auditoria e Relatório de Logs de Acesso</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rastreamento forense com registro de endereço IP, Fuso Horário (Time Zone), Usuário e Ação executada.
                    </p>
                  </div>

                  {/* Actions: Export CSV & Print Formal Report */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => exportAccessLogsToCSV(logsList)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Relatório (CSV)</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Relatório</span>
                    </button>
                    <button
                      onClick={refreshLogs}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                      title="Atualizar Logs"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* System Parameters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-900 font-bold uppercase block">Fuso Horário (Time Zone)</span>
                      <strong className="text-xs text-purple-950 font-black">{currentTimeZone}</strong>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-900 font-bold uppercase block">Endereço IP do Cliente</span>
                      <strong className="text-xs text-blue-950 font-mono font-black">{currentIp} (Florianópolis / SC)</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase block">Total de Registros Gravados</span>
                      <strong className="text-xs text-slate-900 font-black">{logsList.length} eventos auditados</strong>
                    </div>
                  </div>
                </div>

                {/* Search in logs */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar logs por ação, IP, usuário ou Time Zone..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Data e Hora</th>
                        <th className="p-3">Usuário(a)</th>
                        <th className="p-3">Ação Executada</th>
                        <th className="p-3">Endereço IP</th>
                        <th className="p-3">Time Zone</th>
                        <th className="p-3">Local Estimado</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-600 text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                            {log.userName}
                          </td>
                          <td className="p-3 text-slate-800 font-medium">
                            {log.action}
                          </td>
                          <td className="p-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                            {log.ip}
                          </td>
                          <td className="p-3 text-slate-600 text-[11px] whitespace-nowrap">
                            {log.timeZone}
                          </td>
                          <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">
                            {log.location}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ALTERAR SENHA DO ADMINISTRADOR */}
          {activeTab === 'password' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Alteração da Senha do Administrador</h3>
                    <p className="text-xs text-slate-500">Mantenha a senha da conta administrativa atualizada e segura.</p>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Credencial Padrão Inicial</span>
                  </div>
                  <p className="text-[11px] text-purple-900/90 leading-relaxed">
                    E-mail do Administrador: <strong className="text-purple-950">admin@assedioaki.sc.gov.br</strong><br />
                    Senha padrão inicial: <strong className="text-purple-950">admin123</strong>
                  </p>
                </div>

                {passwordFeedback && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 font-bold ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Senha Atual</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="password"
                        required
                        placeholder="Informe a senha atual..."
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="password"
                        required
                        placeholder="Mínimo de 6 caracteres..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="password"
                        required
                        placeholder="Repita a nova senha..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Salvar Nova Senha do Administrador</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Administrador logado: <strong>{currentUser?.name || 'Administrador Geral SC'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>

      </div>

      {/* CONFIRMATION DELETION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">{confirmModal.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{confirmModal.details}</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl text-[11px] font-semibold border ${
              confirmModal.type === 'block'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {confirmModal.type === 'block'
                ? '⚠️ O acesso da usuária será suspenso imediatamente. Ela não poderá logar até o desbloqueio.'
                : '⚠️ Esta operação é irreversível e ficará registrada nos relatórios de auditoria com seu IP e Time Zone.'}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteDeletion}
                className={`px-4 py-1.5 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 ${
                  confirmModal.type === 'block'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmModal.type === 'block' ? (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirmar Bloqueio</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
