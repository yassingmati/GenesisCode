import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Input, Skeleton,
  Chip, Select, SelectItem, Textarea,
  Checkbox, Divider
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { api, pickTitle } from '../components/common';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';

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
    initialXml: '',
    scratchBlocks: []
  });
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
      fr_question: '', en_question: '', ar_question: '',
      fr_explanation: '', en_explanation: '', ar_explanation: '',
      options: ['', ''],
      solutions: [],
      elements: [],
      targets: [],
      testCases: [],
      initialXml: '',
      scratchBlocks: []
    });
    setModalOpen(true);
  };

  const startEdit = async (exercise) => {
    try {
      const { data } = await api.get(`/exercises/${exercise._id}`);
      setEditing(data);
      setForm({
        level: data.level,
        type: data.type,
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
        scratchBlocks: data.scratchBlocks || []
      });
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
        fr: { question: form.fr_question, explanation: form.fr_explanation },
        en: { question: form.en_question, explanation: form.en_explanation },
        ar: { question: form.ar_question, explanation: form.ar_explanation }
      }
    };

    if (form.type === 'QCM') {
      payload.options = form.options.filter(opt => opt.trim() !== '');
      payload.solutions = form.solutions;
    } else if (form.type === 'DragDrop') {
      payload.elements = form.elements;
      payload.targets = form.targets;
      payload.solutions = form.solutions;
    } else if (form.type === 'Code') {
      payload.testCases = form.testCases;
    } else if (form.type === 'TextInput') {
      payload.solutions = form.solutions;
    } else if (form.type === 'Scratch') {
      payload.initialXml = form.initialXml;
      payload.scratchBlocks = form.scratchBlocks; // Optional: expected blocks
    } else if (form.type === 'ScratchBlocks') {
      payload.scratchBlocks = form.scratchBlocks;
      payload.solutions = form.solutions; // Optional: if order matters
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
  const addScratchBlock = () => setForm(f => ({ ...f, scratchBlocks: [...f.scratchBlocks, ''] }));
  const updateScratchBlock = (idx, value) => setForm(f => ({
    ...f,
    scratchBlocks: f.scratchBlocks.map((b, i) => i === idx ? value : b)
  }));
  const removeScratchBlock = (idx) => setForm(f => ({
    ...f,
    scratchBlocks: f.scratchBlocks.filter((_, i) => i !== idx)
  }));

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
            <div className="col-span-2 border p-4 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-small font-bold">Éléments</span>
                  <Button size="sm" variant="flat" onPress={addElement}>Ajouter</Button>
                </div>
                {form.elements.map((element, idx) => (
                  <div key={idx} className="mb-2">
                    <Input
                      value={element}
                      onValueChange={v => updateElement(idx, v)}
                      placeholder={`Élément ${idx + 1}`}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-small font-bold">Cibles</span>
                  <Button size="sm" variant="flat" onPress={addTarget}>Ajouter</Button>
                </div>
                {form.targets.map((target, idx) => (
                  <div key={idx} className="mb-2">
                    <Input
                      value={target}
                      onValueChange={v => updateTarget(idx, v)}
                      placeholder={`Cible ${idx + 1}`}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type === 'Code' && (
            <div className="col-span-2 border p-4 rounded-lg">
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
            <div className="col-span-2 border p-4 rounded-lg">
              <span className="text-small font-bold block mb-2">Configuration Scratch</span>
              <Textarea
                label="XML Initial"
                placeholder="<xml>...</xml>"
                value={form.initialXml}
                onValueChange={v => setForm(f => ({ ...f, initialXml: v }))}
                minRows={5}
              />
            </div>
          )}

          {form.type === 'ScratchBlocks' && (
            <div className="col-span-2 border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-small font-bold">Blocs disponibles</span>
                <Button size="sm" variant="flat" onPress={addScratchBlock}>Ajouter bloc</Button>
              </div>
              {form.scratchBlocks.map((block, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Input
                    value={block}
                    onValueChange={v => updateScratchBlock(idx, v)}
                    placeholder="Type de bloc (ex: event_whenflagclicked)"
                    size="sm"
                  />
                  <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeScratchBlock(idx)}>
                    <IconX size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="col-span-2">
            <Textarea
              label="Explication (Français)"
              value={form.fr_explanation}
              onValueChange={v => setForm(f => ({ ...f, fr_explanation: v }))}
            />
          </div>
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
