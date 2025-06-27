#!/usr/bin/env node

import DependencyGraphBuilder from './dependencyGraphBuilder.js';
import { setupLogger } from './logger.js';

// Простой тест с мокированными данными
async function testWithMockData() {
  const logger = setupLogger();
  
  console.log('🧪 Тест построения графа зависимостей с мокированными данными\n');
  
  // Создаем мокированную структуру проекта
  const mockProjectStructure = {
    source: {
      modules: {
        products: {
          _files: [
            {
              name: 'products.controller.js',
              relativePath: 'controllers/products.controller.js',
              analysis: {
                Dependencies: [
                  { path: 'queries/products.queries.js' },
                  { path: 'configs/products.lookup.config.js' }
                ]
              }
            },
            {
              name: 'products.queries.js',
              relativePath: 'controllers/queries/products.queries.js',
              analysis: {
                Dependencies: []
              }
            },
            {
              name: 'products.lookup.config.js',
              relativePath: 'controllers/configs/products.lookup.config.js',
              analysis: {
                Dependencies: []
              }
            },
            {
              name: 'ProductEdit.vue',
              relativePath: 'components/pages/ProductEdit.vue',
              analysis: {
                Dependencies: [
                  { path: 'store/products.js' }
                ]
              }
            },
            {
              name: 'products.js',
              relativePath: 'store/products.js',
              analysis: {
                Dependencies: []
              }
            }
          ]
        }
      }
    }
  };
  
  try {
    const graphBuilder = new DependencyGraphBuilder();
    
    // Строим граф зависимостей
    console.log('📊 Построение графа зависимостей...');
    const graph = await graphBuilder.buildGraphFromAnalysis(mockProjectStructure);
    
    console.log(`  - Узлов в графе: ${graph.order}`);
    console.log(`  - Рёбер (зависимостей): ${graph.size}`);
    
    // Показываем все узлы
    console.log('\n📋 Узлы графа:');
    graph.forEachNode((nodeId) => {
      const nodeData = graph.getNodeAttributes(nodeId);
      console.log(`  - ${nodeData.file.name}`);
    });
    
    // Показываем все связи
    console.log('\n🔗 Связи:');
    try {
      graph.forEachEdge((edgeId, sourceId, targetId) => {
        console.log(`  Edge: ${edgeId}, Source: ${sourceId}, Target: ${targetId}`);
        try {
          const sourceFile = graph.getNodeAttribute(sourceId, 'file');
          const targetFile = graph.getNodeAttribute(targetId, 'file');
          console.log(`  ${sourceFile.name} → ${targetFile.name}`);
        } catch (e) {
          console.log(`  Ошибка получения атрибутов: ${e.message}`);
        }
      });
    } catch (e) {
      console.log(`  Ошибка обхода рёбер: ${e.message}`);
    }
    
    // Кластеризуем граф
    console.log('\n🗂️ Кластеризация...');
    const clusters = graphBuilder.clusterGraph(10);
    
    console.log(`  - Найдено кластеров: ${clusters.length}`);
    
    clusters.forEach((cluster, index) => {
      console.log(`\n  Кластер ${index + 1} (${cluster.type}):`);
      console.log(`    ID: ${cluster.id}`);
      console.log(`    Размер: ${cluster.size} файлов`);
      console.log(`    Файлы:`);
      cluster.files.forEach(file => {
        console.log(`      - ${file.name}`);
      });
    });
    
    console.log('\n✅ Тест завершен успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка теста:', error);
  }
}

testWithMockData();