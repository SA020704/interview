// convert-sass-to-css.js
// 批量将Vue文件中的<style lang="scss" scoped>替换为<style scoped>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 要处理的目录
const directories = [
    path.join(__dirname, 'src/views'),
    path.join(__dirname, 'src/components')
];

// 递归处理目录中的文件
function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 递归处理子目录
            processDirectory(fullPath);
        } else if (file.endsWith('.vue')) {
            // 处理Vue文件
            processVueFile(fullPath);
        }
    }
}

// 处理单个Vue文件
function processVueFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 替换<style lang="scss" scoped>为<style scoped>
        const newContent = content.replace(/<style\s+lang=['"]scss['"]\s+scoped>/g, '<style scoped>');

        // 如果文件内容有变化，则保存
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`已处理: ${filePath}`);
        }
    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error);
    }
}

// 开始处理
directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    } else {
        console.warn(`目录不存在: ${dir}`);
    }
});

console.log('处理完成!'); 