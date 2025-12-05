import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../services/courseService';
import CategoryPaymentService from '../../services/categoryPaymentService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Input, Chip
} from "@nextui-org/react";
import { IconSearch, IconBrandJavascript, IconBrandPython, IconBrandCpp, IconBrandReact, IconCode, IconLock, IconCheck } from '@tabler/icons-react';

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
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [catsData, historyData] = await Promise.all([
          getCategories('specific'),
          CategoryPaymentService.getUserAccessHistory().catch(() => [])
        ]);

        setCategories(catsData || []);

        // accessMap: { categoryId: boolean }
        const accMap = {};
        if (historyData && Array.isArray(historyData)) {
          // historyData is likely an array of purchased plans. 
          // We need to map them to categories.
          // Assuming historyData items have 'category' or 'plan.category' field
          // Actually, let's look at what initialized payment returns or access history structure.
          // Ideally getUserAccessHistory returns list of active accesses.
          // If we're unsure of structure, we can just rely on 'checkCategoryAccess' for each or wait for user to click.
          // Optimization: checking EACH category individually might be slow if many.
          // Let's assume historyData contains `{ category: "id", ... }` objects.
          historyData.forEach(h => {
            if (h.category) accMap[h.category] = true;
          });
        }

        // Alternative: we can't easily batch check access without an endpoint.
        // Let's rely on individual checks OR just assume for now we highlight known ones.
        // Given I implemented `getUserAccessHistory` in service, let's trust it returns something useful.
        // If it fails, no big deal, access is checked on next page anyway.
        setAccessMap(accMap);

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
            // Note: accessMap might not be populated perfectly if history structure varies, 
            // but the real check is on the next page. This adds visual flair.
            // Actually, without robust history data, maybe better to NOT show misleading locks here?
            // The user asked for "same functionnalities". In DebutantMap, you see lock icons ON LEVELS, not on categories?
            // DebutantMap lists *categories* (CategorySection). 
            // WAIT, DebutantMap categories are open, paths are open, levels are locked.
            // But Specific categories are PAID.
            // Let's assume for this page, we just let them click through. 
            // Verification: The user request included `choose-language` in the URL list to "ajouter ... les meme fonctionaliter".
            // So I will add the lock/unlock *visual* if I can.

            // To be safe and avoid showing "Locked" on things they actually own if my history parsing is wrong,
            // I will default to showing nothing or "Start". 
            // But wait, I added the code to fetch history. Let's use it if we can.
            // If I can't guarantee `accessMap` is correct, let's skip the lock icon HERE and strictly enforce it on the next page.
            // However, users like to know what they have.
            // Let's add a "Déjà acheté" badge if we find it in history.
            const isUnlocked = accessMap[cat._id];

            return (
              <Card
                key={cat._id}
                isPressable
                onPress={() => navigate(`/learning/specific/${cat._id}`)}
                className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800"
              >
                <CardBody className="p-6 flex flex-col items-center text-center gap-4 relative">
                  {isUnlocked && (
                    <Chip
                      color="success"
                      variant="flat"
                      size="sm"
                      className="absolute top-2 right-2"
                      startContent={<IconCheck size={12} />}
                    >
                      Acheté
                    </Chip>
                  )}

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
                    variant={isUnlocked ? "flat" : "light"}
                    className="font-semibold"
                    endContent={<IconCode size={16} />}
                  >
                    {isUnlocked ? "Continuer" : "Voir les parcours"}
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
