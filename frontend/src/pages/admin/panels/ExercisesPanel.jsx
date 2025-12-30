import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Input, Skeleton,
  Chip, Select, SelectItem, Textarea,
  Checkbox, Divider, Tabs, Tab
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { api, pickTitle } from '../components/common';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import ScratchEditor from '../../../components/ui/ScratchEditor';

export default function ExercisesPanel({ onOpenCreate }) {
  const [paths, setPaths] = useState([]);
  const [levels, setLevels] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    level: '',
    type: 'QCM',
    fr_question: '', en_question: '', ar_question: '',
    fr_explanation: '', en_explanation: '', ar_explanation: '',
    options: ['', ''],
    solutions: [],
    elements: [],
    targets: [],
    testCases: [],
    testCases: [],
    initialXml: '',
    scratchBlocks: [],
    validationRules: [],
    language: 'javascript', // Code
    codeSnippet: '', // Code
    solutionXml: '' // Scratch Solution
  });
  const [scratchTab, setScratchTab] = useState('initial'); // 'initial' or 'solution'
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchPaths();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      fetchLevels(selectedPath);
    } else {
      setLevels([]);
      setSelectedLevel('');
      setExercises([]);
    }
  }, [selectedPath]);

  useEffect(() => {
    if (selectedLevel) {
      fetchExercises(selectedLevel);
    } else {
      setExercises([]);
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (onOpenCreate) {
      onOpenCreate(() => openCreate());
    }
  }, [onOpenCreate, selectedLevel]);

  const fetchPaths = async () => {
    try {
      const { data } = await api.get('/paths');
      setPaths(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLevels = async (pathId) => {
    try {
      const { data } = await api.get(`/paths/${pathId}/levels`);
      setLevels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les niveaux');
    }
  };

  const fetchExercises = async (levelId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/levels/${levelId}/exercises`);
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les exercices');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return exercises.filter(exercise => {
      const question = pickTitle(exercise).toLowerCase();
      return !q || question.includes(q) || String(exercise._id).includes(q);
    });
  }, [exercises, query]);

  const pages = Math.max(1, Math.ceil(filteredExercises.length / perPage));
  const pagedExercises = filteredExercises.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({
      level: selectedLevel || '',
      type: 'QCM',
      fr_name: '', en_name: '', ar_name: '',
      fr_question: '', en_question: '', ar_question: '',
      fr_explanation: '', en_explanation: '', ar_explanation: '',
      options: ['', ''],
      solutions: [],
      elements: [],
      targets: [],
      testCases: [],
      initialXml: '',
      scratchBlocks: [],
      validationRules: [],
      language: 'javascript',
      codeSnippet: '',
      solutionXml: '',
      dragDropSolutions: {} // DragDrop solutions map
    });
    setScratchTab('initial');
    setModalOpen(true);
  };

  const startEdit = async (exercise) => {
    try {
      const { data } = await api.get(`/exercises/${exercise._id}`);
      setEditing(data);
      setForm({
        level: data.level,
        type: data.type,
        fr_name: data.translations?.fr?.name || '',
        en_name: data.translations?.en?.name || '',
        ar_name: data.translations?.ar?.name || '',
        fr_question: data.translations?.fr?.question || '',
        en_question: data.translations?.en?.question || '',
        ar_question: data.translations?.ar?.question || '',
        fr_explanation: data.translations?.fr?.explanation || '',
        en_explanation: data.translations?.en?.explanation || '',
        ar_explanation: data.translations?.ar?.explanation || '',
        options: data.options?.length ? data.options : ['', ''],
        solutions: data.solutions || [],
        elements: data.elements || [],
        targets: data.targets || [],
        testCases: data.testCases || [],
        initialXml: data.initialXml || '',
        scratchBlocks: data.scratchBlocks || [],
        validationRules: data.validationRules || [],
        language: data.language || 'javascript',
        codeSnippet: data.codeSnippet || '',
        solutionXml: data.solutions?.[0] && typeof data.solutions[0] === 'string' ? data.solutions[0] : '',
        dragDropSolutions: data.solutions?.[0] || {} // Extract DragDrop map
      });
      setScratchTab('initial');
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de récupérer l\'exercice');
    }
  };

  const handleSubmit = async () => {
    if (!form.level) {
      toast.error('Sélectionne un niveau');
      return;
    }
    if (!form.fr_question?.trim()) {
      toast.error('Question FR requise');
      return;
    }
    const payload = {
      level: form.level,
      type: form.type,
      translations: {
        fr: { name: form.fr_name, question: form.fr_question, explanation: form.fr_explanation },
        en: { name: form.en_name, question: form.en_question, explanation: form.en_explanation },
        ar: { name: form.ar_name, question: form.ar_question, explanation: form.ar_explanation }
      }
    };

    if (form.type === 'QCM') {
      // Fix: Ensure options are objects with id and text
      payload.options = form.options
        .filter(opt => opt.trim() !== '')
        .map((opt, idx) => ({
          id: String(idx),
          text: opt
        }));
      payload.solutions = form.solutions;
    } else if (form.type === 'DragDrop') {
      if (!form.elements.length || !form.targets.length) {
        toast.error('DragDrop nécessite au moins 1 élément et 1 cible');
        return;
      }

      const missingSolutions = form.elements.filter(el => !form.dragDropSolutions?.[el]);
      if (missingSolutions.length > 0) {
        toast.error(`Solution manquante pour: ${missingSolutions.join(', ')}`);
        return;
      }

      payload.elements = form.elements;
      payload.targets = form.targets;
      // Convert map { elem: target } to solutions array [{ elem: target }]
      payload.solutions = [form.dragDropSolutions || {}];
    } else if (form.type === 'Code') {
      payload.testCases = form.testCases;
      payload.language = form.language;
      payload.codeSnippet = form.codeSnippet;
    } else if (form.type === 'TextInput') {
      payload.solutions = form.solutions;
    } else if (form.type === 'Scratch') {
      payload.initialXml = form.initialXml;
      payload.scratchBlocks = form.scratchBlocks;
      payload.validationRules = form.validationRules;
      // If we have a solution XML (passed via scratchBlocks or separate field), include it
      if (form.solutionXml) {
        payload.solutions = [form.solutionXml];
      }
    } else if (form.type === 'ScratchBlocks') {
      payload.scratchBlocks = form.scratchBlocks;
      // Par défaut, l'ordre de création définit la solution pour ScratchBlocks
      payload.solutions = form.scratchBlocks;
    }

    try {
      if (editing) {
        await api.put(`/exercises/${editing._id}`, payload);
        toast.success('Exercice mis à jour');
      } else {
        await api.post('/exercises', payload);
        toast.success('Exercice créé');
      }
      setModalOpen(false);
      fetchExercises(form.level);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Erreur sauvegarde exercice');
    }
  };

  // QCM helpers
  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }));
  const updateOption = (idx, value) => setForm(f => ({
    ...f,
    options: f.options.map((opt, i) => i === idx ? value : opt)
  }));
  const removeOption = (idx) => setForm(f => ({
    ...f,
    options: f.options.filter((_, i) => i !== idx),
    solutions: f.solutions.filter(s => s !== idx).map(s => s > idx ? s - 1 : s)
  }));
  const toggleSolution = (idx) => setForm(f => ({
    ...f,
    solutions: f.solutions.includes(idx)
      ? f.solutions.filter(s => s !== idx)
      : [...f.solutions, idx]
  }));

  // DragDrop helpers
  const addElement = () => setForm(f => ({ ...f, elements: [...f.elements, ''] }));
  const updateElement = (idx, value) => setForm(f => ({
    ...f,
    elements: f.elements.map((el, i) => i === idx ? value : el)
  }));
  const addTarget = () => setForm(f => ({ ...f, targets: [...f.targets, ''] }));
  const updateTarget = (idx, value) => setForm(f => ({
    ...f,
    targets: f.targets.map((t, i) => i === idx ? value : t)
  }));

  // Code helpers
  const addTestCase = () => setForm(f => ({
    ...f,
    testCases: [...f.testCases, { input: '', expected: '', points: 1 }]
  }));
  const updateTestCase = (idx, field, value) => setForm(f => ({
    ...f,
    testCases: f.testCases.map((tc, i) =>
      i === idx ? { ...tc, [field]: value } : tc
    )
  }));
  const removeTestCase = (idx) => setForm(f => ({
    ...f,
    testCases: f.testCases.filter((_, i) => i !== idx)
  }));

  // ScratchBlocks helpers
  const addScratchBlock = () => setForm(f => ({
    ...f,
    scratchBlocks: [...f.scratchBlocks, { text: '', category: 'motion', type: 'command' }]
  }));

  const updateScratchBlock = (idx, field, value) => setForm(f => ({
    ...f,
    scratchBlocks: f.scratchBlocks.map((b, i) => {
      if (i !== idx) return b;
      // Handle legacy string data if encountered
      const currentBlock = typeof b === 'string' ? { text: b, category: 'motion', type: 'command' } : b;
      return { ...currentBlock, [field]: value };
    })
  }));

  const removeScratchBlock = (idx) => setForm(f => ({
    ...f,
    scratchBlocks: f.scratchBlocks.filter((_, i) => i !== idx)
  }));

  // Validation Rules Helpers
  const addValidationRule = () => setForm(f => ({
    ...f,
    validationRules: [...(f.validationRules || []), { type: 'mustUseBlock', value: '', message: '' }]
  }));

  const updateValidationRule = (idx, field, value) => setForm(f => ({
    ...f,
    validationRules: f.validationRules.map((r, i) => i === idx ? { ...r, [field]: value } : r)
  }));

  const removeValidationRule = (idx) => setForm(f => ({
    ...f,
    validationRules: f.validationRules.filter((_, i) => i !== idx)
  }));

  // Helper to ensure block is an object for rendering
  const getBlockObject = (block) => {
    if (typeof block === 'string') return { text: block, category: 'motion', type: 'command' };
    return block;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
          <Select
            placeholder="Sélectionner un parcours"
            selectedKeys={selectedPath ? [selectedPath] : []}
            onChange={e => setSelectedPath(e.target.value)}
            className="max-w-xs"
            size="sm"
          >
            {paths.map(path => (
              <SelectItem key={path._id} value={path._id}>
                {pickTitle(path)}
              </SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Sélectionner un niveau"
            selectedKeys={selectedLevel ? [selectedLevel] : []}
            onChange={e => setSelectedLevel(e.target.value)}
            className="max-w-xs"
            size="sm"
            isDisabled={!selectedPath}
          >
            {levels.map(level => (
              <SelectItem key={level._id} value={level._id}>
                {pickTitle(level) || `Niveau ${level.order}`}
              </SelectItem>
            ))}
          </Select>

          <SearchBar
            value={query}
            onChange={v => setQuery(v)}
            placeholder="Rechercher exercices..."
          />
        </div>
        <Button color="primary" startContent={<IconPlus size={18} />} onPress={() => openCreate()}>
          Nouvel exercice
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[140px]">
                <Skeleton className="rounded-lg">
                  <div className="h-full rounded-lg bg-default-300"></div>
                </Skeleton>
              </Card>
            ))}
          </div>
        ) : pagedExercises.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedExercises.map(exercise => (
                <Card key={exercise._id} className="h-full">
                  <CardHeader className="flex justify-between items-start pb-0">
                    <div className="flex flex-col">
                      <h4 className="text-md font-bold">{pickTitle(exercise) || 'Sans question'}</h4>
                      <p className="text-small text-default-500">
                        {String(exercise._id).slice(0, 8)}
                      </p>
                    </div>
                    <Chip size="sm" variant="flat" color="primary">
                      {exercise.type}
                    </Chip>
                  </CardHeader>
                  <CardBody className="py-2">
                    {/* Additional content */}
                  </CardBody>
                  <CardFooter className="justify-end gap-2 pt-0">
                    <Button isIconOnly size="sm" variant="light" onPress={() => startEdit(exercise)}>
                      <IconEdit size={18} />
                    </Button>
                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => setConfirm({ open: true, id: exercise._id })}>
                      <IconTrash size={18} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-small text-default-400">
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredExercises.length)} / {filteredExercises.length}
              </span>
              <Pagination
                page={page}
                pages={pages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(pages, p + 1))}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Aucun exercice</h3>
            <p className="text-default-500 mb-4">Sélectionne un niveau pour commencer.</p>
            <Button color="primary" startContent={<IconPlus size={18} />} onPress={() => openCreate()}>
              Nouvel exercice
            </Button>
          </div>
        )}
      </div>

      <FormModal
        open={modalOpen}
        title={editing ? 'Éditer exercice' : 'Nouvel exercice'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="flat" color="default" onPress={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              Sauvegarder
            </Button>
          </div>
        }
      >
        <div className="h-[600px] flex flex-col">
          <Tabs aria-label="Exercise Options" className="mb-4">
            <Tab key="general" title="Général">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Niveau"
                  placeholder="Sélectionner"
                  selectedKeys={form.level ? [form.level] : []}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                >
                  {levels.map(level => (
                    <SelectItem key={level._id} value={level._id}>
                      {pickTitle(level) || `Niveau ${level.order}`}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Type"
                  selectedKeys={form.type ? [form.type] : []}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <SelectItem key="QCM" value="QCM">QCM</SelectItem>
                  <SelectItem key="TextInput" value="TextInput">Réponse texte</SelectItem>
                  <SelectItem key="DragDrop" value="DragDrop">Glisser-déposer</SelectItem>
                  <SelectItem key="Code" value="Code">Code</SelectItem>
                  <SelectItem key="Scratch" value="Scratch">Scratch</SelectItem>
                  <SelectItem key="ScratchBlocks" value="ScratchBlocks">Scratch Blocks</SelectItem>
                </Select>

                <div className="col-span-2">
                  <Input
                    label="Titre (Français)"
                    value={form.fr_name}
                    onValueChange={v => setForm(f => ({ ...f, fr_name: v }))}
                    isRequired
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Title (English)"
                    value={form.en_name}
                    onValueChange={v => setForm(f => ({ ...f, en_name: v }))}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Titre (Arabe)"
                    value={form.ar_name}
                    onValueChange={v => setForm(f => ({ ...f, ar_name: v }))}
                  />
                </div>

                <div className="col-span-2">
                  <Textarea
                    label="Question (Français)"
                    value={form.fr_question}
                    onValueChange={v => setForm(f => ({ ...f, fr_question: v }))}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    label="Question (Anglais)"
                    value={form.en_question}
                    onValueChange={v => setForm(f => ({ ...f, en_question: v }))}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    label="Question (Arabe)"
                    value={form.ar_question}
                    onValueChange={v => setForm(f => ({ ...f, ar_question: v }))}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    label="Explication (Français)"
                    value={form.fr_explanation}
                    onValueChange={v => setForm(f => ({ ...f, fr_explanation: v }))}
                  />
                </div>
              </div>
            </Tab>

            <Tab key="config" title="Configuration">
              {/* Type-specific fields */}
              {form.type === 'QCM' && (
                <div className="col-span-2 border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-small font-bold">Options (QCM)</span>
                    <Button size="sm" variant="flat" onPress={addOption}>Ajouter option</Button>
                  </div>
                  {form.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <Input
                        value={option}
                        onValueChange={v => updateOption(idx, v)}
                        placeholder={`Option ${idx + 1}`}
                        size="sm"
                      />
                      <Checkbox
                        isSelected={form.solutions.includes(idx)}
                        onValueChange={() => toggleSolution(idx)}
                      >
                        Solution
                      </Checkbox>
                      {form.options.length > 2 && (
                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeOption(idx)}>
                          <IconX size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {form.type === 'DragDrop' && (
                <div className="col-span-2 flex flex-col gap-4">
                  <div className="border p-4 rounded-lg grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-small font-bold">Éléments (à glisser)</span>
                        <Button size="sm" variant="flat" onPress={addElement}>Ajouter</Button>
                      </div>
                      {form.elements.map((element, idx) => (
                        <div key={idx} className="mb-2 flex gap-2">
                          <Input
                            value={element}
                            onValueChange={v => updateElement(idx, v)}
                            placeholder={`Élément ${idx + 1}`}
                            size="sm"
                          />
                          <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => setForm(f => ({ ...f, elements: f.elements.filter((_, i) => i !== idx) }))}>
                            <IconX size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-small font-bold">Cibles (zones de dépôt)</span>
                        <Button size="sm" variant="flat" onPress={addTarget}>Ajouter</Button>
                      </div>
                      {form.targets.map((target, idx) => (
                        <div key={idx} className="mb-2 flex gap-2">
                          <Input
                            value={target}
                            onValueChange={v => updateTarget(idx, v)}
                            placeholder={`Cible ${idx + 1}`}
                            size="sm"
                          />
                          <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => setForm(f => ({ ...f, targets: f.targets.filter((_, i) => i !== idx) }))}>
                            <IconX size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <span className="text-small font-bold block mb-2">Solutions (Associations)</span>
                    <p className="text-xs text-default-500 mb-2">Associez chaque élément à sa cible correcte.</p>
                    {form.elements.map((element, idx) => (
                      <div key={idx} className="flex gap-4 items-center mb-2">
                        <span className="w-1/3 text-sm font-medium truncate" title={element}>{element || `Élément ${idx + 1}`}</span>
                        <span className="text-default-400">➜</span>
                        <Select
                          className="flex-1"
                          size="sm"
                          placeholder="Sélectionner une cible"
                          selectedKeys={form.dragDropSolutions?.[element] ? [form.dragDropSolutions[element]] : []}
                          onChange={(e) => setForm(f => ({
                            ...f,
                            dragDropSolutions: { ...f.dragDropSolutions, [element]: e.target.value }
                          }))}
                        >
                          {form.targets.map((target, tIdx) => (
                            <SelectItem key={target} value={target}>
                              {target}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.type === 'TextInput' && (
                <div className="col-span-2 border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-small font-bold">Réponses acceptées</span>
                    <Button size="sm" variant="flat" onPress={() => setForm(f => ({ ...f, solutions: [...f.solutions, ''] }))}>
                      Ajouter réponse
                    </Button>
                  </div>
                  <p className="text-xs text-default-500 mb-4">
                    Ajoutez toutes les variantes acceptées (ex: "Paris", "paris", "PARIS"). La casse est généralement ignorée, mais c'est bien d'être explicite.
                  </p>
                  {form.solutions.map((sol, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <Input
                        value={sol}
                        onValueChange={v => setForm(f => ({
                          ...f,
                          solutions: f.solutions.map((s, i) => i === idx ? v : s)
                        }))}
                        placeholder={`Réponse ${idx + 1}`}
                        size="sm"
                      />
                      <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => setForm(f => ({ ...f, solutions: f.solutions.filter((_, i) => i !== idx) }))}>
                        <IconX size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {form.type === 'Code' && (
                <div className="col-span-2 border p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Select
                      label="Langage"
                      selectedKeys={[form.language]}
                      onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    >
                      <SelectItem key="javascript" value="javascript">JavaScript</SelectItem>
                      <SelectItem key="python" value="python">Python</SelectItem>
                      <SelectItem key="java" value="java">Java</SelectItem>
                      <SelectItem key="csharp" value="csharp">C#</SelectItem>
                      <SelectItem key="cpp" value="cpp">C++</SelectItem>
                    </Select>
                    <div className="col-span-2">
                      <Textarea
                        label="Code Initial (Snippet)"
                        placeholder="// Code de départ pour l'étudiant"
                        value={form.codeSnippet}
                        onValueChange={v => setForm(f => ({ ...f, codeSnippet: v }))}
                        minRows={5}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-small font-bold">Tests</span>
                    <Button size="sm" variant="flat" onPress={addTestCase}>Ajouter test</Button>
                  </div>
                  {form.testCases.map((testCase, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-center mb-2">
                      <Input
                        value={testCase.input}
                        onValueChange={v => updateTestCase(idx, 'input', v)}
                        placeholder="Input"
                        size="sm"
                      />
                      <Input
                        value={testCase.expected}
                        onValueChange={v => updateTestCase(idx, 'expected', v)}
                        placeholder="Expected"
                        size="sm"
                      />
                      <Input
                        type="number"
                        value={testCase.points}
                        onValueChange={v => updateTestCase(idx, 'points', +v)}
                        placeholder="Pts"
                        size="sm"
                      />
                      <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeTestCase(idx)}>
                        <IconX size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {form.type === 'Scratch' && (
                <div className="col-span-2 flex flex-col gap-4 h-full">
                  <div className="flex gap-2 border-b pb-2">
                    <Button
                      size="sm"
                      color={scratchTab === 'initial' ? 'primary' : 'default'}
                      variant={scratchTab === 'initial' ? 'solid' : 'light'}
                      onPress={() => setScratchTab('initial')}
                    >
                      État Initial (Élève)
                    </Button>
                    <Button
                      size="sm"
                      color={scratchTab === 'solution' ? 'success' : 'default'}
                      variant={scratchTab === 'solution' ? 'solid' : 'light'}
                      onPress={() => setScratchTab('solution')}
                    >
                      Solution Attendue (Correction)
                    </Button>
                  </div>

                  <div className="flex-1 border rounded-lg overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
                    <div className="bg-default-100 p-2 border-b">
                      <span className="text-small font-bold">
                        {scratchTab === 'initial' ? 'Éditeur Visuel (Initial XML)' : 'Éditeur Solution (Solution XML)'}
                      </span>
                      <p className="text-xs text-default-500">
                        {scratchTab === 'initial'
                          ? "Construisez ici l'état initial des blocs pour l'élève."
                          : "Construisez ici la solution complète. Elle sera utilisée pour vérifier la réponse exacte (si pas de règles)."}
                      </p>
                    </div>
                    <div className="flex-1 relative">
                      {scratchTab === 'initial' ? (
                        <ScratchEditor
                          initialXml={form.initialXml}
                          onXmlChange={(xml) => setForm(f => ({ ...f, initialXml: xml }))}
                        />
                      ) : (
                        <ScratchEditor
                          key="solution-editor"
                          initialXml={form.solutionXml}
                          onXmlChange={(xml) => setForm(f => ({ ...f, solutionXml: xml }))}
                        />
                      )}
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-small font-bold">Règles de validation</span>
                      <Button size="sm" variant="flat" onPress={addValidationRule}>Ajouter règle</Button>
                    </div>

                    {form.validationRules && form.validationRules.map((rule, idx) => (
                      <div key={idx} className="grid grid-cols-[150px_1fr_1fr_auto] gap-2 items-center mb-2 border p-2 rounded bg-gray-50">
                        <Select
                          size="sm"
                          selectedKeys={[rule.type]}
                          onChange={(e) => updateValidationRule(idx, 'type', e.target.value)}
                        >
                          <SelectItem key="mustUseBlock" value="mustUseBlock">Doit utiliser un bloc</SelectItem>
                          <SelectItem key="maxBlocks" value="maxBlocks">Nb max blocs</SelectItem>
                          <SelectItem key="whitelist" value="whitelist">Liste blanche</SelectItem>
                        </Select>

                        <Input
                          size="sm"
                          placeholder={rule.type === 'maxBlocks' ? 'Ex: 10' : 'Type de bloc (ex: controls_repeat)'}
                          value={rule.value}
                          onValueChange={(v) => updateValidationRule(idx, 'value', v)}
                        />

                        <Input
                          size="sm"
                          placeholder="Message d'erreur personnalisé"
                          value={rule.message}
                          onValueChange={(v) => updateValidationRule(idx, 'message', v)}
                        />

                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeValidationRule(idx)}>
                          <IconX size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.type === 'ScratchBlocks' && (
                <div className="col-span-2 border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-small font-bold">Blocs disponibles</span>
                    <Button size="sm" variant="flat" onPress={addScratchBlock}>Ajouter bloc</Button>
                  </div>
                  {form.scratchBlocks.map((block, idx) => {
                    const b = getBlockObject(block);
                    return (
                      <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center mb-2">
                        <Input
                          value={b.text}
                          onValueChange={v => updateScratchBlock(idx, 'text', v)}
                          placeholder="Texte (ex: avancer de 10)"
                          size="sm"
                        />
                        <Select
                          selectedKeys={b.category ? [b.category] : ['motion']}
                          onChange={e => updateScratchBlock(idx, 'category', e.target.value)}
                          size="sm"
                          placeholder="Catégorie"
                        >
                          <SelectItem key="motion" value="motion">Mouvement</SelectItem>
                          <SelectItem key="looks" value="looks">Apparence</SelectItem>
                          <SelectItem key="sound" value="sound">Son</SelectItem>
                          <SelectItem key="events" value="events">Événements</SelectItem>
                          <SelectItem key="control" value="control">Contrôle</SelectItem>
                          <SelectItem key="sensing" value="sensing">Capteurs</SelectItem>
                          <SelectItem key="operators" value="operators">Opérateurs</SelectItem>
                          <SelectItem key="variables" value="variables">Variables</SelectItem>
                        </Select>
                        <Select
                          selectedKeys={b.type ? [b.type] : ['command']}
                          onChange={e => updateScratchBlock(idx, 'type', e.target.value)}
                          size="sm"
                          placeholder="Type"
                        >
                          <SelectItem key="command" value="command">Commande</SelectItem>
                          <SelectItem key="reporter" value="reporter">Valeur</SelectItem>
                          <SelectItem key="boolean" value="boolean">Condition</SelectItem>
                          <SelectItem key="hat" value="hat">Début</SelectItem>
                          <SelectItem key="c-block" value="c-block">Boucle (C)</SelectItem>
                        </Select>

                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeScratchBlock(idx)}>
                          <IconX size={16} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Tab>
          </Tabs>
        </div>
      </FormModal>

      <ConfirmDialog
        open={confirm.open}
        title="Supprimer l'exercice"
        message="Es-tu sûr de vouloir supprimer cet exercice ? Cette action est irréversible."
        onConfirm={async () => {
          try {
            await api.delete(`/exercises/${confirm.id}`);
            toast.success('Exercice supprimé');
            setConfirm({ open: false, id: null });
            if (selectedLevel) fetchExercises(selectedLevel);
          } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la suppression');
          }
        }}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </>
  );
}
