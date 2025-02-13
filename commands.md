# Start guardian containers

Be sure to start the guardian containers created during setup

# Create a user

```sh
node dist/gridlock.js create-user -n "Bertram Gilfoyle" -e gilfoyle@piedpiper.com -p password
```

# Add a guardian to a user

This function adds guardian to the user object.

First add a "cloud guardian" which will be one of the docker containers you started during setup. Let's make this guardian the owner guardian that represents you.

Note: that you will be prompted for the node ID and node public key. You can find this information from the docker logs.

WARNING: the current guardians use NATS public keys which do not work with our encryption. You will have to use a temporary key until we can recreate the nats containers. Use this one which is the pub key for gridlock-staging-4
Zos8ukwJEL7TFvrtinuV9AQNC2if3rwcb55HJLnpIlQ

```sh
node dist/gridlock.js add-guardian -e gilfoyle@piedpiper.com -p password -t cloud -n "My computer" -o true
```

Then add another cloud guardian. This will not be labeled as an owner guardian.

Tip: You can add the node ID and public key as a command line parameter using -i and -k respectivelly.

```sh
node dist/gridlock.js add-guardian -e gilfoyle@piedpiper.com -p password -t cloud -n "My cloud guardian" -o false
```

The add a Gridlock guardian which is already up and running for you in the cloud.

```sh
node dist/gridlock.js add-guardian -e gilfoyle@piedpiper.com -p password -t gridlock
```

# See your network of guardians

```sh
node dist/gridlock.js show-network -e gilfoyle@piedpiper.com
```

# Create a wallet

Create a wallet for a user.

```sh
node dist/gridlock.js create-wallet -e gilfoyle@piedpiper.com -p password -b solana
```

# Sign message

Sign a message for the user.

```sh
node dist/gridlock.js sign -e gilfoyle@piedpiper.com -p password -m "this is the test message"
```

# Verify signature

verify signature

```sh
node dist/gridlock.js verify -e gilfoyle@piedpiper.com -p password -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello -b solana
```

# Extra debug functions

Functions for testing that will be removed.

```sh
node dist/gridlock-utils.js e2e-send -e gilfoyle@piedpiper.com -p password -m "this is my message" -t "uIaPp2B+SR49nFshtaq6AdH8GIo416tjaMIPSgW5eEU="
```

```sh
node dist/gridlock-utils.js e2e-receive -p "Oc860iPn+GjHXiemYBc/uqtvorlyNyTqYKfuhoZn7gI=" -s "ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk=" -m "FOmuwcKOD9XpcSpJUsN5YVTOZYfOiM2Ex2P9ZR5xTst/ERIXSA1gdMAYMk3IHah64qAC2PzAosGNgQ=="
```
