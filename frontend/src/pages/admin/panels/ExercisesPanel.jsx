import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { api, pickTitle, inputStyle, selectStyle, textareaStyle } from '../components/common';
import { Grid, Card, CardTitle, CardMeta, CardActions, IconButton, EmptyState, Tiny } from '../styles';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import { ActionPrimary } from '../styles';

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
    testCases: []
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
      testCases: []
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
        testCases: data.testCases || []
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

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={selectedPath} 
            onChange={e => setSelectedPath(e.target.value)} 
            style={selectStyle()}
          >
            <option value="">Sélectionner un parcours</option>
            {paths.map(path => (
              <option key={path._id} value={path._id}>
                {pickTitle(path)}
              </option>
            ))}
          </select>

          <select 
            value={selectedLevel} 
            onChange={e => setSelectedLevel(e.target.value)} 
            style={selectStyle()}
          >
            <option value="">Sélectionner un niveau</option>
            {levels.map(level => (
              <option key={level._id} value={level._id}>
                {pickTitle(level) || `Niveau ${level.order}`}
              </option>
            ))}
          </select>

          <SearchBar 
            value={query} 
            onChange={v => setQuery(v)} 
            placeholder="Rechercher exercices..." 
          />
        </div>
        <ActionPrimary onClick={() => openCreate()}>
          <FiPlus /> Nouvel exercice
        </ActionPrimary>
      </div>

      <div style={{ marginTop: '16px' }}>
        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '4px' }} />
              </Card>
            ))}
          </Grid>
        ) : pagedExercises.length ? (
          <>
            <Grid>
              {pagedExercises.map(exercise => (
                <Card key={exercise._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <CardTitle>{pickTitle(exercise) || 'Sans question'}</CardTitle>
                      <CardMeta>{exercise.type}</CardMeta>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tiny>Niveau</Tiny>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {String(exercise._id).slice(0, 8)}
                      </div>
                    </div>
                  </div>
                  <CardActions>
                    <IconButton onClick={() => startEdit(exercise)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton danger>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Grid>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tiny>
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredExercises.length)} / {filteredExercises.length}
              </Tiny>
              <Pagination 
                page={page} 
                pages={pages} 
                onPrev={() => setPage(p => Math.max(1, p - 1))} 
                onNext={() => setPage(p => Math.min(pages, p + 1))} 
              />
            </div>
          </>
        ) : (
          <EmptyState>
            <h3>Aucun exercice</h3>
            <p>Sélectionne un niveau pour commencer.</p>
            <ActionPrimary onClick={() => openCreate()}>
              <FiPlus /> Nouvel exercice
            </ActionPrimary>
          </EmptyState>
        )}
      </div>

      <FormModal 
        open={modalOpen} 
        title={editing ? 'Éditer exercice' : 'Nouvel exercice'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #eef2ff' }}>
              Annuler
            </button>
            <ActionPrimary onClick={handleSubmit}>
              <FiPlus /> Sauvegarder
            </ActionPrimary>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Niveau</div>
            <select 
              value={form.level} 
              onChange={e => setForm(f => ({ ...f, level: e.target.value }))} 
              style={selectStyle()}
            >
              <option value="">Sélectionner un niveau</option>
              {levels.map(level => (
                <option key={level._id} value={level._id}>
                  {pickTitle(level) || `Niveau ${level.order}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Type</div>
            <select 
              value={form.type} 
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))} 
              style={selectStyle()}
            >
              <option value="QCM">QCM</option>
              <option value="TextInput">Réponse texte</option>
              <option value="DragDrop">Glisser-déposer</option>
              <option value="Code">Code</option>
            </select>
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Question (Français)</div>
            <textarea 
              value={form.fr_question} 
              onChange={e => setForm(f => ({ ...f, fr_question: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Question (Anglais)</div>
            <textarea 
              value={form.en_question} 
              onChange={e => setForm(f => ({ ...f, en_question: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Question (Arabe)</div>
            <textarea 
              value={form.ar_question} 
              onChange={e => setForm(f => ({ ...f, ar_question: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>

          {/* Type-specific fields */}
          {form.type === 'QCM' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px' }}>Options (QCM)</div>
                <button onClick={addOption} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                  Ajouter option
                </button>
              </div>
              {form.options.map((option, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input 
                    value={option} 
                    onChange={e => updateOption(idx, e.target.value)} 
                    placeholder={`Option ${idx + 1}`}
                    style={inputStyle()} 
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <input 
                      type="checkbox" 
                      checked={form.solutions.includes(idx)} 
                      onChange={() => toggleSolution(idx)} 
                    />
                    Solution
                  </label>
                  {form.options.length > 2 && (
                    <button 
                      onClick={() => removeOption(idx)} 
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                    >
                      Suppr
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {form.type === 'DragDrop' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', marginBottom: '8px' }}>Éléments</div>
                  {form.elements.map((element, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        value={element} 
                        onChange={e => updateElement(idx, e.target.value)} 
                        placeholder={`Élément ${idx + 1}`}
                        style={inputStyle()} 
                      />
                    </div>
                  ))}
                  <button onClick={addElement} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                    Ajouter élément
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: '13px', marginBottom: '8px' }}>Cibles</div>
                  {form.targets.map((target, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        value={target} 
                        onChange={e => updateTarget(idx, e.target.value)} 
                        placeholder={`Cible ${idx + 1}`}
                        style={inputStyle()} 
                      />
                    </div>
                  ))}
                  <button onClick={addTarget} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                    Ajouter cible
                  </button>
                </div>
              </div>
            </div>
          )}

          {form.type === 'Code' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px' }}>Tests</div>
                <button onClick={addTestCase} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                  Ajouter test
                </button>
              </div>
              {form.testCases.map((testCase, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    value={testCase.input} 
                    onChange={e => updateTestCase(idx, 'input', e.target.value)} 
                    placeholder="Input"
                    style={inputStyle()} 
                  />
                  <input 
                    value={testCase.expected} 
                    onChange={e => updateTestCase(idx, 'expected', e.target.value)} 
                    placeholder="Expected"
                    style={inputStyle()} 
                  />
                  <input 
                    type="number" 
                    value={testCase.points} 
                    onChange={e => updateTestCase(idx, 'points', +e.target.value)} 
                    placeholder="Points"
                    style={inputStyle()} 
                  />
                  <button 
                    onClick={() => removeTestCase(idx)} 
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                  >
                    Suppr
                  </button>
                </div>
              ))}
            </div>
          )}

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Explication (Français)</div>
            <textarea 
              value={form.fr_explanation} 
              onChange={e => setForm(f => ({ ...f, fr_explanation: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
        </div>
      </FormModal>
    </>
  );
}
