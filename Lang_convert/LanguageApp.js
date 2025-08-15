import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { AzureChatOpenAI } from "@langchain/openai";
import { configDotenv } from "dotenv";
configDotenv();

const llm = new AzureChatOpenAI({
  azure: true,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: "gpt-4o",
  azureOpenAIApiVersion: "2024-04-01-preview",
});

// Prompt templates
const punctuation = PromptTemplate.fromTemplate(`
Given a sentence, add punctuation where needed.
sentence: {sentence}
sentence with punctuation:
`);

const grammar = PromptTemplate.fromTemplate(`
Given a sentence, correct the grammar.
sentence: {punctuated}
sentence with correct grammar:
`);

const translation = PromptTemplate.fromTemplate(`
Given a sentence, translate that sentence into {language}.
sentence: {grammatically_correct_sentence}
translated sentence:
`);

const toEnglish = PromptTemplate.fromTemplate(`
Given a sentence, translate that sentence into English.
sentence: {translated}
translated sentence:
`);

// Sub-chains
const punctuationChain = RunnableSequence.from([
  punctuation,
  llm,
  new StringOutputParser(),
]);

const grammarChain = RunnableSequence.from([
  grammar,
  llm,
  new StringOutputParser(),
]);

const translationChain = RunnableSequence.from([
  translation,
  llm,
  new StringOutputParser(),
]);

const englishConversionChain = RunnableSequence.from([
  toEnglish,
  llm,
  new StringOutputParser(),
]);

// Final combined chain
const combinedChain = RunnableSequence.from([
  {
    punctuated: punctuationChain,
    original_inputs: new RunnablePassthrough(),
  },
  {
    grammatically_correct_sentence: grammarChain,
    language: ({ original_inputs }) => original_inputs.language,
  },
  {
    translated: translationChain,
    text: ({ grammatically_correct_sentence }) => grammatically_correct_sentence,
    language: ({ language }) => language,
  },
  {
    english: englishConversionChain,
    sentence: ({ translated }) => translated,
  },
]);

// Run
const response = await combinedChain.invoke({
  sentence: "ronit bali is a boi who is naughty",
  language: "japanese",
});

console.log(response);
