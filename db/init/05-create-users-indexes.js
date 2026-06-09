db.users.createIndex({ id: 1 }, { unique: true, name: "uniq_id" });
db.users.createIndex({ email: 1 }, { unique: true, name: "uniq_email" });
db.users.createIndex({ username: 1 }, { unique: true, name: "uniq_username" });

print("[init] Created users indexes: uniq_id (unique), uniq_email (unique), uniq_username (unique)");
