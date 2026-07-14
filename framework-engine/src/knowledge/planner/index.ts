/**
 * index.ts — Query Planner Engine
 *
 * Exporta todos os componentes públicos da camada do planejador de consulta.
 * Posicionada antes da execução do Resolver.
 */

export * from './QueryPlanner.ts';
export * from './QueryPlan.ts';
export * from './QueryNode.ts';
export * from './PlanningContext.ts';
export * from './PlanningPolicy.ts';
export * from './PlanningMetrics.ts';
export * from './PlanningSnapshot.ts';
export * from './PlanningErrors.ts';
export * from './PlanningStrategy.ts';
