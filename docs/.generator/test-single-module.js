#!/usr/bin/env node

import DependencyGraphBuilder from './dependencyGraphBuilder.js';
import ASTSplitter from './astSplitter.js';
import { setupLogger } from './logger.js';
import path from 'path';

// Тестируем только построение графа зависимостей для модуля products
async function testSingleModule() {
  const logger = setupLogger();
  
  console.log('🧪 Тест построения графа зависимостей для модуля products\n');
  
  try {
    const graphBuilder = new DependencyGraphBuilder();
    const astSplitter = new ASTSplitter();
    
    // Путь к модулю products
    const modulePath = path.join(process.cwd(), '../../src/modules/products');
    
    console.log('📂 Анализ зависимостей для:', modulePath);
    
    // Строим граф зависимостей
    const graph = await graphBuilder.buildGraph(modulePath);
    
    console.log(`📊 Результаты анализа:`);
    console.log(`  - Узлов в графе: ${graph.order}`);
    console.log(`  - Рёбер (зависимостей): ${graph.size}`);
    
    // Кластеризуем граф
    const clusters = graphBuilder.clusterGraph(15);
    
    console.log(`\n🗂️ Кластеризация:`);
    console.log(`  - Найдено кластеров: ${clusters.length}`);
    
    clusters.forEach((cluster, index) => {
      console.log(`  Кластер ${index + 1} (${cluster.type}): ${cluster.size} файлов`);
      cluster.files.slice(0, 3).forEach(file => {
        console.log(`    - ${path.basename(file)}`);
      });
      if (cluster.files.length > 3) {
        console.log(`    - ... и ещё ${cluster.files.length - 3} файлов`);
      }
    });
    
    console.log('\n✅ Тест завершен успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка теста:', error);
  }
}

testSingleModule();