const nacl = require("tweetnacl")
const sodium = require("sodium-native")
const crypto = require("crypto")
const composer = require("crypto-key-composer")
const assert = require("assert")

// Generate a random key seed for use by all libraries
const seed = crypto.randomBytes(32)
console.log("Seed: " + seed.toString("hex"))

// Generate a random message to sign
const message = Buffer.from("test message")

// Sign with sodium-native
// ------------------------------------------------------------------------------

const sodiumPublicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
const sodiumSecretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
sodium.crypto_sign_seed_keypair(sodiumPublicKey, sodiumSecretKey, seed)

const sodiumDetachedSignature = Buffer.alloc(sodium.crypto_sign_BYTES)
sodium.crypto_sign_detached(sodiumDetachedSignature, message, sodiumSecretKey)
// console.log(sodiumDetachedSignature)

// Sign with tweetnacl-js
// ------------------------------------------------------------------------------

const naclSignKeypair = nacl.sign.keyPair.fromSeed(seed)
const naclPublicKey = naclSignKeypair.publicKey
const naclSecretKey = naclSignKeypair.secretKey

const naclDetachedSignature = nacl.sign.detached(message, naclSecretKey)
const naclDetachedSignatureBuffer = Buffer.from(naclDetachedSignature)
// console.log(naclDetachedSignatureBuffer)

// Sign with Node.js crypto
// ------------------------------------------------------------------------------

// Creates a PKCS8 PEM encoded ed25519 key
const cryptoPrivateKeyPem = composer.composePrivateKey({
  format: "pkcs8-pem",
  keyAlgorithm: {
    id: "ed25519",
  },
  keyData: {
    seed: seed,
  },
})

// Converts PKCS8 PEM Private Key to a crypto KeyObject
const cryptoPrivateKey = crypto.createPrivateKey({
  key: cryptoPrivateKeyPem,
  format: "pem",
  type: "pkcs8",
})

// Uses PrivateKey to get the PublicKey
const cryptoPublicKey = crypto.createPublicKey({
  key: cryptoPrivateKey,
  format: "pem",
})

const cryptoDetachedSignature = crypto.sign(null, message, cryptoPrivateKey)
// console.log(cryptoDetachedSignature)

// VERIFICATION : TWEETNACL
// ------------------------------------------------------------------------------

// Ensure tweetnacl verifies its own detached signature
assert(nacl.sign.detached.verify(message, naclDetachedSignature, naclPublicKey))
console.log("tweetnacl-js : self : OK")

// Ensure tweetnacl can verify the detached signature signed by sodium-native
assert(
  nacl.sign.detached.verify(message, sodiumDetachedSignature, naclPublicKey)
)
console.log("tweetnacl-js : sodium-native : OK")

// Ensure tweetnacl can verify the detached signature signed by Node.js crypto
assert(
  nacl.sign.detached.verify(message, cryptoDetachedSignature, naclPublicKey)
)
console.log("tweetnacl-js : node crypto : OK")

// VERIFICATION : SODIUM-NATIVE
// ------------------------------------------------------------------------------

// Ensure sodium-native can verify its own detached signature
assert(
  sodium.crypto_sign_verify_detached(
    sodiumDetachedSignature,
    message,
    sodiumPublicKey
  )
)
console.log("sodium-native : self : OK")

// Ensure sodium-native can verify the detached signature signed by tweetnacl
assert(
  sodium.crypto_sign_verify_detached(
    naclDetachedSignatureBuffer,
    message,
    sodiumPublicKey
  )
)
console.log("sodium-native : tweetnacl-js : OK")

// Ensure sodium-native can verify the detached signature signed by Node.js crypto
assert(
  sodium.crypto_sign_verify_detached(
    cryptoDetachedSignature,
    message,
    sodiumPublicKey
  )
)
console.log("sodium-native : node crypto : OK")

// VERIFICATION : NODE.JS CRYPTO
// ------------------------------------------------------------------------------

// Ensure Node.js crypto can verify its own detached signature
assert(crypto.verify(null, message, cryptoPublicKey, cryptoDetachedSignature))
console.log("node crypto : self : OK")

// Ensure Node.js crypto can verify tweetnacl's detached signature
assert(
  crypto.verify(null, message, cryptoPublicKey, naclDetachedSignatureBuffer)
)
console.log("node crypto : tweetnal-js : OK")

// Ensure Node.js crypto can verify sodium-native's detached signature
assert(crypto.verify(null, message, cryptoPublicKey, sodiumDetachedSignature))
console.log("node crypto : sodium-native : OK")
