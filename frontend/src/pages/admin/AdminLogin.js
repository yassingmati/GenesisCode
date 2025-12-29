import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginAdmin } from '../../api/adminService';
import { motion } from 'framer-motion';
import { Card, CardBody, Input, Button, Image } from "@nextui-org/react";
import { IconMail, IconLock, IconLogin, IconShieldLock } from '@tabler/icons-react';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, admin } = await loginAdmin({ email, password });
      setToken(token);
      setAdmin(admin);
      toast.success("Bienvenue Admin !");
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-6">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardBody className="p-8 gap-6">
            <div className="text-center mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <IconShieldLock size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Administration</h1>
              <p className="text-gray-400 text-sm">Accéder au panneau de contrôle Genesis</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                label="Email"
                placeholder="admin@genesis.code"
                value={email}
                onValueChange={setEmail}
                startContent={<IconMail className="text-gray-400" size={20} />}
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-white/5 border-white/10 hover:border-white/20 focus-within:!border-blue-500",
                  input: "text-white",
                  label: "text-gray-400"
                }}
                isRequired
              />
              <Input
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onValueChange={setPassword}
                startContent={<IconLock className="text-gray-400" size={20} />}
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-white/5 border-white/10 hover:border-white/20 focus-within:!border-blue-500",
                  input: "text-white",
                  label: "text-gray-400"
                }}
                isRequired
              />

              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 mt-2"
                size="lg"
                isLoading={loading}
                startContent={!loading && <IconLogin size={20} />}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="text-center text-xs text-gray-500 mt-2">
              <p>Accès réservé au personnel autorisé uniquement.</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
