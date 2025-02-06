# Start guardian containers

create new containers

```bash
docker run --name owner-guardian -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian1 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian2 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

or start existing containers

```bash
docker start owner-guardian && docker logs -f owner-guardian
docker start guardian1 && docker logs -f guardian1
docker start guardian2 && docker logs -f guardian2
```

# Create a user

```bash
clear && node dist/gridlock.js create-user -n "Bertram Gilfoyle" -e 1@1.com -p password
```

# Add a guardian to a user

This function adds guardian to the user object.
First add a custom cloud guardian labeled as the owner guardian.
Then add another cloud guardian.
Then add a gridlock guarian.

```bash
clear && node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k s6VTHsJ5uqnFjrFVqerBjgGPcw5zZ2cVdKwj9XEyLUU -o true
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian1 -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6 -k 7l9XVjtAax40b7gfbBohR5IgU7D2Polnta/YI0FfplE= -o false
node dist/gridlock.js add-guardian -e 1@1.com -p password -t gridlock
```

add rust testing code

```bash
clear && node dist/gridlock.js create-user -n "Bertram Gilfoyle" -e 1@1.com -p password
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k s6VTHsJ5uqnFjrFVqerBjgGPcw5zZ2cVdKwj9XEyLUU -o
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian1 -i dbf6ea5f-82a4-4c40-9aec-5b83a6fb6b78 -k "DUamBveqELmPiuQzXsntwrvNrlJ1HITDnBo2V1w94A0="

```

# Create a wallet

Create a wallet for a user.

```bash
clear && node dist/gridlock.js create-wallet -e 1@1.com -p password -b solana
```

# Sign message

Sign a message for the user.

```bash
clear && node dist/gridlock.js sign -e 1@1.com -p password -a 9ECoXFLbU9LN95b6TsFmMzS231u2ybToWTQfdyNLbvzL -m hello
```

# Verify signature

verify signature

```bash
clear && node dist/gridlock.js verify -e 1@1.com -p password -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello -b solana -s fbeb92da7ddf672326c4d8fc86e9ea771f0c879f9a134298849f4833916b196c7d6eebe50bba0b8350c58fa18df0aee905e0d46716bab5253c1dedbfc24bae08
```

# Extra debug functions

Functions for testing that will be removed.

## Show network

```bash
clear && node dist/gridlock.js show-network -e 1@1.com
```

```bash
node dist/gridlock-utils.js e2e-send -e 1@1.com -p password -m "this is my message" -t "uIaPp2B+SR49nFshtaq6AdH8GIo416tjaMIPSgW5eEU="
```

```bash
node dist/gridlock-utils.js e2e-receive -p "Oc860iPn+GjHXiemYBc/uqtvorlyNyTqYKfuhoZn7gI=" -s "ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk=" -m "FOmuwcKOD9XpcSpJUsN5YVTOZYfOiM2Ex2P9ZR5xTst/ERIXSA1gdMAYMk3IHah64qAC2PzAosGNgQ=="
```

//guardian
"e2e_public": "DUamBveqELmPiuQzXsntwrvNrlJ1HITDnBo2V1w94A0=",
"e2e_private": "6zXAHwbmO+I3Qz998H/PZ6EhgV+s53RHNzHSjkTuWe8="

//local

private = sA8/5/hr904Yl8Pp8L8hs7UNBgdC7YYHTvo8zUDFifA=

clear && node dist/gridlock.js recover -e 2@2.com -p mypass
