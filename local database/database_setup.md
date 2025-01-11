# MongoDB Docker Setup

This guide will help you set up a MongoDB Docker container using Docker Compose.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Setup Instructions (Linux)

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/gridlock-cli.git
   cd gridlock-cli
   ```

2. Start the MongoDB container:

   ```sh
   docker-compose up -d
   ```

3. Ensure the container is running:

   ```sh
   docker ps
   ```

4. Access the MongoDB shell inside the running container:

   ```sh
   docker exec -it mongodb mongosh -u root -p example
   ```

### MongoDB Operations

5. List databases:

   ```javascript
   show dbs;
   ```

6. Switch to the desired database (if not already in the default database):

   ```javascript
   use gridlock;
   ```

7. Save an example object to the container:

   ```javascript
   const guardian = {
     nodeId: '123-456-789',
     name: 'example node',
     type: 'Example Guardian',
     active: true,
     publicKey: 'ABCDEFGH1234568',
   };

   db.collection('guardians').insertOne(guardian);
   ```

8. Query the object:

   ```javascript
   db.collection('guardians').find({ nodeId: '123-456-789' }).pretty();
   ```

9. Delete the example object:

   ```javascript
   db.collection('guardians').deleteOne({ nodeId: '123-456-789' });
   ```

10. Exit the MongoDB shell:

    ```sh
    exit
    ```

11. Stop the MongoDB container (if needed):

    ```sh
    docker-compose down
    ```

### Point other applications to database


1. Get IP address

    ```sh
    docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mongodb
    ```
   
2. Build connection string

    ```sh
       mongodb://root:example@<container_ip>:27017/gridlock
    ```

3. Use connection string in application. Use Gridlock SDK init function to update SDK parameters