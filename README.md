# TweetNacl vs. sodium-native vs.  benchmark

## Run It

```
npm install
node benchmark.js
```

For more usage and to see interpret the various outputs
see [Benny](https://caderek.github.io/benny/)

## tl;dr

`sodium-native` is the fastest choice, but with it comes a hard to fulfill dependency in some environments.

It might be preferable to use the Node.js `crypto.sign()` and `crypto.verify()`, but it expects `PEM` or `DER` encoded public and private keys. It is possible to convert the raw bytes of a key seed to native crypto `KeyObject` form using the awesome [ipfs-shipyard/js-crypto-key-composer](https://github.com/ipfs-shipyard/js-crypto-key-composer). If `PEM` encoded keys are not rehydrated back to Node `KeyObject` form then the sign/verify operations can be much slower. `ed25519` signing is available in Node.js 12+ which is currently the oldest supported LTS version.

`tweetnacl-js` makes a very good pure Javascript fallback for use in other environments or the browser, but it is by far the slowest option.

Is the speed of sign/verify the most critical aspect when making a choice? Or reducing native compiled dependencies?

```sh
$ node benchmark.js
Running "sign : tweetnacl vs. sodium-native vs. crypto" suite...
Progress: 100%

  sign w/ tweetnacl:
    242 ops/s, ±3.19%      | slowest, 99.49% slower

  sign w/ sodium-native:
    47 315 ops/s, ±1.61%   | fastest

  sign w/ crypto (KeyObject):
    23 310 ops/s, ±1.58%   | 50.73% slower

  sign w/ crypto (PEM):
    10 964 ops/s, ±2.11%   | 76.83% slower

Finished 4 cases!
  Fastest: sign w/ sodium-native
  Slowest: sign w/ tweetnacl

Saved to: benchmark/results/sign.json

Saved to: benchmark/results/sign.chart.html
Running "verify : tweetnacl vs. sodium-native vs. crypto" suite...
Progress: 100%

  verify w/ tweetnacl:
    126 ops/s, ±3.29%      | slowest, 99.28% slower

  verify w/ sodium-native:
    17 494 ops/s, ±1.03%   | fastest

  verify w/ crypto (KeyObject):
    9 301 ops/s, ±1.02%    | 46.83% slower

  verify w/ crypto (PEM):
    8 582 ops/s, ±1.66%    | 50.94% slower

Finished 4 cases!
  Fastest: verify w/ sodium-native
  Slowest: verify w/ tweetnacl

Saved to: benchmark/results/verify.json

Saved to: benchmark/results/verify.chart.html
```

## Compatibility

There is a [compat.js](compat.js) file in this repository that when run with `node compat.js` will generate, from a common 32 byte seed, a keypair for each of the following, and then sign and verify the signatures in a matrix of all three options. This shows a path to using whichever library suits your needs, with the ability to verify detached signatures using one of the others.

* [tweetnacl-js](https://github.com/dchest/tweetnacl-js)
* [sodium-native](https://github.com/sodium-friends/sodium-native/)
* [Node.js Crypto](https://nodejs.org/api/crypto.html)

```sh
$ node compat.js
Seed: a16f89fbee1c7ca27a595a3e0eb70c067f82c3b9c830274b7a30aafab2fdf982
tweetnacl-js : self : OK
tweetnacl-js : sodium-native : OK
tweetnacl-js : node crypto : OK
sodium-native : self : OK
sodium-native : tweetnacl-js : OK
sodium-native : node crypto : OK
node crypto : self : OK
node crypto : tweetnal-js : OK
node crypto : sodium-native : OK
```
