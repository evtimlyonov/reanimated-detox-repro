import { by, device, element, expect, waitFor } from 'detox';

// While the system Face ID sheet is shown the app is "inactive". Any synchronized
// Detox call made at that point waits for the app to become idle.
const waitForIdleWhileFaceIdSheetIsOpen = async () => {
  await expect(element(by.id('title'))).toExist();
};

describe('Reanimated 500 ms interval vs Detox idle state', () => {
  beforeEach(async () => {
    await device.setBiometricEnrollment(true);
    await device.launchApp({ newInstance: true, permissions: { faceid: 'YES' } });
  });

  it('PASSES when no Animated component is mounted', async () => {
    await element(by.id('unmount-animated')).tap();

    await element(by.id('auth')).tap();
    await waitForIdleWhileFaceIdSheetIsOpen();
    await device.matchFace();

    await waitFor(element(by.text('Result: success'))).toBeVisible().withTimeout(10000);
  });

  it('HANGS when one Animated.View is mounted (app never idle while Face ID sheet is open)', async () => {
    await element(by.id('auth')).tap();
    await waitForIdleWhileFaceIdSheetIsOpen();
    await device.matchFace();

    await waitFor(element(by.text('Result: success'))).toBeVisible().withTimeout(10000);
  });
});
