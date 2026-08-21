const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const base = "file://" + path.resolve(__dirname, "index.html");
  await page.goto(base + "?robot=1&pid=T1");
  await page.waitForFunction(() => window.__robotReport);
  const rep = await page.evaluate(() => window.__robotReport);
  rep.forEach(c => console.log((c.pass ? "PASS " : "FAIL ") + c.name + " " + c.detail));
  // live click-through: intro -> 2 trials
  await page.goto(base);
  await page.fill("#pid", "DEMO"); await page.click("#go");
  for (let k = 0; k < 13; k++) { await page.waitForSelector(".plan");
    await page.click(".plan >> nth=0"); }
  await page.waitForSelector(".result");
  const txt = await page.textContent(".result");
  console.log("full live run completed: " + (txt.includes("Done") ? "PASS" : "FAIL"));
  await page.screenshot({ path: "shot_pilot.png" });
  await browser.close();
  process.exit(rep.every(c => c.pass) ? 0 : 1);
})();
