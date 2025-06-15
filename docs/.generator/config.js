import { config } from 'dotenv';
import path from 'path';
// doc-generator/config.js
({ config }).config();
export const projectRootDir = process.env.PROJECT_DIR || path.resolve(process.cwd());
export const outputPath = process.env.OUTPUT_PATH || path.join(process.cwd(), 'docs', 'documentation.md');
export const openaiApiKey = process.env.OPENAI_API_KEY;
export const openaiOrgKey = process.env.OPENAI_ORG_KEY;
export const openaiModel = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
export const logPath = process.env.LOG_PATH || path.join(process.cwd(), 'logs', 'doc-generation.log');
export const stateDir = process.env.STATE_DIR || '.doc-state';
export const fileTypes = {
  include: ['.js', '.vue', '.scss', '.css', '.json'],
  exclude: ['node_modules', '.git', 'dist', 'build', 'coverage', 'tests', '__tests__'],
};
export const maxTocGroupingDepth = parseInt(process.env.MAX_TOC_GROUPING_DEPTH || '2');
export const validationSettings = {
  enableValidation: process.env.ENABLE_VALIDATION !== 'false',
  minComponentCoverage: 0.5, // минимум 50% компонентов должны быть упомянуты
  minFunctionCoverage: 0.3,  // минимум 30% функций должны быть упомянуты
  maxRetries: 2,              // максимум попыток регенерации
};
export const frameworkDir = process.env.FRAMEWORK_DIR || 'martyrs';
export const sourceDir = process.env.SOURCE_DIR || 'src';
export const batchSize = parseInt(process.env.BATCH_SIZE || '5');
export const batchDelay = parseInt(process.env.BATCH_DELAY || '1000');
export const maxTokensPerRequest = parseInt(process.env.MAX_TOKENS || '4000');
export const minSectionLength = parseInt(process.env.MIN_SECTION_LENGTH || '200');
export const generateExamples = process.env.GENERATE_EXAMPLES !== 'false';
export const includeArchitectureDiagrams = process.env.INCLUDE_ARCHITECTURE_DIAGRAMS !== 'false';
export const useMemoryForContext = process.env.USE_MEMORY_FOR_CONTEXT !== 'false';
export const existingDocsPath = process.env.EXISTING_DOCS_PATH || null;
export const maxContextTokens = parseInt(process.env.MAX_CONTEXT_TOKENS || '4000');
export const maxNewTokens = parseInt(process.env.MAX_NEW_TOKENS || '1500');
export const minTokensForSummary = parseInt(process.env.MIN_TOKENS_FOR_SUMMARY || '1000');
export const maxRelatedDocuments = parseInt(process.env.MAX_RELATED_DOCUMENTS || '3');
export const useSystemPrompt = process.env.USE_SYSTEM_PROMPT !== 'false';
export const useContinuation = process.env.USE_CONTINUATION !== 'false';
export const projectInfo = {
  name: process.env.PROJECT_NAME || 'Martyrs Project',
  description: process.env.PROJECT_DESCRIPTION || 'Проект, использующий фреймворк martyrs',
  version: process.env.PROJECT_VERSION || '1.0.0',
  language: process.env.PROJECT_LANGUAGE || 'javascript',
  framework: process.env.PROJECT_FRAMEWORK || 'martyrs',
};
export default {
  projectRootDir,
  outputPath,
  openaiApiKey,
  openaiOrgKey,
  openaiModel,
  logPath,
  stateDir,
  fileTypes,
  frameworkDir,
  sourceDir,
  batchSize,
  batchDelay,
  maxTokensPerRequest,
  minSectionLength,
  generateExamples,
  includeArchitectureDiagrams,
  useMemoryForContext,
  existingDocsPath,
  maxContextTokens,
  maxNewTokens,
  minTokensForSummary,
  maxRelatedDocuments,
  useSystemPrompt,
  useContinuation,
  projectInfo,
  maxTocGroupingDepth,
  validationSettings
};
