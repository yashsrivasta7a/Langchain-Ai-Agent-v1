
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import fetch from "cross-fetch";
import dotenv from 'dotenv'

dotenv.config();
const text = await fs.readFile("story.txt", "utf8");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ["\n\n", "\n", " ", ""],
});
const output = await splitter.createDocuments([text]);

const supabase = createClient(
  process.env.PROJECT_URL,
  process.env.API_KEY,
  { fetch }
);

const embeddings = new AzureOpenAIEmbeddings({
  azure: true,
  azureOpenAIApiKey:
    process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-3-large",
  azureOpenAIApiVersion: "2024-04-01-preview",
  maxRetries: 1,
});

await SupabaseVectorStore.fromDocuments(output, embeddings, {
  client: supabase,
  tableName: "documents",
});

console.log("✅ Embeddings uploaded to Supabase!");
