import test from 'node:test'
import assert from 'node:assert/strict'
import { initialNodes, initialEdges } from '../src/features/survey-builder/fixtures.ts';
import { serializeSurvey } from '../src/features/survey-builder/helpers/serialization.ts';
import { canConnect } from '../src/features/survey-builder/helpers/graph.ts';
test('export preserves branch identities and positions, excluding editor internals', () => {
  const nodes = initialNodes.map(n => ({ ...n, selected: true, measured: { width: 246, height: 200 } }))
  const result = JSON.parse(JSON.stringify(serializeSurvey('Test', nodes, initialEdges)))
  assert.equal(result.startNodeId, 'start')
  assert.equal(result.schemaVersion, 1)
  assert.equal(result.nodes.length, 4)
  assert.equal(result.edges.length, 5)
  assert.equal('selected' in result.nodes[0], false)
  assert.equal('measured' in result.nodes[0], false)
  assert.deepEqual(result.nodes[0].position, initialNodes[0].position)
  for (const edge of result.edges.filter(e => e.source === 'question')) {
    assert.ok(result.nodes.find(n => n.id === 'question').data.options.some(o => o.id === edge.sourceHandle))
  }
})
test('rejects cycles, self-links, links into start and links out of end', () => {
  assert.equal(canConnect('question', 'intro', 'option_1', initialNodes, initialEdges), false)
  assert.equal(canConnect('intro', 'intro', 'next', initialNodes, initialEdges), false)
  assert.equal(canConnect('intro', 'start', 'next', initialNodes, initialEdges), false)
  assert.equal(canConnect('end', 'intro', 'next', initialNodes, initialEdges), false)
  assert.equal(canConnect('intro', 'end', 'next', initialNodes, initialEdges), true)
})

const { checkPaths } = await import('../src/features/survey-builder/helpers/graph.ts');
test('complete branching survey passes with a shared ending', () => {
  assert.deepEqual(checkPaths(initialNodes, initialEdges), { valid: true, issues: [], endCount: 1 });
});
test('separate branches can terminate at separate End nodes', () => {
  const nodes = [...initialNodes, { ...initialNodes[3], id: 'end-two' }];
  const edges = initialEdges.map(e => e.sourceHandle === 'option_3' ? { ...e, target: 'end-two' } : e);
  assert.equal(checkPaths(nodes, edges).valid, true);
  assert.equal(checkPaths(nodes, edges).endCount, 2);
  assert.equal(canConnect('question', 'end-two', 'option_3', nodes, initialEdges), true);
  assert.equal(canConnect('end-two', 'intro', 'next', nodes, edges), false);
});
test('one completed branch cannot hide an unconnected choice', () => {
  const result = checkPaths(initialNodes, initialEdges.filter(e => e.sourceHandle !== 'option_3'));
  assert.equal(result.valid, false);
  assert.equal(result.issues.length, 1);
  assert.match(result.issues[0].message, /Could be better/);
  assert.equal(result.issues[0].nodeId, 'question');
});
test('a branch into a dead-end text block fails even if other branches finish', () => {
  const nodes = [...initialNodes, { ...initialNodes[1], id: 'dead' }];
  const edges = initialEdges.map(e => e.sourceHandle === 'option_3' ? { ...e, target: 'dead' } : e);
  const result = checkPaths(nodes, edges);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(i => i.nodeId === 'dead' && /no next block/.test(i.message)));
});
test('unused End blocks are flagged; deletion of an ending exposes incomplete choices', () => {
  assert.equal(checkPaths([...initialNodes, { ...initialNodes[3], id: 'unused' }], initialEdges).valid, false);
  const result = checkPaths(initialNodes.filter(n => n.type !== 'end'), initialEdges.filter(e => e.target !== 'end'));
  assert.equal(result.valid, false);
  assert.equal(result.issues.filter(i => i.nodeId === 'question').length, 3);
});
test('cycles fail even with an exit to End', () => {
  const edges = initialEdges.map(e => e.sourceHandle === 'option_3' ? { ...e, target: 'intro' } : e);
  assert.ok(checkPaths(initialNodes, edges).issues.some(i => /loop/.test(i.message)));
});
test('nested branching and reconverging paths pass', () => {
  const nested = { ...initialNodes[2], id: 'nested' };
  const nodes = [...initialNodes, nested];
  const edges = [...initialEdges.map(e => e.sourceHandle === 'option_3' ? { ...e, target: 'nested' } : e), ...nested.data.options.map(o => ({ id: `nested-${o.id}`, source: 'nested', sourceHandle: o.id, target: 'end' }))];
  assert.equal(checkPaths(nodes, edges).valid, true);
  assert.equal(checkPaths(nodes, edges.filter(e => e.id !== 'nested-option_2')).valid, false);
});
test('empty graph, no choices, dangling edges, invalid handles, duplicate outputs and extra Starts fail', () => {
  assert.equal(checkPaths([], []).valid, false);
  assert.equal(checkPaths(initialNodes.map(n => n.type === 'options' ? { ...n, data: { ...n.data, options: [] } } : n), initialEdges).valid, false);
  assert.equal(checkPaths(initialNodes, [...initialEdges, { id: 'bad', source: 'intro', target: 'missing', sourceHandle: 'next' }]).valid, false);
  assert.equal(checkPaths(initialNodes, initialEdges.map(e => e.source === 'start' ? { ...e, sourceHandle: 'invalid' } : e)).valid, false);
  assert.equal(checkPaths(initialNodes, [...initialEdges, { id: 'duplicate', source: 'start', target: 'end', sourceHandle: 'next' }]).valid, false);
  assert.equal(checkPaths([...initialNodes, { ...initialNodes[0], id: 'extra-start' }], initialEdges).valid, false);
});

const { nextOptionId } = await import('../src/features/survey-builder/helpers/options.ts');
test('short option IDs avoid collisions after deleting a middle choice', () => {
  assert.equal(nextOptionId([]), 'option_1');
  const options = [{ id: 'option_1', label: 'Renamed' }, { id: 'option_3', label: 'Third' }];
  assert.equal(nextOptionId(options), 'option_4');
  assert.equal(nextOptionId([{ id: 'legacy-uuid', label: 'Older choice' }]), 'option_1');
  assert.equal(nextOptionId([{ id: 'option_10', label: 'Tenth' }]), 'option_11');
});
