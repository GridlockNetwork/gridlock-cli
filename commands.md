# Start guardian containers

Be sure to start the guardian containers created during setup, the create a user. Note: We are saving the credentials for future use with the -s flag.

# Create a user

```sh
node dist/gridlock.js create-user -n "Bertram Gilfoyle" -e gilfoyle@piedpiper.com -p password -s
```

# Add a guardian to a user

This function adds guardian to the user object.

First add a "cloud guardian" which will be one of the docker containers you started during setup. Let's make this guardian the owner guardian that represents you.

Note: that you will be prompted for the node ID and node public key. You can find this information from the docker logs.

Note that we currently have two keys, the nkeys signing key using the ed25519 curve for idenity verification and a nacl box x25519 key for e2e encryption. The node id is how we contact the node, I'm not exactly sure what the nkey signing keys are for. To add a node, you want the top node id and the e2e public key.

This is the output from the modifed guardian container on the rust e2e branch

```{
  "node_id": "9242891d-0a68-4a8b-90a4-a1934b6b354b",
  "public_key": "UATHUPF3HL6QD4GUSBIMJO4G5AWLFFBENJPPYWIBVSGRW4LNE6BQL6ZP",
  "private_key": "SUAMAN66MFOAB2C6MXIA6DWGKIOOEMJZ5DQUTLUZJ2N3KTZJIXFSDZ4S6E",
  "e2e_public": "j4P3JoRtBaGiAdOmN3R1JcM/Jdhwvmag1VqmOt2stno=",
  "e2e_private": "HdYVTSOSVw9ttSd8Z5uQTTnPXci54iSRBMydY6oGWe8="
}
```

```sh
node dist/gridlock.js add-guardian -t cloud -n "My computer" -o
```

The add two Gridlock guardians which are already up and running for you in the cloud.

```sh
node dist/gridlock.js add-guardian -t gridlock
node dist/gridlock.js add-guardian -t gridlock
```

# See your network of guardians

```sh
node dist/gridlock.js show-network
```

# Create a wallet

Create a wallet for a user.

```sh
node dist/gridlock.js create-wallet -b solana
```

# Sign message

Sign a message for the user.

```sh
node dist/gridlock.js sign -m "this is the test message"
```

# Verify signature

verify signature

```sh
node dist/gridlock.js verify -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello -b solana
```

# Extra debug functions

Functions for testing that will be removed.

```sh
node dist/gridlock-utils.js e2e-send -m "this is my message" -t "uIaPp2B+SR49nFshtaq6AdH8GIo416tjaMIPSgW5eEU="
```

```sh
node dist/gridlock-utils.js e2e-receive -p "Oc860iPn+GjHXiemYBc/uqtvorlyNyTqYKfuhoZn7gI=" -s "ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk=" -m "FOmuwcKOD9XpcSpJUsN5YVTOZYfOiM2Ex2P9ZR5xTst/ERIXSA1gdMAYMk3IHah64qAC2PzAosGNgQ=="
```
