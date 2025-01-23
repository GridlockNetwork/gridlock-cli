# Run docker containers for each guardian
```bash
docker run --name owner-guardian -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian1 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian2 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```


# Create a user
```bash
clear && node newback.js create-user -n derek -e 1@1.com
```

# Add a guardian to a user
This function adds a guardian to the user. First add a guardian and label it the owner guardian
```bash
clear && node newback.js add-guardian -e 1@1.com -p password -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k UCKZ5L3CM6MI6UOD3NJLFGFCSZYMYCGFCHPGNZJCNPTQDB7AGY4SAHV6 -o
```

Now add additional guardians
```bash
clear && node newback.js add-guardian -e 1@1.com -p password -t cloud -n guardian1 -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6 -k UC7K4POWWO6QVG25CEM4H7UN6LLSFTC3Y3EL4KEASFLEGCMA46YXLN7V
```
```bash
clear && node newback.js add-guardian -e 1@1.com -p password -t cloud -n guardian2 -i e2bb515f-31e6-4f12-a80d-a4bd8a1215d8 -k UBRQWGLFLFAFJSJBZZUR47IBARHOHUCOQXLD23O4QUMCZI5YJZNFFBY2
```


# Create a wallet
Create a wallet for a user.
```bash
clear && node newback.js create-wallet -e 1@1.com -p password -b solana
```


# Sign message
Sign a message for the user.
```bash
clear && node newback.js sign -e 1@1.com -p password -b solana -m hello
```

# Extra debug functions
Functions for testing that will be removed.

## Test login
```bash
clear && node newback.js login -e 1@1.com -p password
```
## Show network
```bash
clear && node newback.js show-network -e 1@1.com
```

# deregister guardian
```bash
clear && node newback.js deregister-guardian -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6
```

```bash
clear && node newback.js deregister-guardian -i e2bb515f-31e6-4f12-a80d-a4bd8a1215d8
```

```bash
clear && node newback.js deregister-guardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434
```

