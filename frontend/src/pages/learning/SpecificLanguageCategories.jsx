import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../services/courseService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Input
} from "@nextui-org/react";
import { IconSearch, IconBrandJavascript, IconBrandPython, IconBrandCpp, IconBrandReact, IconCode } from '@tabler/icons-react';

// Map language names to icons and colors
const getLanguageStyle = (name) => {
  const styles = {
    'JavaScript': { icon: IconBrandJavascript, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    'Python': { icon: IconBrandPython, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'React': { icon: IconBrandReact, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    'C++': { icon: IconBrandCpp, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    // Add more as needed
  };
  return styles[name] || { icon: IconCode, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-slate-700' };
};

export default function SpecificLanguageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories('specific');
        setCategories(data || []);
      } catch (e) {
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCategories = categories.filter(cat => {
    const name = cat?.translations?.fr?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <ClientPageLayout
      title="Choisir ton propre langage"
      subtitle="Sélectionne le langage de programmation que tu veux apprendre et commence ton parcours personnalisé."
      breadcrumbs={[{ label: 'Langages' }]}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      showBackButton={true}
      backPath="/dashboard"
      backLabel="Retour au tableau de bord"
      heroContent={
        <div className="mt-8 max-w-md mx-auto md:mx-0">
          <Input
            classNames={{
              base: "max-w-full sm:max-w-[20rem] h-12",
              mainWrapper: "h-full",
              input: "text-small text-slate-900 dark:text-white",
              inputWrapper: "h-full font-normal text-default-500 bg-white/90 backdrop-blur-md dark:bg-slate-800/50 dark:text-white",
            }}
            placeholder="Rechercher un langage..."
            size="lg"
            startContent={<IconSearch size={18} className="text-slate-500 dark:text-slate-400" />}
            value={searchTerm}
            onValueChange={setSearchTerm}
            type="search"
          />
        </div>
      }
    >
      {filteredCategories.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun langage trouvé pour "{searchTerm}"</p>
          <Button variant="light" color="primary" onPress={() => setSearchTerm('')} className="mt-4">
            Effacer la recherche
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map(cat => {
            const name = cat?.translations?.fr?.name || 'Langage';
            const style = getLanguageStyle(name);
            const Icon = style.icon;

            return (
              <Card
                key={cat._id}
                isPressable
                onPress={() => navigate(`/learning/specific/${cat._id}`)}
                className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800"
              >
                <CardBody className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${style.bg} flex items-center justify-center mb-2`}>
                    <Icon size={40} className={style.color} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Commence ton apprentissage en {name}
                    </p>
                  </div>
                </CardBody>
                <CardFooter className="pt-0 pb-6 justify-center">
                  <Button
                    color="primary"
                    variant="light"
                    className="font-semibold"
                    endContent={<IconCode size={16} />}
                  >
                    Voir les parcours
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </ClientPageLayout>
  );
}
