import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

type IngestRequest = { videoUrl: string };
type IngestResponse = {
  transcriptId?: string;
  videoId: string;
  jobId?: string;
  status?: "queued" | "processing" | "completed" | "failed" | "pending";
  message?: string;
};

type QueryRequest = { question: string; videoId: string };
type QueryResponse = { answer?: string };

type JobStatusResponse = {
  job?: {
    id: string;
    videoId: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress?: number;
    errorMessage?: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    ingestVideo: builder.mutation<IngestResponse, IngestRequest>({
      query: (body) => ({
        url: "/ingest",
        method: "POST",
        body,
      }),
    }),
    getJobStatus: builder.query<JobStatusResponse, string>({
      query: (jobId) => `/job/status/${jobId}`,
    }),
    queryVideo: builder.mutation<QueryResponse, QueryRequest>({
      query: (body) => ({
        url: "/query",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useIngestVideoMutation,
  useQueryVideoMutation,
  useLazyGetJobStatusQuery,
} = api;
