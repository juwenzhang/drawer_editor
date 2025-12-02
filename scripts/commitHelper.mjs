import { execSync } from 'node:child_process';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const TYPES = {
  feat: '新功能',
  fix: '修复bug',
  docs: '文档更新',
  style: '代码格式',
  refactor: '重构',
  perf: '性能优化',
  test: '测试相关',
  build: '构建系统',
  ci: 'CI配置',
  chore: '其他杂项',
};

async function promptCommit() {
  console.log('请选择提交类型:');
  Object.entries(TYPES).forEach(([type, desc], index) => {
    console.log(`  ${index + 1}. ${type.padEnd(10)} - ${desc}`);
  });

  rl.question('\n输入类型编号或名称 (默认: 1): ', (typeInput) => {
    let type = typeInput.trim();
    
    if (!type) type = '1';
    if (/^\d+$/.test(type)) {
      const index = parseInt(type) - 1;
      const types = Object.keys(TYPES);
      type = types[index] || 'feat';
    }

    rl.question(`输入简要描述 (${type}): `, (subject) => {
      if (!subject.trim()) {
        console.log('❌ 描述不能为空');
        rl.close();
        return;
      }

      rl.question('关联的Issue编号 (可选，如 #123): ', (issue) => {
        const issueRef = issue.trim() ? ` closes ${issue.trim()}` : '';
        const commitMsg = `${type}: ${subject}${issueRef}`;
        
        console.log('\n生成的提交信息:');
        console.log(`  ${commitMsg}`);
        
        rl.question('\n确认提交? (y/N): ', (confirm) => {
          if (confirm.toLowerCase() === 'y') {
            try {
              execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
              console.log('提交成功！');
            } catch (error) {
              console.error('提交失败:', error.message);
            }
          } else {
            console.log('已取消提交');
          }
          rl.close();
        });
      });
    });
  });
}

promptCommit();
