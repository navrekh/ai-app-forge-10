import axios from "axios";
import { BACKEND_API } from "../config/backend";

export async function startBuild(projectName: string) {
  const res = await axios.post(
    BACKEND_API.BASE_URL + BACKEND_API.START_BUILD,
    { projectName }
  );
  return res.data; // { buildId, status }
}

export async function getBuildStatus(buildId: string) {
  const res = await axios.get(
    BACKEND_API.BASE_URL + BACKEND_API.BUILD_STATUS(buildId)
  );
  return res.data;
}
