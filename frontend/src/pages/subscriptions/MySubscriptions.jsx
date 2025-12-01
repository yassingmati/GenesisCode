import React, { useEffect, useState } from 'react';
import SubscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      setSubscriptions(subs);
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
      loadSubscriptions(); // Recharger pour voir le statut mis à jour
    } catch (err) {
      console.error('Erreur annulation:', err);
      toast.error('Erreur lors de l\'annulation.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" label="Chargement..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mes Abonnements</h1>

      {subscriptions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-gray-500 text-lg">Vous n'avez aucun abonnement actif.</p>
            <Button color="primary" className="mt-4" href="/plans" as="a">
              Voir les offres
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {subscriptions.map((sub) => (
            <Card key={sub._id} className="w-full">
              <CardHeader className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-6 py-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold">{sub.plan?.name || 'Plan Inconnu'}</h3>
                  <Chip
                    color={sub.status === 'active' ? 'success' : sub.status === 'canceled' ? 'warning' : 'default'}
                    variant="flat"
                  >
                    {sub.status === 'active' ? 'Actif' : sub.status === 'canceled' ? 'Annulé' : sub.status}
                  </Chip>
                </div>
                <div className="text-sm text-gray-500">
                  {sub.priceMonthly > 0 ? `${(sub.priceMonthly / 100).toFixed(2)} TND / mois` : 'Gratuit'}
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date de début</p>
                    <p className="font-medium">
                      {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), 'dd MMMM yyyy', { locale: fr }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Prochaine échéance / Fin</p>
                    <p className="font-medium">
                      {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd MMMM yyyy', { locale: fr }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Renouvellement auto</p>
                    <p className="font-medium">
                      {sub.cancelAtPeriodEnd ? 'Non (Annulé)' : 'Oui'}
                    </p>
                  </div>
                </div>

                {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                  <div className="flex justify-end">
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={() => handleCancel(sub._id)}
                    >
                      Annuler l'abonnement
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Section Historique des Paiements (Si disponible dans l'objet subscription) */}
      {subscriptions.some(sub => sub.paymentHistory && sub.paymentHistory.length > 0) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Historique des Paiements</h2>
          <Card>
            <Table aria-label="Historique des paiements">
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>PLAN</TableColumn>
                <TableColumn>MONTANT</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>FACTURE</TableColumn>
              </TableHeader>
              <TableBody>
                {subscriptions.flatMap(sub =>
                  (sub.paymentHistory || []).map((payment, idx) => ({
                    ...payment,
                    planName: sub.plan?.name,
                    key: `${sub._id}-${idx}`
                  }))
                ).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).map((payment) => (
                  <TableRow key={payment.key}>
                    <TableCell>{payment.paidAt ? format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                    <TableCell>{payment.planName}</TableCell>
                    <TableCell>{payment.amount ? `${(payment.amount / 100).toFixed(2)} ${payment.currency}` : 'Gratuit'}</TableCell>
                    <TableCell>
                      <Chip size="sm" color={payment.status === 'completed' || payment.status === 'paid' || payment.status === 'free' ? 'success' : 'warning'}>
                        {payment.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => SubscriptionService.downloadInvoice(sub._id)}
                        isDisabled={!payment.status || (payment.status !== 'completed' && payment.status !== 'paid')}
                      >
                        Télécharger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
