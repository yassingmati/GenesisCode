import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getApiUrl } from '../../utils/apiConfig';
import { Card, CardBody, CardHeader, Input, Button, Divider } from "@nextui-org/react";
import { IconMail, IconSend, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function InviteChild() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    childEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.childEmail.trim()) {
      setError('L\'email de l\'enfant est requis');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.childEmail)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));
      const response = await fetch(`${API_BASE_URL}/api/parent/invite-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'invitation');
      }

      setSuccess(`Invitation envoyée avec succès à ${formData.childEmail}`);
      setFormData({ childEmail: '' });

      setTimeout(() => {
        navigate('/parent/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Erreur invitation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="light"
          startContent={<IconArrowLeft size={18} />}
          onClick={() => navigate('/parent/dashboard')}
          className="mb-6 text-gray-600 dark:text-gray-300"
        >
          Retour au dashboard
        </Button>

        <Card className="bg-white dark:bg-slate-800 shadow-md">
          <CardHeader className="flex flex-col gap-2 p-6 pb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inviter un enfant</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Ajoutez votre enfant à votre compte parent pour suivre ses progrès et gérer ses paramètres.
            </p>
          </CardHeader>

          <Divider className="my-4" />

          <CardBody className="p-6 pt-0">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300 mb-2">
                <IconMail size={20} />
                Comment ça marche ?
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Entrez l'email de votre enfant. Il recevra une invitation par email et pourra accepter
                de partager ses données avec vous. Une fois acceptée, vous pourrez suivre ses progrès
                et configurer les contrôles parentaux.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <Input
                  type="email"
                  name="childEmail"
                  label="Email de l'enfant"
                  placeholder="enfant@exemple.com"
                  value={formData.childEmail}
                  onChange={handleChange}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<IconMail className="text-gray-400" size={18} />}
                  errorMessage={error}
                  isInvalid={!!error}
                  isDisabled={loading}
                  classNames={{
                    inputWrapper: "bg-white dark:bg-slate-900",
                  }}
                />
                {success && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-2 font-medium">
                    {success}
                  </p>
                )}
              </div>

              <div className="flex gap-4 justify-end mt-2">
                <Button
                  variant="flat"
                  color="default"
                  onPress={() => navigate('/parent/dashboard')}
                  isDisabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={loading}
                  startContent={!loading && <IconSend size={18} />}
                >
                  Envoyer l'invitation
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
