import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import fetch from "cross-fetch";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();


const embeddings = new AzureOpenAIEmbeddings({
  azure: true,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-3-large",
  azureOpenAIApiVersion: "2024-04-01-preview",
  maxRetries: 1,
});
const supabase = createClient(process.env.PROJECT_URL, process.env.API_KEY, {
  fetch,
});

const vector = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vector.asRetriever(); // name.AsRer match doc chlata  h

export {retriever}