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

It might be preferable to use the Node.js `crypto.sign()` and `crypto.verify()`, but they expect `PEM` encoded public and private keys. Is there a way to use raw keys? If `PEM` encoded keys are not rehydrated back to Node `KeyObject` form then the sign/verify operations can be much slower. `ed25519` signing is available in Node.js 12+ which is currently the oldest supported LTS version.

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
