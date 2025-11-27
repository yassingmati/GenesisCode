import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPathsByCategory, getCategories } from '../../services/courseService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Chip, Spacer
} from "@nextui-org/react";
import { IconRoute, IconChevronRight, IconArrowLeft } from '@tabler/icons-react';

/**
 * SpecificCategoryPaths.jsx - Redesigned with NextUI and Shared Layout
 */

export default function SpecificCategoryPaths() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [paths, setPaths] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [pathsData, categoriesData] = await Promise.all([
          getPathsByCategory(categoryId),
          getCategories('specific')
        ]);

        setPaths(pathsData || []);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setCategory(currentCategory);
      } catch (e) {
        setError('Erreur lors du chargement des parcours');
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  const categoryName = category?.translations?.fr?.name || 'Langage';

  return (
    <ClientPageLayout
      title={<span>Parcours <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{categoryName}</span></span>}
      subtitle={`Choisis le parcours qui correspond le mieux à ton niveau et tes objectifs pour maîtriser ${categoryName}.`}
      breadcrumbs={[
        { label: 'Langages', path: '/learning/choose-language' },
        { label: categoryName }
      ]}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      backPath="/learning/choose-language"
      backLabel="Retour aux langages"
    >
      {paths.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-slate-700">
          <CardBody>
            <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">Aucun parcours disponible</h3>
            <p className="text-gray-500 dark:text-gray-400">Les parcours pour {categoryName} seront bientôt disponibles.</p>
            <Spacer y={4} />
            <Button
              variant="light"
              color="primary"
              startContent={<IconArrowLeft size={18} />}
              onPress={() => navigate('/learning/choose-language')}
            >
              Retour aux langages
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paths.map((path, index) => (
            <Card
              key={path._id}
              isPressable
              onPress={() => navigate(`/learning/specific/${categoryId}/paths/${path._id}`)}
              className="group hover:-translate-y-2 transition-transform duration-300 border-none shadow-lg hover:shadow-2xl bg-white dark:bg-slate-800 overflow-visible"
            >
              <CardBody className="p-0 relative overflow-hidden rounded-t-xl">
                {/* Card Header Gradient */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative p-6 flex items-start justify-between">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-white">
                    <IconRoute size={32} />
                  </div>
                  <Chip
                    size="sm"
                    variant="solid"
                    classNames={{ base: "bg-white/20 backdrop-blur-md border-none text-white font-bold" }}
                  >
                    Parcours {index + 1}
                  </Chip>
                </div>

                {/* Content */}
                <div className="p-6 pt-8">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {path?.translations?.fr?.name || 'Parcours'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                    {path?.translations?.fr?.description || 'Commence ce parcours pour progresser en ' + categoryName}
                  </p>
                </div>
              </CardBody>

              <CardFooter className="px-6 pb-6 pt-0 bg-transparent border-none">
                <Button
                  className="w-full font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                  color="primary"
                  variant="flat"
                  endContent={<IconChevronRight size={18} />}
                >
                  Voir les niveaux
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </ClientPageLayout>
  );
}