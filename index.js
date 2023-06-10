import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

(async () => {

  const Config = {
    followNewTab: false,
    fps: 60,
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
      color: 'black' | '#35A5FF',
    }
  };

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--use-fake-ui-for-media-stream',
      '--window-size=1920,1080',
      '--enable-experimental-web-platform-features',
      '--disable-infobars',
      '--enable-usermedia-screen-capturing',
      '--allow-http-screen-capture',
      '--auto-select-desktop-capture-source=webclip',
      '--autoplay-policy=no-user-gesture-required',
    ],
    ignoreDefaultArgs: ['--mute-audio'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('https://www.desmos.com/calculator');

  const recorder = new PuppeteerScreenRecorder(page, Config);
  const savePath = './test/demo.mp4';
  await recorder.start(savePath);

  page.evaluate(async () => {
    let cssText = `
#dcg-header-container,
.dcg-expressions-branding,
.dcg-show-keypad-container
{
  display: none !important;
}
#graph-container {
  top: 0 !important;
}
`;

    let stylesheet = document.createElement("style");
    stylesheet.textContent = cssText;
    document.head.appendChild(stylesheet);

    Calc.setExpression({ id: 'graph1', latex: 'y=\\sin(x\\cos(x))' });
    await new Promise(r => setTimeout(r, 2000));
    Calc.selectedExpressionId = "graph1";
    Calc.controller.grapher2d.audioGraph.enterAudioTrace();
    await new Promise(r => setTimeout(r, 2000));
    Calc.controller.grapher2d.audioGraph.hearGraph();
  });
  await new Promise(r => setTimeout(r, 14000));
  await recorder.stop();
  await page.screenshot({ path: 'example.png' });
  await browser.close();
})();