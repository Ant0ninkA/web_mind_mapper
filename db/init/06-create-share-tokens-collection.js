const validator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["token", "mindmapId", "createdAt"],
    additionalProperties: true,
    properties: {
      _id: {},
      token: {
        bsonType: "string",
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        description: "UUID v4 share token.",
      },
      mindmapId: {
        bsonType: "string",
        description: "ID of the shared mindmap.",
      },
      createdAt: { bsonType: "date" },
    },
  },
};

const collectionExists = db.getCollectionNames().includes("share_tokens");

if (collectionExists) {
  db.runCommand({
    collMod: "share_tokens",
    validator: validator,
    validationLevel: "moderate",
    validationAction: "error",
  });
  print("[init] Collection 'share_tokens' already existed — validator updated in place");
} else {
  db.createCollection("share_tokens", {
    validator: validator,
    validationLevel: "moderate",
    validationAction: "error",
  });
  print("[init] Created collection 'share_tokens' with $jsonSchema validator (level=moderate, action=error)");
}
