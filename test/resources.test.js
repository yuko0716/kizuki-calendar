import test from "node:test";
import assert from "node:assert/strict";
import { CURATED_ARTICLES, relatedArticles } from "../src/resources.js";

test("curated article links use https and named sources", () => {
  assert.ok(CURATED_ARTICLES.length >= 6);
  for (const article of CURATED_ARTICLES) {
    assert.match(article.url, /^https:\/\//);
    assert.ok(article.source);
    assert.ok(article.title);
    assert.ok(article.keywords.length > 0);
  }
});

test("related articles come only from the curated catalog", () => {
  const results = relatedArticles("今日は公園から帰るときに大泣き。まだ遊びたくて切り替えが難しかった", 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].id, "tantrum");
  assert.ok(results.every((result) => CURATED_ARTICLES.some((article) => article.id === result.id)));
});

test("food and sleep notes match their topics", () => {
  assert.equal(relatedArticles("ごはんを遊び食べしてスプーンを置いた")[0]?.id, "food");
  assert.equal(relatedArticles("昼寝が遅くて夜なかなか寝なかった")[0]?.id, "rhythm");
});

test("blank or unrelated notes do not force a recommendation", () => {
  assert.deepEqual(relatedArticles(""), []);
  assert.deepEqual(relatedArticles("今日は赤い靴を履いた"), []);
});
