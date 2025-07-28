import { PromptTemplate } from "@langchain/core/prompts";
import { AzureChatOpenAI } from "@langchain/openai";
import { retriever } from "./util/retriever.js";
import { combineDocument } from "./util/combineDocument.js";
import dotenv from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
dotenv.config();

const llm = new AzureChatOpenAI({
  azure: true,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY_49,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: "gpt-4o",
  azureOpenAIApiVersion: "2024-04-01-preview",
  maxRetries: 1,
});

const standaloneQuestionTemplate =
  `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question}
standalone question:`;

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);
// output ->
//     PromptTemplate {
//     inputVariables: ['question'],
//     template: "Given a question, convert it in a standalone question. question:{question} standalone question:",
//     partialVariables: {}
// }

// const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm).pipe(retriver); retriver recieves the object instead of string
const answerTemplate = `
You are a helpful and enthusiastic support bot who can answer a given question about Marvel based on the context provided and conversation history.
Try to find the answer in the context or conversation history.
If you really don't know the answer, say "I'm sorry, I don't know the answer to that." and direct the questioner to email yashsrivasta7a.com.
Always speak as if you were chatting to a friend.
context={context}
conversation history={conv_history}
question={question}
answer:`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionChain = RunnableSequence.from([
  standaloneQuestionPrompt,
  llm,
  new StringOutputParser(),
]);

const retrieverChain = RunnableSequence.from([
  (prev) => prev.standaloneQuestion,
  retriever,
  combineDocument,
]);

const answerChain = RunnableSequence.from([
  answerPrompt,
  llm,
  new StringOutputParser()
]);

const Chain = RunnableSequence.from([
  {
    standaloneQuestion: standaloneQuestionChain,
    original_input: new RunnablePassthrough(),
  },
  {
    context: retrieverChain,
    question: ({ original_input }) => original_input.question,
    conv_history: ({ original_input }) => original_input.conv_history,
  },
  
  answerChain
]);



// const response = await Chain.invoke({
//   question: "Who helped MR STARK in building the ironman suit , he's cool af",
// });

export { Chain };
