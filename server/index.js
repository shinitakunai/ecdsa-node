const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {
  utf8ToBytes,
  toHex,
  hexToBytes,
} = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "554d9a239c2c14ae6a77c9de35f2f61c56e1e4ea": 100,
  "52c0072010ea5b9e258883f6c6464e84812ef44d": 50,
  b22b628a9d7718f7f3936270abe038f654a2b60b: 75,
};

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, recoverBit, recipient, amount } = req.body;

  const sender = toHex(
    keccak256(
      secp
        .recoverPublicKey(
          hashMessage("test"),
          hexToBytes(signature),
          recoverBit
        )
        .slice(1)
    ).slice(-20)
  );

  console.log(sender, "sender");

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
