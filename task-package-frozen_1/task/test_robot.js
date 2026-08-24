/* Headless verification of the experiment task.
   Run:  node test_robot.js
   1. Robot runs (cheapest / bigdata / random): all in-page checks must PASS.
   2. Determinism: same pid twice -> identical trial sequence & choices.
   3. Screenshots: intro screen and a live trial screen.               */
const { chromium } = require("playwright");
const path = require("path");
const URLBASE = "file://" + path.resolve(__dirname, "index.html");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  let failures = 0;

  async function robotRun(policy, pid) {
    await page.goto(`${URLBASE}?robot=${policy}&pid=${pid}`);
    await page.waitForFunction(() => window.__robotReport, null, { timeout: 15000 });
    const report = await page.evaluate(() => window.__robotReport);
    const bad = report.filter(c => !c.pass);
    console.log(`robot=${policy}: ${report.length} checks, ` +
      `${report.length - bad.length} passed`);
    bad.forEach(c => { console.log(`  FAIL: ${c.name} — ${c.detail}`); failures++; });
    return page.evaluate(() =>
      rows.filter(r => r.phase === "choice").map(r =>
        [r.trial_idx, r.block, r.opt1_role, r.opt1_gb, r.opt1_price,
         r.opt2_role, r.opt2_gb, r.opt3_role, r.choice_role, r.choice_gb]
          .join("|")).join(";"));
  }

  const s1 = await robotRun("cheapest", "P01");
  const s2 = await robotRun("cheapest", "P01");
  console.log("determinism (same pid): " + (s1 === s2 ? "PASS" : "FAIL"));
  if (s1 !== s2) failures++;
  const s3 = await robotRun("cheapest", "P02");
  console.log("different pid gives different sequence: " +
    (s1 !== s3 ? "PASS" : "FAIL"));
  if (s1 === s3) failures++;
  await robotRun("bigdata", "P03");
  await robotRun("random", "P04");

  // screenshots: intro, then drive UI to a live trial
  await page.goto(URLBASE);
  await page.screenshot({ path: "shot_intro.png" });
  await page.fill("#pid", "DEMO");
  await page.check("#consent");
  await page.click("#go");
  for (let i = 0; i < 6; i++) await page.fill(`#wtp${i}`, String(8 + i * 2));
  await page.click("#go");
  await page.waitForSelector(".plan");
  await page.screenshot({ path: "shot_trial.png" });
  // click through 3 trials to confirm the live loop advances
  for (let k = 0; k < 3; k++) {
    await page.waitForSelector(".plan");
    await page.click(".plan >> nth=0");
    await page.waitForTimeout(400);
  }
  const ti = await page.evaluate(() => ti);
  console.log(`live click-through advanced to trial ${ti}: ` +
    (ti === 3 ? "PASS" : "FAIL"));
  if (ti !== 3) failures++;

  await browser.close();
  console.log(failures === 0 ? "\nALL TESTS PASSED" :
    `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})();
