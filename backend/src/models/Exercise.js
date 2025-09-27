// FILE: models/Exercise.js
const { Schema, model, Types } = require('mongoose');


const exerciseTranslationSchema = new Schema({
name: { type: String },
question: { type: String, required: true },
explanation: { type: String }
}, { _id: false });


const testCaseSchema = new Schema({
input: Schema.Types.Mixed,
expected: Schema.Types.Mixed,
points: { type: Number, default: 1 }
}, { _id: false });


const matchingPairSchema = new Schema({
id: { type: String, required: true },
content: { type: String, required: true }
}, { _id: false });


const blockSchema = new Schema({
id: { type: String, required: true },
code: { type: String, required: true }
}, { _id: false });


const exerciseSchema = new Schema({
translations: {
fr: { type: exerciseTranslationSchema },
en: { type: exerciseTranslationSchema },
ar: { type: exerciseTranslationSchema }
},
type: {
type: String,
enum: [
'QCM',
'DragDrop',
'TextInput',
'Code',
'OrderBlocks',
'FillInTheBlank',
'SpotTheError',
'Matching'
],
required: true
},
// Champs communs
solutions: { type: [Schema.Types.Mixed], default: [] },


// Champs spécifiques aux types
options: { type: [String], default: [] },
elements: { type: [Schema.Types.Mixed], default: [] },
targets: { type: [Schema.Types.Mixed], default: [] },
testCases: { type: [testCaseSchema], default: [] },
blocks: { type: [blockSchema], default: [] },
codeSnippet: { type: String },
prompts: { type: [matchingPairSchema], default: [] },
matches: { type: [matchingPairSchema], default: [] },


level: { type: Types.ObjectId, ref: 'Level', required: true }
}, {
timestamps: true
});


module.exports = model('Exercise', exerciseSchema);