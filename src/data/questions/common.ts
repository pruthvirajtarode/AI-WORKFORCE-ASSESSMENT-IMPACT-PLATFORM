import type { SeedQuestion as Question } from '../../types';

// ============================================================
// SUROJ × BE10X — COMMON QUESTION BANK (all departments)
// Professional, scenario-led items on AI fundamentals, GenAI,
// Claude usage, prompting, verification and responsible use.
// ============================================================

export const COMMON_PRE_QUESTIONS: Partial<Question>[] = [
  {
    id: 'com-pre-001', department_id: null, question_type: 'mcq', competency: 'ai_fundamentals', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'A colleague says: "The AI assistant read our contract, so whatever it says about the liquidated damages clause must be correct." What is the most accurate response?',
    options: [
      { id: 'a', text: 'Correct — once a document is uploaded, the AI reproduces it exactly' },
      { id: 'b', text: 'Partly correct — the AI is accurate on legal text but not on numbers' },
      { id: 'c', text: 'Incorrect — language models generate likely text and can misstate or invent details, so clause wording must be checked against the source' },
      { id: 'd', text: 'Incorrect — AI assistants cannot read contracts at all' },
    ],
    correct_answer: 'c',
    explanation: 'LLMs predict text; they can summarise well but may misquote or hallucinate. Critical clauses are always verified in the original.',
  },
  {
    id: 'com-pre-002', department_id: null, question_type: 'mcq', competency: 'ai_fundamentals', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'You ask an AI assistant about a GST notification issued last month and it answers confidently. Which limitation should you keep in mind first?',
    options: [
      { id: 'a', text: 'The model may have a knowledge cut-off and might not know recent notifications unless you provide the text' },
      { id: 'b', text: 'AI assistants refuse to discuss taxation' },
      { id: 'c', text: 'The model always browses the internet, so the answer is current' },
      { id: 'd', text: 'Confident answers are verified internally by the model' },
    ],
    correct_answer: 'a',
  },
  {
    id: 'com-pre-003', department_id: null, question_type: 'mcq', competency: 'generative_ai', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'Which of these tasks is generative AI best suited to in a construction company\'s day-to-day work?',
    options: [
      { id: 'a', text: 'Approving vendor payments without review' },
      { id: 'b', text: 'Signing statutory returns on behalf of the company' },
      { id: 'c', text: 'Replacing site measurement with estimated quantities' },
      { id: 'd', text: 'Producing first drafts of summaries, letters, comparison tables and checklists for a professional to review' },
    ],
    correct_answer: 'd',
  },
  {
    id: 'com-pre-004', department_id: null, question_type: 'multiple_select', competency: 'generative_ai', difficulty: 'hard', max_marks: 3, assessment_phase: 'pre',
    question_text: 'Select ALL outputs where a generative AI draft is appropriate as a starting point, provided a responsible person reviews it before use.',
    options: [
      { id: 'a', text: 'A summary of a 40-page specification for an internal briefing' },
      { id: 'b', text: 'A draft reply to a vendor asking for revised delivery dates' },
      { id: 'c', text: 'The final certified quantity for a running account bill, without checking' },
      { id: 'd', text: 'A first-cut agenda and action-item list for a project review meeting' },
    ],
    correct_answer: ['a', 'b', 'd'],
  },
  {
    id: 'com-pre-005', department_id: null, question_type: 'mcq', competency: 'claude_usage', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'When working with Claude on a long tender or policy document, which approach usually gives the most reliable output?',
    options: [
      { id: 'a', text: 'Ask one broad question such as "What is important here?"' },
      { id: 'b', text: 'Provide the document, state your role and goal, ask for specific items with section references, and then ask follow-up questions section by section' },
      { id: 'c', text: 'Paste only the first page to save time' },
      { id: 'd', text: 'Ask the same question repeatedly until the answer sounds right' },
    ],
    correct_answer: 'b',
  },
  {
    id: 'com-pre-006', department_id: null, question_type: 'short_answer', competency: 'claude_usage', difficulty: 'medium', max_marks: 4, assessment_phase: 'pre',
    question_text: 'Describe how you would use a follow-up conversation with an AI assistant to improve a first draft that is too long and too generic for senior management.',
    rubric: '1 mark each: (1) asks for a specific length/format (2) specifies audience and decision needed (3) asks to remove generic statements / add specifics from source (4) reviews and iterates rather than accepting first output',
  },
  {
    id: 'com-pre-007', department_id: null, question_type: 'mcq', competency: 'prompt_engineering', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'Which element most improves the usefulness of a prompt asking AI to summarise a project report?',
    options: [
      { id: 'a', text: 'Adding "please" and "thank you"' },
      { id: 'b', text: 'Writing the prompt in capital letters' },
      { id: 'c', text: 'Specifying the audience, purpose, required sections and output format' },
      { id: 'd', text: 'Keeping the prompt to under five words' },
    ],
    correct_answer: 'c',
  },
  {
    id: 'com-pre-008', department_id: null, question_type: 'prompt_writing', competency: 'prompt_engineering', difficulty: 'hard', max_marks: 5, assessment_phase: 'pre',
    question_text: 'Write a prompt that asks an AI assistant to convert rough site-meeting notes into a structured action list.',
    scenario_text: 'Notes (excerpt): "slab casting blk C pushed — pump not available — Ramesh to check alt vendor by thu; drawings rev for staircase pending from consultant; safety audit next week, need PPE count".',
    rubric: '1 mark each: (1) role/context given (2) required columns e.g. action, owner, due date, status (3) instruction to flag missing owners/dates instead of inventing them (4) output format (table) (5) tone/brevity guidance',
  },
  {
    id: 'com-pre-009', department_id: null, question_type: 'mcq', competency: 'document_analysis', difficulty: 'hard', max_marks: 2, assessment_phase: 'pre',
    question_text: 'You need AI help to find every clause in a 60-page contract that creates a financial obligation for your company. What is the most reliable instruction?',
    options: [
      { id: 'a', text: '"Summarise the contract."' },
      { id: 'b', text: '"List every clause that creates a payment, penalty, security, indemnity or cost obligation for the Contractor; quote the clause number and wording; say \'not found\' if a category is absent."' },
      { id: 'c', text: '"Is this contract good for us?"' },
      { id: 'd', text: '"Find the risky parts."' },
    ],
    correct_answer: 'b',
  },
  {
    id: 'com-pre-010', department_id: null, question_type: 'document_analysis', competency: 'document_analysis', difficulty: 'hard', max_marks: 6, assessment_phase: 'pre',
    question_text: 'Explain how you would use AI to compare two versions of an internal procedure document and produce a change summary for your team.',
    rubric: '1 mark each: (1) provide both versions clearly labelled (2) ask for section-wise added/removed/modified items (3) ask for impact of each change (4) request quotes/section references (5) manually spot-check changes against source (6) circulate in a clear format',
  },
  {
    id: 'com-pre-011', department_id: null, question_type: 'mcq', competency: 'data_analysis', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'An AI assistant calculates totals from a spreadsheet you pasted and reports a grand total. What is the best practice before using that number?',
    options: [
      { id: 'a', text: 'Reconcile the total with a spreadsheet formula or a control total, because AI arithmetic on pasted data can be wrong' },
      { id: 'b', text: 'Accept it — AI is a computer and computers do not make arithmetic errors' },
      { id: 'c', text: 'Round it to the nearest lakh' },
      { id: 'd', text: 'Ask the AI if it is sure' },
    ],
    correct_answer: 'a',
  },
  {
    id: 'com-pre-012', department_id: null, question_type: 'data_analysis', competency: 'data_analysis', difficulty: 'hard', max_marks: 6, assessment_phase: 'pre',
    question_text: 'You have a monthly table of 8 project sites with planned vs actual progress (%). Describe how you would use AI to identify which sites need management attention.',
    rubric: '1 mark each: (1) clean/structure data before sharing (2) define a variance threshold (3) ask AI to rank by variance and trend (4) ask for likely causes as hypotheses, not facts (5) verify flagged sites with site data (6) present concise exception summary',
  },
  {
    id: 'com-pre-013', department_id: null, question_type: 'mcq', competency: 'critical_verification', difficulty: 'hard', max_marks: 2, assessment_phase: 'pre',
    question_text: 'An AI summary of a circular cites "Clause 7.4" for a key requirement. When you open the circular, it has only 6 sections. What has most likely happened?',
    options: [
      { id: 'a', text: 'The circular you opened is incomplete' },
      { id: 'b', text: 'The AI fabricated (hallucinated) the reference; the underlying claim must also be treated as unverified' },
      { id: 'c', text: 'Clause numbers do not matter if the content sounds right' },
      { id: 'd', text: 'The AI is referring to a future version of the circular' },
    ],
    correct_answer: 'b',
  },
  {
    id: 'com-pre-014', department_id: null, question_type: 'multiple_select', competency: 'critical_verification', difficulty: 'hard', max_marks: 3, assessment_phase: 'pre',
    question_text: 'Select ALL information that should NOT be pasted into a public, non-enterprise AI tool without approval.',
    options: [
      { id: 'a', text: 'Employee salary and bank details' },
      { id: 'b', text: 'Unpublished bid prices and margins' },
      { id: 'c', text: 'A generic question on how to structure meeting minutes' },
      { id: 'd', text: 'Client contract documents marked confidential' },
    ],
    correct_answer: ['a', 'b', 'd'],
  },
  {
    id: 'com-pre-015', department_id: null, question_type: 'short_answer', competency: 'critical_verification', difficulty: 'hard', max_marks: 4, assessment_phase: 'pre',
    question_text: 'List four checks you would perform on an AI-generated management summary before forwarding it to your Head of Department.',
    rubric: '1 mark each for any four: numbers reconciled to source; references/clauses exist; no invented facts; key exclusions/assumptions stated; tone and confidentiality appropriate; dates verified; matches the question asked',
  },
  {
    id: 'com-pre-016', department_id: null, question_type: 'mcq', competency: 'productivity_automation', difficulty: 'medium', max_marks: 2, assessment_phase: 'pre',
    question_text: 'Which task is the best candidate for building a reusable AI prompt template in your department?',
    options: [
      { id: 'a', text: 'A one-time personal question' },
      { id: 'b', text: 'A task with legal sign-off that must not be touched by AI' },
      { id: 'c', text: 'A frequent, repetitive document task with a consistent structure, such as a weekly status summary' },
      { id: 'd', text: 'Tasks where no input data is available' },
    ],
    correct_answer: 'c',
  },
  {
    id: 'com-pre-017', department_id: null, question_type: 'workflow_design', competency: 'workflow_design', difficulty: 'hard', max_marks: 8, assessment_phase: 'pre',
    question_text: 'Pick one recurring task in your role that takes at least two hours a week. Design an AI-assisted workflow for it.',
    rubric: '1 mark each: (1) task clearly defined (2) inputs identified (3) prompt/steps specified (4) where AI is used vs human (5) verification step (6) data confidentiality considered (7) output format/handoff (8) realistic time saving estimate',
  },
  {
    id: 'com-pre-018', department_id: null, question_type: 'long_answer', competency: 'productivity_automation', difficulty: 'medium', max_marks: 5, assessment_phase: 'pre',
    question_text: 'Describe how you currently use (or would like to use) AI tools in your work, and what stops you from using them more.',
    rubric: '1 mark each: (1) specific current or intended tasks (2) realistic benefits (3) barriers identified honestly (4) awareness of risks (5) concrete next step',
  },
];

export const COMMON_POST_QUESTIONS: Partial<Question>[] = [
  {
    id: 'com-post-001', department_id: null, question_type: 'mcq', competency: 'ai_fundamentals', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'Why can an AI assistant give two different answers to the same question about a project report?',
    options: [
      { id: 'a', text: 'It is connected to the project server and the data changed' },
      { id: 'b', text: 'It is malfunctioning and should not be used' },
      { id: 'c', text: 'Different users receive different models' },
      { id: 'd', text: 'Responses are generated probabilistically and are sensitive to wording and context, so consistency must come from clear prompts and verification' },
    ],
    correct_answer: 'd',
  },
  {
    id: 'com-post-002', department_id: null, question_type: 'mcq', competency: 'ai_fundamentals', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'A document is longer than what the AI tool can process in one go. What is the most sound approach?',
    options: [
      { id: 'a', text: 'Split it into logical sections, analyse each with the same instructions, then consolidate and check for items that span sections' },
      { id: 'b', text: 'Upload it anyway and trust the summary' },
      { id: 'c', text: 'Only analyse the executive summary' },
      { id: 'd', text: 'Ask the AI to guess the rest of the content' },
    ],
    correct_answer: 'a',
  },
  {
    id: 'com-post-003', department_id: null, question_type: 'multiple_select', competency: 'generative_ai', difficulty: 'hard', max_marks: 3, assessment_phase: 'post',
    question_text: 'Select ALL statements that correctly describe responsible use of generative AI at Suroj Buildcon.',
    options: [
      { id: 'a', text: 'The employee who uses the AI output remains accountable for its accuracy' },
      { id: 'b', text: 'AI drafts may be sent to clients without review if the deadline is tight' },
      { id: 'c', text: 'Confidential data should only be used in approved tools' },
      { id: 'd', text: 'Numerical outputs should be reconciled to source data' },
    ],
    correct_answer: ['a', 'c', 'd'],
  },
  {
    id: 'com-post-004', department_id: null, question_type: 'scenario', competency: 'generative_ai', difficulty: 'hard', max_marks: 6, assessment_phase: 'post',
    question_text: 'Your Head of Department asks whether the team can use AI to prepare the monthly management report. Give a balanced recommendation covering where AI helps, where it must not be relied upon, and the controls you would put in place.',
    rubric: '1 mark each: (1) drafting/summarising benefits (2) analysis support benefits (3) limits on final numbers/decisions (4) verification control (5) confidentiality/tool control (6) ownership & sign-off',
  },
  {
    id: 'com-post-005', department_id: null, question_type: 'prompt_writing', competency: 'claude_usage', difficulty: 'hard', max_marks: 6, assessment_phase: 'post',
    question_text: 'Write the sequence of 3–4 prompts you would use in a single Claude conversation to turn a 30-page document into a decision note for management.',
    rubric: '1 mark each: (1) context/role prompt (2) structured extraction prompt (3) analysis/risks prompt (4) decision-note drafting prompt with format (5) self-check prompt asking for uncertain points/references (6) logical sequencing',
  },
  {
    id: 'com-post-006', department_id: null, question_type: 'mcq', competency: 'claude_usage', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'Claude returns a comparison table but one row contains a value you cannot find in the source. What is the best next step?',
    options: [
      { id: 'a', text: 'Delete the table and stop using AI for this task' },
      { id: 'b', text: 'Keep the value; the AI probably inferred it correctly' },
      { id: 'c', text: 'Ask Claude to show the exact source text for that value, verify it yourself, and correct or remove it if unsupported' },
      { id: 'd', text: 'Replace it with an average of the other rows' },
    ],
    correct_answer: 'c',
  },
  {
    id: 'com-post-007', department_id: null, question_type: 'prompt_writing', competency: 'prompt_engineering', difficulty: 'expert', max_marks: 8, assessment_phase: 'post',
    question_text: 'Write a reusable prompt template your department could use every week. Include placeholders, constraints and a verification instruction.',
    rubric: '1 mark each: (1) clear role (2) task and purpose (3) placeholders for inputs (4) output structure (5) constraints e.g. length/tone (6) instruction to flag missing data instead of guessing (7) references to source required (8) explicit reviewer check step',
  },
  {
    id: 'com-post-008', department_id: null, question_type: 'mcq', competency: 'prompt_engineering', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'Which addition most reduces the risk of an AI inventing information when extracting data from a document?',
    options: [
      { id: 'a', text: '"Be creative."' },
      { id: 'b', text: '"Answer in one sentence."' },
      { id: 'c', text: '"Use your general knowledge where the document is unclear."' },
      { id: 'd', text: '"Only use the provided document. If an item is not stated, write \'Not stated\' and do not infer it. Cite the section for each item."' },
    ],
    correct_answer: 'd',
  },
  {
    id: 'com-post-009', department_id: null, question_type: 'document_analysis', competency: 'document_analysis', difficulty: 'expert', max_marks: 8, assessment_phase: 'post',
    question_text: 'You receive three related documents — a client letter, the contract clause it refers to, and your internal note. Describe how you would use AI to check consistency between them and draft a response.',
    rubric: '1 mark each: (1) label documents clearly (2) extract claims from the letter (3) map each claim to the clause (4) identify inconsistencies with internal note (5) ask for quotes/references (6) human verification of the mapping (7) draft response tone and structure (8) approval before sending',
  },
  {
    id: 'com-post-010', department_id: null, question_type: 'mcq', competency: 'document_analysis', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'You used AI to extract 25 obligations from a contract. What is the most efficient yet safe way to validate the extraction?',
    options: [
      { id: 'a', text: 'Check each obligation\'s cited clause in the source, and separately scan high-risk sections (payment, penalties, termination) for anything missed' },
      { id: 'b', text: 'Check only the first five obligations' },
      { id: 'c', text: 'Ask the AI to rate its own confidence and skip high-confidence items' },
      { id: 'd', text: 'No validation is needed if the list looks complete' },
    ],
    correct_answer: 'a',
  },
  {
    id: 'com-post-011', department_id: null, question_type: 'data_analysis', competency: 'data_analysis', difficulty: 'expert', max_marks: 8, assessment_phase: 'post',
    question_text: 'You have a 2,000-row export from your ERP. Explain how you would use AI to analyse it safely and produce three management insights.',
    rubric: '1 mark each: (1) remove/mask sensitive fields (2) describe columns/data dictionary to AI (3) ask for formulas/pivot approach rather than relying on AI arithmetic (4) validate totals with control figures (5) ask for trends/outliers (6) treat causes as hypotheses (7) insights linked to evidence (8) concise management format',
  },
  {
    id: 'com-post-012', department_id: null, question_type: 'mcq', competency: 'data_analysis', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'AI identifies that "costs rose 18% because of rain delays." Your data contains cost and date columns but no weather information. How should this be treated?',
    options: [
      { id: 'a', text: 'Report it — the AI has access to weather data' },
      { id: 'b', text: 'Treat it as an unsupported hypothesis; report only what the data shows and investigate the cause separately' },
      { id: 'c', text: 'Change it to 20% to be conservative' },
      { id: 'd', text: 'Delete the cost data' },
    ],
    correct_answer: 'b',
  },
  {
    id: 'com-post-013', department_id: null, question_type: 'output_evaluation', competency: 'critical_verification', difficulty: 'expert', max_marks: 6, assessment_phase: 'post',
    question_text: 'Evaluate this AI output and list what you would check or correct before use:',
    scenario_text: 'AI output: "As per Section 194C, TDS on contractor payments is always 2%. The vendor\'s GSTIN 27ABCDE1234F1Z5 is valid and active. Total payable after TDS on ₹4,50,000 is ₹4,41,000."',
    rubric: '1 mark each: (1) 194C rate depends on payee type (1%/2%) – "always" is wrong (2) GSTIN validity cannot be confirmed by AI – verify on portal (3) arithmetic check: 2% of 4,50,000 = 9,000 → 4,41,000 only if 2% applies (4) threshold/exemption conditions (5) whether TDS base excludes GST (6) cite current rules/source',
  },
  {
    id: 'com-post-014', department_id: null, question_type: 'mcq', competency: 'critical_verification', difficulty: 'expert', max_marks: 2, assessment_phase: 'post',
    question_text: 'Which practice gives the strongest assurance that an AI-assisted report is fit to circulate?',
    options: [
      { id: 'a', text: 'Running the same prompt twice and comparing answers' },
      { id: 'b', text: 'Using a longer prompt' },
      { id: 'c', text: 'Independent verification of facts and figures against source records, with a named reviewer signing off' },
      { id: 'd', text: 'Asking a second AI tool whether the first one is right' },
    ],
    correct_answer: 'c',
  },
  {
    id: 'com-post-015', department_id: null, question_type: 'multiple_select', competency: 'critical_verification', difficulty: 'hard', max_marks: 3, assessment_phase: 'post',
    question_text: 'Select ALL signs that an AI response may contain hallucinated content.',
    options: [
      { id: 'a', text: 'Specific clause numbers or citations that cannot be located in the source' },
      { id: 'b', text: 'Precise figures that do not appear in the input data' },
      { id: 'c', text: 'The response quotes text that exactly matches the source' },
      { id: 'd', text: 'Confident statements about events after the material you provided' },
    ],
    correct_answer: ['a', 'b', 'd'],
  },
  {
    id: 'com-post-016', department_id: null, question_type: 'workflow_design', competency: 'workflow_design', difficulty: 'expert', max_marks: 10, assessment_phase: 'post',
    question_text: 'Design an end-to-end AI-assisted workflow for a cross-department process (for example: tender receipt → cost estimate → management approval). Show handoffs, controls and accountability.',
    rubric: '1 mark each: (1) process boundary defined (2) departments/roles mapped (3) AI steps identified (4) human decision points (5) verification controls (6) data confidentiality (7) templates/prompts reused (8) handoff artefacts (9) turnaround/time metrics (10) feedback/improvement loop',
  },
  {
    id: 'com-post-017', department_id: null, question_type: 'scenario', competency: 'productivity_automation', difficulty: 'hard', max_marks: 6, assessment_phase: 'post',
    question_text: 'Since the workshop, identify two tasks you now perform with AI assistance. For each, describe the before/after process, time saved and how you ensure quality.',
    rubric: '3 marks per task: (1) concrete before/after process (2) plausible time saving (3) quality/verification control',
  },
  {
    id: 'com-post-018', department_id: null, question_type: 'mcq', competency: 'productivity_automation', difficulty: 'hard', max_marks: 2, assessment_phase: 'post',
    question_text: 'Your team wants to scale AI usage. Which step creates the most durable productivity improvement?',
    options: [
      { id: 'a', text: 'Each person experiments privately with no shared practices' },
      { id: 'b', text: 'Build a shared library of tested prompt templates, examples and verification checklists for recurring tasks' },
      { id: 'c', text: 'Mandate AI for every task regardless of fit' },
      { id: 'd', text: 'Ban AI use until a perfect tool is available' },
    ],
    correct_answer: 'b',
  },
];
