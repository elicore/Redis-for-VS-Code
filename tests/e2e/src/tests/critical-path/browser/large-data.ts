import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester';
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar';
import { WebView } from '../../../page-objects/components/WebView';
import { Common } from '../../../helpers/Common';
import { KeyDetailsView } from '../../../page-objects/components/edit-panel/KeyDetailsView';
import { CommonDriverExtension } from '../../../helpers/CommonDriverExtension';
import { StringKeyParameters } from '../../../helpers/keys';
import { ButtonsActions } from '../../../helpers/common-actions/actions/ButtonAction';
import { InputActions } from '../../../helpers/common-actions/actions/InputActions';

describe('Cases with large data', () => {
  let browser: VSBrowser;
  let webView: WebView;
  let bottomBar: BottomBar;
  let keyDetailsView: KeyDetailsView;
  let sideBarView: SideBarView | undefined;

  beforeEach(async () => {
    browser = VSBrowser.instance;
    bottomBar = new BottomBar();
    webView = new WebView();
    keyDetailsView = new KeyDetailsView();

    await browser.waitForWorkbench(20_000);

  });
  afterEach(async () => {
    await webView.switchBack();
  });
  it('Verify that user can download String key value as txt file when it has > 5000 characters', async function () {
    const keyName = Common.generateWord(10);
    const bigKeyName = Common.generateWord(10);
    // Create string key with 5000 characters
    const length = 5000;
    const keyValue = Common.generateWord(length);
    const stringKeyParameters: StringKeyParameters = {
      keyName: keyName,
      value: keyValue
    };
    const bigStringKeyParameters: StringKeyParameters = {
      keyName: bigKeyName,
      value: keyValue + 1
    };

    //TODO create 2 strings
    sideBarView = await (await new ActivityBar().getViewControl('RedisInsight'))?.openView();

    //TODO open the key stringKeyParameters.keyName
    await CommonDriverExtension.driverSleep();
    await webView.switchToFrame(KeyDetailsView.keyFrame);
    expect(await keyDetailsView.isElementDisplayed(keyDetailsView.loadAllStringValue)).false;

    // TODO open the key bigStringKeyParameters.keyName
    await CommonDriverExtension.driverSleep();
    expect(await keyDetailsView.isElementDisplayed(keyDetailsView.loadAllStringValue)).true;

    await ButtonsActions.clickElement(keyDetailsView.loadAllStringValue);
    await expect((await InputActions.getFieldValue(keyDetailsView.keyStringValue)).length).eql(bigStringKeyParameters.value.length, 'String key > 5000 value is not fully loaded after clicking Load All');
  });
});
