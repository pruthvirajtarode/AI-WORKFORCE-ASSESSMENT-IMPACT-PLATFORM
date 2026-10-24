import fs from 'node:fs';

import path from 'node:path';

import ts from 'typescript';



const root = process.cwd();

const sourceDir = root;

const output = path.join(root, 'src', 'data', 'departmentalAssessments.json');



const definitions = [

  {

    number: 1,

    title: 'EPC Bids & Design-Build / Tendering & Contracts',

    description: 'Long tender document analysis, obligation extraction, eligibility checking, and pre-bid query generation.',

    category: 'Winning Work',

  },

  {

    number: 2,

    title: 'Accounts & Finance',

    description: 'Invoice reconciliation, GSTR-2A/2B reconciliation, TDS review, bank reconciliation, notice response drafting.',

    category: 'Numbers, Drawings & Systems',

  },

  {

    number: 3,

    title: 'People, Admin & Communication',

    description: 'Letter drafting, tone control, policy documents, meeting minutes, presentations, internal communication.',

    category: 'People & Communication',

  },

  {

    number: 4,

    title: 'Cost Control, Planning & Systems',

    description: 'Budget vs actual, schedule analysis, monthly reporting, dashboard creation, forecast-at-completion.',

    category: 'Numbers, Drawings & Systems',

  },

  {

    number: 5,

    title: 'Procurement & Stores',

    description: 'Vendor quotations, quotation normalisation, purchase orders, vendor comparison, delivery tracking, inventory.',

    category: 'Running Site & Materials',

  },

  {

    number: 6,

    title: 'Design, Drawings & Quantities',

    description: 'Drawings, specifications, quantities, BBS checking, revisions, correspondence, take-off verification.',

    category: 'Numbers, Drawings & Systems',

  },

];



function literalValue(node) {

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;

  if (ts.isNumericLiteral(node)) return Number(node.text);

  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;

  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;

  if (node.kind === ts.SyntaxKind.NullKeyword) return null;

  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literalValue);

  if (ts.isObjectLiteralExpression(node)) {

    return Object.fromEntries(node.properties.map((property) => {

      if (!ts.isPropertyAssignment(property)) throw new Error('Unsupported property in source assessment data');

      const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)

        ? property.name.text

        : undefined;

      if (!key) throw new Error('Unsupported property name in source assessment data');

      return [key, literalValue(property.initializer)];

    }));

  }

  throw new Error(`Unsupported source value: ${node.getText()}`);

}



function findConstant(sourceFile, name) {

  let result;

  function visit(node) {

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {

      result = node.initializer;

    }

    ts.forEachChild(node, visit);

  }

  visit(sourceFile);

  if (!result) throw new Error(`Could not find ${name} in assessment HTML`);

  return result;

}



function plainText(html) {

  return html

    .replace(/<br\s*\/?\s*>/gi, '\n')

    .replace(/<\/(p|div|li)>/gi, '\n')

    .replace(/<[^>]+>/g, '')

    .replace(/&nbsp;/g, ' ')

    .replace(/&amp;/g, '&')

    .replace(/&lt;/g, '<')

    .replace(/&gt;/g, '>')

    .replace(/&quot;/g, '"')

    .replace(/&#39;|&apos;/g, "'")

    .replace(/[ \t]+\n/g, '\n')

    .replace(/\n{3,}/g, '\n\n')

    .trim();

}



function matches(html, expression, label) {

  const found = html.match(expression);

  if (!found) throw new Error(`Could not extract ${label}`);

  return found[1];

}



function questionCount(parts) {

  return parts.reduce((count, part) => count + part.qs.length, 0);

}



function responseCount(parts) {

  return parts.reduce((count, part) => count + part.qs.reduce((partCount, question) => (

    partCount + (question.type === 'cw' ? Object.keys(question.items).length : 1)

  ), 0), 0);

}



const htmlFiles = fs.readdirSync(sourceDir).filter((name) => /^Suroj S[1-6] assessment.*\.html$/i.test(name));

const assessments = definitions.map((definition) => {

  const sessionDefinition = Object.fromEntries(Object.entries(definition).filter(([key]) => key !== 'expected'));

  const filename = htmlFiles.find((name) => name.startsWith(`Suroj S${definition.number} assessment`));

  if (!filename) throw new Error(`Missing source HTML for session ${definition.number}`);



  const html = fs.readFileSync(path.join(sourceDir, filename), 'utf8');

  const script = matches(html, /<script>([\s\S]*?)<\/script>/i, `script for session ${definition.number}`);

  const source = ts.createSourceFile(filename, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);

  const parts = literalValue(findConstant(source, 'PARTS'));

  const autoQuestionIds = literalValue(findConstant(source, 'AUTO'));

  const title = plainText(matches(html, /<title>([\s\S]*?)<\/title>/i, 'title'));

  const headline = plainText(matches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 'headline'));

  const introduction = plainText(matches(html, /<p class="lede">([\s\S]*?)<\/p>/i, 'introduction'));

  const durationMinutes = Number(matches(html, /<b>(\d+)\s*min<\/b>/i, 'duration'));

  const facts = plainText(matches(html, /<div class="facts">([\s\S]*?)<\/div>\s*<\/div>/i, 'assessment facts'));

  const totalMarks = Number(matches(html, /<b>(\d+) marks<\/b>/i, 'total marks'));

  const markSplit = facts.match(/(\d+) auto-scored, (\d+) marked by the trainer/);

  if (!markSplit) throw new Error(`Could not extract scoring split for session ${definition.number}`);



  const normalizedParts = parts.map((part) => ({

    ...part,

    briefText: plainText(part.brief),

    files: [...part.brief.matchAll(/<code>([\s\S]*?)<\/code>/gi)].map((match) => plainText(match[1])),

  }));

  const flattenedIds = normalizedParts.flatMap((part) => part.qs.flatMap((question) => (

    question.type === 'cw' ? Object.keys(question.items) : [question.id]

  )));

  const halfMarkIds = normalizedParts.flatMap((part) => part.qs.flatMap((question) => (

    question.type === 'cw' ? Object.keys(question.items) : []

  )));

  const manualQuestionIds = normalizedParts.flatMap((part) => part.qs

    .filter((question) => question.manual)

    .map((question) => question.id));

  const manualMarks = Object.fromEntries(normalizedParts.flatMap((part) => part.qs

    .filter((question) => question.manual)

    .map((question) => {

      const markCount = `${question.text} ${part.brief}`.match(/(\d+(?:\.\d+)?)\s*marks?/i);

      return [question.id, markCount ? Number(markCount[1]) : null];

    })));



  return {

    ...sessionDefinition,

    sourceFile: filename,

    sourceTitle: title,

    headline,

    introduction,

    durationMinutes,

    questionCount: questionCount(normalizedParts),

    responseCount: responseCount(normalizedParts),

    totalMarks,

    scoring: {

      autoMarks: Number(markSplit[1]),

      trainerMarks: Number(markSplit[2]),

      autoQuestionIds,

      halfMarkIds,

      manualQuestionIds,

      manualMarks,

      rules: {

        choice: 'Exact option match',

        multi: 'Exact set match; all and only correct options are required',

        num: 'Accepted within the trainer-key minimum and maximum range',

        text: 'Compared after trimming, uppercasing and removing whitespace',

        correctWrong: 'Each source Correct/Wrong row is worth 0.5 marks',

        trainer: 'Trainer-marked responses are scored manually using the source assessment rubric',

      },

    },

    instructions: [

      'Complete the assessment parts in order.',

      plainText(matches(html, /<p class="note"[^>]*>([\s\S]*?)<\/p>/i, 'save instruction'))

        .replace('Your answers save on this device as you go. Nothing reaches the trainer until you press Submit at the end.',

          'Your answers save with your assessment attempt as you go. The attempt is submitted when you press Submit at the end.'),

    ],

    parts: normalizedParts,

    questionIds: flattenedIds,

  };

});



const invalidAssessment = assessments.find((assessment) => {
  const uniqueQuestionIds = new Set(assessment.questionIds);
  return assessment.durationMinutes <= 0
    || assessment.questionCount === 0
    || assessment.responseCount < assessment.questionCount
    || uniqueQuestionIds.size !== assessment.questionIds.length
    || assessment.totalMarks !== assessment.scoring.autoMarks + assessment.scoring.trainerMarks;
});

if (assessments.length !== 6 || assessments.some((assessment) => assessment.durationMinutes !== 30) || invalidAssessment) {
  throw new Error(invalidAssessment
    ? `Invalid extracted assessment data for session ${invalidAssessment.number}`
    : `Expected six source assessments with 30-minute timers; extracted ${assessments.length} sessions`);
}

fs.writeFileSync(output, `${JSON.stringify(assessments, null, 2)}\n`);

for (const assessment of assessments) {

  console.log(`Session ${assessment.number}: ${assessment.questionCount} questions, ${assessment.durationMinutes} min, ${assessment.totalMarks} marks (${assessment.scoring.autoMarks} auto / ${assessment.scoring.trainerMarks} trainer), ${assessment.parts.length} parts`);

}

console.log(`Wrote ${path.relative(root, output)}`);
