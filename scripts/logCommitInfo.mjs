import { execSync } from 'node:child_process';
import fs from "node:fs/promises";
import path from 'node:path';

async function logCommitInfo() {
  const logDir = '.commit-logs';
  await fs.mkdir(logDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logDir, `commit-${timestamp}.json`);

  try {
    const branch = execSync('git branch --show-current').toString().trim();
    const status = execSync('git status --porcelain').toString().trim() || 'No Staged Changes';
    const diffSummary = execSync('git diff --cached --stat').toString().trim() || 'No diff summary';
    const commitMessage = execSync('git log -1 --pretty=format:%s').toString().trim();
    const commitHash = execSync('git log -1 --pretty=format:%H').toString().trim();
    const commitAuthor = execSync('git log -1 --pretty=format:%an').toString().trim();
    const commitEmail = execSync('git log -1 --pretty=format:%ae').toString().trim();
    const commitType = commitMessage.includes(':') 
      ? commitMessage.split(':')[0].trim()
      : 'unknown';

    const changedFilesRaw = execSync('git diff --cached --name-only').toString().trim();
    const changedFiles = changedFilesRaw ? changedFilesRaw.split('\n') : [];
    const changedFileCount = changedFiles.length;

    const buildInfo = await getBuildInfo();
    
    const logData = {
      timestamp: new Date().toISOString(),
      branch,
      status,
      diffSummary,
      commitMessage,
      commitHash,
      commitAuthor,
      commitEmail,
      commitType,
      changedFiles,
      changedFileCount,
      buildInfo,
      project: {
        name: process.env.npm_package_name || 'unknown',
        version: process.env.npm_package_version || 'unknown'
      }
    };
    
    await fs.writeFile(logFile, JSON.stringify(logData, null, 2));
    console.log(`✅ Commit info logged to ${logFile}`);
    
    console.log(`
提交摘要：
   类型: ${commitType}
   分支: ${branch}
   文件: ${changedFileCount} 个文件变更
   作者: ${commitAuthor} <${commitEmail}>
   哈希: ${commitHash.substring(0, 8)}
`);
    
  } catch (error) {
    console.error('❌ 记录提交信息失败:', error.message);
  }
}

async function getBuildInfo() {
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
    
    if (hasBuildScript) {
      // 尝试运行构建前检查
      const buildTimestamp = new Date().toISOString();
      const nodeVersion = process.version;
      const platform = process.platform;
      
      return {
        hasBuildScript: true,
        buildTimestamp,
        nodeVersion,
        platform,
      };
    }
    
    return { hasBuildScript: false };
  } catch {
    return { hasBuildScript: false, error: '无法读取 package.json' };
  }
}

async function runBuild() {
  try {
    console.log('🏗️  运行构建检查...');
    const startTime = Date.now();
    
    const result = '构建检查已跳过（如需完整构建请取消注释代码）';
    
    const duration = Date.now() - startTime;
    return {
      success: true,
      duration: `${duration}ms`,
      output: result.substring(0, 500)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  logCommitInfo().catch(console.error);
}

export { logCommitInfo };
