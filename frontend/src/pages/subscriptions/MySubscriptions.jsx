import React, { useEffect, useState } from 'react';
import SubscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';
import {
  Card, CardBody, CardHeader, Button, Chip, Spinner, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell
} from "@nextui-org/react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IconPremiumRights, IconCalendarTime, IconHistory, IconDownload } from '@tabler/icons-react';

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subs = await SubscriptionService.getMySubscriptions();
      setSubscriptions(subs || []);
    } catch (err) {
      console.error('Erreur chargement abonnements:', err);
      toast.error('Impossible de charger vos abonnements.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (subscriptionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cet abonnement ? Vous perdrez l\'accès à la fin de la période.')) {
      return;
    }

    try {
      await SubscriptionService.cancelSubscription(subscriptionId);
      toast.success('Abonnement annulé avec succès.');
      loadSubscriptions();
    } catch (err) {
      console.error('Erreur annulation:', err);
      toast.error('Erreur lors de l\'annulation.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" color="primary" label="Chargement des abonnements..." />
      </div>
    );
  }

  // Filter Active vs Inactive
  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing');
  const inactiveSubs = subscriptions.filter(s => s.status !== 'active' && s.status !== 'trialing');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 mb-2">
          Mes Abonnements
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gérez vos plans et accès aux catégories d'apprentissage.
        </p>
      </div>

      {/* Active Subscriptions Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <IconPremiumRights className="text-blue-500" size={24} />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Plans Actifs</h2>
        </div>

        {activeSubs.length === 0 ? (
          <Card className="border-none shadow-sm bg-gray-50 dark:bg-slate-800/50">
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconPremiumRights className="text-blue-500" size={32} />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Aucun abonnement actif.</p>
              <p className="text-sm text-gray-400 mb-6">Accédez à des cours premium pour commencer.</p>
              <Button color="primary" href="/plans" as="a" variant="shadow" className="font-semibold">
                Découvrir les offres
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSubs.map(sub => (
              <Card key={sub._id} className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-900 overflow-visible hover:scale-[1.02] transition-transform duration-300">
                <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
                  <div className="flex justify-between w-full mb-2">
                    <Chip color="success" variant="shadow" size="sm" className="uppercase font-bold tracking-wider text-[10px]">
                      ACTIF
                    </Chip>
                    {sub.priceMonthly > 0 ? (
                      <span className="font-bold text-xl text-gray-900 dark:text-white">
                        {(sub.priceMonthly / 100).toFixed(2)} <span className="text-sm text-gray-500 font-normal">TND/mo</span>
                      </span>
                    ) : (
                      <span className="font-bold text-lg text-emerald-500">GRATUIT</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                    {sub.plan?.name || sub.categoryPlan?.name || 'Accès Premium'}
                  </h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {sub.plan?.description || "Accès complet au parcours d'apprentissage."}
                  </div>
                </CardHeader>
                <CardBody className="px-6 py-6 overflow-visible">
                  <Divider className="my-4 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <IconCalendarTime size={16} /> Début
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), 'dd MMM yyyy', { locale: fr }) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <IconHistory size={16} /> Fin / Renouvellement
                      </span>
                      <span className={`font-medium ${sub.cancelAtPeriodEnd ? 'text-orange-500' : 'text-blue-600'}`}>
                        {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy', { locale: fr }) : 'Illimité'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    {!sub.cancelAtPeriodEnd && sub.priceMonthly > 0 && (
                      <Button
                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 font-medium"
                        variant="flat"
                        onPress={() => handleCancel(sub._id)}
                      >
                        Annuler
                      </Button>
                    )}
                    {/* Could add 'Upgrade' button here */}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* History / Inactive Section */}
      {inactiveSubs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <IconHistory className="text-gray-500" size={24} />
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Historique / Expirés</h2>
          </div>
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <Table removeWrapper aria-label="Historique abonnements">
              <TableHeader>
                <TableColumn>PLAN</TableColumn>
                <TableColumn>PÉRIODE</TableColumn>
                <TableColumn>MONTANT</TableColumn>
                <TableColumn>STATUT</TableColumn>
              </TableHeader>
              <TableBody>
                {inactiveSubs.map(sub => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <span className="font-medium">{sub.plan?.name || 'Inconnu'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500">
                        Du {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), 'dd/MM/yy') : '?'} au {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd/MM/yy') : '?'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.priceMonthly > 0 ? `${(sub.priceMonthly / 100).toFixed(2)}` : '0'} TND
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default">{sub.status}</Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {/* Invoice History */}
      {subscriptions.some(sub => sub.paymentHistory && sub.paymentHistory.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <IconDownload className="text-gray-500" size={24} />
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Factures</h2>
          </div>
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <Table removeWrapper aria-label="Historique des paiements">
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>PLAN</TableColumn>
                <TableColumn>MONTANT</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTION</TableColumn>
              </TableHeader>
              <TableBody>
                {subscriptions.flatMap(sub =>
                  (sub.paymentHistory || []).map((payment, idx) => ({
                    ...payment,
                    planName: sub.plan?.name,
                    subId: sub._id,
                    key: `${sub._id}-${idx}`
                  }))
                ).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).map((payment) => (
                  <TableRow key={payment.key}>
                    <TableCell>{payment.paidAt ? format(new Date(payment.paidAt), 'dd MMM yyyy', { locale: fr }) : '-'}</TableCell>
                    <TableCell><span className="font-medium">{payment.planName}</span></TableCell>
                    <TableCell>{payment.amount ? `${(payment.amount / 100).toFixed(2)} ${payment.currency}` : 'Gratuit'}</TableCell>
                    <TableCell>
                      <Chip size="sm" color={payment.status === 'completed' || payment.status === 'paid' ? 'success' : 'warning'} variant="dot">
                        {payment.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        startContent={<IconDownload size={14} />}
                        onPress={() => SubscriptionService.downloadInvoice(payment.subId)}
                        isDisabled={!payment.status || (payment.status !== 'completed' && payment.status !== 'paid')}
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

    </div>
  );
}
