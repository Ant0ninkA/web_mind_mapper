const validator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["id", "email", "username", "passwordHash", "createdAt", "updatedAt"],
    additionalProperties: true,
    properties: {
      _id: {},
      id: {
        bsonType: "string",
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        description: "UUID v4 primary key.",
      },
      email: {
        bsonType: "string",
        description: "Lowercase email address.",
      },
      username: {
        bsonType: "string",
        minLength: 3,
        maxLength: 32,
        pattern: "^[a-zA-Z0-9_]+$",
        description: "Alphanumeric + underscores, 3-32 chars.",
      },
      passwordHash: {
        bsonType: "string",
        description: "bcrypt hash (~60 chars).",
      },
      avatarUrl: {
        bsonType: ["string", "null"],
        description: "Optional avatar URL.",
      },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
};

const collectionExists = db.getCollectionNames().includes("users");

if (collectionExists) {
  db.runCommand({
    collMod: "users",
    validator: validator,
    validationLevel: "moderate",
    validationAction: "error",
  });
  print("[init] Collection 'users' already existed — validator updated in place");
} else {
  db.createCollection("users", {
    validator: validator,
    validationLevel: "moderate",
    validationAction: "error",
  });
  print("[init] Created collection 'users' with $jsonSchema validator (level=moderate, action=error)");
}
