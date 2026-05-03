db.mindmaps.createIndex({ id: 1 }, { unique: true, name: "uniq_id" });
db.mindmaps.createIndex({ name: 1 }, { name: "by_name" });
db.mindmaps.createIndex({ updatedAt: -1 }, { name: "by_updatedAt_desc" });

print("[init] Created indexes: uniq_id (unique), by_name, by_updatedAt_desc");
