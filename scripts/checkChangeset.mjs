import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';

async function checkChangeset() {
  const changesetDir = '.changeset';
  try {
    await fs.access(changesetDir);
  } catch {
    console.log('项目未初始化 Changeset。跳过检查。');
    process.exit(0);
  }

  const gitStatus = execSync(`git status --porcelain ${changesetDir}`).toString();
  const uncommittedChangesets = gitStatus.split('\n').filter(
    line => line.includes('.md')
  ).length;

  if (uncommittedChangesets > 0) {
    console.log(`发现 ${uncommittedChangesets} 个未提交的 changeset 文件。`);
    console.log('请在运行 `pnpm changeset version` 前提交它们。');
  } else {
    console.log('未发现未提交的 changeset 文件。');
  }
}

checkChangeset().catch(console.error);