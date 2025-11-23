import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import API_CONFIG from '../../config/api';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Badge,
  ScrollShadow,
  Spacer,
  Divider,
  Image,
  Tooltip,
  Checkbox
} from "@nextui-org/react";
import {
  IconSearch,
  IconFilter,
  IconGridDots,
  IconList,
  IconTimeline,
  IconPlayerPlay,
  IconFileText,
  IconX,
  IconArrowRight,
  IconBook,
  IconFolder,
  IconChartBar
} from '@tabler/icons-react';

const API_BASE = `${API_CONFIG.BASE_URL}/api/courses`;

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

export default function DebutantMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // États de l'interface
  const { language, setLanguage } = useLanguage();
  const lang = language;
  const [query, setQuery] = useState(() => localStorage.getItem('dm_q') || '');
  const [videoOnly, setVideoOnly] = useState(() => localStorage.getItem('dm_video') === '1');
  const [pdfOnly, setPdfOnly] = useState(() => localStorage.getItem('dm_pdf') === '1');
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem('dm_cat') || null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('dm_view') || 'grid');

  // États des données
  const [categories, setCategories] = useState([]);
  const [pathsByCategory, setPathsByCategory] = useState({});
  const [levelsByPath, setLevelsByPath] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États de l'interface
  const [showFilters, setShowFilters] = useState(false);
  const [previewLevel, setPreviewLevel] = useState(null);

  // Recherche avec debounce
  const [debouncedQ, setDebouncedQ] = useState(query);
  const qTimer = useRef(null);

  // Sauvegarde des préférences
  useEffect(() => { localStorage.setItem('dm_q', query); }, [query]);
  useEffect(() => { localStorage.setItem('dm_video', videoOnly ? '1' : '0'); }, [videoOnly]);
  useEffect(() => { localStorage.setItem('dm_pdf', pdfOnly ? '1' : '0'); }, [pdfOnly]);
  useEffect(() => { localStorage.setItem('dm_cat', activeCategory || ''); }, [activeCategory]);
  useEffect(() => { localStorage.setItem('dm_view', viewMode); }, [viewMode]);

  // Debounce de la recherche
  useEffect(() => {
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => setDebouncedQ((query || '').trim().toLowerCase()), 300);
    return () => clearTimeout(qTimer.current);
  }, [query]);

  // Chargement des données
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const rc = await fetch(`${API_BASE}/categories`, { headers: API_CONFIG.getDefaultHeaders() });
        if (!rc.ok) throw new Error(`Erreur catégories: ${rc.status}`);
        const cats = await rc.json();

        if (!mounted) return;
        console.log('[DebutantMap] Categories fetched:', cats.length, cats);
        setCategories(cats || []);

        const pmap = {};
        await Promise.all((cats || []).map(async (cat) => {
          try {
            const rp = await fetch(`${API_BASE}/categories/${cat._id}/paths`, { headers: API_CONFIG.getDefaultHeaders() });
            pmap[cat._id] = rp.ok ? (await rp.json()) : [];
            console.log(`[DebutantMap] Paths for category ${cat.translations?.fr?.name}:`, pmap[cat._id].length);
          } catch { pmap[cat._id] = []; }
        }));

        if (!mounted) return;
        console.log('[DebutantMap] Total paths by category:', pmap);
        setPathsByCategory(pmap);

        const allPaths = Object.values(pmap).flat();
        console.log('[DebutantMap] Total paths:', allPaths.length);
        const lmap = {};
        await Promise.all(allPaths.map(async p => {
          try {
            const rl = await fetch(`${API_BASE}/paths/${p._id}/levels`, { headers: API_CONFIG.getDefaultHeaders() });
            lmap[p._id] = rl.ok ? (await rl.json()) : [];
            console.log(`[DebutantMap] Levels for path ${p.translations?.fr?.name}:`, lmap[p._id].length);
          } catch { lmap[p._id] = []; }
        }));

        if (!mounted) return;
        console.log('[DebutantMap] Total levels by path:', lmap);
        setLevelsByPath(lmap);

        // if (mounted && !activeCategory && cats && cats.length) {
        //   setActiveCategory(cats[0]._id);
        // }
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || 'Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  const hasAnyVideo = lvl => lvl && lvl.videos && Object.values(lvl.videos).some(Boolean);
  const hasAnyPdf = lvl => lvl && lvl.pdfs && Object.values(lvl.pdfs).some(Boolean);

  const seqList = useMemo(() => {
    const list = [];
    for (const c of categories) {
      const paths = (pathsByCategory[c._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      for (const p of paths) {
        const lvls = (levelsByPath[p._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const l of lvls) list.push(l._id);
      }
    }
    return list;
  }, [categories, pathsByCategory, levelsByPath]);

  const seqMap = useMemo(() => {
    const m = {};
    let n = 1;
    for (const id of seqList) m[id] = n++;
    return m;
  }, [seqList]);

  const filteredCategories = useMemo(() => {
    const q = debouncedQ || '';
    return categories.filter(cat => {
      const paths = (pathsByCategory[cat._id] || []);
      if (!q && !videoOnly && !pdfOnly) return true; // Show all if no filter

      return paths.some(path => {
        const lvls = (levelsByPath[path._id] || []);
        if (lvls.length === 0 && !q && !videoOnly && !pdfOnly) return true; // Show empty paths if no filter

        return lvls.some(l => {
          if (videoOnly && !hasAnyVideo(l)) return false;
          if (pdfOnly && !hasAnyPdf(l)) return false;
          if (!q) return true;
          const title = (l.translations?.[lang]?.title || l.translations?.fr?.title || '').toLowerCase();
          const pname = (path.translations?.[lang]?.name || path.translations?.fr?.name || '').toLowerCase();
          const cname = (cat.translations?.[lang]?.name || cat.translations?.fr?.name || '').toLowerCase();
          return title.includes(q) || pname.includes(q) || cname.includes(q);
        });
      });
    });
  }, [categories, pathsByCategory, levelsByPath, debouncedQ, videoOnly, pdfOnly, lang]);

  const openLevel = (id) => {
    if (!id) return;
    navigate(`/courses/levels/${id}`);
  };

  const handlePreview = (level) => {
    setPreviewLevel(level);
    onOpen();
  };

  const stats = useMemo(() => {
    const allLevels = Object.values(levelsByPath).flat();
    return {
      totalLevels: allLevels.length,
      withVideo: allLevels.filter(hasAnyVideo).length,
      withPdf: allLevels.filter(hasAnyPdf).length,
      totalPaths: Object.values(pathsByCategory).flat().length
    };
  }, [levelsByPath, pathsByCategory]);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-danger">Erreur: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isBordered maxWidth="full" className="bg-background/70 backdrop-blur-md">
        <NavbarBrand className="cursor-pointer" onClick={() => navigate('/dashboard')}>
          <p className="font-bold text-inherit text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GenesisCode</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <Input
            classNames={{
              base: "max-w-full sm:max-w-[20rem] h-10",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Rechercher..."
            size="sm"
            startContent={<IconSearch size={18} />}
            value={query}
            onValueChange={setQuery}
            isClearable
            onClear={() => setQuery('')}
          />
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              isIconOnly
              variant={viewMode === 'grid' ? "solid" : "light"}
              color={viewMode === 'grid' ? "primary" : "default"}
              onClick={() => setViewMode('grid')}
            >
              <IconGridDots size={20} />
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              isIconOnly
              variant={viewMode === 'list' ? "solid" : "light"}
              color={viewMode === 'list' ? "primary" : "default"}
              onClick={() => setViewMode('list')}
            >
              <IconList size={20} />
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Select
              className="w-32"
              defaultSelectedKeys={[lang]}
              onChange={(e) => setLanguage(e.target.value)}
              size="sm"
            >
              {LANGS.map(l => (
                <SelectItem key={l.code} value={l.code} startContent={<span className="text-lg">{l.flag}</span>}>
                  {l.label}
                </SelectItem>
              ))}
            </Select>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Card className="w-80 h-full rounded-none border-r border-divider hidden md:flex flex-col">
          <CardBody className="p-4 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <IconFolder size={20} className="text-primary" />
                Catégories
              </h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant={activeCategory === null ? "flat" : "light"}
                  color={activeCategory === null ? "primary" : "default"}
                  className="justify-start"
                  onClick={() => setActiveCategory(null)}
                >
                  Toutes les catégories
                </Button>
                {categories.map(c => (
                  <Button
                    key={c._id}
                    variant={activeCategory === c._id ? "flat" : "light"}
                    color={activeCategory === c._id ? "primary" : "default"}
                    className="justify-start"
                    onClick={() => setActiveCategory(activeCategory === c._id ? null : c._id)}
                  >
                    {c.translations?.[lang]?.name || c.translations?.fr?.name || 'Sans nom'}
                  </Button>
                ))}
              </div>
            </div>

            <Divider />

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <IconFilter size={20} className="text-primary" />
                Filtres
              </h3>
              <div className="flex flex-col gap-3">
                <Checkbox isSelected={videoOnly} onValueChange={setVideoOnly}>
                  Avec vidéo
                </Checkbox>
                <Checkbox isSelected={pdfOnly} onValueChange={setPdfOnly}>
                  Avec PDF
                </Checkbox>
              </div>
            </div>

            <Divider />

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <IconChartBar size={20} className="text-primary" />
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-default-100 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.totalLevels}</div>
                  <div className="text-xs text-default-500">Niveaux</div>
                </div>
                <div className="bg-default-100 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{stats.totalPaths}</div>
                  <div className="text-xs text-default-500">Parcours</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Main Content */}
        <ScrollShadow className="flex-1 p-6 bg-default-50">
          <div className="max-w-7xl mx-auto">
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-default-400">
                <IconSearch size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold">Aucun contenu trouvé</h3>
                <p>Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <div className="space-y-12">
                {filteredCategories.map(cat => (
                  <CategorySection
                    key={cat._id}
                    category={cat}
                    paths={pathsByCategory[cat._id] || []}
                    levelsByPath={levelsByPath}
                    activeCategory={activeCategory}
                    lang={lang}
                    viewMode={viewMode}
                    openLevel={openLevel}
                    seqMap={seqMap}
                    hasAnyVideo={hasAnyVideo}
                    hasAnyPdf={hasAnyPdf}
                    debouncedQ={debouncedQ}
                    videoOnly={videoOnly}
                    pdfOnly={pdfOnly}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollShadow>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {previewLevel?.translations?.[lang]?.title || previewLevel?.translations?.fr?.title || 'Aperçu'}
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500">
                  {previewLevel?.translations?.[lang]?.content || 'Aucune description disponible.'}
                </p>
                <div className="flex gap-2 mt-4">
                  <Chip color="primary" variant="flat" startContent={<IconBook size={16} />}>
                    {(previewLevel?.exercises || []).length} exercices
                  </Chip>
                  {hasAnyVideo(previewLevel) && (
                    <Chip color="secondary" variant="flat" startContent={<IconPlayerPlay size={16} />}>
                      Vidéo
                    </Chip>
                  )}
                  {hasAnyPdf(previewLevel) && (
                    <Chip color="warning" variant="flat" startContent={<IconFileText size={16} />}>
                      PDF
                    </Chip>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    openLevel(previewLevel._id);
                    onClose();
                  }}
                  endContent={<IconArrowRight size={16} />}
                >
                  Commencer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function CategorySection({
  category,
  paths,
  levelsByPath,
  activeCategory,
  lang,
  viewMode,
  openLevel,
  seqMap,
  hasAnyVideo,
  hasAnyPdf,
  debouncedQ,
  videoOnly,
  pdfOnly,
  onPreview
}) {
  if (activeCategory && activeCategory !== category._id) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {category.translations?.[lang]?.name || category.translations?.fr?.name || 'Sans nom'}
        </h2>
        <Chip variant="flat" size="sm">{paths.length} parcours</Chip>
      </div>

      <div className="space-y-8">
        {paths.map(path => {
          const lvls = (levelsByPath[path._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
          const visibleLvls = lvls.filter(l => {
            if (videoOnly && !hasAnyVideo(l)) return false;
            if (pdfOnly && !hasAnyPdf(l)) return false;
            if (!debouncedQ) return true;
            const q = debouncedQ;
            const title = (l.translations?.[lang]?.title || l.translations?.fr?.title || '').toLowerCase();
            const pname = (path.translations?.[lang]?.name || path.translations?.fr?.name || '').toLowerCase();
            return title.includes(q) || pname.includes(q) || (category.translations?.[lang]?.name || category.translations?.fr?.name || '').toLowerCase().includes(q);
          });

          if (visibleLvls.length === 0 && (debouncedQ || videoOnly || pdfOnly)) return null;

          return (
            <PathSection
              key={path._id}
              path={path}
              levels={visibleLvls}
              lang={lang}
              viewMode={viewMode}
              openLevel={openLevel}
              seqMap={seqMap}
              hasAnyVideo={hasAnyVideo}
              hasAnyPdf={hasAnyPdf}
              onPreview={onPreview}
            />
          );
        })}
      </div>
    </div>
  );
}

function PathSection({ path, levels, lang, viewMode, openLevel, seqMap, hasAnyVideo, hasAnyPdf, onPreview }) {
  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader className="flex justify-between items-center px-6 py-4">
        <div>
          <h3 className="text-xl font-semibold">
            {path.translations?.[lang]?.name || path.translations?.fr?.name || 'Sans nom'}
          </h3>
          <p className="text-small text-default-500">
            {levels.length} niveau(s) • ordre {path.order ?? '—'}
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {levels.map((lvl, index) => (
            <LevelCard
              key={lvl._id}
              level={lvl}
              pathId={path._id}
              index={index}
              seqNumber={seqMap[lvl._id]}
              lang={lang}
              viewMode={viewMode}
              openLevel={openLevel}
              hasAnyVideo={hasAnyVideo}
              hasAnyPdf={hasAnyPdf}
              onPreview={onPreview}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function LevelCard({ level, pathId, index, seqNumber, lang, viewMode, openLevel, hasAnyVideo, hasAnyPdf, onPreview }) {
  const hasVideo = hasAnyVideo(level);
  const hasPdf = hasAnyPdf(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        isPressable
        onPress={() => openLevel(level._id)}
        className="h-full hover:scale-[1.02] transition-transform"
      >
        <CardBody className="p-4">
          <div className="flex justify-between items-start mb-3">
            <Chip
              size="sm"
              color="primary"
              variant="shadow"
              classNames={{ content: "font-bold" }}
            >
              {seqNumber || '-'}
            </Chip>
            <div className="flex gap-1">
              {hasVideo && <Tooltip content="Vidéo"><Chip size="sm" variant="flat" color="secondary" className="px-0 min-w-unit-6 h-6"><IconPlayerPlay size={12} /></Chip></Tooltip>}
              {hasPdf && <Tooltip content="PDF"><Chip size="sm" variant="flat" color="warning" className="px-0 min-w-unit-6 h-6"><IconFileText size={12} /></Chip></Tooltip>}
            </div>
          </div>

          <h4 className="font-semibold text-lg mb-2 line-clamp-2">
            {level.translations?.[lang]?.title || level.translations?.fr?.title || 'Sans titre'}
          </h4>

          <p className="text-small text-default-500 mb-4">
            {(level.exercises || []).length} exercice(s)
          </p>
        </CardBody>

        <CardFooter className="pt-0 gap-2">
          <Button
            size="sm"
            variant="light"
            fullWidth
            onPress={(e) => {
              e.continuePropagation();
              onPreview(level);
            }}
          >
            Aperçu
          </Button>
          <Button
            size="sm"
            color="primary"
            fullWidth
            endContent={<IconArrowRight size={14} />}
          >
            Go
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}