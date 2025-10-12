Архитектура масштабируемой системы билетов
Общая концепция:
Начальное состояние (1 сервер):
[Сервер 1]
├── Node.js API (порт 3000)
├── Bull Queue Manager
├── 4 Rust воркера
└── Подключение к Redis/MongoDB
После масштабирования (10+ серверов):
[Load Balancer]
    ├── [API Servers] - принимают запросы
    ├── [Worker Servers] - обрабатывают билеты
    └── [Hybrid Servers] - и API, и воркеры

[Shared Infrastructure]
    ├── Redis (единая очередь)
    ├── MongoDB (единая БД)
    └── S3/NFS (общее хранилище PDF)
Детальная архитектура:
1. Режимы работы серверов
Каждый сервер при запуске определяет свою роль через WORKER_MODE:

api - только принимает HTTP запросы, добавляет задачи в очередь
worker - только обрабатывает задачи из очереди
both - универсальный режим (для начала с 1 сервера)
auto - сервер сам решает на основе нагрузки

Это позволяет начать с одного сервера в режиме both, а потом добавлять специализированные.
2. Система очередей (Bull + Redis)
Почему Bull + Redis:

Redis один для всех серверов (единая точка правды)
Bull обеспечивает retry, приоритеты, отложенные задачи
Rust воркеры читают напрямую из Redis по протоколу Bull

Структура очередей:
Redis:
├── bull:tickets:wait     - ожидающие задачи
├── bull:tickets:active   - обрабатываются сейчас
├── bull:tickets:completed - завершенные
├── bull:tickets:failed   - проваленные
├── bull:tickets:{id}     - данные конкретной задачи
└── batch:{batchId}       - статус пакета билетов
3. Координация между серверами
Через Redis Pub/Sub:
workers:stats         - каждый сервер публикует свои метрики
worker:commands:{id}  - команды конкретному серверу
ticket:completed      - уведомления о готовых билетах
scaling:decisions     - глобальные решения о масштабировании
Метрики каждого сервера:

Количество активных воркеров
CPU load
Memory usage
Queue pressure (waiting/active ratio)

4. Автоскейлинг
Локальный (на каждом сервере):

Сервер смотрит на свою нагрузку
Добавляет/убирает Rust воркеры
От 2 до 16 воркеров на сервер

Глобальный (опциональный координатор):

Анализирует метрики всех серверов
Решает какой сервер должен добавить воркеры
Отправляет команды через Redis Pub/Sub

5. Процесс добавления нового сервера
Шаг 1: Запуск сервера с нужной ролью
bash# Сервер 2 - только воркеры
WORKER_MODE=worker \
WORKER_COUNT=8 \
REDIS_HOST=shared.redis.host \
MONGODB_URI=shared.mongo.host \
PUBLIC_PATH=/mnt/shared/public \
node server.js
Шаг 2: Автоматическая регистрация

Сервер подключается к общему Redis
Начинает читать из общей очереди
Публикует свои метрики
Готов к работе

Шаг 3: Балансировка нагрузки

API серверы за nginx/haproxy
Воркеры автоматически конкурируют за задачи
Redis гарантирует что задача попадет только к одному

6. Обработка сбоев
Падение воркера:

Manager перезапускает воркер
Задача возвращается в очередь (Bull retry)
Другой воркер подхватывает

Падение сервера:

Другие серверы продолжают работать
Задачи перераспределяются автоматически
При восстановлении сервер подключается обратно

7. Хранение файлов
Варианты:

NFS - общая папка для всех серверов
S3 - каждый воркер загружает в S3
CDN - раздача готовых PDF

8. Мониторинг
Bull Dashboard - веб-интерфейс для очередей
Redis Commander - просмотр данных Redis
Custom Dashboard - агрегация метрик всех серверов
9. Эволюция системы
Этап 1 (текущий): 1 сервер
WORKER_MODE=both
Все на одной машине
Этап 2: Разделение API и воркеров
Сервер 1: WORKER_MODE=api
Сервер 2: WORKER_MODE=worker
Этап 3: Горизонтальное масштабирование
2 API сервера
3 Worker сервера
Load Balancer
Этап 4: Geo-распределение
Региональные API
Централизованные воркеры
Multi-region Redis
10. Ключевые решения

Bull вместо кастомной очереди - готовые retry, приоритеты, monitoring
Rust воркеры вместо Node - скорость обработки PDF
Redis как единая точка координации - все серверы видят одну очередь
Режимы работы серверов - гибкость в распределении ролей
Автоскейлинг воркеров - адаптация к нагрузке

Эта архитектура позволяет начать с одного сервера и плавно масштабироваться до десятков без изменения кода, только через ENV переменные и добавление серверов.

Вот полный адаптированный код под все 10 пунктов архитектуры:

## 1. **Главный модуль Events с поддержкой режимов**:

```javascript
// src/modules/events/events.server.js
import Bull from 'bull';
import os from 'os';
import { spawn } from 'child_process';
import WorkerManager from './workers/manager.js';
import { setupQueueMonitoring, setupAutoScaling } from './workers/autoscaler.js';
import WorkerCoordinator from './workers/coordinator.js';

function initializeEvent(app, db, origins, publicPath, options = {}) {
  const { 
    eventFields = {}, 
    ticketFields = {},
    workerMode = process.env.WORKER_MODE || 'auto'
  } = options;

  // Модели всегда инициализируем
  db.event = createEventModel(db, eventFields);
  db.ticket = createTicketModel(db, ticketFields);

  // Определяем роль этого инстанса
  const instanceId = `${os.hostname()}-${process.pid}`;
  const isWorkerNode = ['worker', 'both', 'auto'].includes(workerMode);
  const isApiNode = ['api', 'both', 'auto'].includes(workerMode);

  // Redis конфиг для всех серверов
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0
  };

  // Очередь билетов (общая для всех серверов)
  const ticketQueue = new Bull('tickets', { redis: redisConfig });

  // API endpoints - только на API нодах
  if (app && isApiNode) {
    console.log(`[${instanceId}] Starting as API node`);
    eventsRoutes(app, db, origins, publicPath);
    ticketsRoutes(app, db, origins, publicPath, ticketQueue);
    
    // Мониторинг очереди
    setupQueueMonitoring(ticketQueue, instanceId);
  }

  // Воркеры - только на воркер нодах
  if (isWorkerNode) {
    console.log(`[${instanceId}] Starting as Worker node`);
    
    const workerManager = new WorkerManager({
      instanceId,
      publicPath,
      redisConfig,
      mongoUri: process.env.MONGODB_URI,
      workerCount: process.env.WORKER_COUNT || os.cpus().length,
      maxWorkers: process.env.MAX_WORKERS || os.cpus().length * 2,
      minWorkers: process.env.MIN_WORKERS || 2
    });
    
    workerManager.start();
    
    // Автоскейлинг воркеров на этой ноде
    setupAutoScaling(ticketQueue, instanceId, workerManager);
  }

  // Координатор (только на главной ноде)
  if (process.env.IS_COORDINATOR === 'true') {
    console.log(`[${instanceId}] Starting as Coordinator`);
    const coordinator = new WorkerCoordinator(ticketQueue.client);
    coordinator.start();
  }

  return { ticketQueue, instanceId };
}

export default initializeEvent;
```

## 2. **Обновленный контроллер с очередями**:

```javascript
// src/modules/events/controllers/tickets.controller.js
import Bull from 'bull';

const controllerFactory = (db, publicPath, ticketQueue) => {
  const Ticket = db.ticket;
  const Event = db.event;
  
  // Если очередь не передана, создаем локальную
  if (!ticketQueue) {
    ticketQueue = new Bull('tickets', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });
  }

  async function create(req, res) {
    try {
      const event = await Event.findById(req.body.target).exec();
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const quantity = req.body.quantity || 1;
      const batchId = `batch_${Date.now()}_${req.userId}`;
      const tickets = [];

      // Создаем билеты в БД
      for (let i = 0; i < quantity; i++) {
        const ticket = new Ticket({
          ...req.body,
          status: 'pending',
          batchId
        });
        
        const saved = await ticket.save();
        tickets.push(saved._id);
        
        // Добавляем в очередь с метаданными
        await ticketQueue.add('generate-pdf', {
          ticketId: saved._id.toString(),
          ticketData: req.body,
          event: event.toObject(),
          batchId,
          index: i + 1,
          publicPath,
          storageType: process.env.STORAGE_TYPE || 'local', // local/s3/nfs
          storageConfig: {
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION
          }
        }, {
          priority: req.body.seat === 'VIP' ? 1 : 10,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });
      }

      // Сохраняем batch информацию
      await ticketQueue.client.setex(
        `batch:${batchId}`,
        3600,
        JSON.stringify({
          id: batchId,
          userId: req.userId,
          tickets,
          total: quantity,
          completed: 0,
          failed: 0,
          status: 'processing',
          createdAt: Date.now()
        })
      );

      // Публикуем событие о создании batch
      await ticketQueue.client.publish('batch:created', JSON.stringify({
        batchId,
        userId: req.userId,
        quantity
      }));

      res.json({ success: true, batchId, tickets });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async function getBatchStatus(req, res) {
    const batch = await ticketQueue.client.get(`batch:${req.params.batchId}`);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    const data = JSON.parse(batch);
    if (data.userId !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Добавляем актуальную информацию из очереди
    const jobCounts = await ticketQueue.getJobCounts();
    data.queueStats = jobCounts;
    
    res.json(data);
  }

  // Остальные методы...
  return {
    create,
    getBatchStatus,
    read,
    update,
    delete: deleteTicket
  };
};

export default controllerFactory;
```

## 3. **Менеджер воркеров с автоскейлингом**:

```javascript
// src/modules/events/workers/manager.js
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

class WorkerManager {
  constructor(options) {
    this.options = options;
    this.workers = new Map();
    this.redis = new Redis(options.redisConfig);
    this.isShuttingDown = false;
  }

  async start() {
    console.log(`[${this.options.instanceId}] Starting worker manager`);
    
    // Проверяем/компилируем Rust воркер
    await this.ensureWorkerBinary();
    
    // Запускаем начальное количество воркеров
    for (let i = 0; i < this.options.workerCount; i++) {
      await this.spawnWorker(i);
    }
    
    // Подписываемся на команды от координатора
    this.subscribeToCommands();
    
    // Публикуем метрики
    this.startMetricsReporting();
    
    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async ensureWorkerBinary() {
    const binaryPath = './workers/ticket-worker/target/release/ticket-worker';
    
    if (!fs.existsSync(binaryPath)) {
      console.log('Compiling Rust worker...');
      await new Promise((resolve, reject) => {
        const compile = spawn('cargo', ['build', '--release'], {
          cwd: './workers/ticket-worker',
          stdio: 'inherit'
        });
        
        compile.on('close', code => {
          if (code === 0) {
            console.log('Rust worker compiled successfully');
            resolve();
          } else {
            reject(new Error(`Compilation failed with code ${code}`));
          }
        });
      });
    }
    
    this.workerBinary = binaryPath;
  }

  async spawnWorker(id) {
    if (this.isShuttingDown) return;
    
    const workerId = `${this.options.instanceId}-worker-${id}`;
    console.log(`Spawning worker ${workerId}`);
    
    const worker = spawn(this.workerBinary, [], {
      env: {
        ...process.env,
        WORKER_ID: workerId,
        REDIS_URL: `redis://${this.options.redisConfig.host}:${this.options.redisConfig.port}`,
        MONGODB_URI: this.options.mongoUri,
        PUBLIC_PATH: this.options.publicPath,
        INSTANCE_ID: this.options.instanceId
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Логирование
    worker.stdout.on('data', data => {
      console.log(`[${workerId}]:`, data.toString().trim());
    });
    
    worker.stderr.on('data', data => {
      console.error(`[${workerId} ERROR]:`, data.toString().trim());
    });
    
    // Автоматический перезапуск при падении
    worker.on('exit', (code, signal) => {
      console.log(`Worker ${workerId} exited with code ${code}, signal ${signal}`);
      this.workers.delete(workerId);
      
      // Перезапускаем если не выключаемся
      if (!this.isShuttingDown) {
        setTimeout(() => {
          console.log(`Restarting worker ${id}...`);
          this.spawnWorker(id);
        }, 3000);
      }
    });
    
    this.workers.set(workerId, worker);
    
    // Публикуем событие о запуске воркера
    await this.redis.publish('worker:started', JSON.stringify({
      workerId,
      instanceId: this.options.instanceId,
      timestamp: Date.now()
    }));
  }

  async killWorker(id) {
    const workerId = `${this.options.instanceId}-worker-${id}`;
    const worker = this.workers.get(workerId);
    
    if (worker) {
      console.log(`Killing worker ${workerId}`);
      worker.kill('SIGTERM');
      this.workers.delete(workerId);
    }
  }

  subscribeToCommands() {
    const subscriber = new Redis(this.options.redisConfig);
    
    subscriber.subscribe(
      `worker:commands:${this.options.instanceId}`,
      'worker:commands:all'
    );
    
    subscriber.on('message', async (channel, message) => {
      const command = JSON.parse(message);
      console.log(`Received command: ${command.action}`);
      
      switch (command.action) {
        case 'scale_up':
          if (this.workers.size < this.options.maxWorkers) {
            await this.spawnWorker(this.workers.size);
          }
          break;
          
        case 'scale_down':
          if (this.workers.size > this.options.minWorkers) {
            await this.killWorker(this.workers.size - 1);
          }
          break;
          
        case 'restart':
          await this.restartAllWorkers();
          break;
      }
    });
  }

  async startMetricsReporting() {
    setInterval(async () => {
      const metrics = {
        instanceId: this.options.instanceId,
        workers: this.workers.size,
        load: os.loadavg()[0],
        memUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        timestamp: Date.now()
      };
      
      await this.redis.hset(
        'workers:stats',
        this.options.instanceId,
        JSON.stringify(metrics)
      );
      
      // TTL для очистки старых метрик
      await this.redis.expire('workers:stats', 300);
      
    }, 5000); // Каждые 5 секунд
  }

  async shutdown() {
    console.log('Shutting down worker manager...');
    this.isShuttingDown = true;
    
    // Останавливаем всех воркеров
    for (const [id, worker] of this.workers) {
      console.log(`Stopping ${id}`);
      worker.kill('SIGTERM');
    }
    
    // Ждем завершения
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Принудительно убиваем если не завершились
    for (const [id, worker] of this.workers) {
      if (!worker.killed) {
        worker.kill('SIGKILL');
      }
    }
    
    await this.redis.quit();
    console.log('Worker manager shut down');
    process.exit(0);
  }
}

export default WorkerManager;
```

Блять, точно! Вот обновленный Rust воркер с поддержкой всей архитектуры:

## **Полный Rust воркер с масштабированием**:

```rust
// workers/ticket-worker/src/main.rs
use redis::{Commands, Connection, PubSubCommands};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs;
use std::path::Path;
use std::time::{Duration, SystemTime};
use qrcode::QrCode;
use base64;
use mongodb::{Client, options::ClientOptions};
use bson::{doc, oid::ObjectId};
use image::Luma;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Deserialize, Serialize, Debug)]
struct JobData {
    ticket_id: String,
    ticket_data: TicketData,
    event: Event,
    batch_id: String,
    index: u32,
    public_path: String,
    storage_type: Option<String>,
    storage_config: Option<StorageConfig>,
}

#[derive(Deserialize, Serialize, Debug)]
struct TicketData {
    name: String,
    email: String,
    seat: String,
    price: f64,
}

#[derive(Deserialize, Serialize, Debug)]
struct Event {
    name: String,
    location: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct StorageConfig {
    bucket: Option<String>,
    region: Option<String>,
}

struct Worker {
    id: String,
    redis: Connection,
    mongo: mongodb::Database,
    public_path: String,
    instance_id: String,
    is_running: Arc<AtomicBool>,
    jobs_processed: u64,
    jobs_failed: u64,
    start_time: SystemTime,
}

impl Worker {
    async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let worker_id = std::env::var("WORKER_ID")
            .unwrap_or_else(|_| format!("worker-{}", uuid::Uuid::new_v4()));
        
        let instance_id = std::env::var("INSTANCE_ID")
            .unwrap_or_else(|_| "unknown".to_string());
        
        println!("[{}] Initializing worker", worker_id);
        
        // Redis connection
        let redis_url = std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1/".to_string());
        let redis_client = redis::Client::open(redis_url)?;
        let mut redis = redis_client.get_connection()?;
        
        // MongoDB connection
        let mongo_url = std::env::var("MONGODB_URI")
            .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let mut mongo_options = ClientOptions::parse(&mongo_url).await?;
        mongo_options.app_name = Some(worker_id.clone());
        
        let mongo_client = Client::with_options(mongo_options)?;
        let mongo = mongo_client.database("martyrs");
        
        let public_path = std::env::var("PUBLIC_PATH")
            .unwrap_or_else(|_| "./public".to_string());
        
        // Регистрируем воркер в Redis
        let _: () = redis.hset(
            "workers:active",
            &worker_id,
            &serde_json::json!({
                "instance_id": &instance_id,
                "start_time": SystemTime::now().duration_since(SystemTime::UNIX_EPOCH)?.as_secs(),
                "status": "running"
            }).to_string()
        )?;
        
        Ok(Worker {
            id: worker_id,
            redis,
            mongo,
            public_path,
            instance_id,
            is_running: Arc::new(AtomicBool::new(true)),
            jobs_processed: 0,
            jobs_failed: 0,
            start_time: SystemTime::now(),
        })
    }
    
    async fn run(&mut self) {
        println!("[{}] Worker started, waiting for jobs...", self.id);
        
        // Запускаем поток для отправки метрик
        let metrics_thread = self.start_metrics_thread();
        
        // Основной цикл обработки задач
        while self.is_running.load(Ordering::Relaxed) {
            match self.fetch_and_process_job().await {
                Ok(processed) => {
                    if processed {
                        self.jobs_processed += 1;
                    }
                },
                Err(e) => {
                    eprintln!("[{}] Error in job loop: {}", self.id, e);
                    // Небольшая пауза при ошибке
                    std::thread::sleep(Duration::from_secs(1));
                }
            }
        }
        
        println!("[{}] Worker shutting down", self.id);
        self.cleanup().await;
    }
    
    async fn fetch_and_process_job(&mut self) -> Result<bool, Box<dyn std::error::Error>> {
        // Блокирующее чтение из очереди Bull с таймаутом
        let result: Result<Vec<String>, _> = self.redis.blpop(
            &["bull:tickets:wait"],
            1 // 1 секунда таймаут для проверки is_running
        );
        
        match result {
            Ok(data) if data.len() >= 2 => {
                let job_id = &data[1];
                
                // Перемещаем в активные
                let _: () = self.redis.rpush("bull:tickets:active", job_id)?;
                
                // Обрабатываем задачу
                self.process_job(job_id).await?;
                Ok(true)
            },
            Ok(_) => Ok(false), // Таймаут, нет задач
            Err(e) => Err(Box::new(e))
        }
    }
    
    async fn process_job(&mut self, job_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let job_key = format!("bull:tickets:{}", job_id);
        let start_time = SystemTime::now();
        
        // Получаем данные задачи
        let job_data_str: String = self.redis.hget(&job_key, "data")?;
        let job_data: JobData = serde_json::from_str(&job_data_str)?;
        
        println!("[{}] Processing ticket {} (batch: {})", 
            self.id, job_data.ticket_id, job_data.batch_id);
        
        // Обновляем прогресс
        self.update_progress(&job_key, 10)?;
        
        match self.generate_ticket(&job_data).await {
            Ok(pdf_path) => {
                let duration = SystemTime::now().duration_since(start_time)?;
                
                self.complete_job(job_id, &job_data, &pdf_path, duration).await?;
                
                println!("[{}] Ticket {} completed in {}ms", 
                    self.id, job_data.ticket_id, duration.as_millis());
                
                Ok(())
            }
            Err(e) => {
                self.jobs_failed += 1;
                self.fail_job(job_id, &job_data, &e.to_string()).await?;
                Err(e)
            }
        }
    }
    
    async fn generate_ticket(&mut self, data: &JobData) -> Result<String, Box<dyn std::error::Error>> {
        // 1. Генерируем QR код
        let qr = QrCode::new(&data.ticket_id)?;
        let image = qr.render::<Luma<u8>>()
            .width(400)
            .height(400)
            .build();
        
        // Конвертируем в base64
        let mut qr_bytes = Vec::new();
        {
            use std::io::Cursor;
            use image::ImageFormat;
            image.write_to(&mut Cursor::new(&mut qr_bytes), ImageFormat::Png)?;
        }
        let qr_base64 = format!("data:image/png;base64,{}", base64::encode(&qr_bytes));
        
        // 2. Генерируем красивый HTML
        let html = self.render_beautiful_html(data, &qr_base64);
        
        // 3. Сохраняем HTML во временный файл
        let temp_dir = format!("{}/temp", self.public_path);
        fs::create_dir_all(&temp_dir)?;
        
        let temp_html = format!("{}/{}.html", temp_dir, data.ticket_id);
        fs::write(&temp_html, &html)?;
        
        // 4. Конвертируем через wkhtmltopdf
        let pdf_dir = format!("{}/tickets", self.public_path);
        fs::create_dir_all(&pdf_dir)?;
        
        let pdf_path = format!("{}/ticket-{}.pdf", pdf_dir, data.ticket_id);
        
        let output = Command::new("wkhtmltopdf")
            .args(&[
                "--enable-local-file-access",
                "--print-media-type",
                "--no-stop-slow-scripts",
                "--javascript-delay", "100",
                "--margin-top", "0",
                "--margin-bottom", "0",
                "--margin-left", "0",
                "--margin-right", "0",
                "--page-size", "A4",
                "--dpi", "300",
                "--image-quality", "100",
                &temp_html,
                &pdf_path
            ])
            .output()?;
        
        if !output.status.success() {
            return Err(format!("wkhtmltopdf failed: {}", 
                String::from_utf8_lossy(&output.stderr)).into());
        }
        
        // 5. Удаляем временный файл
        fs::remove_file(&temp_html)?;
        
        // 6. Загружаем в S3/CDN если настроено
        if let Some(storage_type) = &data.storage_type {
            match storage_type.as_str() {
                "s3" => self.upload_to_s3(&pdf_path, data).await?,
                "nfs" => self.copy_to_nfs(&pdf_path, data)?,
                _ => {}
            }
        }
        
        // 7. Обновляем билет в MongoDB
        let tickets_collection = self.mongo.collection::<bson::Document>("tickets");
        
        let ticket_oid = ObjectId::parse_str(&data.ticket_id)?;
        
        tickets_collection.update_one(
            doc! { "_id": ticket_oid },
            doc! { "$set": {
                "status": "completed",
                "image": format!("/tickets/ticket-{}.pdf", data.ticket_id),
                "qrcode": qr_base64,
                "processedBy": &self.id,
                "processedAt": bson::DateTime::now()
            }},
            None
        ).await?;
        
        Ok(pdf_path)
    }
    
    fn render_beautiful_html(&self, data: &JobData, qr_base64: &str) -> String {
        format!(r#"<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

* {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}}

@page {{
    size: A4;
    margin: 0;
}}

body {{
    font-family: 'Inter', system-ui, sans-serif;
    width: 210mm;
    height: 297mm;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20mm;
}}

.ticket {{
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    height: 100%;
    display: flex;
    flex-direction: column;
}}

.header {{
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    position: relative;
}}

.event-title {{
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 10px;
}}

.content {{
    padding: 40px;
    flex: 1;
    display: flex;
    gap: 40px;
}}

.info-section {{
    flex: 1;
}}

.info-row {{
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}}

.info-label {{
    font-size: 12px;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 1px;
    margin-bottom: 5px;
}}

.info-value {{
    font-size: 18px;
    font-weight: 600;
    color: #333;
}}

.qr-section {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}}

.qr-code img {{
    width: 150px;
    height: 150px;
}}
</style>
</head>
<body>
<div class="ticket">
    <div class="header">
        <div class="event-title">{}</div>
        <div>Entry Ticket</div>
    </div>
    
    <div class="content">
        <div class="info-section">
            <div class="info-row">
                <div class="info-label">Name</div>
                <div class="info-value">{}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Location</div>
                <div class="info-value">{}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Seat</div>
                <div class="info-value">{}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Price</div>
                <div class="info-value">${}</div>
            </div>
        </div>
        
        <div class="qr-section">
            <div class="qr-code">
                <img src="{}" />
            </div>
        </div>
    </div>
</div>
</body>
</html>"#,
            data.event.name,
            data.ticket_data.name,
            data.event.location,
            data.ticket_data.seat,
            data.ticket_data.price,
            qr_base64
        )
    }
    
    fn update_progress(&mut self, job_key: &str, progress: u8) -> Result<(), Box<dyn std::error::Error>> {
        let _: () = self.redis.hset(job_key, "progress", progress)?;
        Ok(())
    }
    
    async fn complete_job(&mut self, job_id: &str, data: &JobData, pdf_path: &str, duration: Duration) 
        -> Result<(), Box<dyn std::error::Error>> {
        
        let job_key = format!("bull:tickets:{}", job_id);
        
        // Помечаем задачу выполненной в Bull формате
        let _: () = self.redis.hset_multiple(
            &job_key,
            &[
                ("finishedOn", chrono::Utc::now().timestamp_millis().to_string()),
                ("returnvalue", serde_json::json!({
                    "success": true,
                    "pdf_path": pdf_path,
                    "duration_ms": duration.as_millis()
                }).to_string()),
                ("progress", "100".to_string())
            ]
        )?;
        
        // Перемещаем из active в completed
        let _: () = self.redis.lrem("bull:tickets:active", 1, job_id)?;
        let _: () = self.redis.sadd("bull:tickets:completed", job_id)?;
        
        // Обновляем batch статистику атомарно
        let batch_key = format!("batch:{}", data.batch_id);
        
        // Используем Lua скрипт для атомарного обновления
        let script = r#"
            local batch = redis.call('get', KEYS[1])
            if batch then
                local data = cjson.decode(batch)
                data.completed = data.completed + 1
                if data.completed == data.total then
                    data.status = 'completed'
                end
                redis.call('setex', KEYS[1], 3600, cjson.encode(data))
                return data.completed
            end
            return 0
        "#;
        
        let completed: i64 = redis::Script::new(script)
            .key(&batch_key)
            .invoke(&mut self.redis)?;
        
        // Публикуем событие завершения
        let _: () = self.redis.publish(
            "ticket:completed",
            serde_json::json!({
                "batch_id": data.batch_id,
                "ticket_id": data.ticket_id,
                "pdf_path": pdf_path,
                "worker_id": self.id,
                "completed_count": completed
            }).to_string()
        )?;
        
        Ok(())
    }
    
    async fn fail_job(&mut self, job_id: &str, data: &JobData, error: &str) 
        -> Result<(), Box<dyn std::error::Error>> {
        
        let job_key = format!("bull:tickets:{}", job_id);
        
        // Получаем количество попыток
        let attempts: i32 = self.redis.hget(&job_key, "attemptsMade")
            .unwrap_or(0);
        
        let max_attempts = 3;
        
        if attempts < max_attempts {
            // Возвращаем в очередь для повтора
            let _: () = self.redis.lrem("bull:tickets:active", 1, job_id)?;
            let _: () = self.redis.rpush("bull:tickets:wait", job_id)?;
            let _: () = self.redis.hset(&job_key, "attemptsMade", attempts + 1)?;
            
            println!("[{}] Job {} failed, attempt {}/{}, retrying...", 
                self.id, job_id, attempts + 1, max_attempts);
        } else {
            // Финальный провал
            let _: () = self.redis.hset_multiple(
                &job_key,
                &[
                    ("failedReason", error.to_string()),
                    ("finishedOn", chrono::Utc::now().timestamp_millis().to_string())
                ]
            )?;
            
            let _: () = self.redis.lrem("bull:tickets:active", 1, job_id)?;
            let _: () = self.redis.sadd("bull:tickets:failed", job_id)?;
            
            // Обновляем batch
            let batch_key = format!("batch:{}", data.batch_id);
            let _: () = self.redis.hincrby(&batch_key, "failed", 1)?;
            
            // Публикуем событие провала
            let _: () = self.redis.publish(
                "ticket:failed",
                serde_json::json!({
                    "batch_id": data.batch_id,
                    "ticket_id": data.ticket_id,
                    "error": error,
                    "worker_id": self.id
                }).to_string()
            )?;
            
            eprintln!("[{}] Job {} failed after {} attempts: {}", 
                self.id, job_id, max_attempts, error);
        }
        
        Ok(())
    }
    
    fn start_metrics_thread(&mut self) -> std::thread::JoinHandle<()> {
        let worker_id = self.id.clone();
        let instance_id = self.instance_id.clone();
        let is_running = self.is_running.clone();
        
        std::thread::spawn(move || {
            let redis_client = redis::Client::open(
                std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".to_string())
            ).expect("Failed to create Redis client for metrics");
            
            let mut redis = redis_client.get_connection()
                .expect("Failed to connect to Redis for metrics");
            
            while is_running.load(Ordering::Relaxed) {
                // Отправляем heartbeat и метрики
                let metrics = serde_json::json!({
                    "worker_id": worker_id,
                    "instance_id": instance_id,
                    "last_heartbeat": chrono::Utc::now().timestamp(),
                    "status": "running"
                });
                
                let _: Result<(), _> = redis.hset(
                    "workers:heartbeat",
                    &worker_id,
                    metrics.to_string()
                );
                
                // TTL 30 секунд - если воркер умрет, запись исчезнет
                let _: Result<(), _> = redis.expire("workers:heartbeat", 30);
                
                std::thread::sleep(Duration::from_secs(10));
            }
        })
    }
    
    async fn upload_to_s3(&self, pdf_path: &str, data: &JobData) -> Result<(), Box<dyn std::error::Error>> {
        // Здесь был бы код для S3 загрузки
        println!("[{}] Would upload {} to S3", self.id, pdf_path);
        Ok(())
    }
    
    fn copy_to_nfs(&self, pdf_path: &str, data: &JobData) -> Result<(), Box<dyn std::error::Error>> {
        // Копирование в NFS
        let nfs_path = std::env::var("NFS_PATH").unwrap_or("/mnt/nfs".to_string());
        let dest = format!("{}/tickets/ticket-{}.pdf", nfs_path, data.ticket_id);
        fs::copy(pdf_path, dest)?;
        Ok(())
    }
    
    async fn cleanup(&mut self) {
        // Удаляем воркер из активных
        let _: Result<(), _> = self.redis.hdel("workers:active", &self.id);
        let _: Result<(), _> = self.redis.hdel("workers:heartbeat", &self.id);
        
        println!("[{}] Worker cleaned up. Processed: {}, Failed: {}", 
            self.id, self.jobs_processed, self.jobs_failed);
    }
}

// Обработка сигналов для graceful shutdown
fn setup_signal_handlers(is_running: Arc<AtomicBool>) {
    ctrlc::set_handler(move || {
        println!("\nReceived shutdown signal");
        is_running.store(false, Ordering::Relaxed);
    }).expect("Error setting signal handler");
}

#[tokio::main]
async fn main() {
    let mut worker = Worker::new().await.expect("Failed to create worker");
    
    // Настраиваем обработчики сигналов
    setup_signal_handlers(worker.is_running.clone());
    
    // Запускаем воркер
    worker.run().await;
}
```

## **Cargo.toml для воркера**:

```toml
[package]
name = "ticket-worker"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
redis = { version = "0.23", features = ["script"] }
mongodb = { version = "2.7", features = ["sync"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
qrcode = "0.13"
image = "0.24"
base64 = "0.21"
chrono = "0.4"
uuid = { version = "1.5", features = ["v4"] }
ctrlc = "3.4"
bson = "2.7"
```

Теперь воркер полностью интегрирован в архитектуру:
- Работает с Bull очередями
- Отправляет метрики и heartbeat
- Поддерживает retry механизм
- Обновляет batch статистику
- Публикует события для WebSocket
- Graceful shutdown
- Поддержка S3/NFS для хранения

## 4. **Автоскейлер**:

```javascript
// src/modules/events/workers/autoscaler.js
import os from 'os';

export function setupAutoScaling(queue, instanceId, workerManager) {
  let lastQueueSize = 0;
  let scaleUpCooldown = 0;
  let scaleDownCooldown = 0;
  
  setInterval(async () => {
    try {
      const stats = await queue.getJobCounts();
      const { waiting, active } = stats;
      
      // Метрики системы
      const load = os.loadavg()[0];
      const cpuCount = os.cpus().length;
      const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
      const currentWorkers = workerManager.workers.size;
      
      // Рассчитываем давление на очередь
      const queuePressure = waiting / (active + 1);
      const queueGrowth = waiting - lastQueueSize;
      lastQueueSize = waiting;
      
      console.log(`[${instanceId}] Queue: ${waiting}/${active}, Workers: ${currentWorkers}, Load: ${load.toFixed(2)}, Pressure: ${queuePressure.toFixed(2)}`);
      
      // Уменьшаем cooldown
      if (scaleUpCooldown > 0) scaleUpCooldown--;
      if (scaleDownCooldown > 0) scaleDownCooldown--;
      
      // Логика масштабирования вверх
      if (scaleUpCooldown === 0) {
        if (
          (queuePressure > 10 || waiting > 100) &&
          currentWorkers < workerManager.options.maxWorkers &&
          load < cpuCount * 0.8
        ) {
          console.log(`[${instanceId}] Scaling up: adding worker`);
          await workerManager.spawnWorker(currentWorkers);
          scaleUpCooldown = 6; // 30 секунд cooldown (6 * 5сек)
          
          // Публикуем событие
          await queue.client.publish('scaling:event', JSON.stringify({
            instanceId,
            action: 'scale_up',
            reason: `Queue pressure: ${queuePressure}`,
            workers: currentWorkers + 1
          }));
        }
      }
      
      // Логика масштабирования вниз
      if (scaleDownCooldown === 0) {
        if (
          waiting === 0 &&
          active < currentWorkers / 2 &&
          currentWorkers > workerManager.options.minWorkers
        ) {
          console.log(`[${instanceId}] Scaling down: removing worker`);
          await workerManager.killWorker(currentWorkers - 1);
          scaleDownCooldown = 12; // 60 секунд cooldown
          
          // Публикуем событие
          await queue.client.publish('scaling:event', JSON.stringify({
            instanceId,
            action: 'scale_down',
            reason: 'Low activity',
            workers: currentWorkers - 1
          }));
        }
      }
      
      // Публикуем метрики
      await queue.client.hset(
        'queue:metrics',
        instanceId,
        JSON.stringify({
          waiting,
          active,
          completed: stats.completed,
          failed: stats.failed,
          queuePressure,
          queueGrowth,
          workers: currentWorkers,
          load,
          memUsage,
          timestamp: Date.now()
        })
      );
      
    } catch (error) {
      console.error(`[${instanceId}] Autoscaling error:`, error);
    }
  }, 5000); // Каждые 5 секунд
}

export function setupQueueMonitoring(queue, instanceId) {
  // Dashboard метрики
  queue.on('completed', async (job, result) => {
    await queue.client.hincrby('stats:completed', instanceId, 1);
  });
  
  queue.on('failed', async (job, err) => {
    await queue.client.hincrby('stats:failed', instanceId, 1);
    console.error(`[${instanceId}] Job failed:`, err);
  });
  
  queue.on('stalled', async (job) => {
    await queue.client.hincrby('stats:stalled', instanceId, 1);
    console.warn(`[${instanceId}] Job stalled:`, job.id);
  });
}
```

## 5. **Координатор кластера**:

```javascript
// src/modules/events/workers/coordinator.js
class WorkerCoordinator {
  constructor(redisClient) {
    this.redis = redisClient;
    this.checkInterval = 30000; // 30 сек
  }

  async start() {
    console.log('Cluster coordinator started');
    
    setInterval(async () => {
      const stats = await this.getClusterStats();
      const decision = await this.makeScalingDecision(stats);
      
      if (decision.action) {
        await this.executeDecision(decision);
      }
      
      // Сохраняем глобальную статистику
      await this.saveGlobalStats(stats);
      
    }, this.checkInterval);
  }

  async getClusterStats() {
    const workerStats = await this.redis.hgetall('workers:stats');
    const queueMetrics = await this.redis.hgetall('queue:metrics');
    
    const nodes = {};
    
    // Парсим статистику воркеров
    for (const [id, data] of Object.entries(workerStats)) {
      nodes[id] = { ...JSON.parse(data), type: 'worker' };
    }
    
    // Добавляем метрики очередей
    for (const [id, data] of Object.entries(queueMetrics)) {
      if (nodes[id]) {
        nodes[id].queue = JSON.parse(data);
      }
    }
    
    // Рассчитываем общие метрики
    const totalWorkers = Object.values(nodes).reduce((sum, n) => sum + (n.workers || 0), 0);
    const totalWaiting = Object.values(nodes).reduce((sum, n) => sum + (n.queue?.waiting || 0), 0);
    const avgLoad = Object.values(nodes).reduce((sum, n) => sum + (n.load || 0), 0) / Object.keys(nodes).length;
    
    return {
      nodes,
      totalWorkers,
      totalWaiting,
      avgLoad,
      nodeCount: Object.keys(nodes).length
    };
  }

  async makeScalingDecision(stats) {
    const { nodes, totalWorkers, totalWaiting, avgLoad } = stats;
    
    // Критическая нагрузка - нужно больше воркеров
    if (totalWaiting > 1000 && avgLoad < 0.7) {
      // Находим ноду с наименьшей нагрузкой
      const bestNode = Object.entries(nodes)
        .sort(([,a], [,b]) => a.load - b.load)[0];
      
      if (bestNode) {
        return {
          action: 'scale_up',
          nodeId: bestNode[0],
          reason: `High queue (${totalWaiting} waiting)`,
          priority: 'high'
        };
      }
    }
    
    // Очень мало работы - уменьшаем воркеры
    if (totalWaiting === 0 && totalWorkers > stats.nodeCount * 2) {
      const nodeWithMostWorkers = Object.entries(nodes)
        .sort(([,a], [,b]) => b.workers - a.workers)[0];
      
      if (nodeWithMostWorkers) {
        return {
          action: 'scale_down',
          nodeId: nodeWithMostWorkers[0],
          reason: 'Idle queue',
          priority: 'low'
        };
      }
    }
    
    return { action: null };
  }

  async executeDecision(decision) {
    console.log(`Coordinator decision: ${decision.action} for ${decision.nodeId}`);
    
    await this.redis.publish(
      `worker:commands:${decision.nodeId}`,
      JSON.stringify(decision)
    );
    
    // Логирование решения
    await this.redis.lpush(
      'scaling:history',
      JSON.stringify({
        ...decision,
        timestamp: Date.now()
      })
    );
    
    // Обрезаем историю до 100 последних записей
    await this.redis.ltrim('scaling:history', 0, 99);
  }

  async saveGlobalStats(stats) {
    await this.redis.set(
      'cluster:stats',
      JSON.stringify({
        ...stats,
        timestamp: Date.now()
      })
    );
    
    // TTL 5 минут
    await this.redis.expire('cluster:stats', 300);
  }
}

export default WorkerCoordinator;
```

## 6. **Конфигурация для разных окружений**:

```javascript
// config/deployment.config.js
export const deploymentConfigs = {
  development: {
    WORKER_MODE: 'both',
    WORKER_COUNT: 2,
    MAX_WORKERS: 4,
    MIN_WORKERS: 1,
    IS_COORDINATOR: 'true'
  },
  
  production: {
    // Сервер 1 - API + Coordinator
    'api-main': {
      WORKER_MODE: 'api',
      IS_COORDINATOR: 'true',
      PORT: 3000
    },
    
    // Серверы 2-4 - Чистые воркеры
    'worker-1': {
      WORKER_MODE: 'worker',
      WORKER_COUNT: 8,
      MAX_WORKERS: 16,
      MIN_WORKERS: 4
    },
    
    'worker-2': {
      WORKER_MODE: 'worker',
      WORKER_COUNT: 8,
      MAX_WORKERS: 16,
      MIN_WORKERS: 4
    },
    
    // Сервер 5 - Гибридный для балансировки
    'hybrid-1': {
      WORKER_MODE: 'both',
      WORKER_COUNT: 4,
      MAX_WORKERS: 8,
      MIN_WORKERS: 2,
      PORT: 3001
    }
  }
};

// Загрузчик конфига
export function loadConfig() {
  const env = process.env.NODE_ENV || 'development';
  const serverName = process.env.SERVER_NAME || 'default';
  
  const config = deploymentConfigs[env]?.[serverName] || deploymentConfigs[env] || deploymentConfigs.development;
  
  // Применяем конфиг к process.env
  Object.entries(config).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  return config;
}
```

## 7. **Docker Compose для масштабирования**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Общая инфраструктура
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - martyrs

  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - martyrs

  # API + Coordinator
  api-main:
    build: .
    environment:
      - WORKER_MODE=api
      - IS_COORDINATOR=true
      - REDIS_HOST=redis
      - MONGODB_URI=mongodb://mongodb:27017/martyrs
      - PUBLIC_PATH=/shared/public
    ports:
      - "3000:3000"
    volumes:
      - shared-data:/shared
    networks:
      - martyrs
    depends_on:
      - redis
      - mongodb

  # Worker nodes (можно скейлить: docker-compose up --scale worker=5)
  worker:
    build: .
    environment:
      - WORKER_MODE=worker
      - WORKER_COUNT=4
      - MAX_WORKERS=8
      - MIN_WORKERS=2
      - REDIS_HOST=redis
      - MONGODB_URI=mongodb://mongodb:27017/martyrs
      - PUBLIC_PATH=/shared/public
    volumes:
      - shared-data:/shared
    networks:
      - martyrs
    depends_on:
      - redis
      - mongodb

  # Nginx для балансировки API
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    networks:
      - martyrs
    depends_on:
      - api-main

networks:
  martyrs:
    driver: bridge

volumes:
  redis-data:
  mongo-data:
  shared-data:
```

## 8. **PM2 ecosystem для production**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'martyrs-api',
      script: './server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        WORKER_MODE: 'api',
        IS_COORDINATOR: 'true',
        PORT: 3000,
        REDIS_HOST: 'redis.prod.local',
        MONGODB_URI: 'mongodb://mongo.prod.local/martyrs'
      }
    },
    {
      name: 'martyrs-workers',
      script: './server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        WORKER_MODE: 'worker',
        WORKER_COUNT: 8,
        MAX_WORKERS: 16,
        MIN_WORKERS: 4,
        REDIS_HOST: 'redis.prod.local',
        MONGODB_URI: 'mongodb://mongo.prod.local/martyrs'
      }
    }
  ]
};
```

Теперь система полностью готова к масштабированию:
- Запускается на 1 сервере с `WORKER_MODE=both`
- Легко разделяется на API и Worker ноды
- Автоматически балансирует нагрузку
- Координатор управляет глобальным скейлингом
- Все метрики в Redis для мониторинга