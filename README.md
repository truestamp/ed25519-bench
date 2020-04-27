# TweetNacl vs sodium-native benchmark

## Run It

```
npm install
node benchmark.js
```

For more usage and to see interpret the various outputs
see [Benny](https://caderek.github.io/benny/)

## tl;dr

```
❯ node benchmark.js
Running "tweetnacl vs. sodium-native" suite...
Progress: 100%

  sign w/ tweetnacl:
    286 ops/s, ±2.24%      | slowest, 99.47% slower

  sign w/ sodium-native:
    54 008 ops/s, ±0.62%   | fastest

Finished 2 cases!
  Fastest: sign w/ sodium-native
  Slowest: sign w/ tweetnacl

Saved to: benchmark/results/sign.json

Saved to: benchmark/results/sign.chart.html
```
