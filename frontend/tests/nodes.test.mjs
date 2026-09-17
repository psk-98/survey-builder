import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurveyNode } from '../src/features/survey-builder/helpers/nodes.ts';
import { serializeSurvey } from '../src/features/survey-builder/helpers/serialization.ts';
test('new option nodes start with locally scoped short IDs and independent data', () => {
 const first = createSurveyNode('options', 'first', { x: 10, y: 20 });
 const second = createSurveyNode('options', 'second', { x: 30, y: 40 });
 assert.deepEqual(first.data.options.map(o => o.id), ['option_1','option_2']);
 first.data.options[0].label = 'Updated';
 assert.equal(second.data.options[0].label, 'Option 1');
 assert.equal(second.id, 'second');
});
test('node factory exports a valid End shape without editor selection state', () => {
 const node = createSurveyNode('end', 'alternate-end', { x: 50, y: 60 });
 const document = serializeSurvey('Test', [node], []);
 assert.deepEqual(document.nodes[0], { id: 'alternate-end', type: 'end', position: { x: 50, y: 60 }, data: { label: 'Thank you!', content: '', options: [] } });
});
