import { AzureChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();
import { PromptTemplate } from "@langchain/core/prompts";
import { log } from "node:console";
const OPEN_AI_KEY = process.env.AZURE_OPENAI_API_KEY;

const llm = new AzureChatOpenAI({
      azure: true,
      azureOpenAIApiKey:process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiDeploymentName: "gpt-4o",
      azureOpenAIApiVersion: "2024-04-01-preview",
})


const standaloneQuestionTemplate = ' Given a question convert it to a standalone question so that i can feed it to llm. question:{question} standalone question:'

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm)

const response = await  standaloneQuestionChain.invoke({
   question: 'What are the technical requi rements for runmng Langchain? I only have a very laptop which is not that powerful  '
})

console.log(response);
