import test from 'node:test';
import assert from 'node:assert/strict';
import {filterSurveys,filterInteractions} from '../src/features/surveys/list-utils.ts';
import {definitionSchema, surveySchema, interactionSchema} from '../src/lib/api/schemas.ts';
import {initialNodes,initialEdges} from '../src/features/survey-builder/fixtures.ts';
const definition={schemaVersion:1,title:'Feedback',startNodeId:'start',nodes:initialNodes,edges:initialEdges};
const surveys=[{id:2,name:'Beta',survey_definition:{...definition,title:'Beta'}},{id:1,name:'Alpha',survey_defintion:{...definition,title:'Alpha',edges:[]}}];
const interactions=[{id:'one',survey_id:'2',completed:true,created_at:'2026-09-21T10:00:00Z',updated_at:'2026-09-21T10:02:00Z',current_step:'end',answers:[{node_id:'q1',question:'Your experience?',type:'options',answer:{id:'option_1',label:'Excellent'}}]},{id:'two',survey_id:'2',completed:false,created_at:'2026-08-01T10:00:00Z',updated_at:'2026-08-01T10:00:00Z',current_step:'question',answers:[]}];
test('survey search, status, sort compose without mutating source',()=>{
 assert.deepEqual(filterSurveys(surveys,' ALP ','incomplete','title').map(x=>x.id),[1]);
 assert.deepEqual(filterSurveys(surveys,'','ready','id-desc').map(x=>x.id),[2]);
 assert.deepEqual(filterSurveys(surveys,'','all','id-asc').map(x=>x.id),[1,2]);
 assert.equal(surveys[0].id,2);
});
test('interaction search includes choice labels; completion and dates compose',()=>{
 assert.deepEqual(filterInteractions(interactions,'excellent','completed','newest','7',Date.parse('2026-09-22')).map(x=>x.id),['one']);
 assert.deepEqual(filterInteractions(interactions,'','in-progress','newest','all').map(x=>x.id),['two']);
 assert.equal(filterInteractions(interactions,'','all','newest','1',Date.parse('2026-09-25')).length,0);
 assert.deepEqual(filterInteractions(interactions,'','all','oldest','all').map(x=>x.id),['two','one']);
});
test('schemas normalize optional content and reject malformed responses',()=>{
 const document=definitionSchema.parse({...definition,nodes:[{id:'start',type:'start',position:{x:0,y:0},data:{label:'Hello',content:null}}]});
 assert.equal(document.nodes[0].data.content,'');assert.deepEqual(document.nodes[0].data.options,[]);
 assert.equal(surveySchema.safeParse({id:1}).success,false);
 assert.equal(interactionSchema.safeParse(interactions[0]).success,true);
 assert.equal(definitionSchema.safeParse({...definition,nodes:[{id:'bad',type:'unknown'}]}).success,false);
});
