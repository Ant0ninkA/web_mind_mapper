db.mindmaps.createIndex({ id: 1 }, { unique: true, name: "uniq_id" });
db.mindmaps.createIndex({ updatedAt: -1 }, { name: "by_updatedAt_desc" });
db.mindmaps.createIndex({ ownerId: 1 }, { name: "by_ownerId" });

print("[init] Created indexes: uniq_id (unique), by_updatedAt_desc, by_ownerId");
