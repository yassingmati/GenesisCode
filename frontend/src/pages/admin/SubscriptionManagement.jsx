import React from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiEdit, FiTrash2, FiFileText, FiPlus, FiX, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

/* ---------------- styled & utils (modernized) ---------------- */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;
const Page = styled.div`
  padding: 28px;
  animation: ${fadeIn} .28s ease-out;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #12202b;
  background: #f7f8fb;
  min-height: 100vh;
`;
const Container = styled.div` max-width:1200px; margin:0 auto; `;
const Header = styled.div`display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap;`;
const Title = styled.h2` margin:0; font-size:20px; color:#0f1720; `;
const Controls = styled.div` display:flex; gap:8px; align-items:center; flex-wrap:wrap; `;
const SearchInput = styled.input`
  padding:10px 12px; border-radius:10px; border:1px solid #e6e8ee; min-width:260px;
  box-shadow: 0 2px 6px rgba(15, 23, 32, 0.03);
`;
const ActionButton = styled.button`
  padding:8px 12px; border-radius:10px; border:1px solid #e2e6ef;
  background: ${(p) => (p.primary ? '#0b67ff' : 'white')};
  color: ${(p) => (p.primary ? 'white' : '#0f1720')};
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  display:inline-flex; gap:8px; align-items:center; font-weight:500;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  box-shadow: ${(p) => (p.primary ? '0 6px 18px rgba(11,103,255,0.12)' : 'none')};
`;
const CardGrid = styled.div` display:grid; grid-template-columns: 1fr 380px; gap:18px; align-items:start;`;
const LeftColumn = styled.div``;
const RightColumn = styled.div``;

const TableCard = styled.div`
  background:white; border-radius:12px; padding:12px; box-shadow:0 6px 18px rgba(15,23,32,0.04);
`;
const Table = styled.table`
  width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;
  th, td { padding:12px 10px; border-bottom:1px solid #f1f5f9; text-align:left; vertical-align:middle; }
  th { color:#39434f; text-transform:uppercase; font-size:12px; letter-spacing:0.02em; }
  tbody tr:hover { background:#fbfcff; }
`;
const Small = styled.small` color:#6b7280; font-size:13px; `;
const Badge = styled.span`
  display:inline-block; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600;
  background:${p => p.bg || '#eef2ff'}; color:${p => p.color || '#243b8c'};
`;
const FooterPager = styled.div` margin-top:12px; display:flex; justify-content:space-between; gap:8px; align-items:center; `;

/* Modal */
const ModalBackdrop = styled.div` position:fixed; inset:0; background:rgba(3,7,18,0.45); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; `;
const Modal = styled.div` width:760px; max-width:100%; background:white; padding:18px; border-radius:12px; box-shadow:0 12px 40px rgba(2,6,23,0.18); `;
const ModalHeader = styled.div` display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px; `;
const ModalTitle = styled.h3` margin:0; font-size:18px; `;
const CloseBtn = styled.button` background:transparent; border:0; cursor:pointer; padding:6px; border-radius:8px; &:hover{ background:#f3f4f6 }`;

/* form layout */
const Field = styled.div` margin-bottom:10px; `;
const Label = styled.label` display:block; font-size:13px; margin-bottom:6px; color:#334155; `;
const Input = styled.input` width:100%; padding:10px; border-radius:8px; border:1px solid #e6e8ee; font-size:14px; `;
const Textarea = styled.textarea` width:100%; padding:10px; border-radius:8px; border:1px solid #e6e8ee; min-height:88px; font-size:14px; `;
const Row = styled.div` display:flex; gap:8px; align-items:center; `;
const SmallNote = styled.div` color:#64748b; font-size:13px; margin-top:6px;`;

/* plan preview cards */
const PlansList = styled.div` display:grid; grid-template-columns: 1fr; gap:10px; `;
const PlanCard = styled.div`
  background: linear-gradient(180deg, #fff, #fbfdff); padding:12px; border-radius:10px; display:flex; justify-content:space-between; gap:12px;
  border:1px solid #eef2ff;
`;
const PlanMeta = styled.div``;
const PlanTitle = styled.div` font-weight:700; font-size:15px; color:#0b1320; `;
const PlanPrice = styled.div` margin-top:6px; font-weight:600; color:#0b67ff; `;
const FeatureList = styled.ul` margin:8px 0 0 16px; color:#475569; font-size:13px;`;

/* chips for features */
const Chips = styled.div` display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; `;
const Chip = styled.span`
  background:#eef2ff; color:#0b67ff; padding:6px 8px; border-radius:999px; font-size:13px; display:inline-flex; gap:6px; align-items:center;
`;

/* spinner */
const Spinner = styled.div`
  width:28px; height:28px; border-radius:50%; border:3px solid rgba(0,0,0,0.06); border-top-color:#0b67ff; animation:spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg) } }
`;

/* helpers */
function formatPriceFromCents(cents, currency = 'EUR') {
  if (cents == null) return '—';
  const value = Number(cents) / 100;
  // simple currency mapping
  const symbol = currency === 'TND' ? 'TND' : currency === 'USD' ? '$' : '€';
  return `${symbol} ${value.toFixed(2)}`;
}
function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}
function statusStyle(status) {
  switch (status) {
    case 'active': return { bg: '#e6ffef', color: '#007a3d' };
    case 'trialing': return { bg: '#fff7e6', color: '#b97400' };
    case 'past_due': return { bg: '#fff0f0', color: '#b20' };
    case 'canceled': return { bg: '#f5f5f5', color: '#666' };
    case 'incomplete': return { bg: '#fff0f0', color: '#b20' };
    default: return { bg: '#eef2ff', color: '#243b8c' };
  }
}

/* ---------------- component ---------------- */
export default function SubscriptionManagement() {
  const { token } = useAuth();
  const mounted = useRef(true);

  // subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // plans
  const [plans, setPlans] = useState([]);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // for edit

  // UI state
  const [globalAction, setGlobalAction] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  // controllers
  const subsControllerRef = useRef(null);
  const plansControllerRef = useRef(null);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // axios instance
  const api = useMemo(() => {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const instance = axios.create({ baseURL: API_BASE, withCredentials: true, timeout: 20000 });

    instance.interceptors.request.use(cfg => {
      const effectiveToken = token || localStorage.getItem('adminToken');
      if (effectiveToken) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${effectiveToken}` };
      return cfg;
    }, e => Promise.reject(e));

    instance.interceptors.response.use(r => r, err => {
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Non autorisé — veuillez vous reconnecter en tant qu'administrateur.");
      }
      return Promise.reject(err);
    });

    return instance;
  }, [token]);

  /* ----- fetchPlans ----- */
  const fetchPlans = useCallback(async () => {
    setPlanLoading(true);
    if (plansControllerRef.current) plansControllerRef.current.abort();
    const c = new AbortController(); plansControllerRef.current = c;
    try {
      const res = await api.get('/api/admin/subscriptions/plans', { signal: c.signal });
      if (!mounted.current) return;
      const data = res.data && res.data.plans ? res.data.plans : (Array.isArray(res.data) ? res.data : []);
      setPlans(data);
    } catch (err) {
      if (err.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('fetchPlans', err);
      toast.error(err?.response?.data?.message || 'Impossible de récupérer les plans');
      setPlans([]);
    } finally {
      if (mounted.current) setPlanLoading(false);
      plansControllerRef.current = null;
    }
  }, [api]);

  /* ----- fetchSubscriptions ----- */
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    if (subsControllerRef.current) subsControllerRef.current.abort();
    const c = new AbortController(); subsControllerRef.current = c;
    try {
      const res = await api.get('/api/admin/subscriptions', { params: { page, limit, search: debouncedSearch || undefined }, signal: c.signal });
      if (!mounted.current) return;
      setSubscriptions(res.data.subscriptions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (err.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('fetchSubscriptions', err);
      const status = err?.response?.status;
      if (status === 404) {
        toast.error('Endpoint /api/admin/subscriptions introuvable (404). Vérifie le backend.');
      } else {
        toast.error(err?.response?.data?.message || 'Erreur lors du chargement des abonnements');
      }
      setSubscriptions([]);
      setTotalPages(1);
    } finally {
      if (mounted.current) setLoading(false);
      subsControllerRef.current = null;
    }
  }, [api, page, limit, debouncedSearch]);

  useEffect(() => { fetchPlans(); fetchSubscriptions(); }, [fetchPlans, fetchSubscriptions]);

  /* ----- helpers for button states ----- */
  const setLoadingFor = useCallback((id, val) => setActionLoading(prev => ({ ...prev, [id]: val })), []);

  /* ----- change plan (modal handled below) ----- */
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState('');

  const openChangePlanModal = useCallback((user) => { setSelectedUser(user); setNewPlan(user.planId || ''); setShowChangePlanModal(true); }, []);

  const handleChangePlan = useCallback(async () => {
    if (!selectedUser) return;
    if (!newPlan) return toast.warn('Choisissez un plan');
    setGlobalAction(true); setLoadingFor(selectedUser._id, true);
    try {
      const res = await api.put(`/api/admin/subscriptions/${selectedUser._id}/change-plan`, { planId: newPlan });
      toast.success(res.data.message || 'Plan mis à jour');
      setShowChangePlanModal(false);
      await fetchSubscriptions();
    } catch (err) {
      console.error('changePlan', err);
      toast.error(err?.response?.data?.message || 'Erreur lors du changement de plan');
    } finally {
      setGlobalAction(false); setLoadingFor(selectedUser._id, false);
    }
  }, [api, selectedUser, newPlan, fetchSubscriptions, setLoadingFor]);

  /* ----- cancel / resume ----- */
  const postAction = useCallback(async (userId, path, successMsg) => {
    setLoadingFor(userId, true);
    try {
      const res = await api.post(path);
      toast.success(res.data.message || successMsg);
      await fetchSubscriptions();
      setConfirmAction(null);
    } catch (err) {
      console.error('postAction', err);
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setLoadingFor(userId, false);
    }
  }, [api, fetchSubscriptions, setLoadingFor]);

  const handleCancel = useCallback((user) => setConfirmAction({ type: 'cancel', user }), []);
  const handleResume = useCallback((user) => setConfirmAction({ type: 'resume', user }), []);

  const confirmPerform = useCallback(async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    if (type === 'cancel') await postAction(user._id, `/api/admin/subscriptions/${user._id}/cancel`, 'Annulation programmée');
    else await postAction(user._id, `/api/admin/subscriptions/${user._id}/resume`, 'Abonnement réactivé');
  }, [confirmAction, postAction]);

  /* ----- billing portal ----- */
  const openBillingPortal = useCallback(async (user) => {
    setLoadingFor(user._id, true);
    try {
      const res = await api.get(`/api/admin/subscriptions/${user._id}/billing-portal`);
      const url = res.data.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else toast.error('URL portal introuvable');
    } catch (err) {
      console.error('openBillingPortal', err);
      toast.error(err?.response?.data?.message || 'Impossible d\'ouvrir le billing portal');
    } finally {
      setLoadingFor(user._id, false);
    }
  }, [api, setLoadingFor]);

  /* ----- refresh single user ----- */
  const refreshUser = useCallback(async (user) => {
    setLoadingFor(user._id, true);
    try {
      await api.get(`/api/admin/subscriptions/${user._id}`);
      toast.success('État rafraîchi');
      await fetchSubscriptions();
    } catch (err) {
      console.error('refreshUser', err);
      toast.error('Erreur rafraîchissement');
    } finally {
      setLoadingFor(user._id, false);
    }
  }, [api, fetchSubscriptions, setLoadingFor]);

  /* ----- export CSV ----- */
  const exportCSV = useCallback(() => {
    if (!subscriptions || subscriptions.length === 0) return toast.info('Aucun abonnement à exporter');
    const header = ['_id','email','firstName','lastName','planId','status','currentPeriodEnd','stripeCustomerId','stripeSubscriptionId','cancelAtPeriodEnd'];
    const rows = subscriptions.map(u => header.map(h => {
      const v = u[h];
      if (v === null || v === undefined) return '';
      if (h === 'currentPeriodEnd') {
        try { return (new Date(v)).toISOString(); } catch { return ''; }
      }
      if (typeof v === 'string' || typeof v === 'number') return String(v).replace(/"/g, '""');
      return JSON.stringify(v).replace(/"/g, '""');
    }).map(cell => `"${cell}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = `subscriptions_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link); link.click(); link.remove();
    toast.success('Export CSV téléchargé');
  }, [subscriptions]);

  const renderStatus = useCallback((s) => { const st = statusStyle(s); return <Badge bg={st.bg} color={st.color}>{s || '—'}</Badge>; }, []);
  const planOptions = useMemo(() => plans.map(p => ({ id: p._id, label: `${p.name} ${p.priceMonthly ? `— ${formatPriceFromCents(p.priceMonthly, p.currency)}` : ''}`, raw: p })), [plans]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setShowChangePlanModal(false); setConfirmAction(null); setPlansModalOpen(false); setSelectedPlan(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------------- Plan CRUD (client-side UI + API calls) ---------------- */
  // plan form state uses decimal price input for UX
  const [planForm, setPlanForm] = useState({
    _id: '', name: '', description: '', priceDisplay: '', // priceDisplay = decimal string like "9.99"
    currency: 'TND', interval: 'month', active: true, featuresList: []
  });
  const [featureInput, setFeatureInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const openCreatePlan = useCallback(() => {
    setSelectedPlan(null);
    setPlanForm({ _id: '', name: '', description: '', priceDisplay: '', currency: 'TND', interval: 'month', active: true, featuresList: [] });
    setFeatureInput('');
    setFormErrors({});
    setPlansModalOpen(true);
  }, []);

  const openEditPlan = useCallback((p) => {
    setSelectedPlan(p);
    setPlanForm({
      _id: p._id,
      name: p.name || '',
      description: p.description || '',
      priceDisplay: p.priceMonthly != null ? String((Number(p.priceMonthly) / 100).toFixed(2)) : '',
      currency: p.currency || 'TND',
      interval: p.interval || 'month',
      active: !!p.active,
      featuresList: Array.isArray(p.features) ? p.features.slice() : (p.features ? [p.features] : [])
    });
    setFeatureInput('');
    setFormErrors({});
    setPlansModalOpen(true);
  }, []);

  // features helpers
  const addFeature = useCallback(() => {
    const v = featureInput.trim();
    if (!v) return;
    setPlanForm(f => ({ ...f, featuresList: [...f.featuresList, v] }));
    setFeatureInput('');
  }, [featureInput]);

  const removeFeature = useCallback((idx) => {
    setPlanForm(f => ({ ...f, featuresList: f.featuresList.filter((_, i) => i !== idx) }));
  }, []);

  const validatePlanForm = useCallback(() => {
    const errs = {};
    if (!planForm._id || !String(planForm._id).trim()) errs._id = 'Identifiant requis';
    if (!planForm.name || !planForm.name.trim()) errs.name = 'Nom requis';
    if (planForm.priceDisplay && isNaN(Number(planForm.priceDisplay.replace(',', '.')))) errs.priceDisplay = 'Prix invalide';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }, [planForm]);

  const savePlan = useCallback(async () => {
    if (!validatePlanForm()) return toast.warn('Corrigez les erreurs du formulaire');
    setPlanLoading(true);
    try {
      const payload = {
        _id: String(planForm._id).trim(),
        name: (planForm.name || '').trim(),
        description: planForm.description || '',
        // convert decimal string to cents (e.g., "9.99" -> 999)
        priceCents: planForm.priceDisplay ? Math.round(Number(String(planForm.priceDisplay).replace(',', '.')) * 100) : null,
        currency: planForm.currency,
        interval: planForm.interval,
        active: !!planForm.active,
        features: Array.isArray(planForm.featuresList) ? planForm.featuresList.filter(Boolean) : []
      };

      if (selectedPlan) {
        const res = await api.put(`/api/admin/subscriptions/plans/${encodeURIComponent(selectedPlan._id)}`, payload);
        toast.success(res.data.message || 'Plan mis à jour');
      } else {
        const res = await api.post('/api/admin/subscriptions/plans', payload);
        toast.success(res.data.message || 'Plan créé');
      }

      await fetchPlans();
      setPlansModalOpen(false);
      setSelectedPlan(null);

    } catch (err) {
      console.error('savePlan', err);
      toast.error(err?.response?.data?.message || 'Erreur sauvegarde plan');
    } finally {
      if (mounted.current) setPlanLoading(false);
    }
  }, [api, planForm, selectedPlan, fetchPlans, validatePlanForm]);

  const deletePlan = useCallback(async (planId, hard = false) => {
    if (!planId) return;
    try {
      setGlobalAction(true);
      const url = `/api/admin/subscriptions/plans/${encodeURIComponent(planId)}${hard ? '?hard=true' : ''}`;
      const res = await api.delete(url);
      toast.success(res.data.message || 'Plan supprimé');
      await fetchPlans();
    } catch (err) {
      console.error('deletePlan', err);
      toast.error(err?.response?.data?.message || 'Erreur suppression plan');
    } finally {
      setGlobalAction(false);
    }
  }, [api, fetchPlans]);

  /* ---------------- render ---------------- */
  return (
    <Page>
      <Container>
        <ToastContainer position="top-right" />
        <Header>
          <Title>Gestion des abonnements</Title>
          <Controls>
            <SearchInput
              placeholder="Rechercher par email, nom ou plan..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              aria-label="Rechercher abonnements"
            />

            <ActionButton onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); fetchSubscriptions(); }} title="Réinitialiser & rafraîchir">
              <FiRefreshCw /> Rafraîchir
            </ActionButton>

            <ActionButton onClick={exportCSV} title="Exporter CSV">
              <FiFileText /> Export CSV
            </ActionButton>

            <ActionButton onClick={openCreatePlan} primary title="Créer plan">
              <FiPlus /> Plan
            </ActionButton>

            <ActionButton disabled={globalAction} onClick={fetchPlans} title="Rafraîchir plans">Plans</ActionButton>
          </Controls>
        </Header>

        <CardGrid>
          <LeftColumn>
            <TableCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ fontWeight:700 }}>{subscriptions.length}</div>
                  <Small>abonnements affichés</Small>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <Small>Items / page</Small>
                  <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>

              <Table role="table" aria-label="Tableau des abonnements">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Statut</th>
                    <th>Période actuelle</th>
                    <th style={{ minWidth: 260 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign:'center', padding:20 }}><Spinner /></td></tr>
                  ) : subscriptions.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding:20 }}>Aucun abonnement trouvé</td></tr>
                  ) : subscriptions.map(u => (
                    <tr key={u._id}>
                      <td>{u.firstName || '—'} <Small>{u.lastName || ''}</Small></td>
                      <td><Small>{u.email}</Small></td>
                      <td>
                        {/* try to show plan name if available */}
                        {(() => {
                          const found = plans.find(p => p._id === u.planId);
                          return found ? <div><strong>{found.name}</strong><Small> • {found._id}</Small></div> : (u.planId || '—');
                        })()}
                      </td>
                      <td>{renderStatus(u.status)}</td>
                      <td>{u.currentPeriodEnd ? formatDate(u.currentPeriodEnd) : '—'}</td>
                      <td style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <ActionButton onClick={() => openChangePlanModal(u)} title="Modifier le plan" disabled={!!actionLoading[u._id]}><FiEdit />Modifier</ActionButton>

                        {u.status !== 'canceled' ? (
                          <ActionButton onClick={() => handleCancel(u)} title="Annuler" disabled={!!actionLoading[u._id]}><FiTrash2 />Annuler</ActionButton>
                        ) : (
                          <ActionButton onClick={() => handleResume(u)} title="Réactiver" disabled={!!actionLoading[u._id]}>Réactiver</ActionButton>
                        )}

                        <ActionButton onClick={() => openBillingPortal(u)} disabled={!!actionLoading[u._id]}>Portal</ActionButton>
                        <ActionButton onClick={() => refreshUser(u)} disabled={!!actionLoading[u._id]}>Rafraîchir</ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <FooterPager>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <ActionButton disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))}><FiChevronLeft /> Prev</ActionButton>
                  <div>Page {page} / {totalPages}</div>
                  <ActionButton disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next <FiChevronRight /></ActionButton>
                </div>

                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <Small>Filtrer / Trier</Small>
                  {/* you can extend with sort/filter controls */}
                </div>
              </FooterPager>
            </TableCard>
          </LeftColumn>

          <RightColumn>
            <div style={{ display:'flex', gap:12, flexDirection:'column' }}>
              <TableCard>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>Plans existants</div>
                    <Small>Cliquez sur Edit pour modifier</Small>
                  </div>
                  <ActionButton onClick={fetchPlans} disabled={globalAction || planLoading}><FiRefreshCw /> Rafraîchir</ActionButton>
                </div>

                <div style={{ marginTop:12 }}>
                  {planLoading ? <div style={{ padding:12, textAlign:'center' }}><Spinner /></div> : (
                    <PlansList>
                      {plans.length === 0 ? <Small>Aucun plan</Small> : plans.map(p => (
                        <PlanCard key={p._id}>
                          <PlanMeta>
                            <PlanTitle>{p.name} <Small style={{ marginLeft:8 }}>({_ => p._id})</Small></PlanTitle>
                            <Small style={{ display:'block', marginTop:6 }}>{p.description || ''}</Small>
                            <PlanPrice>{p.priceMonthly ? formatPriceFromCents(p.priceMonthly, p.currency) : '—'} • {p.interval || '—'}</PlanPrice>

                            {Array.isArray(p.features) && p.features.length > 0 && (
                              <FeatureList>
                                {p.features.map((f, i) => <li key={i}>{f}</li>)}
                              </FeatureList>
                            )}
                          </PlanMeta>

                          <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                            <div style={{ display:'flex', gap:8 }}>
                              <ActionButton onClick={() => openEditPlan(p)}><FiEdit />Edit</ActionButton>
                              <ActionButton onClick={() => { if (window.confirm('Supprimer définitivement ce plan ?')) deletePlan(p._id, true); }}><FiTrash2 />Del</ActionButton>
                            </div>
                            <div>
                              <Badge bg={p.active ? '#e6ffef' : '#fff0f0'} color={p.active ? '#007a3d' : '#b20'}>
                                {p.active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                          </div>
                        </PlanCard>
                      ))}
                    </PlansList>
                  )}
                </div>
              </TableCard>

              {/* Quick tips card */}
              <TableCard>
                <div style={{ fontWeight:700, marginBottom:8 }}>Conseils UX</div>
                <ul style={{ margin:0, paddingLeft:18 }}>
                  <li><Small>Utilise des fonctionnalités courtes — elles s'affichent bien dans les cartes.</Small></li>
                  <li><Small>Préfère un prix clair (ex: 9.99) pour éviter confusions avec centimes.</Small></li>
                  <li><Small>Active la prévisualisation du plan pour voir l'apparence en front.</Small></li>
                </ul>
              </TableCard>
            </div>
          </RightColumn>
        </CardGrid>

        {/* Change Plan Modal */}
        {showChangePlanModal && selectedUser && (
          <ModalBackdrop onClick={() => setShowChangePlanModal(false)} role="dialog" aria-modal="true" aria-label="Modifier le plan">
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Changer le plan — {selectedUser.email}</ModalTitle>
                <CloseBtn onClick={() => setShowChangePlanModal(false)} aria-label="Fermer"><FiX /></CloseBtn>
              </ModalHeader>

              <Field>
                <Label>Plan</Label>
                <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 8, borderRadius: 8, border: '1px solid #e6e8ee' }} aria-label="Choisir plan">
                  <option value="">-- Choisir un plan --</option>
                  {planOptions.map(p => (<option key={p.id} value={p.id}>{p.label}</option>))}
                </select>
              </Field>

              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <ActionButton onClick={() => setShowChangePlanModal(false)}>Annuler</ActionButton>
                <ActionButton primary onClick={handleChangePlan} disabled={globalAction || !newPlan}>Confirmer</ActionButton>
              </div>
            </Modal>
          </ModalBackdrop>
        )}

        {/* Confirm cancel/resume */}
        {confirmAction && (
          <ModalBackdrop onClick={() => setConfirmAction(null)} role="dialog" aria-modal="true" aria-label="Confirmer action">
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>{confirmAction.type === 'cancel' ? 'Confirmer annulation' : 'Confirmer réactivation'}</ModalTitle>
                <CloseBtn onClick={() => setConfirmAction(null)} aria-label="Fermer"><FiX /></CloseBtn>
              </ModalHeader>

              <p>Êtes-vous sûr(e) de vouloir {confirmAction.type === 'cancel' ? 'programmer l\'annulation' : 'réactiver'} l'abonnement de <strong>{confirmAction.user.email}</strong> ?</p>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <ActionButton onClick={() => setConfirmAction(null)}>Annuler</ActionButton>
                <ActionButton primary onClick={confirmPerform} disabled={!!actionLoading[confirmAction.user._id]}>
                  {actionLoading[confirmAction.user._id] ? <Spinner /> : (confirmAction.type === 'cancel' ? 'Oui, annuler' : 'Oui, réactiver')}
                </ActionButton>
              </div>
            </Modal>
          </ModalBackdrop>
        )}

        {/* Plans modal (create / edit / list) */}
        {plansModalOpen && (
          <ModalBackdrop onClick={() => { setPlansModalOpen(false); setSelectedPlan(null); }} role="dialog" aria-modal="true" aria-label="Gérer les plans">
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>{selectedPlan ? 'Modifier le plan' : 'Créer un plan'}</ModalTitle>
                <CloseBtn onClick={() => { setPlansModalOpen(false); setSelectedPlan(null); }} aria-label="Fermer"><FiX /></CloseBtn>
              </ModalHeader>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
                <div>
                  <Field>
                    <Label>_id (identifiant unique)</Label>
                    <Input value={planForm._id} onChange={e => setPlanForm(f => ({ ...f, _id: e.target.value }))} disabled={!!selectedPlan} placeholder="ex: pro, basic, enterprise" />
                    {formErrors._id && <SmallNote style={{ color:'#b91c1c' }}>{formErrors._id}</SmallNote>}
                  </Field>

                  <Field>
                    <Label>Nom</Label>
                    <Input value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
                    {formErrors.name && <SmallNote style={{ color:'#b91c1c' }}>{formErrors.name}</SmallNote>}
                  </Field>

                  <Field>
                    <Label>Description</Label>
                    <Textarea value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} />
                  </Field>

                  <Row style={{ marginTop:8 }}>
                    <div style={{ flex: 1 }}>
                      <Field>
                        <Label>Prix (ex: 9.99)</Label>
                        <Input value={planForm.priceDisplay} onChange={e => {
                          // allow digits, dot, comma
                          const v = e.target.value;
                          if (/^[0-9]*[.,]?[0-9]{0,2}$/.test(v) || v === '') setPlanForm(f => ({ ...f, priceDisplay: v }));
                        }} placeholder="ex: 9.99" />
                        {formErrors.priceDisplay && <SmallNote style={{ color:'#b91c1c' }}>{formErrors.priceDisplay}</SmallNote>}
                      </Field>
                    </div>

                    <div style={{ width:120 }}>
                      <Field>
                        <Label>Devise</Label>
                        <select value={planForm.currency} onChange={e => setPlanForm(f => ({ ...f, currency: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8 }}>
                          <option value="TND">TND</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </Field>
                    </div>

                    <div style={{ width:140 }}>
                      <Field>
                        <Label>Intervalle</Label>
                        <select value={planForm.interval} onChange={e => setPlanForm(f => ({ ...f, interval: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8 }}>
                          <option value="month">Mensuel</option>
                          <option value="year">Annuel</option>
                        </select>
                      </Field>
                    </div>
                  </Row>

                  <Field>
                    <Label>Fonctionnalités (ajouter puis Enter ou clic)</Label>
                    <div style={{ display:'flex', gap:8 }}>
                      <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                        placeholder="ex: 10 projets, Support 24/7" />
                      <ActionButton onClick={addFeature}><FiPlus /></ActionButton>
                    </div>
                    <Chips>
                      {planForm.featuresList.map((f, i) => (
                        <Chip key={i}>
                          <span style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f}</span>
                          <button onClick={() => removeFeature(i)} style={{ background:'transparent', border:0, cursor:'pointer', padding:4 }} aria-label={`Supprimer ${f}`}><FiX /></button>
                        </Chip>
                      ))}
                      {planForm.featuresList.length === 0 && <SmallNote>Aucune fonctionnalité ajoutée</SmallNote>}
                    </Chips>
                  </Field>

                  <Field>
                    <Label>Actif</Label>
                    <label style={{ display:'inline-flex', gap:8, alignItems:'center' }}>
                      <input type="checkbox" checked={!!planForm.active} onChange={e => setPlanForm(f => ({ ...f, active: e.target.checked }))} />
                      <Small>Le plan sera disponible pour attribution</Small>
                    </label>
                  </Field>

                  <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
                    {selectedPlan && (
                      <ActionButton onClick={() => { if (window.confirm('Supprimer ce plan ? (soft delete)')) deletePlan(selectedPlan._id, false); }} disabled={globalAction}>Supprimer</ActionButton>
                    )}

                    <ActionButton onClick={() => { setPlansModalOpen(false); setSelectedPlan(null); }}>Annuler</ActionButton>
                    <ActionButton primary onClick={savePlan} disabled={planLoading}>
                      {planLoading ? <Spinner /> : (selectedPlan ? 'Enregistrer' : 'Créer')}
                    </ActionButton>
                  </div>
                </div>

                {/* preview side */}
                <div style={{ borderLeft: '1px dashed #eef2f7', paddingLeft:12 }}>
                  <div style={{ fontWeight:700 }}>Aperçu du plan</div>
                  <div style={{ marginTop:10 }}>
                    <div style={{ background:'#fff', borderRadius:10, padding:12, border:'1px solid #eef2ff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:16 }}>{planForm.name || 'Nom du plan'}</div>
                          <Small>{planForm._id ? `ID: ${planForm._id}` : 'ID: (requis)'}</Small>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:16, fontWeight:800 }}>{planForm.priceDisplay ? `${planForm.currency} ${planForm.priceDisplay}` : '—'}</div>
                          <Small>{planForm.interval === 'year' ? 'Annuel' : 'Mensuel'}</Small>
                        </div>
                      </div>

                      <div style={{ marginTop:10 }}>
                        <Small>{planForm.description || 'Description courte du plan...'}</Small>
                      </div>

                      <div style={{ marginTop:10 }}>
                        {planForm.featuresList.length === 0 ? <SmallNote>Aucune fonctionnalité</SmallNote> : (
                          <ul style={{ paddingLeft:16, margin:0 }}>
                            {planForm.featuresList.map((f, idx) => <li key={idx}><Small>{f}</Small></li>)}
                          </ul>
                        )}
                      </div>

                      <div style={{ marginTop:12, display:'flex', gap:8, justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          {planForm.active ? <Badge bg="#e6ffef" color="#007a3d">Actif</Badge> : <Badge bg="#fff0f0" color="#b20">Inactif</Badge>}
                        </div>
                        <div>
                          <ActionButton onClick={() => { /* quick preview action or copy id */ }}><FiCheck /> Tester</ActionButton>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop:12 }}>
                    <div style={{ fontWeight:700, marginBottom:8 }}>Aide</div>
                    <Small> - L'identifiant (_id) doit être unique et sans espaces.</Small><br />
                    <Small> - Prix : utilisez un format décimal (ex: 9.99)</Small>
                  </div>
                </div>
              </div>

            </Modal>
          </ModalBackdrop>
        )}
      </Container>
    </Page>
  );
}
