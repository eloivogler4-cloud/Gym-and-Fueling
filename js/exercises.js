// Client-side helper for exercises page
// This script reads/writes exercises from the same localStorage key used by the app's ExerciseInfoStorage adapter: 'gym_exercises_v1'

(function(){
  const STORAGE_KEY = 'gym_exercises_v1';

  function readAll(){
    try{
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if(!raw) return [];
      const obj = JSON.parse(raw);
      return Object.values(obj || {}).sort((a,b)=>a.name.localeCompare(b.name));
    } catch(e){ console.error(e); return []; }
  }

  function save(ex){
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    obj[ex.id] = ex;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function renderList(list){
    const container = document.getElementById('list');
    container.innerHTML = '';
    if(list.length === 0){ container.innerHTML = '<p>No exercises found. Click "Populate demo exercises" to add examples.</p>'; return; }
    for(const ex of list){
      const card = document.createElement('article');
      card.className = 'exercise-card';
      const title = document.createElement('h4'); title.textContent = ex.name;
      const desc = document.createElement('p'); desc.textContent = ex.description || '';
      const muscles = document.createElement('div'); muscles.className = 'muscle-list';
      (ex.muscles && ex.muscles.primary || []).forEach(m => { const s = document.createElement('span'); s.className='muscle'; s.textContent = m; muscles.appendChild(s); });
      const tags = document.createElement('div');
      (ex.tags || []).slice(0,5).forEach(t => { const b=document.createElement('span'); b.className='badge'; b.textContent=t; tags.appendChild(b); });
      const btn = document.createElement('button'); btn.textContent = 'View'; btn.addEventListener('click', ()=> openModal(ex.id));
      card.appendChild(title); card.appendChild(tags); card.appendChild(desc); card.appendChild(muscles); card.appendChild(btn);
      container.appendChild(card);
    }
  }

  function openModal(id){
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const obj = JSON.parse(raw);
    const ex = obj[id];
    if(!ex) return;
    const content = document.getElementById('modalContent');
    content.innerHTML = '';
    const h = document.createElement('h2'); h.textContent = ex.name; content.appendChild(h);
    const pdesc = document.createElement('p'); pdesc.textContent = ex.description || ''; content.appendChild(pdesc);
    const hd = document.createElement('h3'); hd.textContent = 'Technique'; content.appendChild(hd);
    const steps = document.createElement('ol'); (ex.technique && ex.technique.steps || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; steps.appendChild(li); }); content.appendChild(steps);
    const mistakesH = document.createElement('h4'); mistakesH.textContent = 'Common mistakes'; content.appendChild(mistakesH);
    const mistakes = document.createElement('ul'); (ex.technique && ex.technique.commonMistakes || []).forEach(m => { const li=document.createElement('li'); li.textContent=m; mistakes.appendChild(li); }); content.appendChild(mistakes);
    const safetyH = document.createElement('h4'); safetyH.textContent = 'Safety tips'; content.appendChild(safetyH);
    const safety = document.createElement('ul'); (ex.technique && ex.technique.safetyTips || []).forEach(t => { const li=document.createElement('li'); li.textContent=t; safety.appendChild(li); }); content.appendChild(safety);

    const musclesH = document.createElement('h3'); musclesH.textContent = 'Muscles'; content.appendChild(musclesH);
    const primary = document.createElement('div'); primary.innerHTML = '<strong>Primary:</strong> ' + ((ex.muscles && ex.muscles.primary || []).join(', ') || ''); content.appendChild(primary);
    const secondary = document.createElement('div'); secondary.innerHTML = '<strong>Secondary:</strong> ' + ((ex.muscles && ex.muscles.secondary || []).join(', ') || ''); content.appendChild(secondary);

    const varH = document.createElement('h3'); varH.textContent = 'Variations'; content.appendChild(varH);
    const easier = document.createElement('div'); easier.innerHTML = '<strong>Easier:</strong> ' + ((ex.variations && ex.variations.easier || []).map(v=>v.name).join(', ') || ''); content.appendChild(easier);
    const harder = document.createElement('div'); harder.innerHTML = '<strong>Harder:</strong> ' + ((ex.variations && ex.variations.harder || []).map(v=>v.name).join(', ') || ''); content.appendChild(harder);

    // visual placeholder
    const visH = document.createElement('h4'); visH.textContent = 'Visual mapping (placeholder)'; content.appendChild(visH);
    const visP = document.createElement('p'); visP.textContent = 'This exercise references muscles by ID for future visual highlighting.'; content.appendChild(visP);

    document.getElementById('exerciseModal').style.display = 'flex';
  }

  function closeModal(){ document.getElementById('exerciseModal').style.display = 'none'; }

  function populateDemos(){
    const now = new Date().toISOString();
    const pushUp = {
      id: 'pushup-1',
      name: 'Push Up',
      description: 'A classic bodyweight pushing exercise that targets the chest, triceps and shoulders.',
      equipment: [],
      difficulty: { level: 'beginner', score: 3 },
      technique: {
        steps: ['Start in a high plank with hands under shoulders.', 'Lower your body until your chest nearly touches the floor.', 'Push back up to the starting position while keeping a neutral spine.'],
        commonMistakes: ['Flaring elbows too wide', 'Sagging hips', 'Incomplete range of motion'],
        safetyTips: ['Keep core braced', 'Avoid breath-holding']
      },
      muscles: { primary: ['pectoralis_major','triceps_brachii','anterior_deltoid'], secondary: ['biceps_brachii'] },
      variations: { easier: [{ name: 'Knee Push Up' }], harder: [{ name: 'Weighted Push Up' }, { name: 'Decline Push Up' }] },
      tags: ['bodyweight','push','chest'],
      visual: [ { muscleId: 'pectoralis_major', highlights: { opacity: 0.9, color: '#ff6666' } } ],
      createdAt: now,
      updatedAt: now
    };

    const squat = {
      id: 'squat-1',
      name: 'Back Squat',
      description: 'Barbell back squat targeting the quadriceps and glutes.',
      equipment: ['barbell','squat rack'],
      difficulty: { level: 'intermediate', score: 6 },
      technique: {
        steps: ['Position bar on upper back', 'Unrack and step back', 'Descend by bending hips and knees until thighs are at least parallel', 'Drive up through heels to stand'],
        commonMistakes: ['Knees caving inwards', 'Rounding the lower back'],
        safetyTips: ['Use spotters for heavy sets', 'Maintain neutral spine']
      },
      muscles: { primary: ['quadriceps','gluteus_maximus'], secondary: ['hamstrings'] },
      variations: { easier: [{ name: 'Goblet Squat' }], harder: [{ name: 'Pause Back Squat' }] },
      tags: ['barbell','legs','strength'],
      visual: [ { muscleId: 'quadriceps', highlights: { opacity: 0.9, color: '#ffcc66' } }, { muscleId: 'gluteus_maximus', highlights: { opacity: 0.8, color:'#cc9966' } } ],
      createdAt: now,
      updatedAt: now
    };

    save(pushUp); save(squat);
    refresh();
  }

  function refresh(){
    const all = readAll();
    const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    let filtered = all;
    if(q){
      filtered = all.filter(e => e.name.toLowerCase().includes(q) || (e.description||'').toLowerCase().includes(q) || (e.tags||[]).some(t=>t.toLowerCase().includes(q)) || (e.muscles && ((e.muscles.primary||[]).some(m=>m.toLowerCase().includes(q))||(e.muscles.secondary||[]).some(m=>m.toLowerCase().includes(q)))));
    }
    renderList(filtered);
  }

  document.getElementById('searchInput').addEventListener('input', refresh);
  document.getElementById('addDemoBtn').addEventListener('click', populateDemos);
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // initial render
  refresh();
})();
