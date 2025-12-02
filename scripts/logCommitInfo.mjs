import { execSync } from 'node:child_process';
import fs from "node:fs/promises";
import path from 'node:path';

async function logCommitInfo() {
  const logDir = '.commit-logs';
  await fs.mkdir(logDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logDir, `commit-${timestamp}.json`);

  // 实现获取得到一些git信息吧，以及进行构建一下吧
  const logData = {
    timestamp: new Date().toISOString(),
    branch: execSync('git branch --show-current').toString().trim(),
    status: execSync('git status --porcelain').toString().trim() || 'No Staged Changes',
    diffSummary: execSync('git diff --cached --stat').toString().trim() || 'No diff summary',
    commitMessage: execSync('git log -1 --pretty=format:%s').toString().trim(),
    commitHash: execSync('git log -1 --pretty=format:%H').toString().trim(),
    commitAuthor: execSync('git log -1 --pretty=format:%an').toString().trim(),
    commitEmail: execSync('git log -1 --pretty=format:%ae').toString().trim(),
    commitType: logData.commitMessage.split(':')[0].trim(),
  }
  await fs.writeFile(logFile, JSON.stringify(logData, null, 2));
  console.log(`Commit info logged to ${logFile}`);
}

logCommitInfo().catch(console.error);
