/**
 * PromptAssembler.test.ts
 *
 * Testes unitários da segunda geração de Prompt Assembly.
 * Cobrem layout, orçamento (budget), políticas, otimizador, prioridades, compressão/podagem, fallback e snapshots.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PromptAssembler } from './PromptAssembler.ts';
import { PromptSection } from './PromptSection.ts';
import { PromptBudget } from './PromptBudget.ts';
import { PromptPolicies } from './PromptPolicies.ts';
import { PromptLayout } from './PromptLayout.ts';
import { PromptBudgetExceeded, MandatorySectionMissing } from './PromptErrors.ts';

// ─── Testes ───────────────────────────────────────────────────────────────────

test('PromptBudget: defaults work and calculations are correct', () => {
  const budget = new PromptBudget();
  assert.equal(budget.maxTokens, 16000);
  assert.equal(budget.getUsableBudget(), 13200); // 16000 - 2000 reserved - 800 safety (5%)
  assert.ok(budget.fits(5000));
  assert.ok(!budget.fits(15000));
  assert.ok(budget.shouldCompress(13000)); // > 80% do máximo
});

test('PromptSection: estimates and renders correctly', () => {
  const section = new PromptSection({
    name: 'Task',
    content: 'Define some coding rules',
  });
  
  assert.equal(section.estimateTokens(), 6); // 24 / 4
  const rendered = section.render();
  assert.ok(rendered.includes('## Task'));
  assert.ok(rendered.includes('Define some coding rules'));
});

test('PromptLayout: presets loading', () => {
  const layout = PromptLayout.getPreset('compact');
  assert.equal(layout.name, 'Compact');
  assert.deepEqual(layout.sectionsOrder, ['System', 'Task', 'Rules', 'Context', 'Output Format']);
});

test('PromptAssembler: applies layout formatting correctly', () => {
  const assembler = new PromptAssembler({
    layoutPreset: 'compact',
  });

  const sections = [
    new PromptSection({ name: 'Task', content: 'Do task' }),
    new PromptSection({ name: 'System', content: 'System instruction' }),
  ];

  const ordered = assembler.layout(sections, 'compact');
  
  // Deve reordenar: System primeiro, depois Task conforme preset
  assert.equal(ordered[0].name, 'System');
  assert.equal(ordered[1].name, 'Task');
});

test('PromptAssembler: removes redundancies in section content', () => {
  const assembler = new PromptAssembler({
    policies: {
      mandatorySections: ['System'],
    }
  });
  const sections = [
    new PromptSection({ name: 'System', content: '  Hello \n\n\n World \n\n' }),
  ];

  const result = assembler.assemble(sections);
  assert.equal(result.promptText, '## System\n\nHello \n\n World');
});

test('PromptAssembler: throws when mandatory section is missing', () => {
  const assembler = new PromptAssembler({
    policies: {
      mandatorySections: ['System'],
    }
  });

  const sections = [
    new PromptSection({ name: 'Task', content: 'Just task' }), // Sem System
  ];

  assert.throws(() => {
    assembler.assemble(sections);
  }, MandatorySectionMissing);
});

test('PromptAssembler: prunes low priority optional sections when budget exceeded', () => {
  // Limita orçamento útil para caber pouca coisa (ex: 20 tokens)
  const assembler = new PromptAssembler({
    budget: {
      maxTokens: 50,
      reservedTokens: 5,
      safetyMarginPercentage: 0.1, // 5 tokens safety. Usable = 50 - 5 - 5 = 40 tokens useful.
    },
    policies: {
      mandatorySections: ['System'],
      optionalSections: ['Context', 'Knowledge'],
      priorityRules: {
        'System': 100,
        'Context': 10,     // Muito baixa (será cortada primeiro)
        'Knowledge': 50,   // Alta (será mantida se couber)
      }
    }
  });

  const sections = [
    new PromptSection({ name: 'System', content: 'System' }), // 2 tokens
    new PromptSection({ name: 'Context', content: 'x'.repeat(120) }), // 30 tokens
    new PromptSection({ name: 'Knowledge', content: 'x'.repeat(60) }), // 15 tokens
  ];

  // Total estimado original = 2 + 30 + 15 = 47 tokens (excede limite útil de 40 tokens)
  const result = assembler.assemble(sections);

  // 'Context' (prio 10) deve ter sido descartado. 'Knowledge' (prio 50) e 'System' (mandatório) devem ser mantidos.
  assert.ok(result.promptText.includes('## System'));
  assert.ok(result.promptText.includes('## Knowledge'));
  assert.ok(!result.promptText.includes('## Context'));

  // Verifica métricas
  assert.ok(result.metrics.tokensEconomizados >= 30);
});

test('PromptAssembler: throws budget exceeded if failOnBudgetExceeded policies are strict', () => {
  const assembler = new PromptAssembler({
    budget: {
      maxTokens: 10,
      reservedTokens: 0,
      safetyMarginPercentage: 0,
    },
    policies: {
      mandatorySections: ['System'],
      budgetPolicies: {
        allowPartialContext: false,
        failOnBudgetExceeded: true,
      }
    }
  });

  const sections = [
    new PromptSection({ name: 'System', content: 'x'.repeat(100) }), // 25 tokens (excede limite de 10 tokens)
  ];

  assert.throws(() => {
    assembler.assemble(sections);
  }, PromptBudgetExceeded);
});

test('PromptAssembler: captures snapshot of final prompt', () => {
  const assembler = new PromptAssembler({
    policies: {
      mandatorySections: ['System', 'Task'],
    }
  });
  const sections = [
    new PromptSection({ name: 'System', content: 'System content' }),
    new PromptSection({ name: 'Task', content: 'Task content' }),
  ];

  const result = assembler.assemble(sections);
  const snap = assembler.getSnapshot().getSnapshot();

  assert.equal(snap.layoutName, 'Default');
  assert.equal(snap.tamanhoCaracteres, result.promptText.length);
  assert.equal(snap.secoes.length, 2);
});
