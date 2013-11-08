// Generated by CoffeeScript 1.6.3
var data, recognizer;

data = require("./data");

recognizer = (function() {
  var isplural, ngram;
  isplural = function(word) {
    if (word.match(/.{3}(s|ice|eece)$/)) {
      return true;
    }
    return false;
  };
  ngram = function(arr, minwords, maxwords) {
    var arrlen, i, j, k, key, keys, results, s;
    keys = [];
    results = [];
    maxwords++;
    i = 1;
    while (i <= maxwords) {
      keys.push({});
      i++;
    }
    i = 0;
    arrlen = arr.length;
    s = void 0;
    while (i < arrlen) {
      s = arr[i];
      keys[1][s] = (keys[1][s] || 0) + 1;
      j = 2;
      while (j <= maxwords) {
        if (i + j <= arrlen) {
          s += " " + arr[i + j - 1];
          keys[j][s] = (keys[j][s] || 0) + 1;
        } else {
          break;
        }
        j++;
      }
      i++;
    }
    k = 0;
    while (k < maxwords) {
      key = keys[k];
      for (i in key) {
        if (key[i] >= minwords) {
          results.push(i);
        }
      }
      k++;
    }
    return results;
  };
  recognizer = function(tags, options) {
    var i, n, ngrams, nouns, o, text, word, words;
    if (!options) {
      options = {};
    }
    if (options.verbose) {
      options.gerund = true;
      options.stick_adjectives = true;
      options.stick_prepositions = true;
      options.stick_the = true;
      options.subnouns = true;
      options.match_whole = true;
    }
    nouns = tags.filter(function(tag) {
      return tag.pos.parent === "noun";
    });
    if (options.gerund) {
      for (i in tags) {
        tags[i].pos.tag === "VBG";
      }
    }
    if (options.subnouns) {
      for (i in nouns) {
        if (nouns[i].word.match(" ")) {
          ngrams = ngram(nouns[i].word.replace(/^(the|an?|dr\.|mrs?\.|sir) /i, "").split(" "), 1, 4);
          for (n in ngrams) {
            nouns.push({
              word: ngrams[n],
              pos: parts_of_speech["NN"],
              rule: "subnoun"
            });
          }
        }
      }
    }
    if (options.stick_the) {
      for (i in tags) {
        i = parseInt(i);
        if (tags[i].word === "the" && tags[i + 1] && tags[i + 1].pos.parent === "noun" && isplural(tags[i + 1].word)) {
          nouns.push({
            word: tags[i].word + " " + tags[i + 1].word,
            pos: parts_of_speech["NN"],
            rule: "sticky_the"
          });
        }
      }
    }
    if (options.stick_adjectives) {
      for (i in tags) {
        i = parseInt(i);
        if (!tags[i].word) {
          continue;
        }
        if (tags[i + 1] && tags[i].pos.parent === "adjective" && tags[i + 1].pos.parent === "noun") {
          word = tags[i].word + " " + tags[i + 1].word;
          nouns.push({
            word: word,
            pos: parts_of_speech["NN"],
            rule: "sticky_adj"
          });
        }
      }
      for (i in tags) {
        i = parseInt(i);
        if (!tags[i].word) {
          continue;
        }
        if (tags[i + 1] && tags[i].pos.parent === "noun" && tags[i + 1].pos.parent === "adjective") {
          word = tags[i].word + " " + tags[i + 1].word;
          nouns.push({
            word: word,
            pos: parts_of_speech["NN"],
            rule: "sticky_after_adj"
          });
        }
      }
    }
    if (options.stick_prepositions) {
      words = tags.map(function(t) {
        return t.word;
      });
      for (i in tags) {
        i = parseInt(i);
        if (!tags[i].word) {
          continue;
        }
        if (tags[i - 1] && tags[i + 1] && (tags[i].pos.tag === "CC" || tags[i].pos.tag === "IN")) {
          o = i;
          while (o < tags.length) {
            if (tags[o].pos.parent === "verb" || tags[o].word.match(/\W/)) {
              break;
            }
            if (tags[o].pos.parent === "noun") {
              word = words.slice(i - 1, parseInt(o) + 1).join(" ");
              nouns.push({
                word: word,
                pos: parts_of_speech["NN"],
                rule: "group_prep"
              });
            }
            o++;
          }
        }
      }
    }
    if (options.match_whole) {
      text = tags.map(function(t) {
        return t.word;
      }).join(" ");
      nouns.push({
        word: text,
        pos: parts_of_speech["NN"],
        rule: "whole"
      });
    }
    if (options.kill_numbers) {
      nouns = nouns.filter(function(noun) {
        return !noun.word.match(/([0-9]| \- )/);
      });
    }
    return nouns;
  };
  if (typeof define !== "undefined" && define.amd) {
    define([], function() {
      return recognizer;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = recognizer;
  }
  return recognizer;
})();