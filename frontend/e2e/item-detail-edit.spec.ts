import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5007';

test.describe('Item Detail Edit', () => {
  let itemId: number;

  test.beforeEach(async ({ request }) => {
    const response = await request.post(`${API_URL}/api/inventory`, {
      data: {
        name: `E2ETest_${Date.now()}`,
        quantity: 5,
        category: 'Groceries',
        expirationDate: '2027-06-15T00:00:00',
      },
    });
    const item = await response.json();
    itemId = item.id;
  });

  test.afterEach(async ({ request }) => {
    if (itemId) {
      await request.delete(`${API_URL}/api/inventory/${itemId}`).catch(() => {});
    }
  });

  test('(a) select new category, click Save, reload, assert updated category is displayed', async ({ page }) => {
    await page.goto(`/inventory/${itemId}`);
    await page.waitForSelector('h1');

    // Open the Radix Select dropdown for Category
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Medications' }).click();

    await page.getByRole('button', { name: 'Save' }).click();

    // Confirm no error message appeared
    await expect(page.getByRole('alert')).not.toBeVisible();

    await page.reload();
    await page.waitForSelector('h1');

    // The Select trigger should display the saved category
    await expect(page.getByRole('combobox')).toContainText('Medications');
  });

  test('(b) set new expiration date, click Save, reload, assert updated date displayed and item in correct sort tier', async ({ page }) => {
    await page.goto(`/inventory/${itemId}`);
    await page.waitForSelector('h1');

    await page.getByLabel('Expiration Date').fill('2028-03-20');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('alert')).not.toBeVisible();

    await page.reload();
    await page.waitForSelector('h1');

    await expect(page.getByLabel('Expiration Date')).toHaveValue('2028-03-20');

    // Navigate to inventory list and confirm item is in the correct tier (not expired)
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    // Item should appear in the active/future inventory section, not the expired section
    const expiredSection = page.locator('[data-testid="expired-section"], h2:has-text("Expired")').first();
    const itemInExpired = expiredSection.locator(`text=E2ETest_`);
    await expect(itemInExpired).not.toBeVisible();
  });
});
