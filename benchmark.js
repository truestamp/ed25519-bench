// https://caderek.github.io/benny/
const b = require("benny")

// setup tweetnacl and its keypair
// https://github.com/dchest/tweetnacl-js
const nacl = require("tweetnacl")
const naclKeypair = nacl.sign.keyPair()

// setup sodium-native
// https://sodium-friends.github.io/docs/docs/signing
const sodium = require("sodium-native")
const sodiumPublicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
const sodiumSecretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
sodium.crypto_sign_keypair(sodiumPublicKey, sodiumSecretKey)

// setup Node.js crypto keypair
// Example: https://gist.github.com/teiikushi07/40fa141237a763b8cf30d8c1095eb1c8
const crypto = require("crypto")
const cryptoKeypair = crypto.generateKeyPairSync("ed25519")

// See : nodejs.org/api/crypto.html#crypto_keyobject_export_options
// To inspect the ASN.1 PEM encoded key visit: https://lapo.it/asn1js/
const cryptoPubKeyPem = cryptoKeypair.publicKey.export({
  type: "spki",
  format: "pem",
})
// console.log(cryptoPubKeyPem)

// To inspect the ASN.1 PEM encoded key visit: https://lapo.it/asn1js/
const cryptoPrivKeyPem = cryptoKeypair.privateKey.export({
  type: "pkcs8",
  format: "pem",
})
// console.log(cryptoPrivKeyPem)

const cryptoPubKeyRehydrated = crypto.createPublicKey({
  key: cryptoPubKeyPem,
  format: "pem",
  type: "spki",
})

const cryptoPrivKeyRehydrated = crypto.createPrivateKey({
  key: cryptoPrivKeyPem,
  format: "pem",
  type: "pkcs8",
})

// create a common message to sign
const m = new Uint8Array(100)
var i
for (i = 0; i < m.length; i++) {
  m[i] = i & 0xff
}

// sign the message with nacl.sign for the verify step
const naclTestSig = nacl.sign.detached(m, naclKeypair.secretKey)

// sign the message with sodium.crypto_sign for the verify step
let sodiumTestSig = Buffer.alloc(sodium.crypto_sign_BYTES + m.length)
sodium.crypto_sign(sodiumTestSig, m, sodiumSecretKey)

// sign the message with crypto.sign for the verify step
const cryptoTestSig = crypto.sign(null, m, cryptoKeypair.privateKey)

b.suite(
  "sign : tweetnacl vs. sodium-native vs. crypto",

  b.add("sign w/ tweetnacl", () => {
    let sm = nacl.sign.detached(m, naclKeypair.secretKey)
  }),

  b.add("sign w/ sodium-native", () => {
    let sm = Buffer.alloc(sodium.crypto_sign_BYTES + m.length)
    sodium.crypto_sign(sm, m, sodiumSecretKey)
  }),

  b.add("sign w/ crypto (KeyObject)", () => {
    // crypto.sign(null, m, cryptoKeypair.privateKey)
    crypto.sign(null, m, cryptoPrivKeyRehydrated)
  }),

  b.add("sign w/ crypto (PEM)", () => {
    crypto.sign(null, m, cryptoPrivKeyPem)
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "sign", version: "1.0.0" }),
  b.save({ file: "sign", format: "chart.html" })
)

b.suite(
  "verify : tweetnacl vs. sodium-native vs. crypto",

  b.add("verify w/ tweetnacl", () => {
    if (!nacl.sign.detached.verify(m, naclTestSig, naclKeypair.publicKey)) {
      throw new Error("nacl.sign.detached.verify failed")
    }
  }),

  b.add("verify w/ sodium-native", () => {
    if (!sodium.crypto_sign_open(m, sodiumTestSig, sodiumPublicKey)) {
      throw new Error("sodium.crypto_sign_open failed")
    }
  }),

  b.add("verify w/ crypto (KeyObject)", () => {
    // crypto.verify(null, m, cryptoKeypair.publicKey, cryptoTestSig)
    if (!crypto.verify(null, m, cryptoPubKeyRehydrated, cryptoTestSig)) {
      throw new Error("verify failed")
    }
  }),

  b.add("verify w/ crypto (PEM)", () => {
    if (!crypto.verify(null, m, cryptoPubKeyPem, cryptoTestSig)) {
      throw new Error("verify failed")
    }
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "verify", version: "1.0.0" }),
  b.save({ file: "verify", format: "chart.html" })
)
