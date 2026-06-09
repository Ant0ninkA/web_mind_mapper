import { Db } from 'mongodb';

const COLLECTION = 'mindmaps';

const mindmapValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['id', 'name', 'nodes', 'edges', 'createdAt', 'updatedAt'],
    additionalProperties: true,
    properties: {
      _id: {},
      id: {
        bsonType: 'string',
        pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
        description: 'Application-level UUID. Server queries by this field, not by _id.',
      },
      name: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 200,
      },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
      nodes: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['id', 'position', 'data'],
          additionalProperties: true,
          properties: {
            id: { bsonType: 'string', minLength: 1 },
            type: { bsonType: 'string' },
            position: {
              bsonType: 'object',
              required: ['x', 'y'],
              additionalProperties: true,
              properties: {
                x: { bsonType: ['double', 'int', 'long'] },
                y: { bsonType: ['double', 'int', 'long'] },
              },
            },
            data: {
              bsonType: 'object',
              required: ['label'],
              additionalProperties: true,
              properties: {
                label: { bsonType: 'string' },
              },
            },
            style: {
              bsonType: 'object',
              additionalProperties: true,
              properties: {
                backgroundColor: { bsonType: 'string' },
                color: { bsonType: 'string' },
                borderColor: { bsonType: 'string' },
                borderWidth: { bsonType: ['int', 'double', 'long', 'string'] },
                borderStyle: { bsonType: 'string' },
                borderRadius: { bsonType: ['int', 'double', 'long', 'string'] },
                fontSize: { bsonType: ['int', 'double', 'long', 'string'] },
                fontFamily: { bsonType: 'string' },
                fontWeight: { bsonType: ['int', 'string'] },
                textAlign: { enum: ['left', 'center', 'right', 'justify'] },
                opacity: { bsonType: ['double', 'int'], minimum: 0, maximum: 1 },
              },
            },
          },
        },
      },
      edges: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['id', 'source', 'target'],
          additionalProperties: true,
          properties: {
            id: { bsonType: 'string', minLength: 1 },
            source: { bsonType: 'string', minLength: 1 },
            target: { bsonType: 'string', minLength: 1 },
            sourceHandle: { bsonType: ['string', 'null'] },
            targetHandle: { bsonType: ['string', 'null'] },
            type: { bsonType: 'string' },
            label: { bsonType: 'string' },
            animated: { bsonType: 'bool' },
            style: { bsonType: 'object', additionalProperties: true },
          },
        },
      },
    },
  },
};

export async function initializeDatabase(db: Db): Promise<void> {
  const collections = await db.listCollections({ name: COLLECTION }).toArray();

  if (collections.length === 0) {
    await db.createCollection(COLLECTION, {
      validator: mindmapValidator,
      validationLevel: 'moderate',
      validationAction: 'error',
    });
    console.log('[initDb] Created collection "mindmaps" with schema validator');
  } else {
    await db.command({
      collMod: COLLECTION,
      validator: mindmapValidator,
      validationLevel: 'moderate',
      validationAction: 'error',
    });
    console.log('[initDb] Updated schema validator for "mindmaps" collection');
  }

  const collection = db.collection(COLLECTION);
  await collection.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' });
  await collection.createIndex({ name: 1 }, { name: 'by_name' });
  await collection.createIndex({ updatedAt: -1 }, { name: 'by_updatedAt_desc' });
  console.log('[initDb] Indexes ensured: uniq_id (unique), by_name, by_updatedAt_desc');
}
