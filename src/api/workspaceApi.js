import { buildAxios } from "./axiosInstance";

export const getWorkspaces = async (token) => {
  const axios = buildAxios(token);
  const { data } = await axios.get("/workspaces");
  return data;
};

export const createWorkspace = async (payload, token) => {
  const axios = buildAxios(token);
  const { data } = await axios.post("/workspaces", payload);
  return data;
};
