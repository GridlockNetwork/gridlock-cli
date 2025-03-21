# Gridlock CLI Commands

This document outlines the available commands in the Gridlock CLI.

# Start guardian containers

Be sure to start the guardian containers created during setup, then create a user. Note: We are saving the credentials for future use with the -s flag.

# Create a user

```sh
gridlock create-user -n "Bertram Gilfoyle" -e gilfoyle@piedpiper.com -p password -s
```

# Add a guardian to a user

This function adds guardian to the user object.

First add a "cloud guardian" which will be one of the docker containers you started during setup. Let's make this guardian the owner guardian that represents you.

Note: that you will be prompted for the node ID and node public key. You can find this information from the docker logs.

Note that we currently have two keys, the nkeys signing key using the ed25519 curve for idenity verification and a nacl box x25519 key for e2e encryption. The node id is how we contact the node, I'm not exactly sure what the nkey signing keys are for. To add a node, you want the top node id and the e2e public key.

This is the output from the modifed guardian container on the rust e2e branch

```
Retrieved node identity: node id: 241ae6b0-66fc-421b-984c-5c3ed1b036f2, public key: "UAZ2FCJFPD4QJYPQK335HPBSO2KLHTUVBBMJHFPNHWNUN2BQLPWLOFMC", E2E public key: "jM1Gpqsz8YVUjYv8umyyXsTB4GnAtO9Io+M/SIOZBjw="
```

## Command template to add three guardians

```sh
gridlock add-guardian -t cloud -n "Isabella" -i ENTER_NODE_ID -ik "ENTER_PUBLIC_KEY" -ek "ENTER_ENCRYPTION_KEY"

gridlock add-guardian -t cloud -n "Charlotte" -i ENTER_NODE_ID -ik "ENTER_PUBLIC_KEY" -ek "ENTER_ENCRYPTION_KEY"

gridlock add-guardian -t cloud -n "Amelia" -i ENTER_NODE_ID -ik "ENTER_PUBLIC_KEY" -ek "ENTER_ENCRYPTION_KEY" -o
```

gridlock add-guardian -t cloud -n "Isabella" -i 241ae6b0-66fc-421b-984c-5c3ed1b036f2 -ik UAZ2FCJFPD4QJYPQK335HPBSO2KLHTUVBBMJHFPNHWNUN2BQLPWLOFMC -ek "jM1Gpqsz8YVUjYv8umyyXsTB4GnAtO9Io+M/SIOZBjw="

gridlock add-guardian -t cloud -n "Charlotte" -i 0d9c4dec-11b0-4e25-816b-ee285e8fc7c7 -ik UBUKP574NFLPW37V5XBVDVIKNTY2XQCBNS3HNNTZFTLLI6SRRIYIDIGV -ek "+ekhdwTEHWZK2pXfTZ4uYiPDHi2lLaEN15qBdFiMgXs"

gridlock add-guardian -t cloud -n "Amelia" -i bd750f73-461e-4b8f-bc01-ce97be67ebaf -ik UCOZ5PL4HVA2OKVLDLRUSZF4OH5ZH2JEQBCGPJM4BMWYARN4UX474MGE -ek "etN1yiXIPwNfnhTR5ci39smn+bgmlUdDj43wwe+Vxnc=" -o

The add two Gridlock guardians which are already up and running for you in the cloud.

```sh
gridlock add-guardian -t gridlock
gridlock add-guardian -t gridlock
```

# See your network of guardians

```sh
gridlock show-network
```

# Create a wallet

Create a wallet for a user.

```sh
gridlock create-wallet -b solana
```

# Sign message

Sign a message for the user.

```sh
gridlock sign -m "this is the test message"
```

# Verify signature

verify signature

```sh
gridlock verify -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello -b solana
```

# Extra debug functions

Functions for testing that will be removed.

```sh
gridlock-utils e2e-send -m "this is my message" -t "uIaPp2B+SR49nFshtaq6AdH8GIo416tjaMIPSgW5eEU="
```

```sh
gridlock-utils e2e-receive -p "Oc860iPn+GjHXiemYBc/uqtvorlyNyTqYKfuhoZn7gI=" -s "ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk=" -m "FOmuwcKOD9XpcSpJUsN5YVTOZYfOiM2Ex2P9ZR5xTst/ERIXSA1gdMAYMk3IHah64qAC2PzAosGNgQ=="
```

# docker containers

gridlock add-guardian \
-t cloud \
-n "Oliver" \
-i "bd750f73-461e-4b8f-bc01-ce97be67ebaf" \
-ik "UCOZ5PL4HVA2OKVLDLRUSZF4OH5ZH2JEQBCGPJM4BMWYARN4UX474MGE" \
-ek "etN1yiXIPwNfnhTR5ci39smn+bgmlUdDj43wwe+Vxnc="

gridlock add-guardian \
-t cloud \
-n "Henry" \
-i "0d9c4dec-11b0-4e25-816b-ee285e8fc7c7" \
-ik "UBUKP574NFLPW37V5XBVDVIKNTY2XQCBNS3HNNTZFTLLI6SRRIYIDIGV" \
-ek "+ekhdwTEHWZK2pXfTZ4uYiPDHi2lLaEN15qBdFiMgXs="

gridlock add-guardian \
-t cloud \
-n "James" \
-i "241ae6b0-66fc-421b-984c-5c3ed1b036f2" \
-ik "UAZ2FCJFPD4QJYPQK335HPBSO2KLHTUVBBMJHFPNHWNUN2BQLPWLOFMC" \
-ek "jM1Gpqsz8YVUjYv8umyyXsTB4GnAtO9Io+M/SIOZBjw=" \
-o

# str8 from code

gridlock add-guardian \
-t cloud \
-n "Chartruse" \
-i "8e198cc0-eace-4b9b-a12c-7a6e6801078e" \
-ik "UA2IGJVRR2LXXLUJTBDWRXH55IV2N5JNJQLABEH52COWVWXKYCFVEZJD" \
-ek "DJeBSqPAN6J3tSy34Ora/Bdl4/B/K13pkOkZv4DNUCc="

gridlock add-guardian \
-t cloud \
-n "Orange" \
-i "fefd479f-cf2d-4663-9d36-e597a5d05328" \
-ik "UC35C3EQ4SNGHYLACKP77NTP46Q6PDDSWCY3MTQ5AUAOY6ZSIAS4L5GS" \
-ek "u0gSlgS6w2BkqMI8axOb2xi9kamRHmAgY5jssk38LXw="

gridlock add-guardian \
-t cloud \
-n "Bloo" \
-i "f90f889a-01ea-415f-81fe-ed624c6b0541" \
-ik "UDFCR7NI5DJEAUSEIWWBIXBNQQLWBBPSSDSF5AOCMNW5LMZQGOVT7RCC" \
-ek "JkKinrLp0IU/LKdjgQqzTGAzKjTAjoHvOCo8VUgToh0=" \
