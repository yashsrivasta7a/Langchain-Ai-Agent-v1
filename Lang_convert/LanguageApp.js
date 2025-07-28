import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { AzureChatOpenAI } from "@langchain/openai";
import { configDotenv } from "dotenv";
import { AzureOpenAI } from "openai";
configDotenv();
const llm = new AzureChatOpenAI({
  azure: true,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: "gpt-4o",
  azureOpenAIApiVersion: "2024-04-01-preview",
});

const punctuation = PromptTemplate.fromTemplate(
  `Given a sentence , add punctuation where needed.
sentence:{sentence}
sentence with punctuation :`
);

const grammar = PromptTemplate.fromTemplate(
  `Given a sentence correct the grammar.
    sentence: {punctuated}
    sentence with correct grammar: 
    `
);
const translation =
  PromptTemplate.fromTemplate(`Given a sentence, translate that sentence into {language}
    sentence: {grammatically_correct_sentence}
    translated sentence:`);

const punctuationChain = RunnableSequence.from([
  punctuation,
  llm,
  new StringOutputParser(),
]);
const grammarChain = RunnableSequence.from([
  grammar, //expects{punctuated:}
  llm,
  new StringOutputParser(),
]);
const langchain = RunnableSequence.from([
  translation,
  llm,
  new StringOutputParser(),
]);

const Chain = RunnableSequence.from([
  { 
    punctuated: punctuationChain,
    original_inputs : new RunnablePassthrough()
 },
  // {punctuated : p => p}, not a elegant way
  // prevResult =>console.log(prevResult),   FOR TESTING OUTPUT
  { 
    grammatically_correct_sentence: grammarChain,
    language: ({ original_input }) => original_input.language
    
 },
  
  langchain,
]);

const response = await Chain.invoke({
  sentence: "i dont liked mondays",
  language: "french",
});



console.log(response);
