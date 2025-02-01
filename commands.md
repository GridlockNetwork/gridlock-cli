# Run docker containers for each guardian

```bash
docker run --name owner-guardian -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian1 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian2 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

# Create a user

```bash
clear && node dist/gridlock.js create-user -n "derek rodriguez" -e 1@1.com -p password
```

# Add a guardian to a user

This function adds a guardian to the user. First add a guardian and label it the owner guardian, then add two more.

```bash
clear && node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k s6VTHsJ5uqnFjrFVqerBjgGPcw5zZ2cVdKwj9XEyLUU -o
```

```bash
clear && node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian1 -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6 -k 7l9XVjtAax40b7gfbBohR5IgU7D2Polnta/YI0FfplE=
```

```bash
clear && node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian2 -i e2bb515f-31e6-4f12-a80d-a4bd8a1215d8 -k Zos8ukwJEL7TFvrtinuV9AQNC2if3rwcb55HJLnpIlQ=
```

S
extra dev node

```bash
clear && node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n dev -i f6808a86-de71-42bc-8a4e-745ecdcf4d59 -k 7l9XVjtAax40b7gfbBohR5IgU7D2Polnta/YI0FfplE=
```

# ALL FOR TESTING

```bash
node dist/gridlock.js create-user -n "derek rodriguez" -e 1@1.com -p password
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k s6VTHsJ5uqnFjrFVqerBjgGPcw5zZ2cVdKwj9XEyLUU -o
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian1 -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6 -k 7l9XVjtAax40b7gfbBohR5IgU7D2Polnta/YI0FfplE=
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian2 -i e2bb515f-31e6-4f12-a80d-a4bd8a1215d8 -k Zos8ukwJEL7TFvrtinuV9AQNC2if3rwcb55HJLnpIlQ=
node dist/gridlock.js create-wallet -e 1@1.com -p password -b solana
```

# Create a wallet

Create a wallet for a user.

```bash
clear && node dist/gridlock.js create-wallet -e 1@1.com -p password -b solana
```

# Sign message - DEV IN PROGRSS

Sign a message for the user.

```bash
clear && node dist/gridlock.js sign -e 1@1.com -p password -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello
```

# verify signature

verify signature

```bash
clear && node dist/gridlock.js verify -e 1@1.com -p password -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello -b solana -s 9d93fe400651856e6fcaa83814299b52cc3e0ac4f046de82050f2b25fa145b5adb55ec07aa63719ebe8409b28e7f233ee5d89d528727359d76111e3728d5ab0b
```

# Extra debug functions

Functions for testing that will be removed.

## Test login

```bash
clear && node dist/gridlock.js login -e 1@1.com -p password
```

## Show network

```bash
clear && node dist/gridlock.js show-network -e 1@1.com
```

```bash
clear && node dist/gridlock.js test -i "vYtCNyzl0+ScCGICSci/+/sBPGOfgi9wGBId3CkPQKk=" -p password -m "y8PHxBAzYSaaOLK2cvwag51xmtR+4JCR5H8UVYrtqwnxrW1BdnOFXTstYzH5m0A8ptG/NAe7C/bmNAyaySsm0ybjnB10OPTBLSzKm1qgnf+35zCC'" -s "ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk="
```

⠸ Creating user...Public Key: ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk=
Private Key: 2J/RcblkMQocULCy4V4f0SYLrVzFeBEsfr6IYkXRUVs=
pk: 2J/RcblkMQocULCy4V4f0SYLrVzFeBEsfr6IYkXRUVs=
✔ ➕ Created account for user: Derek Rodriguez

node signing key = iPFg0go9TVclV9vnruGnbgz8VXlpoovb6fDFQOdyeJw=
