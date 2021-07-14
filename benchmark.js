// https://caderek.github.io/benny/
const b = require("benny")

// setup tweetnacl and its keypair
// https://github.com/dchest/tweetnacl-js
const nacl = require("tweetnacl")
const crypto = require("crypto")
const naclKeypair = nacl.sign.keyPair()

// setup sodium-native
// https://sodium-friends.github.io/docs/docs/signing
const sodium = require("sodium-native")
const pk = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
const sk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
sodium.crypto_sign_keypair(pk, sk)

// setup crypto
const cryptoKeypair = crypto.generateKeyPairSync('ed25519')

// create a common message to sign
const m = new Uint8Array(100)
var i
for (i = 0; i < m.length; i++) {
  m[i] = i & 0xff
}

b.suite(
  "tweetnacl vs. sodium-native vs crypto",

  b.add("sign w/ tweetnacl", () => {
    let sm = nacl.sign(m, naclKeypair.secretKey)
  }),

  b.add("sign w/ sodium-native", () => {
    let sm = Buffer.alloc(sodium.crypto_sign_BYTES + m.length)
    sodium.crypto_sign(sm, m, sk)
  }),

  b.add("sign w/ crypto", () => {
    crypto.sign(null, m, cryptoKeypair.privateKey)
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: "sign", version: "1.0.0" }),
  b.save({ file: "sign", format: "chart.html" })
)
