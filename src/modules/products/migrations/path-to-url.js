// renameFullPathToUrl.mjs
import { MongoClient } from 'mongodb';

const uri = process.env.DB_ADDRESS;                         // экспортируйте DB_ADDRESS перед запуском
if (!uri) {
  console.error('DB_ADDRESS env var is required');
  process.exit(1);
}

const client = new MongoClient(uri, { useUnifiedTopology: true });

try {
  await client.connect();
  const db = client.db();                                   // название БД берётся из URI
  const categories = db.collection('categories');

  const result = await categories.updateMany(
    { fullPath: { $exists: true } },                        // обновляем только если поле есть
    { $rename: { fullPath: 'url' } }                        // переименовываем fullPath → url
  );

  console.log(`updated ${result.modifiedCount} / ${result.matchedCount} documents`);
} catch (err) {
  console.error('update failed:', err);
} finally {
  await client.close();
}
