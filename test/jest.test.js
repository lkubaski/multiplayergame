// Chrome webdriver: http://chromedriver.chromium.org/downloads
// Webdriver JS API: https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/
// https://www.codeproject.com/Articles/1241573/Web-Browser-Automation-with-Selenium-using-Node-js

const {Builder, By, Key, until} = require('selenium-webdriver');
let driver; // make sure that the chromedriver binary is in the user PATH
let handles;

async function findElement(id) {
    return driver.findElement(By.id(id));
}

async function click(id) {
    await driver.findElement(By.id(id)).click();
}

async function switchToTab(tabIndex) {
    handles = await driver.getAllWindowHandles();
    await driver.switchTo().window(handles[tabIndex]);
}

async function setMaxScore(maxScore) {
    await click('showConfigButton');
    let maxScoreElt = await findElement("configMaxScore");
    await maxScoreElt.clear();
    await maxScoreElt.sendKeys(maxScore.toString());
    await click('configModalCloseButton');
}

async function checkIfWinnerIs(color) {
    expect(await (await findElement("winnerModal")).isDisplayed()).toBe(true);
    // TODO: check why toMatch("/trophy-red") doesn't work
    expect(await (await findElement("winnerImage")).getAttribute("src")).toBe("http://localhost:3000/trophy-" + color + ".png");
    // TODO: need to wait since the dialog moves
    await driver.sleep(1000);
    await click("closeWinnerModalButton");
}

beforeAll(() => {
    driver = new Builder().forBrowser('chrome').build();
    driver.manage().window().maximize();
});

/*
 * Open all the game engine tabs (homepage, red controller, blue controller)
 */
beforeEach(async () => {
    await driver.get('http://localhost:3000');
    // CTRL-T won't work in chrome, as per https://stackoverflow.com/questions/34829329/how-to-open-a-link-in-new-tab-chrome-using-selenium-webdriver
    //driver.findElement(By.css("body")).sendKeys(Key.CONTROL +"t");
    await driver.executeScript("window.open()");
    await switchToTab(1);
    await driver.get('http://localhost:3000/control/red');
    await driver.executeScript("window.open()");
    await switchToTab(2);
    await driver.get('http://localhost:3000/control/blue');
});

/*
 * Close all tabs
 */
afterEach(async () => {
    await switchToTab(2);
    await driver.close();
    await switchToTab(1);
    await driver.close();
    await switchToTab(0);
    // await driver.close(); // otherwise the whole browser exists :-)
});

afterAll(() => {
    driver.quit();
});

describe('homepage', () => {
    test('game buttons', async () => {
        await switchToTab(0);
        expect(await driver.getTitle()).toBe("Games");
        await click('game1');
        expect(await driver.getTitle()).toBe("Game 1");
        await click("goHomeButton");
        await click("game2");
        expect(await driver.getTitle()).toBe("Game 2");
        await click("goHomeButton");
        await click("game3");
        expect(await driver.getTitle()).toBe("Game 3");
        await click("goHomeButton");
        await click("game4");
        expect(await driver.getTitle()).toBe("Game 4");
    });
});

describe('configuration menu', () => {

    test('start and reload buttons', async () => {
        await switchToTab(0);
        await click('game1');
        await click("startGameButton");
        //expect(await redScore.getText()).toBe("0");
        expect(await (await findElement('redScore')).getText()).toBe("0");
        expect(await (await findElement('blueScore')).getText()).toBe("0");
        await driver.sleep(4000);
        expect(await (await findElement("startGameButton")).isDisplayed()).toBe(false);
        expect(await (await findElement("showConfigButton")).isDisplayed()).toBe(false);
        await switchToTab(1);
        await click("centerButton");
        await switchToTab(2);
        await click("centerButton");
        await switchToTab(0);
        expect(await (await findElement('redScore')).getText()).toBe("1");
        expect(await (await findElement('blueScore')).getText()).toBe("1");
        await click("reloadGameButton");
        expect(await (await findElement('redScore')).getText()).toBe("0");
        expect(await (await findElement('blueScore')).getText()).toBe("0");
    });

    test('configuration button', async () => {
        await switchToTab(0);
        await click('game1');
        let configModal = await findElement("configModal");
        expect(await configModal.isDisplayed()).toBe(false);
        await click('showConfigButton');
        expect(await configModal.isDisplayed()).toBe(true);
        let random = Math.round(Math.random() * 100);
        let maxScoreElt = await findElement("configMaxScore");
        let currentMaxScore = await maxScoreElt.getAttribute("value");
        await maxScoreElt.clear();
        await maxScoreElt.sendKeys(random.toString());
        await click('configModalCloseButton');
        // otherwise you'll get "StaleElementReferenceError: stale element reference: element is not attached to the page document"
        expect(await (await findElement('configModal')).isDisplayed()).toBe(false);
        expect(await (await findElement('maxRedScore')).getText()).toBe("/" + random.toString());
        expect(await (await findElement('maxBlueScore')).getText()).toBe("/" + random.toString());
        await click('showConfigButton');
        maxScoreElt = await findElement('configMaxScore');
        expect(await maxScoreElt.getAttribute("value")).toBe(random.toString());
        await maxScoreElt.clear();
        await maxScoreElt.sendKeys(currentMaxScore); // restore max score
        await click('configModalCloseButton');
    });


    test('home button', async () => {
        // nothing
    });

    test('controller button', async () => {
        // http://stqatools.com/selenium-tab/
        await switchToTab(0);
        await click('game1');
        await click('openRedControllerButton'); // opens new tab (but driver is still in the source one)
        await switchToTab((await driver.getAllWindowHandles()).length - 1);
        expect(await driver.getTitle()).toBe("red Controller");
        await driver.close();
        await switchToTab(0);
        await click('openBlueControllerButton');
        await switchToTab((await driver.getAllWindowHandles()).length - 1);
        expect(await driver.getTitle()).toBe("blue Controller");
        await driver.close();
    });

});

describe('controllers', () => {
    test('controllers', async () => {
        await switchToTab(0);
        await click('game1');
        await click("startGameButton");
        await driver.sleep(4000); // TODO: remove the timer using mocking
        for (let controllerIndex of [1, 2]) {
            await switchToTab(controllerIndex);
            await click("upleftButton");
            await click("upButton");
            await click("uprightButton");
            await click("leftButton");
            await click("centerButton");
            await click("rightButton");
            await click("downleftButton");
            await click("downButton");
            await click("downrightButton");
        }
        await switchToTab(0);
        expect(await (await findElement('redScore')).getText()).toBe("9");
        expect(await (await findElement('blueScore')).getText()).toBe("9");
    });
});

describe('game1', () => {
    test('game1', async () => {
        await switchToTab(0);
        await click('game1');
        await setMaxScore(10);
        // scenario #1: red player wins
        ///////////////////////////////
        await click("startGameButton");
        await driver.sleep(4000); // TODO: remove the timer using mocking
        await switchToTab(1);
        for (let i=1;i<10;i++) await click("centerButton");
        await switchToTab(0);
        expect(await (await findElement("winnerModal")).isDisplayed()).toBe(false);
        await switchToTab(1);
        await click("centerButton");
        await switchToTab(0);
        await checkIfWinnerIs("red");
        // scenario #2: blue player wins
        ///////////////////////////////
        await click("reloadGameButton");
        await click("startGameButton");
        await driver.sleep(4000); // TODO: remove the timer using mocking
        await switchToTab(2);
        for (let i=1;i<=10;i++) await click("centerButton");
        await switchToTab(0);
        await checkIfWinnerIs("blue");
    });
});

describe('game2', () => {
    test('game2', async () => {
        await switchToTab(0);
        await click('game2');
        await click("startGameButton");
        await driver.sleep(4000);
        // scenario #1: red player wins
        ///////////////////////////////
        //let button = await driver.wait(until.elementLocated(By.id('foo')), 10000);
        do {
            await switchToTab(1);
            await click("centerButton");
            await switchToTab(0);
        } while (await (await findElement("winnerModal")).isDisplayed() === false);
        await checkIfWinnerIs("red");
        // scenario #2: blue player wins
        ///////////////////////////////
        await click("reloadGameButton");
        await click("startGameButton");
        await driver.sleep(4000);
        do {
            await switchToTab(2);
            await click("centerButton");
            await switchToTab(0);
        } while (await (await findElement("winnerModal")).isDisplayed() === false);
        await checkIfWinnerIs("blue");
    });
});
describe('game3', () => {

    test('game3', async () => {
        await switchToTab(0);
        await click('game3');
        await setMaxScore(10);
        // scenario #1: red player wins
        ///////////////////////////////
        await click("startGameButton");
        await driver.sleep(4000);
        for (let i=1;i<=9;i++) {
            await switchToTab(0);
            let expectedRedAction = await (await findElement("redActionDiv")).getAttribute("value");
            await switchToTab(1);
            await click(expectedRedAction + "Button");
        }
        await switchToTab(0);
        expect(await (await findElement('redScore')).getText()).toBe("9");
        let expectedRedAction = await (await findElement("redActionDiv")).getAttribute("value");
        let button = expectedRedAction === "up" ? "downButton" : "upButton";
        await switchToTab(1);
        await click(button); // simulate error
        await switchToTab(0);
        expect(await (await findElement('redScore')).getText()).toBe("8");
        for (let i=1;i<=2;i++) {
            await switchToTab(0);
            let expectedRedAction = await (await findElement("redActionDiv")).getAttribute("value");
            await switchToTab(1);
            await click(expectedRedAction + "Button");
        }
        await switchToTab(0);
        await checkIfWinnerIs("red");
        // scenario #2: blue player wins
        ///////////////////////////////
        await click("reloadGameButton");
        await click("startGameButton");
        await driver.sleep(4000); // TODO: remove the timer using mocking
        await switchToTab(2);
        for (let i=1;i<=10;i++) {
            await switchToTab(0);
            let expectedRedAction = await (await findElement("blueActionDiv")).getAttribute("value");
            await switchToTab(2);
            await click(expectedRedAction + "Button");
        }
        await switchToTab(0);
        await checkIfWinnerIs("blue");
    });
});

describe('game4', () => {

    test('game4', async () => {
        await switchToTab(0);
        await click('game4');
        await setMaxScore(5);
        await click("startGameButton");
        await driver.sleep(4000);
        // scenario #1: red player wins
        ///////////////////////////////
        do {
            let redCellId = await (await findElement("redCellId")).getAttribute("value");
            if (redCellId !== "") {
                let controllerButtonId = redCellId.split("red")[1] + "Button";
                await switchToTab(1);
                await click(controllerButtonId);
                await switchToTab(0);
                await driver.sleep(1000);
            }
        } while (await (await findElement("winnerModal")).isDisplayed() === false);
        await checkIfWinnerIs("red");
        // scenario #1: blue player wins
        ///////////////////////////////
        await click("reloadGameButton");
        await click("startGameButton");
        await driver.sleep(4000);
        do {
            let redCellId = await (await findElement("blueCellId")).getAttribute("value");
            if (redCellId !== "") {
                let controllerButtonId = redCellId.split("blue")[1] + "Button";
                await switchToTab(2);
                await click(controllerButtonId);
                await switchToTab(0);
                await driver.sleep(1000);
            }
        } while (await (await findElement("winnerModal")).isDisplayed() === false);
        await checkIfWinnerIs("blue");
    });
});
