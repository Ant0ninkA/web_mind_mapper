db.share_tokens.createIndex({ token: 1 }, { unique: true, name: "uniq_token" });
db.share_tokens.createIndex({ mindmapId: 1 }, { unique: true, name: "uniq_mindmapId" });

print("[init] Created share_tokens indexes: uniq_token (unique), uniq_mindmapId (unique)");
