const {gmailApi} = require('./gmail-api');
const puppeteer = require('puppeteer');

const slackInvitationLink = '';
const slackAccountSettingsPage = '';
const codeberryAddress = '';
const userRealName = '';
const userDisplayName = '';
const userPassword = '';
const userAddress = '';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50
    });

    /**
     * PART I: asking for slack invitation email
     */
    const page1 = await browser.newPage();
    await page1.goto(slackInvitationLink);
    page1.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page1.evaluate(() => console.log(`url is ${location.href}`));

    await page1.type('#email', codeberryAddress, {delay: 30});
    const [response] = await Promise.all([
        page1.waitForNavigation(),
        page1.click('#submit_btn', {delay: 20}),
    ]);

    console.log('Response status:', response.status());
    console.log('Response ok:', response.ok());
    console.log('Response url:', response.url());

    /**
     * PART II: acquiring confirmation link from codeberryAddress
     */
    let confirm_link = gmailApi.getConformationLink();

    /**
     * PART III: registration details
     */
    const page2 = await browser.newPage();
    await page2.goto(confirm_link);
    page2.on('console', msg => console.log('PAGE2 LOG:', msg.text()));
    await page2.evaluate(() => console.log(`url is ${location.href}`));

    await page2.waitFor(3000);
    await page2.type('#invite_real_name', userRealName, {delay: 20});
    await page2.type('#invite_display_name', userDisplayName, {delay: 20});
    await page2.type('#invite_password', userPassword, {delay: 20});
    //TODO: uncheck sending news box

    page2.click('#submit_btn', {delay: 20});
    await page2.waitFor(2000);
    page2.click('#submit_btn', {delay: 20});
    await page2.waitFor(2000);
    page2.click('button[data-qa="skip_tutorial"', {delay: 20});
    await page2.waitFor(2000);

    /**
     * PART IV: signing in and changing email address
     */
    const page4 = await browser.newPage();
    await page4.goto(slackAccountSettingsPage);

    await page4.waitFor(2000);
    await page4.type('#email', codeberryAddress, {delay: 20});
    await page4.type('#password', userPassword, {delay: 20});
    await page4.click('#signin_btn', {delay: 20});

    await page4.waitFor(5000);
    await page4.click('#change_email > a', {delay: 20});
    await page4.waitFor(5000);
    await page4.type('#change_email #email_password', userPassword, {delay: 20});
    await page4.type('#change_email #new_email', userAddress, {delay: 20});
    await page4.click('#change_email #email_form .btn', {delay: 20});

    await browser.close();
})();