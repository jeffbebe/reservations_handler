#!/bin/bash

echo "⌛ Waiting for MongoDB to start..."
sleep 5  # Wait to ensure MongoDB is fully running

echo "🚀 Initializing Replica Set..."
mongosh --host localhost:27017 -u admin -p adminpassword --authenticationDatabase admin <<EOF
try {
    rs.initiate({
        _id: "rs0",
        members: [{ _id: 0, host: "localhost:27017" }]
    });

    db.createUser(
 {
  user: “Admin”,pwd: “myNewPassword”,
  roles: [ { role: ‘root’, db: ‘admin’ } ]
  }
);

rs.status()

    print("✅ Replica Set Initialized Successfully");
} catch (err) {
    print("⚠️ Replica Set Already Initialized or Error Occurred:", err);
}
EOF

echo "🎉 Initialization Script Finished!"